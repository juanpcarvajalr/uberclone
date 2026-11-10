#!/usr/bin/env node
// AI-assisted: see docs/AI_LOG.md #44, #46
import http from 'node:http';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputPath = path.join(rootDir, 'src', 'mocks', 'generatedIncomingRequest.json');
const INBOX_PORT = 8765;
const INBOX_TTL_MS = 120000;

/**
 * @param {string[]} argv
 * @returns {Record<string, string|boolean>}
 */
function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) continue;

    if (token.includes('=')) {
      const separator = token.indexOf('=');
      const key = token.slice(2, separator);
      args[key] = token.slice(separator + 1);
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) {
      args[key] = true;
      continue;
    }
    args[key] = next;
    index += 1;
  }
  return args;
}

/**
 * @returns {string}
 */
function readGoogleMapsKey() {
  const fromEnv = process.env.KEY?.trim();
  if (fromEnv) return fromEnv;
  try {
    const raw = readFileSync(path.join(rootDir, '.env'), 'utf8');
    const match = raw.match(/^KEY=(.*)$/m);
    if (!match) {
      throw new Error('KEY not found in .env');
    }
    return match[1].trim().replace(/^['"]|['"]$/g, '');
  } catch (error) {
    throw new Error(
      `Google Maps KEY required in .env (Distance Matrix). ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * @returns {void}
 */
function printHelp() {
  console.log(`
Passenger simulator (Spec 6 / 11 / 12)
You pass origin/destination as addresses (like a passenger).
The script geocodes them to { lat, lng, address }, runs Distance Matrix once,
calculates fare, and offers the request to a matching driver category.

Required:
  --category <economy|xl|premium>
  --payment <mercadopago|stripe|cash>
  --origin <address>
  --destination <address>

Optional:
  --tip <number>           Propina en COP (default 0). Va completa al conductor (Spec 10).
  --passenger <name>
  --origin-lat / --origin-lng / --dest-lat / --dest-lng
                           Skip geocoding for that place if both lat+lng are set
  --print                  Print only (no file / push / inbox)
  --no-push                Skip Firestore push
  --no-inbox               Skip local HTTP inbox
  --help

Examples (use --key=value so spaces survive npm):
  npm run request-trip -- \\
    --category=economy \\
    --payment=cash \\
    --origin="Altos de Polanco" \\
    --destination="El Tesoro, El Poblado" \\
    --tip=2000

  ./scripts/request-trip.sh \\
    --category=xl \\
    --payment=mercadopago \\
    --origin="Universidad de Antioquia" \\
    --destination="Aeropuerto Olaya Herrera"
`);
}

/**
 * @param {Record<string, string|boolean>} args
 * @returns {{
 *   category: string,
 *   paymentMethod: string,
 *   tip: number,
 *   passengerName?: string,
 *   originAddress: string,
 *   destinationAddress: string,
 *   originCoords?: { lat: number, lng: number },
 *   destinationCoords?: { lat: number, lng: number },
 * }}
 */
function requirePassengerInput(args) {
  const missing = [];
  for (const key of ['category', 'payment', 'origin', 'destination']) {
    if (args[key] == null || args[key] === '') missing.push(`--${key}`);
  }
  if (missing.length) {
    throw new Error(`Missing required passenger params: ${missing.join(', ')}`);
  }

  const hasOriginCoords = args['origin-lat'] != null && args['origin-lng'] != null;
  const hasDestCoords = args['dest-lat'] != null && args['dest-lng'] != null;

  return {
    category: String(args.category),
    paymentMethod: String(args.payment),
    tip: args.tip != null ? Number(args.tip) : 0,
    passengerName: args.passenger ? String(args.passenger) : undefined,
    originAddress: String(args.origin).trim(),
    destinationAddress: String(args.destination).trim(),
    originCoords: hasOriginCoords
      ? { lat: Number(args['origin-lat']), lng: Number(args['origin-lng']) }
      : undefined,
    destinationCoords: hasDestCoords
      ? { lat: Number(args['dest-lat']), lng: Number(args['dest-lng']) }
      : undefined,
  };
}

/**
 * @param {object} tripRequest
 * @returns {Promise<boolean>}
 */
async function pushToFirestore(tripRequest) {
  try {
    const projectUrl = pathToFileURL(
      path.join(rootDir, 'src', 'config', 'firebaseProject.js')
    ).href;
    const triggersUrl = pathToFileURL(
      path.join(rootDir, 'src', 'config', 'devTriggers.js')
    ).href;
    const { firebaseConfig } = await import(projectUrl);
    const { DEV_INCOMING_TRIP_COLLECTION, DEV_INCOMING_TRIP_DOC } =
      await import(triggersUrl);

    const app = initializeApp(firebaseConfig, `trip-request-cli-${Date.now()}`);
    const db = getFirestore(app);
    const triggerId = tripRequest.tripId;

    await setDoc(doc(db, DEV_INCOMING_TRIP_COLLECTION, DEV_INCOMING_TRIP_DOC), {
      triggerId,
      trip: tripRequest,
      createdAt: new Date().toISOString(),
    });

    console.log(
      `Pushed Firestore ${DEV_INCOMING_TRIP_COLLECTION}/${DEV_INCOMING_TRIP_DOC} (${triggerId})`
    );
    return true;
  } catch (error) {
    console.warn(
      `Firestore push skipped: ${error instanceof Error ? error.message : String(error)}`
    );
    return false;
  }
}

/**
 * @param {object} tripRequest
 * @returns {Promise<void>}
 */
function serveInbox(tripRequest) {
  return new Promise((resolve) => {
    let consumed = false;
    const payload = JSON.stringify({
      triggerId: tripRequest.tripId,
      trip: tripRequest,
    });

    const server = http.createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

      if (requestUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: true,
            consumed,
            category: tripRequest.category,
          })
        );
        return;
      }

      const driverCategory = requestUrl.searchParams.get('category');
      if (driverCategory && driverCategory !== tripRequest.category) {
        res.writeHead(204);
        res.end();
        console.log(
          `Inbox kept in limbo: request=${tripRequest.category}, driver=${driverCategory}`
        );
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(payload);
      if (!consumed) {
        consumed = true;
        console.log('Inbox consumed by matching driver category.');
        setTimeout(() => {
          server.close(() => resolve());
        }, 300);
      }
    });

    server.on('error', (error) => {
      console.warn(
        `Local inbox failed: ${error instanceof Error ? error.message : String(error)}`
      );
      resolve();
    });

    server.listen(INBOX_PORT, '0.0.0.0', () => {
      console.log(
        `Local inbox listening on http://0.0.0.0:${INBOX_PORT} for ${INBOX_TTL_MS / 1000}s`
      );
    });

    setTimeout(() => {
      if (!consumed) {
        console.warn('Inbox timed out without being consumed by the app.');
      }
      server.close(() => resolve());
    }, INBOX_TTL_MS);
  });
}

/**
 * @returns {Promise<void>}
 */
async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      printHelp();
      return;
    }

    const passenger = requirePassengerInput(args);
    const apiKey = readGoogleMapsKey();

    const mapsApiUrl = pathToFileURL(
      path.join(rootDir, 'src', 'services', 'googleMapsApi.js')
    ).href;
    const factoryUrl = pathToFileURL(
      path.join(rootDir, 'src', 'utils', 'buildTripRequest.js')
    ).href;
    const { fetchDistanceMatrix, geocodeAddress } = await import(mapsApiUrl);
    const { buildTripRequest } = await import(factoryUrl);

    const origin = passenger.originCoords
      ? {
          ...passenger.originCoords,
          address: passenger.originAddress,
        }
      : await (async () => {
          console.log(`Geocoding origin: ${passenger.originAddress}`);
          return geocodeAddress({
            address: passenger.originAddress,
            apiKey,
          });
        })();

    const destination = passenger.destinationCoords
      ? {
          ...passenger.destinationCoords,
          address: passenger.destinationAddress,
        }
      : await (async () => {
          console.log(`Geocoding destination: ${passenger.destinationAddress}`);
          return geocodeAddress({
            address: passenger.destinationAddress,
            apiKey,
          });
        })();

    console.log('Calling Distance Matrix (create request)...');
    const matrix = await fetchDistanceMatrix({
      origin,
      destination,
      apiKey,
    });
    console.log(
      `Distance Matrix: ${matrix.distanceKm} km, ${matrix.durationMin} min`
    );

    const tripRequest = buildTripRequest({
      category: passenger.category,
      paymentMethod: passenger.paymentMethod,
      tip: passenger.tip,
      passengerName: passenger.passengerName,
      origin,
      destination,
      distanceKm: matrix.distanceKm,
      durationMin: matrix.durationMin,
    });

    const json = `${JSON.stringify(tripRequest, null, 2)}\n`;

    if (!args.print) {
      writeFileSync(outputPath, json, 'utf8');
      console.log(`Wrote ${path.relative(rootDir, outputPath)}`);
    }

    console.log(json);
    console.log('Spec 6.2 Solicitud entrante payload:');
    console.log(
      [
        `  origin=${tripRequest.origin.address}`,
        `  destination=${tripRequest.destination.address}`,
        `  distanceKm=${tripRequest.distanceKm}`,
        `  durationMin=${tripRequest.durationMin}`,
        `  category=${tripRequest.category}`,
        `  paymentMethod=${tripRequest.paymentMethod}`,
        `  fare=${tripRequest.fare}`,
        `  driverEarnings=${tripRequest.driverEarnings}`,
      ].join('\n')
    );
    console.log(
      `Spec 10/11 extras: tip=${tripRequest.tip} commission=${tripRequest.commission} commissionRate=${tripRequest.commissionRate}`
    );

    if (args.print) {
      return;
    }

    if (!args['no-push']) {
      await pushToFirestore(tripRequest);
    }

    if (!args['no-inbox']) {
      await serveInbox(tripRequest);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

main();
