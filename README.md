# UberClone — Versión Conductor

App móvil del conductor (React Native + Expo). Especificación: [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md).

## Requisitos

- Node.js
- Android SDK / emulador (development build; Google Maps no corre en Expo Go)
- Variable `KEY` (Google Maps) en `.env` en la raíz del proyecto (ver `.env.example`)
- Credenciales de pago solo en `backend/.env` (ver `backend/.env.example`; nunca en la app)
- Cuenta de servicio de Firebase en `backend/serviceAccount.json` (no se sube a Git)

## Paso a paso: backend, app y prueba de servicio

Hazlo en este orden. Usa **tres terminales** desde la raíz del repo (`uberclone/`).

### 0. Una sola vez (o tras clonar)

1. Copia variables:
   - Raíz: `.env` con `KEY=` (Google Maps / Geocoding / Distance Matrix / Directions). Ver `.env.example`.
   - Backend: `backend/.env` con `MP_ACCESS_TOKEN`, `PORT=8787`, `FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccount.json` (y opcional `MP_PAYER_EMAIL`). Ver `backend/.env.example`.
2. Coloca la cuenta de servicio de Firebase en `backend/serviceAccount.json` (no se sube a Git).
3. Coloca `google-services.json` en la raíz (FCM / `@react-native-firebase`).
4. Instala dependencias:

```bash
npm install
npm --prefix backend install
```

5. Si cambiaste plugins nativos (`app.json` / RNFirebase), regenera Android:

```bash
npx expo prebuild --clean --platform android
```

6. Publica `firestore.rules` si aún no lo hiciste (incluye `trips` y, si usas push, `devTriggers`).

### 1. Emulador y ADB

1. Abre el emulador Android (o conecta el dispositivo).
2. Verifica dispositivo:

```bash
adb devices
```

Si ADB falla en WSL, reinicia el daemon en Windows, abre el emulador y vuelve a `adb devices`.

3. Reenvía el puerto del backend (pagos / notify FCM):

```bash
adb reverse tcp:8787 tcp:8787
```

### 2. Iniciar el backend (terminal A)

```bash
npm run backend
```

Debe quedar escuchando en el puerto `8787`. Déjala abierta.

Variables mínimas en `backend/.env`: `MP_ACCESS_TOKEN`, `PORT`, `FIREBASE_SERVICE_ACCOUNT_PATH`.  
La URL de retorno de Mercado Pago es `PAYMENT_RETURN_URL` en `src/config/payments.js`. El WebView la intercepta con `onShouldStartLoadWithRequest` (no la carga) y la app llama a `POST /payments/verify` para que el backend consulte el estado real en la API de Mercado Pago.

### 3. Iniciar la aplicación (terminal B)

```bash
npx expo run:android
```

La primera vez compila e instala el development build (Maps / FCM no corren en Expo Go). Cuando Metro esté listo, la app se abre en el emulador.

En la app:

1. Inicia sesión con un conductor con `accountStatus = approved` (si está `pending`, apruébalo en la consola de Firestore).
2. Pon el interruptor en **Disponible**.
3. Confirma que la categoría del vehículo coincide con la que usarás en el script (`economy` / `xl` / `premium`).

Opcional: deja la app en segundo plano si quieres probar push FCM.

### 4. Prueba de servicio / simular un viaje (terminal C)

El script actúa como **pasajero**: geocodifica origen/destino, llama **Distance Matrix** una vez, calcula la tarifa y ofrece el viaje al conductor. El conductor **no** ingresa origen ni destino. **No uses un botón de la app** para crear la solicitud: solo este script.

```bash
npm run request-trip -- \
  --category=economy \
  --payment=mercadopago \
  --origin="Territorio Robledo" \
  --destination="El Tesoro, El Poblado" \
  --tip=2000
```

Para efectivo: `--payment=cash`.

Ese comando:

1. Ejecuta `adb reverse tcp:8765 tcp:8765` (inbox del simulador; con timeout; si ADB cuelga, igual continúa).
2. Geocodifica las direcciones.
3. Consulta Distance Matrix y arma el viaje con `calculateFare` (incl. propina).
4. Intenta avisar por push vía `POST /notifications/trip-request` del backend (si hay `fcmToken`).
5. Deja la solicitud disponible para la app (unos segundos).

Parámetros obligatorios: `--category`, `--payment`, `--origin`, `--destination`.  
Opcionales: `--tip` (COP enteros; por defecto `0`), `--passenger`. Lat/lng solo si quieres forzar coordenadas.

Ayuda:

```bash
npm run create-trip-request -- --help
```

#### Qué debe pasar en la app

1. Se abre **Solicitud entrante** (15 s para aceptar/rechazar).
2. Al **Aceptar**: Distance Matrix + Directions al pickup; `accepted` → `driver_arriving`.
3. **Pasajero a bordo**: Directions pickup → destino (`in_progress`).
4. **Finalizar viaje** → `completed` con tarifa final.
5. Cobro:
   - `cash` → **Confirmar pago en efectivo** → `paid` / `cash_received`.
   - `mercadopago` → **Pagar con Mercado Pago** (backend en marcha) → Checkout Pro; al volver, verify → `paid` / `approved`.
6. El viaje aparece en **Historial** / **Ganancias**.

#### Campos que arma el script (SPEC 6.2 + 11)

| Campo | Origen |
|---|---|
| Origen / destino | `--origin` / `--destination` → Geocoding |
| Distancia / duración | Distance Matrix |
| Categoría / pago | `--category` / `--payment` |
| Tarifa / ganancia | `calculateFare` → `fare` / `driverEarnings` |

También: `tip`, `commission`, `commissionRate`, `paymentStatus: pending`, `passengerId` (stub), `driverId`/`vehicleId` en `null` hasta aceptar.

Si Geocoding responde `ZERO_RESULTS`, la dirección es demasiado vaga: usa barrio + ciudad (`"Robledo, Medellín"`).  
Si responde `REQUEST_DENIED`, la `KEY` está restringida o faltan APIs para uso desde el CLI.

### 5. Tests unitarios (opcional)

```bash
npm test
```

### Push (FCM) en segundo plano

Usa `@react-native-firebase/messaging`. `google-services.json` va en la raíz (`android.googleServicesFile`). La app guarda el token en `drivers/{uid}.fcmToken`. Con backend + `adb reverse` 8787, `request-trip` llama a `POST /notifications/trip-request`.

### APIs de Google en la KEY

En la misma `KEY` del `.env` deben estar habilitadas al menos:

- Maps SDK for Android
- Distance Matrix API
- Directions API
- Geocoding API

## Uso de IA

En este proyecto se usaron herramientas de inteligencia artificial como apoyo. Todo uso está documentado en la [bitácora de IA](docs/AI_LOG.md).

- Los bloques de código asistidos están marcados con `// AI-assisted: see docs/AI_LOG.md #<ID>`.
- Los commits relacionados incluyen el trailer `AI-Log: #<ID>`.
- Las reglas que siguen los agentes de IA están en `AGENTS.md` y `.cursor/rules/`.
