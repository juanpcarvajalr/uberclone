# UberClone — Versión Conductor · Especificación del proyecto

> **Fuente de verdad del proyecto.** Este documento resume y estructura el enunciado institucional para usarlo como contexto en Cursor.
> Si algo aquí contradice el enunciado original, **manda el enunciado** y se debe corregir este archivo.

---

## 0. Cómo debe usar este documento la IA

1. Leer este archivo antes de proponer arquitectura, pantallas o modelos de datos.
2. No inventar requisitos: si algo no está aquí ni en el enunciado, preguntar al integrante.
3. Toda interacción con IA se registra en `docs/AI_LOG.md` siguiendo `.cursor/rules/10-bitacora-ia.mdc`.
4. Nombres de código, campos de base de datos y comentarios de código **en inglés**; textos de UI **en español** (sin i18n).
5. Respetar las reglas de seguridad de la sección 9 sin excepciones.

---

## 1. Descripción general

Aplicación móvil multiplataforma (iOS y Android), versión **conductor** de un clon de Uber, construida con **React Native + Expo**. El conductor:

- se registra (datos personales, vehículo, documentos) y espera aprobación;
- se pone Disponible y envía su ubicación en tiempo real;
- recibe solicitudes con temporizador de 15 s para aceptar o rechazar;
- navega al punto de recogida y luego al destino (Google Directions);
- cobra con Mercado Pago (Checkout Pro) o efectivo;
- consulta tarifa, comisión (20 %), ganancia neta, historial y saldo.

Existe una app de **pasajero** que comparte categorías y la función `calculateFare`.

---

## 2. Stack técnico

| Capa | Tecnología | Notas |
|---|---|---|
| App | React Native + Expo | |
| Mapas | `react-native-maps` (Maps SDK Android/iOS) | Uso ilimitado |
| Rutas | Google Directions API | Solo al aceptar y al cambiar de fase |
| Distancia/duración | Google Distance Matrix API | 1 vez al crear la solicitud, 1 vez al aceptarla |
| Ubicación | `@react-native-community/geolocation` (`watchPosition`) | |
| Tiempo real | Firestore `onSnapshot` | |
| Notificaciones | Firebase Cloud Messaging (`@react-native-firebase/messaging`) | Solicitudes con app en segundo plano |
| Estado global | React Context (`useContext` + `useReducer`) | Sesión del conductor y viaje activo (sección 8) |
| Persistencia local | AsyncStorage | **Solo** sesión y último estado de disponibilidad |
| Imágenes | Cloudinary (plan gratuito) | Firebase Storage puede exigir plan Blaze |
| Backend de pagos | Node.js/Express | |
| Pagos | Mercado Pago Checkout Pro (`react-native-webview` o navegador) | Solo credenciales de prueba |

---

## 3. Estructura de carpetas sugerida

```
/
├─ src/
│  ├─ config/pricing.js            # Único lugar con parámetros de tarifa
│  ├─ utils/calculateFare.js       # Función pura compartida
│  ├─ hooks/
│  │  ├─ useDriverLocation.js
│  │  ├─ useTripRequests.js
│  │  └─ useEarnings.js
│  ├─ context/
│  │  ├─ DriverSessionContext.js   # Conductor autenticado, perfil, vehículo, accountStatus
│  │  └─ ActiveTripContext.js      # Viaje activo + reducer de transiciones de estado
│  ├─ navigation/                  # Stack, Tabs, Drawer
│  ├─ screens/
│  │  ├─ register/                 # PersonalDataTab, VehicleTab, DocumentsTab
│  │  ├─ HomeScreen.js
│  │  ├─ IncomingRequestScreen.js
│  │  ├─ TripInProgressScreen.js
│  │  ├─ TripSummaryScreen.js
│  │  ├─ EarningsScreen.js
│  │  ├─ TripHistoryScreen.js
│  │  ├─ TripDetailScreen.js
│  │  └─ ProfileSettingsScreen.js
│  ├─ services/                    # firestore, payments, maps, cloudinary
│  └─ validation/                  # Validadores puros del registro
├─ backend/                        # Express (pagos y webhooks)
│  └─ .env.example
├─ docs/
│  ├─ PROJECT_SPEC.md              # Este archivo
│  └─ AI_LOG.md                    # Bitácora de IA (obligatoria)
├─ .cursor/                        # Reglas y skills para Cursor
├─ firestore.rules                 # Permisos por colección (sección 11)
├─ AGENTS.md
├─ .env.example                    # Nombres de variables, sin valores
└─ README.md                       # Instalación, variables, sección "Uso de IA"
```

---

## 4. Navegación

- **Stack:** flujo del viaje (Inicio → Solicitud entrante → Viaje en curso → Cobro/Resumen).
- **Tabs:** registro (Datos personales · Vehículo · Documentos y pagos).
- **Drawer:** Perfil, Historial, Ganancias, Configuración.

---

## 5. Registro del conductor

- Tres pestañas con navegación Tab. El botón **Enviar registro** solo se habilita cuando las tres están completas y válidas.
- Ningún campo puede quedar nulo o vacío (aplicar `trim()` antes de validar).
- Errores **debajo de cada campo**, nunca en `Alert`.
- Al enviar se crean, en una sola escritura atómica (`writeBatch`), los documentos `drivers/{uid}`, `vehicles/{vehicleId}` y `driverLocations/{uid}` (sección 11). El conductor queda con `accountStatus = "pending"` e `isAvailable = false`.
- El conductor **no puede ponerse Disponible** hasta `accountStatus = "approved"` (se simula editando el documento en la consola de Firestore).

### Pestaña 1 — Datos personales

| Campo | Regla |
|---|---|
| Foto de perfil | Cámara o galería; obligatoria |
| Nombre completo | Máx. 50 caracteres; solo letras (incluye tildes, ñ, ü) y espacios. Sugerido: `/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]{1,50}$/` |
| Documento de identidad | Numérico, 6 a 10 dígitos: `/^\d{6,10}$/` |
| Celular | Numérico, 10 dígitos: `/^\d{10}$/` |
| Fecha de nacimiento | Selector de fecha; edad ≥ 18 años cumplidos |
| Género | Lista desplegable |
| Correo electrónico | Debe tener `@` y dominio válido |

### Pestaña 2 — Vehículo

| Campo | Regla |
|---|---|
| Categoría | `economy`, `xl`, `premium` (mismas del pasajero) |
| Placa | Convertir a mayúsculas antes de validar; carro: `/^[A-Z]{3}\d{3}$/` (ABC123) |
| Marca | Texto, máx. 30 caracteres |
| Modelo | Texto, máx. 30 caracteres |
| Año | 4 dígitos, no mayor al año actual |
| Fecha de matrícula | Selector de fecha (licencia de tránsito). No puede ser futura ni anterior al 1 de enero de (año del modelo − 1). Determina si se exige la revisión técnico-mecánica |
| Color | Lista desplegable |
| Capacidad de pasajeros | Numérico; si categoría = `xl`, mínimo 6 |
| Foto del vehículo | Obligatoria; debe verse la placa |

### Pestaña 3 — Documentos y pagos

| Campo | Regla |
|---|---|
| Licencia de conducción | Número + foto; vencimiento posterior a hoy |
| SOAT | Foto + vencimiento posterior a hoy |
| Revisión técnico-mecánica | Solo si `isTechnicalInspectionRequired(registrationDate)` es `true`: foto + vencimiento posterior a hoy, ambos obligatorios. Si es `false`, la pestaña muestra "No requerida hasta <fecha>" y los campos no se exigen (ver regla abajo) |
| Correo de Mercado Pago | Formato de correo válido |
| Aceptación de términos | Checkbox obligatorio; mostrar el % de comisión vigente (leído de `pricing.js`) |

> **Prohibido** guardar números de cuenta bancaria o de tarjeta en la app o en AsyncStorage. Los datos sensibles los maneja la pasarela.

Recomendación: los validadores van como funciones puras en `src/validation/` para poder probarlos sin UI.

### Regla de revisión técnico-mecánica

Vehículo particular nuevo (no moto): la primera revisión se exige a los **5 años contados desde la fecha de matrícula**.

```js
isTechnicalInspectionRequired(registrationDate, today = new Date())
// => true si today >= registrationDate + 5 años
```

- Función pura en `src/validation/`, con el plazo (5) en una constante configurable.
- Comparar solo fechas (sin hora), en zona horaria America/Bogota. Sumar años con `addYears` de `date-fns`.
- Si la revisión no es requerida, guardar la fecha en que empezará a serlo (`documents.technicalInspection.requiredFrom`), para mostrarla en el perfil.
- Supuesto académico: no se modelan motos ni vehículos de servicio público (plazos distintos).

| Caso (hoy = 2026-10-26) | registrationDate | Resultado |
|---|---|---|
| Menos de 5 años | 2022-03-10 | `false` |
| Un día antes del plazo | 2021-10-27 | `false` |
| Exactamente 5 años | 2021-10-26 | `true` |
| Más de 5 años | 2020-01-15 | `true` |
| Fecha futura | 2027-01-01 | Error de validación |

---

## 6. Pantallas del conductor

1. **Inicio:** mapa con ubicación actual + interruptor Disponible / No disponible. Mientras está Disponible, la ubicación se actualiza en `driverLocations/{uid}` cada pocos segundos (sugerido: 5 s o 10 m). Al pasar a No disponible o salir de la pantalla, el seguimiento se detiene con la **función de limpieza de** `useEffect`.
2. **Solicitud entrante:** origen, destino, distancia, duración, categoría, método de pago, tarifa estimada y ganancia neta estimada. Temporizador de **15 s**; al llegar a 0 se rechaza automáticamente.
3. **Viaje en curso:** ruta al punto de recogida; el botón **Pasajero a bordo** cambia la ruta al destino; botón **Finalizar viaje**.
4. **Cobro y resumen:** tarifa final, comisión, ganancia neta y estado del pago (Aprobado, Pendiente, Rechazado, Efectivo).
5. **Ganancias:** ver sección 10.
6. **Historial:** ver sección 11.
7. **Perfil y configuración:** datos editables, vehículo, documentos, cerrar sesión.

---

## 7. Estados del viaje (`status`)

El campo `status` controla qué pantalla se muestra.

| Estado | Significado | Transiciones válidas |
|---|---|---|
| `requested` | El pasajero solicitó el viaje | → `accepted`, `rejected`, `cancelled` |
| `accepted` | El conductor aceptó | → `driver_arriving`, `cancelled` |
| `driver_arriving` | Conductor va al punto de recogida | → `in_progress`, `cancelled` |
| `in_progress` | Pasajero a bordo | → `completed` |
| `completed` | Terminó; tarifa, comisión y ganancia calculadas | → `paid` |
| `paid` | Pago confirmado por la pasarela o efectivo registrado | (final) |
| `cancelled` | Cancelado por cualquiera **antes** de `in_progress` | (final) |
| `rejected` | Rechazado o vencido el tiempo y sin más conductores | (final) |

Si el conductor rechaza o vence el tiempo, la solicitud pasa al siguiente conductor o queda `rejected`.
Centralizar las transiciones en una función pura `canTransition(from, to)`, usada por el reducer de `ActiveTripContext` (sección 8) para no escribir estados inválidos.

---

## 8. Hooks obligatorios y estado global

| Hook | Uso exigido |
|---|---|
| `useState` | Disponibilidad, solicitud activa, formularios |
| `useEffect` **con limpieza** | Seguimiento de ubicación, temporizador de solicitud, suscripciones en tiempo real |
| `useContext` | Sesión del conductor y viaje activo |
| `useMemo` | Totales de ganancias |
| `useCallback` | Manejadores de aceptar y rechazar |
| Personalizados (mínimo) | `useDriverLocation`, `useTripRequests`, `useEarnings` |
| AsyncStorage | Solo sesión y último estado de disponibilidad |

### Estado global con React Context

Se usa **Context, no Redux**: el estado global es pequeño (sesión y viaje activo) y Firestore (`onSnapshot`) ya es la fuente de verdad en tiempo real, así que Redux solo agregaría configuración. Además, `useContext` es uno de los hooks exigidos.

- **Dos contextos separados**, para que una actualización del viaje no vuelva a renderizar todo lo que depende de la sesión:
  - `DriverSessionContext`: usuario autenticado, documento `drivers/{uid}`, vehículo y `accountStatus`. Se suscribe con `onSnapshot`, así el cambio a `approved` en la consola se refleja sin reiniciar la app.
  - `ActiveTripContext`: viaje activo, suscrito con `onSnapshot` a `trips/{tripId}`. Usa `useReducer` y valida cada cambio de estado con `canTransition`.
- Cada contexto expone un hook propio (`useDriverSession()`, `useActiveTrip()`) que lanza un error si se usa fuera de su Provider.
- El `value` del Provider se memoriza con `useMemo` y las acciones con `useCallback`.

---

## 9. Pasarela de pagos

**Pasarela:** Mercado Pago Checkout Pro vía API de Orders (cuentas de prueba vendedor/comprador + tarjetas de prueba). Stripe quedó fuera del alcance del equipo.

### Flujo obligatorio

1. Al finalizar el viaje, la app calcula la tarifa final con **la misma** `calculateFare` usada en la estimación.
2. La app envía al backend `tripId` y monto.
3. El backend crea la orden de Checkout Pro (API de Orders) con el access token y devuelve el checkout_url
4. La app abre el checkout; el pasajero paga con tarjeta de prueba.
5. Mercado Pago redirige a la URL de retorno; la app la detecta y el backend verifica el estado del pago en la API antes de actualizar el viaje.
6. La app del conductor escucha el cambio en tiempo real y muestra el resumen.

### Reglas de seguridad (no negociables)

- `access_token` de Mercado Pago **solo en el backend**, en `.env` excluido de Git.
- El repo incluye `.env.example` con los nombres de variables, sin valores.
- Solo credenciales de prueba durante todo el proyecto.
- Nunca pegar llaves, tokens ni datos personales reales en prompts de IA.

### Efectivo

El conductor marca el cobro como recibido. La plataforma no recibió dinero, así que la comisión se **descuenta del saldo** del conductor (puede quedar negativo). La liquidación se simula con un saldo en la app. *Split payments* reales = reto opcional de bonificación.

---

### Reto opcional de bonificación: split payments

- Objetivo: que la pasarela divida el pago real entre conductor (80 %) y plataforma (20 %), en lugar de simularlo con el saldo.
- Enfoque tentativo: modelo marketplace de Mercado Pago (cuenta del conductor vinculada por OAuth + comisión de la plataforma en la orden). Validar en la documentación oficial de Checkout Pro vía Orders cómo se define la comisión de marketplace antes de empezar.
- Solo se aborda cuando todos los entregables de la sección 14 estén completos.

## 10. Tarifa, comisión y ganancias

Todos los parámetros viven en `src/config/pricing.js`. Valores en **pesos colombianos enteros**.

| Parámetro | Valor |
|---|---|
| Tarifa base | 3.500 COP |
| Valor por km | 1.200 COP |
| Valor por minuto | 250 COP |
| Tarifa mínima | 6.000 COP |
| Multiplicador economy / xl / premium | 1,0 / 1,4 / 1,8 |
| Comisión de la plataforma | 20 % |

### Fórmulas

```
fareRaw        = (base + km * perKm + min * perMin) * multiplier[category]
fare           = roundTo100( max(minimumFare, fareRaw) )   // múltiplo de 100 más cercano, ANTES de la comisión
commission     = round(fare * commissionRate)
driverEarnings = fare - commission + tip                   // la propina va completa al conductor
```

### Contrato de la función

```js
calculateFare({ distanceKm, durationMin, category, tip = 0 })
// => { fare, commission, driverEarnings }
```

- Función **pura**, usada en la estimación del pasajero y en el cierre del viaje del conductor.
- Cada viaje guarda el `commissionRate` aplicado para que un cambio futuro no altere el historial.

### Casos de prueba obligatorios

| Caso | Entrada | fare | commission | driverEarnings |
|---|---|---|---|---|
| Ejemplo oficial economy | 8,5 km · 22 min · economy · tip 0 | 19.200 | 3.840 | 15.360 |
| Ejemplo oficial XL | 8,5 km · 22 min · xl · tip 0 | 26.900 | 5.380 | 21.520 |
| Premium | 8,5 km · 22 min · premium · tip 0 | 34.600 | 6.920 | 27.680 |
| Tarifa mínima | 1 km · 2 min · economy · tip 0 | 6.000 | 1.200 | 4.800 |
| Con propina | 8,5 km · 22 min · economy · tip 2.000 | 19.200 | 3.840 | 17.360 |

### Pantalla Ganancias

Para **hoy, semana y mes**, calculado con `useMemo` sobre el historial: número de viajes, total facturado, total de comisiones, propinas, ganancia neta y promedio por viaje.

**Saldo del conductor** = ganancias de viajes pagados por pasarela − comisiones de viajes en efectivo. Se **calcula** a partir de `trips`; no se guarda como campo, para evitar que quede desincronizado.

---

## 11. Historial de carreras y modelo de datos

### Historial

- `FlatList`, del más reciente al más antiguo.
- Filtros: Hoy, Semana, Mes, Rango de fechas + filtro por método de pago.
- Ítem: fecha y hora, origen → destino, categoría, tarifa, ganancia neta, estado del pago.
- Detalle: ruta dibujada con `Polyline` (no Static Maps), duración, distancia, comisión, propina, calificación.
- Sin resultados: mensaje vacío (no lista en blanco).
- Paginación o límite (ej. 20 viajes por carga).

### Modelo de datos (Firestore)

Cuatro colecciones. Conductor y vehículo van separados porque **Firestore no permite ocultar campos de un documento**: la app del pasajero necesita ver la placa y el color del carro, pero no debe poder leer el documento de identidad ni la fecha de nacimiento del conductor. Lo mismo aplica a la ubicación, que además se escribe cada pocos segundos y no debe disparar actualizaciones del perfil.

| Colección | Contenido | Quién lee | Quién escribe |
|---|---|---|---|
| `drivers/{uid}` | Datos personales y documentos (privado) | Solo el propio conductor | El propio conductor, excepto `accountStatus` (solo consola) |
| `vehicles/{vehicleId}` | Datos públicos del vehículo | Usuarios autenticados | El conductor dueño |
| `driverLocations/{uid}` | Disponibilidad y ubicación | Usuarios autenticados | El propio conductor |
| `trips/{tripId}` | Viajes | Conductor y pasajero del viaje | App: transiciones de estado · Backend: campos de pago |

Estas reglas se implementan en `firestore.rules`. El `uid` es el de Firebase Authentication.

#### `drivers/{uid}`

| Campo | Tipo | Descripción |
|---|---|---|
| `fullName` | string | Máx. 50 caracteres |
| `documentNumber` | string | 6 a 10 dígitos (string para conservar ceros a la izquierda) |
| `phone` | string | 10 dígitos |
| `birthDate` | timestamp | Mayor de 18 años |
| `gender` | string | Valor de la lista |
| `email` | string | Correo del conductor |
| `profilePhotoUrl` | string | URL de Cloudinary |
| `vehicleId` | string | Referencia a `vehicles` |
| `accountStatus` | string | `pending`, `approved`, `rejected` |
| `documents.driverLicense` | object | `{ number, photoUrl, expiresAt }` |
| `documents.soat` | object | `{ photoUrl, expiresAt }` |
| `documents.technicalInspection` | object | `{ required, requiredFrom, photoUrl?, expiresAt? }` (sección 5) |
| `mercadoPagoEmail` | string | Correo donde recibiría pagos |
| `termsAcceptedAt` | timestamp | Fecha de aceptación de términos |
| `termsCommissionRate` | number | Comisión mostrada al aceptar (0.20) |
| `fcmToken` | string | Token de Firebase Cloud Messaging |
| `createdAt`, `updatedAt` | timestamp | Auditoría |

#### `vehicles/{vehicleId}`

| Campo | Tipo | Descripción |
|---|---|---|
| `driverId` | string | Dueño (`uid`) |
| `category` | string | `economy`, `xl`, `premium` |
| `plate` | string | Mayúsculas, formato ABC123 |
| `brand`, `model` | string | Máx. 30 caracteres cada uno |
| `year` | number | 4 dígitos |
| `registrationDate` | timestamp | Fecha de matrícula |
| `color` | string | Valor de la lista |
| `passengerCapacity` | number | XL ≥ 6 |
| `photoUrl` | string | URL de Cloudinary |
| `createdAt`, `updatedAt` | timestamp | Auditoría |

#### `driverLocations/{uid}`

| Campo | Tipo | Descripción |
|---|---|---|
| `isAvailable` | boolean | Interruptor Disponible / No disponible |
| `location` | object | `{ lat, lng }` |
| `category` | string | Copia de la categoría del vehículo, para filtrar solicitudes sin leer `vehicles` |
| `updatedAt` | timestamp | Última actualización de ubicación |

#### `trips/{tripId}`

| Campo | Tipo | Descripción |
|---|---|---|
| `driverId`, `passengerId` | string | Referencias a los usuarios |
| `vehicleId` | string | Vehículo con el que se hizo el viaje |
| `origin`, `destination` | object | `{ lat, lng, address }` |
| `distanceKm`, `durationMin` | number | De Distance Matrix |
| `category` | string | `economy`, `xl`, `premium` |
| `fare`, `commission`, `tip`, `driverEarnings` | number | Pesos enteros |
| `commissionRate` | number | Porcentaje aplicado en ese viaje (0.20) |
| `paymentMethod` | string | `mercadopago`, `cash` |
| `paymentStatus`, `paymentId` | string | Respuesta de la pasarela |
| `status` | string | Sección 7 |
| `rating` | number | 1 a 5 |
| `routePolyline` | string | Ruta codificada, para dibujar el detalle sin volver a llamar Directions |
| `createdAt`, `completedAt` | timestamp | Fechas del viaje |

---

## 12. APIs externas y consumo

| Servicio | Uso | Decisión |
|---|---|---|
| Firebase Cloud Messaging | Nuevas solicitudes en segundo plano | Obligatoria |
| Firestore `onSnapshot` | Ubicación y estado del viaje | Obligatoria |
| Geolocalización (`watchPosition`) | Ubicación continua | Obligatoria |
| Maps SDK (`react-native-maps`) | Mapa | Incluida |
| Cloudinary | Fotos de perfil, vehículo, documentos | Recomendada |
| Nominatim (OSM) | Coordenadas → dirección (máx. 1 req/s) | Opcional |
| OSRM / OpenRouteService | Rutas alternativas para ahorrar cupo | Opcional |

Reglas de consumo:

- Distance Matrix: **una vez** al crear la solicitud y **una vez** al aceptarla. Nunca en cada movimiento.
- Restringir la API key de Google por aplicación y activar alertas de presupuesto.
- Historial: `Polyline` con ruta guardada, no Static Maps.

---

## 13. Bitácora de IA (obligatoria)

Protocolo completo en `.cursor/rules/10-bitacora-ia.mdc` y skill `bitacora-ia`. Resumen:

- Archivo `docs/AI_LOG.md` en `main`. Proyecto individual: se registra y se hace commit directamente en `main`.
- `README.md` con sección **Uso de IA** enlazando la bitácora.
- Se entrega también en PDF.
- Registrar en el momento, prompt **textual**, resumen en 2–3 líneas, qué se usó/modificó/descartó, archivos + hash de commit, verificación y aprendizaje.
- Bloques asistidos marcados con `// AI-assisted: see docs/AI_LOG.md #N`; commits con la línea `AI-Log: #N`.
- En la sustentación se puede pedir explicar cualquier bloque asistido.

---

## 14. Entregables y definición de terminado

- [ ] Repositorio en `main` con historial de commits claro.
- [ ] `README.md` con instalación, variables de entorno (`.env.example`) y sección **Uso de IA**.
- [ ] `docs/AI_LOG.md` + exportación PDF.
- [ ] Video ≤ 5 min: registro, solicitud, viaje, pago de prueba e historial.
- [ ] `calculateFare` pasa los casos de prueba de la sección 10.
- [ ] `isTechnicalInspectionRequired` pasa los casos de prueba de la sección 5.
- [ ] `firestore.rules` aplica los permisos de la sección 11.
- [ ] Ninguna llave secreta en el código de la app ni en el historial de Git.
- [ ] Todos los `// AI-assisted` apuntan a una entrada existente en la bitácora.

---

## 15. Decisiones del equipo

| Decisión                           | Opciones                                                | Elegida                                  | Fecha / responsable |
| ---------------------------------- | ------------------------------------------------------- | ---------------------------------------- | ------------------- |
| Base de datos en tiempo real       | Firestore / MongoDB                                     | Firestore                                |                     |
| Backend de pagos                   | Express / Cloud Functions                               | Express                                  |                     |
| Pasarela                           | Mercado Pago / Stripe                                   | Mercado Pago (sin Stripe)                |                     |
| Estado global                      | Context / Redux                                         | Context (`useContext` + `useReducer`)    |                     |
| Librería de ubicación              | `@react-native-community/geolocation` / `expo-location` | `@react-native-community/geolocation`    |                     |
| APIs de rutas                      | Directions + Distance Matrix / Routes API / OSRM        | Directions + Distance Matrix             |                     |
| Regla de revisión técnico-mecánica | —                                                       | Fecha de matrícula + 5 años              |                     |
| Modelo de datos                    | Conductor con vehículo embebido / colecciones separadas | Colecciones separadas (sección 11)       |                     |