# UberClone — Versión Conductor

App móvil del conductor (React Native + Expo). Especificación: [`docs/PROJECT_SPEC.md`](docs/PROJECT_SPEC.md).

## Requisitos

- Node.js
- Android SDK / emulador (development build; Google Maps no corre en Expo Go)
- Variable `KEY` (Google Maps) en `.env` en la raíz del proyecto
- Credenciales de pago solo en `backend/.env` (nunca en la app)

## Arranque

```bash
npm install
npx expo run:android
```

Si ADB falla en WSL, reinicia el daemon en Windows, abre el emulador y verifica con `adb devices`.

## Simular un viaje (pasajero → conductor)

El script actúa como **pasajero**: geocodifica origen/destino, llama **Distance Matrix** una vez al crear la solicitud, calcula la tarifa y la ofrece al conductor. El conductor **no** ingresa origen ni destino; solo los ve y navega con **Directions** (al aceptar y al cambiar de fase).

No uses el botón de la app: la solicitud entra solo por este script.

### 1. Preparar la app

1. Inicia sesión con un conductor **approved**.
2. Pon el interruptor en **Disponible**.
3. La categoría del vehículo debe coincidir con `--category` (si no, la solicitud queda en limbo).

### 2. Lanzar la solicitud

En otra terminal (desde la raíz del repo):

Usa la forma `--clave=valor` (así las direcciones con espacios no se parten al pasar por npm):

```bash
npm run request-trip -- \
  --category=economy \
  --payment=cash \
  --origin="Altos de Polanco" \
  --destination="El Tesoro, El Poblado"
```

Ese comando:

1. Ejecuta `adb reverse tcp:8765 tcp:8765` (con timeout; si ADB cuelga, igual continúa).
2. Geocodifica las direcciones.
3. Consulta Distance Matrix y arma el viaje.
4. Deja la solicitud disponible para la app (unos segundos).

Parámetros obligatorios: `--category`, `--payment`, `--origin`, `--destination`.  
Opcionales: `--tip`, `--passenger`. Lat/lng solo si quieres forzar coordenadas.

Si Geocoding responde `REQUEST_DENIED`, la KEY llegó a Google pero está restringida (p. ej. solo Android) o falta habilitar Geocoding para uso desde el CLI. La KEY del Maps SDK Android no siempre sirve para el script: usa una KEY (o sin restricción de app) que permita Geocoding / Distance Matrix / Directions desde el servidor.

Ayuda:

```bash
npm run create-trip-request -- --help
```

### 3. Flujo en la app

1. Debe abrirse **Solicitud entrante** (15 s para aceptar/rechazar).
2. Al **Aceptar**: Distance Matrix otra vez + Directions al punto de recogida.
3. **Pasajero a bordo**: Directions al destino.
4. **Finalizar viaje** → resumen / cobro.

`MOCK_TRIPS` en historial/ganancias es temporal hasta cablear `trips` en Firestore; las solicitudes entrantes ya no se mockean en la UI.

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
