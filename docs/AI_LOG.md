# Bitácora de uso de IA — UberClone Versión Conductor

- **Integrante:** Juan Pablo Carvajal Restrepo
- **Modalidad:** proyecto individual, trabajo directo sobre `main`.

Este archivo documenta **todo** uso de herramientas de inteligencia artificial en el proyecto (Claude, ChatGPT, Copilot, Gemini, Cursor u otras).

**Convenciones**
- ID de entrada: `#N`, correlativo.
- Código asistido marcado con `// AI-assisted: see docs/AI_LOG.md #N`.
- Los commits relacionados terminan con la línea `AI-Log: #N`.
- Los campos *Decisión del integrante*, *Verificación* y *Aprendizaje* los completa el integrante, no la IA.

## Declaraciones generales

### Uso de autocompletado (Cursor Tab / Copilot)
- Declaración: _indicar si el autocompletado con IA estuvo activo, en qué periodo y en qué archivos._

---

## Entradas

### Entrada #1
- Fecha: 2026-10-15
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Claude (claude.ai)
- Objetivo: Estructurar la especificación del proyecto y las reglas de Cursor para la bitácora de IA
- Prompt:
  ```text
  Esto es un proyecto institucional. Dame un MD para usarlo con mi IDE Cursor, y poder usarlo como insumo principal del proyecto.

  Es muy importante, el tema del uso de IA. Entonces ¿Cómo recomendarías manejarlo? Para que cada vez que la IA haga un cambio, documente como se relaciona en el documento, y además, si es necesario, necesito que me compartas las skills correspondientes.
  ```
- Resumen de la respuesta: Generó `docs/PROJECT_SPEC.md` a partir del enunciado, `AGENTS.md`, reglas de Cursor (`.cursor/rules/*.mdc`), la skill `bitacora-ia` y la plantilla de esta bitácora con trailer `AI-Log` en los commits.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: los archivos listados abajo.
  - Decisión del integrante: aceptado
- Archivos y commit: `docs/PROJECT_SPEC.md`, `docs/AI_LOG.md`, `AGENTS.md`, `.cursor/rules/*.mdc`, `.cursor/skills/bitacora-ia/SKILL.md` — Commit: pendiente
- Verificación: Se leyó cada uno de los archivos de skills y specs generados por la IA para validar su exactitud y que se alineen con el proyecto.
- Aprendizaje: Se evidencia la capacidad de la IA para organizar y definir las bases en proyectos de gran calibre, siendo aún así necesaria la intervención y cuidado del humano.

### Entrada #2
- Fecha: 2026-10-22
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Entender cómo debe calcularse la tarifa del caso de la spec
- Prompt:
  ```text
  ¿Cómo hago la función calculateFare? Con 8.5 km y 22 min en economy me tiene que dar 19200 de fare y no me cuadra: no sé si el redondeo al 100 va antes o después de la comisión del 20%.
  ```
- Resumen de la respuesta: El orden correcto es: tarifa cruda × multiplicador → máximo con mínima → redondeo a 100 → comisión. Propuso `pricing.js` + `calculateFare` / `roundTo100`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/config/pricing.js`, `src/utils/calculateFare.js`
  - Decisión del integrante: usado tal cual; dejé pricing.js como única fuente de la comisión
- Archivos y commit: `src/config/pricing.js`, `src/utils/calculateFare.js` — Commit: pendiente
- Verificación: Probé mentalmente 8.5 km / 22 min economy y me dio 19200 / 3840 / 15360; también revisé el caso de tip 2000
- Aprendizaje: El orden del redondeo importa: si comisionas antes, el caso oficial no cuadra. Mejor tener los números en un solo archivo.

### Entrada #3
- Fecha: 2026-10-22
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Entender por qué una transición de status no debería pasar
- Prompt:
  ```text
  ¿Por qué no puedo pasar de in_progress a cancelled? En mi código lo estaba permitiendo y creo que está mal según la tabla de la sección 7.
  ```
- Resumen de la respuesta: Porque con pasajero a bordo solo cabe `completed`. Dejó el mapa de transiciones válidas en una función pura.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/utils/canTransition.js`
  - Decisión del integrante: usado tal cual
- Archivos y commit: `src/utils/canTransition.js` — Commit: pendiente
- Verificación: Probé canTransition('in_progress','cancelled') → false y ('requested','accepted') → true
- Aprendizaje: Centralizar las transiciones evita que la UI invente estados que la spec no permite.

### Entrada #4
- Fecha: 2026-10-22
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Enganchar la validación de status al estado global del viaje
- Prompt:
  ```text
  ¿Cómo hago el ActiveTripContext con useReducer para que use canTransition? Cuando acepto me está quedando en accepted y yo necesito que ya quede como driver_arriving, ¿por qué se me queda a medias si disparo dos dispatch seguidos?
  ```
- Resumen de la respuesta: Sugirió una sola acción del reducer (`ACCEPT_AND_ARRIVE`) en vez de dos `TRANSITION` encadenados, que con el batching no veían el estado intermedio.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/context/ActiveTripContext.js`
  - Decisión del integrante: usado tal cual. Tiene sentido la acción ACCEPT_AND_ARRIVE
- Archivos y commit: `src/context/ActiveTripContext.js` — Commit: pendiente
- Verificación: Simulé aceptar desde requested y el status quedó en driver_arriving de una vez
- Aprendizaje: Dos dispatch seguidos no siempre ven el estado intermedio.

### Entrada #5
- Fecha: 2026-10-23
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Entender cuándo exige la spec la revisión técnico-mecánica
- Prompt:
  ```text
  ¿Cómo sé si isTechnicalInspectionRequired debe dar true? Probé con matrícula 2023-02-10 y hoy 2026-10-26 y no sé si estoy comparando mal las fechas (con horas me sale raro).
  ```
- Resumen de la respuesta: Hay que comparar solo día calendario (`startOfDay`) y sumar 5 años con `addYears`. Con esa matrícula aún no aplica; `requiredFrom` sería 2028-02-10.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/validation/isTechnicalInspectionRequired.js`
  - Decisión del integrante: usado tal cual
- Archivos y commit: `src/validation/isTechnicalInspectionRequired.js` — Commit: pendiente
- Verificación: Con matrícula 2023-02-10 y hoy 2026-10-26 da false; con 2021-10-26 da true
- Aprendizaje: Comparar fechas con hora mete bugs. startOfDay deja la comparación limpia.

### Entrada #6
- Fecha: 2026-10-23
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Validar placa y nombre sin Alert
- Prompt:
  ```text
  ¿Por qué mi validatePlate acepta "abc123" y la spec pide mayúsculas? Y el nombre me está dejando números. ¿Cómo hago las regex bien y que el error salga debajo del input, no en un Alert?
  ```
- Resumen de la respuesta: Hay que hacer `.toUpperCase()` / `trim()` antes de validar; nombre con `/^[A-Za-zÁÉÍÓÚ... ]{1,50}$/`. Dejó el resto de validadores puros en `registerValidators.js`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/validation/registerValidators.js`
  - Decisión del integrante: usado tal cual; apliqué toUpperCase en el input de placa
- Archivos y commit: `src/validation/registerValidators.js` — Commit: pendiente
- Verificación: validatePlate('abc123') falla hasta pasar a mayúsculas; 'Juan3' falla en el nombre
- Aprendizaje: Validar después de trim/normalizar evita falsos positivos en el formulario.

### Entrada #7
- Fecha: 2026-10-23
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Tener un objeto conductor de prueba alineado al modelo
- Prompt:
  ```text
  ¿Cómo armo el mock del driver mientras no tenga Firebase? No sé qué campos mínimos pide la sección 11 para que después no me toque romper las pantallas.
  ```
- Resumen de la respuesta: Listó los campos de `drivers` / `vehicles` / `driverLocations` y propuso un mock approved en Medellín (Onix, ABC123).
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/mocks/driver.js`
  - Decisión del integrante: usado tal cual
- Archivos y commit: `src/mocks/driver.js` — Commit: pendiente
- Verificación: Revisé que vehicleId del driver coincida con el mock del vehículo y que accountStatus sea approved
- Aprendizaje: Si el mock no sigue el modelo de la sección 11, después las pantallas piden campos que no existen.

### Entrada #8
- Fecha: 2026-10-23
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Evitar hardcodear montos en los viajes mock
- Prompt:
  ```text
  ¿Por qué en el mock de trips no debería poner fare: 19200 a mano? Quiero que si cambio pricing.js los mocks sigan cuadrando. ¿Cómo los genero con calculateFare?
  ```
- Resumen de la respuesta: Spread del resultado de `calculateFare(...)` al armar cada trip; dejó 4 viajes + solicitud entrante.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/mocks/trips.js`
  - Decisión del integrante: usado tal cual
- Archivos y commit: `src/mocks/trips.js` — Commit: pendiente
- Verificación: El trip economy 8.5/22 quedó en 19200 porque usa calculateFare y no un número quemado suelto
- Aprendizaje: Si hardcodeo fares en el mock, cualquier cambio en pricing.js me desincroniza el historial.

### Entrada #9
- Fecha: 2026-10-24
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Bloquear Disponibilidad si la cuenta no está approved
- Prompt:
  ```text
  ¿Por qué el switch de Disponible me deja en true aunque accountStatus sea pending? ¿Cómo hago setAvailability en el DriverSessionContext para que lo rechace y solo guarde idioma/isAvailable en AsyncStorage?
  ```
- Resumen de la respuesta: Validar `accountStatus === 'approved'` antes de setear; si no, devolver `{ ok: false }`. No persistir documentos ni datos bancarios.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/context/DriverSessionContext.js`
  - Decisión del integrante: usado tal cual
- Archivos y commit: `src/context/DriverSessionContext.js` — Commit: pendiente
- Verificación: Puse accountStatus pending en el mock y el switch ya no me dejó Disponible
- Aprendizaje: La regla de negocio (solo approved) tiene que vivir en el context, no solo en la UI del Switch.

### Entrada #11
- Fecha: 2026-10-25
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Pintar Home con lo que ya existe de hooks/context
- Prompt:
  ```text
  ¿Cómo conecto el Switch y el botón Simular solicitud en HomeScreen con useDriverSession / useDriverLocation / useTripRequests? El mapa de verdad después.
  ```
- Resumen de la respuesta: Esqueleto de Home que lee coords, llama `setAvailability` y navega si el trigger funciona.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/screens/HomeScreen.js`
  - Decisión del integrante: usado con ajustes menores de texto en español
- Archivos y commit: `src/screens/HomeScreen.js` — Commit: pendiente
- Verificación: En el emulador: Disponible → Simular solicitud abre IncomingRequest
- Aprendizaje: Home no necesita el mapa real para validar el flujo.

### Entrada #12
- Fecha: 2026-10-25
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Aclarar la fórmula del saldo (efectivo)
- Prompt:
  ```text
  ¿Por qué en efectivo la comisión se descuenta del saldo del conductor? No entiendo la fórmula: ¿sumo driverEarnings de todo y ya, o los cash van distinto? ¿Eso se guarda en el documento del driver?
  ```
- Resumen de la respuesta: No se guarda: se calcula desde trips. Pasarela suma `driverEarnings`; cash resta `commission` (puede quedar negativo).
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: explicación (sin código)
  - Decisión del integrante: acepté la explicación; no pedí código en esa duda
- Archivos y commit: `ninguno` — Commit: pendiente
- Verificación: Sumé a mano trip_002 (cash): la comisión se resta del saldo, no se suma driverEarnings de ese viaje como pasarela
- Aprendizaje: El saldo no es un campo en Firestore: si lo guardara a mano se desincroniza con los trips.

### Entrada #14
- Fecha: 2026-10-25
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Agregar ganancias por periodo con useMemo
- Prompt:
  ```text
  ¿Cómo hago useEarnings para hoy/semana/mes con useMemo? Me están recalculando en cada render y la spec pide useMemo. También la función del saldo de la duda anterior.
  ```
- Resumen de la respuesta: Tres agregados memorizados + `calculateDriverBalance` sobre el mock.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/hooks/useEarnings.js`
  - Decisión del integrante: usado tal cual
- Archivos y commit: `src/hooks/useEarnings.js` — Commit: pendiente
- Verificación: today/week/month cambian según la fecha del celular; el balance global no depende del tab
- Aprendizaje: useMemo evita recalcular agregaciones en cada render de la pantalla de ganancias.

### Entrada #15
- Fecha: 2026-10-25
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Mostrar en UI lo que ya calcula el hook
- Prompt:
  ```text
  ¿Cómo pinto EarningsScreen con lo de useEarnings? Quiero tabs Hoy/Semana/Mes y el saldo arriba. Además, no sé si el promedio por viaje va redondeado.
  ```
- Resumen de la respuesta: Pantalla simple consumiendo `today|week|month` y `balance`; promedio con `Math.round`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/screens/EarningsScreen.js`
  - Decisión del integrante: usado tal cual
- Archivos y commit: `src/screens/EarningsScreen.js` — Commit: pendiente
- Verificación: Cambié entre Hoy/Semana/Mes y vi distintos totales; el saldo arriba se mantiene
- Aprendizaje: La UI solo presenta lo del hook. La lógica de negocio no debería vivir en el JSX.

### Entrada #16
- Fecha: 2026-10-25
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Entender la jerarquía de navegación antes de codear
- Prompt:
  ```text
  ¿Cómo queda la jerarquía de navigators? No me queda claro si el Drawer envuelve el Stack del viaje o al revés, y dónde van las Tabs del registro.
  ```
- Resumen de la respuesta: Root elige Registro (Tabs) vs App (Drawer); dentro del Drawer, Inicio es el Stack del viaje.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: explicación
  - Decisión del integrante: usé la jerarquía que me explicó para armar los navigators después
- Archivos y commit: `ninguno` — Commit: pendiente
- Verificación: Lo contrasté con la sección 4 de la spec: Tabs registro, Stack viaje, Drawer periféricos
- Aprendizaje: Preguntar la jerarquía antes de codear me ahorró meter el Drawer dentro del Stack al revés.

### Entrada #17
- Fecha: 2026-10-25
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Instalar dependencias sin romper peers de Expo 57
- Prompt:
  ```text
  ¿Por qué si hago npm install @react-navigation/native a pelo me salen warnings de peers? ¿Cómo las instalo bien en Expo 57 (stack, tabs, drawer)?
  ```
- Resumen de la respuesta: Usar `npx expo install` para alinear versiones con el SDK (screens, safe-area, gesture-handler, reanimated).
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: comando `expo install` + deps en package.json
  - Decisión del integrante: usé expo install como indicó
- Archivos y commit: `package.json`, `package-lock.json` — Commit: pendiente
- Verificación: Después de instalar, el proyecto arrancó sin pelear tanto con peer deps de screens/reanimated
- Aprendizaje: En Expo es mejor expo install que npm install a pelo para paquetes nativos.

### Entrada #18
- Fecha: 2026-10-25
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Cablear App.js con providers y navigators
- Prompt:
  ```text
  ¿Cómo dejo App.js con DriverSessionProvider + ActiveTripProvider y el RootNavigator? Me está fallando el Drawer si no envuelvo con GestureHandlerRootView. ¿Eso va afuera de NavigationContainer?
  ```
- Resumen de la respuesta: `GestureHandlerRootView` envuelve providers + navigator. Armó Root / Register / TripStack / MainDrawer e i18n mínimo.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `App.js`, navigators, `src/i18n/index.js`, `src/theme/colors.js`
  - Decisión del integrante: usado tal cual; el GestureHandlerRootView sí iba por fuera
- Archivos y commit: `App.js`, `src/navigation/RootNavigator.js`, `src/navigation/RegisterNavigator.js`, `src/navigation/TripStack.js`, `src/navigation/MainDrawer.js`, `src/i18n/index.js`, `src/theme/colors.js` — Commit: pendiente
- Verificación: Abrí el Drawer en Expo Go sin crash y pude entrar a Ganancias/Historial
- Aprendizaje: Sin GestureHandlerRootView el Drawer se queja; el orden de providers importa.

### Entrada #19
- Fecha: 2026-10-26
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Arreglar el timer de 15 s que se dispara mal
- Prompt:
  ```text
  ¿Por qué el timer de IncomingRequestScreen a veces rechaza dos veces o sigue corriendo si salgo de la pantalla? ¿Cómo hago el useEffect de los 15s con clearInterval en el return?
  ```
- Resumen de la respuesta: Un solo interval, deps estables, cleanup obligatorio; al llegar a 0 llamar `rejectTrip` una vez.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/screens/IncomingRequestScreen.js`
  - Decisión del integrante: usado tal cual
- Archivos y commit: `src/screens/IncomingRequestScreen.js` — Commit: pendiente
- Verificación: Dejé correr el timer a 0 sin tocar: volvió a Home una sola vez y el interval no quedó vivo
- Aprendizaje: El cleanup del useEffect en timers es tan importante como el del GPS.

### Entrada #20
- Fecha: 2026-10-26
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Cambiar de fase pickup → destino en la misma pantalla
- Prompt:
  ```text
  ¿Cómo hago en TripInProgress para que el mismo botón cambie de "Pasajero a bordo" a "Finalizar viaje"? Ahora mismo no sé qué status mirar (accepted vs driver_arriving vs in_progress).
  ```
- Resumen de la respuesta: Si está en `accepted`/`driver_arriving` va al pickup; en `in_progress` al destino. Botones llaman `markPassengerOnBoard` / `completeTrip`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/screens/TripInProgressScreen.js`
  - Decisión del integrante: usado tal cual
- Archivos y commit: `src/screens/TripInProgressScreen.js` — Commit: pendiente
- Verificación: Acepté un viaje mock: el botón pasó de Pasajero a bordo a Finalizar viaje al cambiar el status
- Aprendizaje: Una sola pantalla con dos fases según status es más simple que dos rutas distintas.

### Entrada #21
- Fecha: 2026-10-26
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Cerrar el viaje mostrando tarifa y pago mock
- Prompt:
  ```text
  ¿Por qué en el resumen me aparece commissionRate undefined a veces? ¿Cómo pinto TripSummaryScreen con fare/commission/neto y un botón que simule paid (o efectivo recibido) sin pegarle aún a Mercado Pago?
  ```
- Resumen de la respuesta: Usar `trip.commissionRate ?? PRICING.commissionRate`. `markPaid` / `clearTrip` para el mock de cobro.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/screens/TripSummaryScreen.js`
  - Decisión del integrante: usado tal cual; el fallback de commissionRate me quitó el undefined
- Archivos y commit: `src/screens/TripSummaryScreen.js` — Commit: pendiente
- Verificación: En el resumen economy vi 19200 / 3840 / 15360 y el botón de simular pago pasó a paid
- Aprendizaje: Guardar commissionRate en el trip evita que un cambio futuro de pricing.js reescriba el historial.

### Entrada #22
- Fecha: 2026-10-26
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Empty state del historial cuando el filtro no deja nada
- Prompt:
  ```text
  ¿Por qué en TripHistoryScreen se me ve la FlatList vacía fea cuando filtro por Efectivo y no hay datos? ¿Cómo pongo el mensaje vacío y ordeno del más reciente al más antiguo?
  ```
- Resumen de la respuesta: `ListEmptyComponent` + sort por `completedAt` desc; chips de periodo y pago.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/screens/TripHistoryScreen.js`
  - Decisión del integrante: usado tal cual
- Archivos y commit: `src/screens/TripHistoryScreen.js` — Commit: pendiente
- Verificación: Filtro Efectivo dejó solo el viaje cash; un filtro sin matches muestra el mensaje vacío
- Aprendizaje: ListEmptyComponent es parte del requisito: lista en blanco no cuenta como empty state.

### Entrada #23
- Fecha: 2026-10-26
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Detalle sin volver a llamar Directions
- Prompt:
  ```text
  ¿Cómo muestro la ruta en TripDetailScreen sin Static Maps ni otra llamada a Directions? La spec habla de la polyline guardada pero yo solo tengo un string mock, ¿alcanza por ahora?
  ```
- Resumen de la respuesta: Sí para esta fase: mostrar el `routePolyline` mock + montos/rating del trip encontrado por `tripId`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/screens/TripDetailScreen.js`
  - Decisión del integrante: usado tal cual para la fase mock
- Archivos y commit: `src/screens/TripDetailScreen.js` — Commit: pendiente
- Verificación: Abrí trip_001 desde el historial y vi origen, destino y el string de polyline
- Aprendizaje: La polyline guardada evita gastar cuota de Directions solo para mirar un viaje viejo.

### Entrada #24
- Fecha: 2026-10-26
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Entender por qué Enviar registro sigue deshabilitado
- Prompt:
  ```text
  ¿Por qué el botón Enviar registro no se habilita si creo que ya llené las 3 tabs? ¿Cómo conecto isPersonalTabValid / isVehicleTabValid / isDocumentsTabValid y lo de la RTM "No requerida hasta..."?
  ```
- Resumen de la respuesta: Revisar errores por campo (fechas ISO, términos, email MP). Wiring en `RegisterNavigator` + tabs; submit deja `accountStatus: pending`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: tabs de registro + submit en el navigator
  - Decisión del integrante: usado con el wiring del navigator; dejé fotos como URL mock
- Archivos y commit: `src/screens/register/PersonalDataTab.js`, `src/screens/register/VehicleTab.js`, `src/screens/register/DocumentsTab.js`, `src/navigation/RegisterNavigator.js` — Commit: pendiente
- Verificación: Con un campo vacío el botón Enviar queda disabled; con matrícula 2023 sale No requerida hasta…
- Aprendizaje: El submit atómico (las 3 tabs válidas) fuerza a no mandar registros a medias.

### Entrada #25
- Fecha: 2026-10-26
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Cerrar sesión y cambiar idioma sin tocar datos sensibles
- Prompt:
  ```text
  ¿Cómo hago en ProfileSettingsScreen el toggle es/en y el cerrar sesión usando el context? ¿AsyncStorage puede guardar el correo de Mercado Pago o eso también está prohibido?
  ```
- Resumen de la respuesta: Solo idioma (y disponibilidad) en AsyncStorage. MP email vive en el perfil en memoria/mock, no como secreto de pago. SignOut / Entrar mock.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/screens/ProfileSettingsScreen.js`
  - Decisión del integrante: usado tal cual
- Archivos y commit: `src/screens/ProfileSettingsScreen.js` — Commit: pendiente
- Verificación: Cambié idioma es↔en y cerré sesión; AsyncStorage no guarda el correo de MP
- Aprendizaje: Separar lo persistible (idioma/disponibilidad) de lo sensible evita meterme en problemas de la sección de seguridad.
### Entrada #26
- Fecha: 2026-10-27
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Entender por qué cada pantalla se ve distinta
- Prompt:
  ```text
  En Home el título se ve de un tamaño y en Ganancias de otro, y los botones tampoco coinciden (unos con borderRadius 8 otros 10).
  ```
- Resumen de la respuesta: Sí, cada módulo inventaba tipografía/radios. Propuse tokens (`spacing`, `radii`, `typography`) y ampliar `colors` con `onPrimary` etc.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/theme/tokens.js`, ajustes en `src/theme/colors.js`
  - Decisión del integrante: usado; quiero un solo lugar para el look
- Archivos y commit: `src/theme/tokens.js`, `src/theme/colors.js` — Commit: pendiente
- Verificación: Abrí tokens y ya no hay magic numbers sueltos para padding/radius base
- Aprendizaje: Si el estilo vive copiado en 10 StyleSheets, la app se ve como 10 apps distintas

### Entrada #27
- Fecha: 2026-10-27
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Reusar card/botón/input en todas las pantallas
- Prompt:
  ```text
  ¿Ahora cómo hago para que el botón primario de Inicio sea el mismo que el de Resumen y el de Enviar registro?
  ```
- Resumen de la respuesta: Armó `commonStyles` (screen, card, panel, botones, chips, inputs) y un `FormField` compartido; migró pantallas y tabs de registro para consumirlos.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `commonStyles.js`, `FormField.js` + pantallas/registro
  - Decisión del integrante: usado; dejé solo estilos locales cuando era layout puntual
- Archivos y commit: `src/theme/commonStyles.js`, `src/components/FormField.js`, `src/screens/*`, `src/screens/register/*`, `src/navigation/RegisterNavigator.js` — Commit: pendiente
- Verificación: Igualdad en los estilos
- Aprendizaje: El tema no sirve si las pantallas no lo usan.

### Entrada #28
- Fecha: 2026-10-27
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Ask, modelo: Composer)
- Objetivo: Confirmar que el menú y paneles también siguen el mismo look
- Prompt:
  ```text
  El panel de abajo en Home y el de TripInProgress se veían casi iguales pero no iguales (padding distinto)-
  ```
- Resumen de la respuesta: Sí: ambos usan `commonStyles.panel` / botones del tema. El header del stack mantiene el ☰; no hace falta otro estilo paralelo.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: revisión Home + TripInProgress sobre el panel compartido
  - Decisión del integrante: Usado tal cual.
- Archivos y commit: `src/screens/HomeScreen.js`, `src/screens/TripInProgressScreen.js` — Commit: pendiente
- Verificación: Abrí Inicio y Viaje en curso; el sheet inferior se ve del mismo radio/padding
- Aprendizaje: Unificar no es solo colores: también paneles, gaps y botones.

### Entrada #29
- Fecha: 2026-11-02
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Entender y corregir el warning de persistencia de Firebase Auth en React Native
- Prompt:
  ```text
  @\home\juanp\.cursor\projects\home-juanp\terminals\1.txt:292-315  Estoy recibiendo este Warning sobre la Auth de Firebase. ¿Qué pasa?
  ```
- Resumen de la respuesta: `getAuth` sin AsyncStorage deja la sesión solo en memoria; al reiniciar la app se pierde. Se cambió a `initializeAuth` con `getReactNativePersistence` (AsyncStorage v2) y `try/catch` por el hot reload.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/config/firebaseConfig.js` con persistencia RN
  - Decisión del integrante: usado tal cual.
- Archivos y commit: `src/config/firebaseConfig.js` — Commit: pendiente
- Verificación: En efecto, ya no sale la advertencia.
- Aprendizaje: Puedo concluir que si no sale la advertencia es porque ahora sí se está almacenando el Auth en AsyncStorage para su persistencia entre reinicios.

### Entrada #30
- Fecha: 2026-11-02
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Hacer que el ScrollView siga usable al abrir el teclado en el registro
- Prompt:
  ```text
  ¿Por qué el scrollview no funciona cuando abro el teclado en las pantallas? Sé que me falta una propiedad pero no la recuerdo. Ayúdame.
  ```
- Resumen de la respuesta: Con el teclado encima no había rango de scroll. Se armó `FormScrollView` (ScrollView de gesture-handler + `paddingBottom` = altura del teclado + `keyboardDismissMode="none"`) y en Android `softwareKeyboardLayoutMode: "pan"`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `FormScrollView`, `useKeyboardHeight`, tabs de registro, `app.json`
  - Decisión del integrante: Se usó tal cual.
- Archivos y commit: `src/components/FormScrollView.js`, `src/hooks/useKeyboardHeight.js`, `src/screens/register/PersonalDataTab.js`, `src/screens/register/VehicleTab.js`, `src/screens/register/DocumentsTab.js`, `app.json` — Commit: pendiente
- Verificación: Hice la prueba y ahora el scroll sí funciona adecuadamente.
- Aprendizaje: Si el teclado se abría el contenido quedaba estático y no tenía para dónde crecer. Se adicionó el paddingBottom y las propiedades correspondientes.

### Entrada #31
- Fecha: 2026-11-02
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Evitar errores tipográficos usando selectores en campos del registro
- Prompt:
  ```text
  Quiero que cambies los campos que se puedan usar con selector y no con texto, para evitar fallas.
  ```
- Resumen de la respuesta: Se agregaron `SelectField` y `DateField` (modal, sin deps nuevas). En registro: género, fechas, categoría, año, color y capacidad pasan a selector; texto libre solo donde aplica (nombre, documento, placa, etc.).
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: SelectField, DateField, registerOptions y las 3 tabs
  - Decisión del integrante: Usado tal cual.
- Archivos y commit: `src/components/SelectField.js`, `src/components/DateField.js`, `src/constants/registerOptions.js`, `src/screens/register/PersonalDataTab.js`, `src/screens/register/VehicleTab.js`, `src/screens/register/DocumentsTab.js` — Commit: pendiente
- Verificación: Se realiza la verificación de los selectores, para que sea más amigable siendo exitosa.
- Aprendizaje: Hay campos que no deben ser texto libre. Es recomendado que sean seleccionables para evitar errores humanos.

### Entrada #32
- Fecha: 2026-11-02
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Diagnosticar error Firebase Auth configuration not found
- Prompt:
  ```text
  Recibí un error que dice que Firebase auth configuration not found.
  ```
- Resumen de la respuesta: No es un bug del código: Auth no tiene habilitado Correo/contraseña (o Identity Toolkit) en el proyecto `uberclone-70134`. Hay que activarlo en la consola de Firebase.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: pasos en Authentication → Sign-in method (sin cambio de código)
  - Decisión del integrante: Realizar la actividad.
- Archivos y commit: `ninguno` — Commit: pendiente
- Verificación: Se realizó la configuración exitosa desde la consola de Firebase.
- Aprendizaje: Para poder permitir el acceso con usuario y contraseña, se debe habilitar la autenticación en la consola de Firebase nativa. Esto facilita el inicio de sesión en las aplicaciones sin código adicional en mi aplicación.

### Entrada #33
- Fecha: 2026-11-02
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Definir firestore.rules según permisos de la spec antes de escribir el registro
- Prompt:
  ```text
  Antes de probar el registro en Firestore, ¿me ayudas a armar firestore.rules? En la spec el conductor solo puede leer/escribir lo suyo y no debería poder cambiarse accountStatus solo.
  ```
- Resumen de la respuesta: Se creó `firestore.rules` con `drivers`, `vehicles`, `driverLocations` y `trips`: dueño autenticado, create de driver con `accountStatus == pending`, update sin alterar ese campo.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: archivo `firestore.rules` alineado a la sección 11
  - Decisión del integrante: Aprobadas las reglas.
- Archivos y commit: `firestore.rules` — Commit: pendiente
- Verificación: Se usaron las reglas en la consola de Firestore.
- Aprendizaje: Debo limitar la DB, usando reglas de control. La IA teniendo el contexto adecuado, es capaz de entregar las reglas que se adapten. 


### Entrada #34
- Fecha: 2026-11-02
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Subir fotos a Cloudinary en el registro en lugar de guardar URIs file://
- Prompt:
  ```text
  Las URL de las imágenes están quedando en local, por ejemplo:

  "file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252Fuberclone-455c3d58-42f2-4905-abda-092c57ab8f09/ImagePicker/306dbbdf-4d4a-4160-8a94-9132081bde1f.jpeg"

  No se están almacenando aparentemente en Cloudinary. Además, ayúdame a moverme en Cloudinary para encontrar las imágenes una vez sean subidas.
  ```
- Resumen de la respuesta: `registerDriver` guardaba la URI local. Ahora sube con `uploadImage` antes del `writeBatch` y guarda `secure_url`. En Cloudinary: Media Library → carpeta `uberclone/drivers/{uid}/…`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: subir fotos en `registerDriver.js` usando `cloudinary.js`
  - Decisión del integrante: Realizar pruebas y modificar si es necesario.
- Archivos y commit: `src/services/registerDriver.js`, `src/services/cloudinary.js` — Commit: pendiente
- Verificación: Registrar de nuevo el conductor, y ver la URL correcta en la colección, y que las imágenes se carguen en Cloudinary.
- Aprendizaje: Se estaba usando la URI local de las imágenes. Se debe ejecutar la lógica de Cloudinary.

### Entrada #35
- Fecha: 2026-11-02
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Corregir error Unsupported FormDataPart al subir a Cloudinary
- Prompt:
  ```text
  Estoy recibiendo Unsupported FormDataPart implementation. ¿Qué está pasando?
  ```
- Resumen de la respuesta: En RN nuevo, `FormData.append('file', { uri, name, type })` falla. Se convierte la URI a `Blob` con `fetch` y luego se hace append del blob.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: ajuste en `src/services/cloudinary.js`
  - Decisión del integrante: Aceptar y realizar pruebas.
- Archivos y commit: `src/services/cloudinary.js` — Commit: pendiente
- Verificación: Registrar de nuevo el conductor, y ver la URL correcta en la colección, y que las imágenes se carguen en Cloudinary.
- Aprendizaje: Al hacer append con esta versión de React Native, es requerido obtener un Blob a partir de la URI local. (Debe ser binario)

### Entrada #36
- Fecha: 2026-11-02
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Corregir lectura de URI local al subir imágenes a Cloudinary
- Prompt:
  ```text
  Ahora estoy recibiendo No se pudo leer la imagen local.
  ```
- Resumen de la respuesta: `fetch(file://…)` falla en RN/Expo. Se lee la imagen con `XMLHttpRequest` (`responseType: 'blob'`) y luego se sube a Cloudinary.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `src/services/cloudinary.js` con XHR
  - Decisión del integrante: Aceptar y probar.
- Archivos y commit: `src/services/cloudinary.js` — Commit: pendiente
- Verificación: Registrar de nuevo el conductor, y ver la URL correcta en la colección, y que las imágenes se carguen en Cloudinary.
- Aprendizaje: Se debe obtener la URI local con XHR directamente y luego construir el blob para enviar a Cloudinary.

### Entrada #37
- Fecha: 2026-11-02
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Permitir tomar fotos con la cámara además de la galería en el registro
- Prompt:
  ```text
  Las fotos también deben poder tomarse con la cámara del celular.
  ```
- Resumen de la respuesta: `ImagePickerField` ahora ofrece Galería y Cámara (`launchCameraAsync` + permiso de cámara). Se declaró el permiso en `app.json`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `ImagePickerField.js` y permisos en `app.json`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/components/ImagePickerField.js`, `app.json` — Commit: pendiente
- Verificación: _pendiente — sugerida: en registro usar Cámara, conceder permiso y ver la preview_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #38
- Fecha: 2026-11-07
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Limitar campos numéricos del registro, corregir el texto de Términos y Condiciones y reforzar validaciones
- Prompt:
  ```text
  uberclone 

  Necesito que corrijas lo siguiente, y no olvides añadir la entrada a la bitácora.

  Limitar campos sin permitir más escritura para los numéricos, y que no diga términos, sino Términos y Condiciones.

  Además, mejora las validaciones de los campos.
  ```
- Resumen de la respuesta: Se cortó la entrada en documento, celular, licencia y placa con `maxLength` y sanitización al escribir. El switch pasó a “Términos y Condiciones”. Se reforzaron validadores (nombre completo, celular CO, contraseña, vacíos de año/capacidad) y se alineó `isPersonalTabValid` con `validatePassword`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: límites y sanitización en pestañas de registro; mensajes y reglas en `registerValidators.js`; texto del switch en Documentos
  - Decisión del integrante: Aceptar cambios.
- Archivos y commit: `src/validation/registerValidators.js`, `src/screens/register/PersonalDataTab.js`, `src/screens/register/VehicleTab.js`, `src/screens/register/DocumentsTab.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: Se realizó la validación de los límites manualmente, y la data mockeada tampoco persiste. Siendo así exitoso el cambio.
- Aprendizaje: Es recomendable realizar la limitación desde los campos directamente y no solo advertencias al usuario.

### Entrada #39
- Fecha: 2026-11-07
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Definir límites de cuota/presupuesto en Google Maps para evitar cobros inesperados
- Prompt:
  ```text
  Tengo una duda. ¿Qué limites me recomiendas establecer en las APIs para prevenir un cobro a mi tarjeta? Regístralo en la bitácora.
  ```
- Resumen de la respuesta: Presupuesto mensual bajo (≈ USD 5–10) con alerta al 50/90/100 %, cuotas diarias modestas en Directions y Distance Matrix, y restricción de la API key por app/APIs. Maps SDK no suele ser el riesgo principal; el consumo de rutas sí.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: rangos de presupuesto y cuotas diarias orientativos según el uso de la spec
  - Decisión del integrante: Aceptar recomendación.
- Archivos y commit: `docs/AI_LOG.md` — Commit: pendiente
- Verificación: Se establecen los límites en la consola de Google Cloud.
- Aprendizaje: N/A.

### Entrada #40
- Fecha: 2026-11-07
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Corregir validaciones, errores, teclado, doble clic y navegación atrás del login/registro
- Prompt:
  ```text
  Necesito que corrijas los siguientes puntos que veo realizando pruebas en mi login:

  1. Mejora las validaciones del campo de correo además que me está poniendo en mayúscula inicial.
  2. La contraseña no debería verse en texto plano.
  3. Necesito mejorar el manejo de errores y que sean más dicientes.
  4. El botón de Entrar, permite hacer varios clics y por ende hace varias peticiones.
  5. El teclado me tapa campos y botones.
  6. En la pantalla de registro, debería poder volver atrás a @uberclone/src/screens/WelcomeScreen.js 

  No olvides ingresar esto a la bitácora.
  ```
- Resumen de la respuesta: Se normalizó el correo (minúsculas, sin espacios, `autoCapitalize="none"`), se ocultó la contraseña, se pasaron errores bajo el campo con mensajes Firebase más claros, se bloqueó el doble envío, se usó `FormScrollView` para el teclado y se añadió “Volver” en registro hacia Welcome.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: ajustes en `WelcomeScreen`, `authService` y botón atrás en `RegisterNavigator`
  - Decisión del integrante: Aceptar cambios.
- Archivos y commit: `src/screens/WelcomeScreen.js`, `src/services/authService.js`, `src/navigation/RegisterNavigator.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: Se realiza la validación de cada uno de los puntos, siendo correctos.
- Aprendizaje: La IA puede ayudar a resolver problemas en poco tiempo, usándola sabiamente.

### Entrada #41
- Fecha: 2026-11-07
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Evitar el flash de la pantalla de Registro al iniciar sesión
- Prompt:
  ```text
  Hay algo extraño. Cuando inicio sesión, me muestra por 1 o 2 segundos la screen de Registro. Pero después sí va a la pantalla de Inicio. 
  ```
- Resumen de la respuesta: El login marcaba `isAuthenticated` antes de leer Firestore, y el navigator caía en Registro. Ahora se espera el perfil (`authReady` en false) y se actualizan autenticación y registro juntos.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: ajuste del listener en `DriverSessionContext.js`
  - Decisión del integrante: Aceptar.
- Archivos y commit: `src/context/DriverSessionContext.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: Se realiza el inicio de sesión y muestra un loading adecuado.
- Aprendizaje: Debe tenerse presente el tiempo que puede tardar Firestore en confirmar la sesión, y prevenir posibles tiempos de respuesta lentos.

### Entrada #42
- Fecha: 2026-11-07
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Corregir mapa en blanco en la pantalla de inicio
- Prompt:
  ```text
  Ahora veo el mapa en blanco. ¿Solo se verá el mapa cuando esté disponible desde Firestore?

  ```
- Resumen de la respuesta: En Expo Go Google Maps no sirve; hace falta development build. El mapa gris se resolvió con layout + `newArchEnabled=false`. La ubicación no actualizaba porque el GPS solo corría al estar Disponible y quedaba el mock de Medellín; ahora se obtiene/observa GPS al abrir Inicio y se muestra con `showsUserLocation`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: Google Maps nativo, fix New Arch/layout, y GPS continuo en `useDriverLocation`/`DriverMap` para la ubicación actual
  - Decisión del integrante: Aceptar cambios.
- Archivos y commit: `src/components/DriverMap.js`, `src/hooks/useDriverLocation.js`, `src/screens/HomeScreen.js`, `app.config.js`, `android/gradle.properties`, `package.json`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: Se realiza el inicio de sesión, y se obtiene la ubicación correctamente.
- Aprendizaje: Se necesita el development build para poder usar Google Maps. Además de esto, solo se iba a obtener la ubicación si el conductor estaba activo, pero para motivos de prueba, es mejor dejarlo con solo iniciar sesión.

### Entrada #43
- Fecha: 2026-11-09
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Ubicar dónde van las variables de entorno de Mercado Pago
- Prompt:
  ```text
  ¿Dónde debo poner las variables de entorno de mercado pago?
  ```
- Resumen de la respuesta: Van solo en `backend/.env` (access_token y secretos), nunca en el `.env` de la app ni en el código. El `.env` de la raíz es para cosas como la KEY de Google Maps. Aún no existe la carpeta `backend/`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: orientación según la spec y la regla de seguridad
  - Decisión del integrante: Aceptar.
- Archivos y commit: `ninguno` — Commit: pendiente
- Verificación: Se realiza la creación de la variable de entorno y se confirma que esté en el gitignore.
- Aprendizaje: El access token de MP va en el .env del backend.

### Entrada #44
- Fecha: 2026-11-09
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Definir y crear un script parametrizable para solicitudes de servicio de prueba
- Prompt:
  ```text
  ¿Qué opinas de crear un script que sea parametrizable para la solicitud del servicio?

  Perfecto. Ayúdame a crear el script y me informas del paso a paso para su ejecución. Además, modifica esta última entrada de la bitácora, para dejar una sola.
  ```
- Resumen de la respuesta: Conviene como herramienta de prueba. Se creó `buildTripRequest` + CLI `npm run create-trip-request`, que escribe `src/mocks/generatedIncomingRequest.json`; el botón Simular de la app carga esa solicitud y recalcula tarifa con `calculateFare`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: factory, script CLI, JSON generado y cableado en `ActiveTripContext`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/utils/buildTripRequest.js`, `scripts/createTripRequest.mjs`, `scripts/esmResolveHook.mjs`, `scripts/registerEsmResolve.mjs`, `src/mocks/generatedIncomingRequest.json`, `src/context/ActiveTripContext.js`, `src/mocks/trips.js`, `package.json`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: `npm run create-trip-request -- --category xl --km 8.5 --min 22 --payment cash`, recargar la app, Disponible + Simular, y revisar categoría/tarifa en Solicitud entrante_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #45
- Fecha: 2026-11-09
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Confirmar filtro por categoría y si el conductor ingresa origen/destino
- Prompt:
  ```text
  Pero espera, si mi vehículo es economy, solo deberían llegarme las solicitudes de economy. Sino, quedar en el limbo. O así con cada categoría.

  Además, tengo una pregunta. ¿En el alcance se define si debo ingresar el origen y el destino del viaje?
  ```
- Resumen de la respuesta: Sí: la spec guarda `category` en `driverLocations` para filtrar. Se aplicó el filtro en listener/inbox/botón Simular. Origen y destino los trae la solicitud (lado pasajero / Distance Matrix); el conductor no los digita, solo los ve y navega con Directions.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: filtro por categoría en `useTripRequests`, inbox HTTP y `HomeScreen`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/hooks/useTripRequests.js`, `scripts/createTripRequest.mjs`, `src/screens/HomeScreen.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: con vehículo economy, lanzar solicitud `--category xl` (no debe abrir) y luego `--category economy` (sí debe abrir)_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #46
- Fecha: 2026-11-09
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Implementar flujo pasajero→conductor con Matrix/Directions según la spec
- Prompt:
  ```text
  Perfecto, entonces ayúdame a implementar la lógica para que funcione así:

  Origen y destino: en el alcance del conductor no los ingresas. Vienen en la solicitud (los define el pasajero / la creación del viaje). Tú los ves en Solicitud entrante y luego navegas recogida → destino con Google Directions. Distance Matrix calcula km/min al crear y al aceptar; no es un formulario tuyo de origen/destino.

  El script hará las funciones de pasajero. Si es necesario crea un script bash que haga esto: adb reverse tcp:8765 tcp:8765 y luego ejecute el script de node, y yo pueda enviar los parámetros requeridos según la SPEC del proyecto. Para empezar a darle forma al proyecto. Recuerda ceñirte a la SPEC y no asumir nada.
  ```
- Resumen de la respuesta: El CLI pasa a ser simulador de pasajero: exige origen/destino/categoría/pago, llama Distance Matrix al crear y ofrece la solicitud. Al aceptar, Matrix otra vez + Directions al pickup; al “Pasajero a bordo”, Directions al destino con Polyline. Se añadió `scripts/request-trip.sh` (adb reverse + npm).
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `googleMapsApi`, factory sin defaults de origen/destino, CLI + bash, accept/fase con APIs, `TripRouteMap`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/services/googleMapsApi.js`, `src/services/googleMaps.js`, `src/utils/decodePolyline.js`, `src/utils/buildTripRequest.js`, `scripts/createTripRequest.mjs`, `scripts/request-trip.sh`, `src/context/ActiveTripContext.js`, `src/screens/IncomingRequestScreen.js`, `src/screens/TripInProgressScreen.js`, `src/components/TripRouteMap.js`, `package.json`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: `npm run request-trip -- --category economy --payment cash --origin "..." --origin-lat ... --origin-lng ... --destination "..." --dest-lat ... --dest-lng ...` con conductor Disponible; aceptar y comprobar ruta al pickup y luego al destino_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #47
- Fecha: 2026-11-09
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Aclarar si bastan direcciones y para qué sirve el bash
- Prompt:
  ```text
  ¿Debo enviar siempre latitud y longitud? ¿No simplemente el origen y destino?

  Además, ¿Entonces para qué creaste un bash si igual debo ejecutar algo así?

  npm run request-trip -- \
    --category economy \
    --payment cash \
    --origin "Calle 50 #46-36, Medellín" \
    --origin-lat 6.2442 \
    --origin-lng -75.5812 \
    --destination "El Tesoro, El Poblado" \
    --dest-lat 6.1987 \
    --dest-lng -75.575
  ```
- Resumen de la respuesta: No hace falta mandar lat/lng: el modelo sí las guarda, pero el script geocodifica desde las direcciones. El bash no quita los parámetros del viaje; solo encadena `adb reverse` + el CLI para no correr dos comandos.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `geocodeAddress` + CLI solo con `--origin` / `--destination` (coords opcionales)
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/services/googleMapsApi.js`, `scripts/createTripRequest.mjs`, `scripts/request-trip.sh`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: `npm run request-trip -- --category economy --payment cash --origin "Calle 50 #46-36, Medellín" --destination "El Tesoro, El Poblado"` con Geocoding API habilitada en la KEY_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #48
- Fecha: 2026-11-09
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Arreglar request-trip colgado en adb y REQUEST_DENIED de Geocoding
- Prompt:
  ```text
  El script ya no parece funcionar.

  Además, la petición sí llegó a Google:

  API
  Solicitudes
  Errores
  Latencia promedio (ms)
  99% de latencia (ms)
  Geocoding API	1	1	20	33
  ```
- Resumen de la respuesta: `adb reverse` se colgaba y frenaba el bash; se puso timeout y se llama al CLI con `exec`. `REQUEST_DENIED` es restricción/permiso de la KEY (1 error en consola). Se documentó `--clave=valor` para no perder espacios con npm.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: timeout en `request-trip.sh`, parse `--key=value`, mensaje de error de Geocoding, README
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `scripts/request-trip.sh`, `scripts/createTripRequest.mjs`, `src/services/googleMapsApi.js`, `README.md`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: `npm run request-trip -- --category=economy --payment=cash --origin="Altos de Polanco" --destination="El Tesoro, El Poblado"` con KEY válida para Geocoding_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #49
- Fecha: 2026-11-09
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Saber qué configurar en Firestore para completar el flujo según la spec
- Prompt:
  ```text
  Perfecto, ahora sí. Entonces dime qué debo configurar en Firestore para que la aplicación siga completando su flujo según la SPEC del proyecto.
  ```
- Resumen de la respuesta: El registro crea drivers/vehicles/driverLocations. En consola solo hay que aprobar `accountStatus` y, si se prueba, alinear `vehicles.category` con el script. `trips` aún no lo escribe el flujo simulado; historial/ganancias siguen en mock. Publicar `firestore.rules` (incl. `devTriggers` si se usa push).
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: guía operativa de Firestore según secciones 5 y 11
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `ninguno` — Commit: pendiente
- Verificación: _pendiente — sugerida: approved + category coincidente + Disponible + request-trip_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #50
- Fecha: 2026-11-09
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Persistir el trip en Firestore al recibir, aceptar y rechazar
- Prompt:
  ```text
  Perfecto. Ahora sí: cuando llegue la solicitud desde el script, necesito que se genere el trip en Firestore. Y al aceptar o rechazar, que se actualice el estado. Recuerda basarte solamente en la SPEC y no asumir nada.
  ```
- Resumen de la respuesta: Se creó `tripsService` y se cableó `receiveIncomingRequest` / `acceptTrip` / `rejectTrip` para escribir `trips/{tripId}` con las transiciones de la sección 7 (`requested` → `accepted`/`rejected`, luego `driver_arriving`).
- Qué se usó / modificado / descartado:
  - Propuesto por la IA: servicio Firestore + `ActiveTripContext` con `onSnapshot` y `canTransition`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/services/tripsService.js`, `src/context/ActiveTripContext.js`, `src/hooks/useTripRequests.js`, `src/screens/IncomingRequestScreen.js`, `firestore.rules`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: Disponible + request-trip → ver documento en `trips` → aceptar/rechazar y confirmar `status`_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #51
- Fecha: 2026-11-09
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Completar el viaje hasta `completed` con tarifa final
- Prompt:
  ```text
  Además, ayúdame con la parte del viaje en curso: pasajero a bordo, finalizar, y que quede completed con la tarifa. Ceñirte a la SPEC.
  ```
- Resumen de la respuesta: `markPassengerOnBoard` pide Directions al destino y pasa a `in_progress`; `completeTrip` recalcula con `calculateFare` y deja el viaje en `completed` con `completedAt`.
- Qué se usó / modificado / descartado:
  - Propuesto por la IA: transiciones en `ActiveTripContext` + handlers async en `TripInProgressScreen`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/context/ActiveTripContext.js`, `src/screens/TripInProgressScreen.js`, `src/utils/calculateFare.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: aceptar → Pasajero a bordo → Finalizar y revisar `status`/`fare` en Firestore_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #52
- Fecha: 2026-11-09
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Cobro solo en efectivo (`cash_received`)
- Prompt:
  ```text
  Por el momento manejemos solo cash, para no complicar mucho la implementación. Que el conductor marque el efectivo recibido y el viaje quede pagado.
  ```
- Resumen de la respuesta: En resumen solo aparece “Marcar efectivo recibido”; `markPaid` escribe `status: paid` y `paymentStatus: cash_received`. Mercado Pago queda fuera de este tramo.
- Qué se usó / modificado / descartado:
  - Propuesto por la IA: flujo cash en `TripSummaryScreen` + `markPaid` según sección 9 Efectivo
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/context/ActiveTripContext.js`, `src/screens/TripSummaryScreen.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: finalizar viaje → marcar efectivo → documento en `paid` / `cash_received`_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #53
- Fecha: 2026-11-09
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Historial y ganancias desde los viajes del conductor en Firestore
- Prompt:
  ```text
  Y por último el almacenamiento de los viajes del conductor: el historial y las ganancias ya no deberían usar el mock. Que lean lo de Firestore.
  ```
- Resumen de la respuesta: `useEarnings`, Historial y Detalle pasan a `fetchTripsByDriver` / `fetchTripById`. El saldo se calcula (pasarela − comisión cash) sin campo guardado. Se quitó `MOCK_TRIPS` de esas pantallas.
- Qué se usó / modificado / descartado:
  - Propuesto por la IA: lectura Firestore en hooks/pantallas + Polyline del `routePolyline` guardado en el detalle
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/hooks/useEarnings.js`, `src/screens/TripHistoryScreen.js`, `src/screens/TripDetailScreen.js`, `src/screens/EarningsScreen.js`, `src/services/tripsService.js`, `README.md`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: viaje `paid` → abrir Historial/Ganancias y ver el mismo `tripId`_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #54
- Fecha: 2026-11-09
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Actualizar `driverLocations` mientras el conductor está Disponible
- Prompt:
  ```text
  También, según la SPEC, mientras esté Disponible la ubicación debería actualizarse en driverLocations. ¿Me ayudas a dejar eso cableado?
  ```
- Resumen de la respuesta: `upsertDriverLocation` escribe al cambiar disponibilidad/ubicación; el GPS queda montado a nivel app con `DriverLocationListener` para no cortarse al salir de Inicio.
- Qué se usó / modificado / descartado:
  - Propuesto por la IA: `driverLocationService` + sync en `DriverSessionContext` + listener global
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/services/driverLocationService.js`, `src/context/DriverSessionContext.js`, `src/hooks/useDriverLocation.js`, `src/components/DriverLocationListener.js`, `App.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: Disponible ON → mover GPS/emulador → ver `location`/`updatedAt` en `driverLocations/{uid}`_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #55
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Quitar Stripe y dejar solo Mercado Pago + efectivo
- Prompt:
  ```text
  Vamos a usar solamente Mercado Pago y no Stripe, así que elimina todo lo relacionado.
  ```
- Resumen de la respuesta: Se quitó Stripe de filtros, validadores, mocks, README y SPEC; `paymentMethod` queda en `mercadopago` | `cash`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: limpieza en app/docs/reglas de seguridad
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/utils/displayLabels.js`, `src/utils/buildTripRequest.js`, `src/screens/TripHistoryScreen.js`, `src/mocks/trips.js`, `scripts/createTripRequest.mjs`, `docs/PROJECT_SPEC.md`, `PROJECT_SPEC.md`, `README.md`, `.cursor/rules/20-seguridad.mdc`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: `rg stripe` sin usos funcionales; script con `--payment=mercadopago|cash`_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #56
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Backend Express con Checkout Pro vía Orders
- Prompt:
  ```text
  La variable de entorno de MercadoPago se llama así y está en /backend MP_ACCESS_TOKEN. ¿Cómo armo el backend para crear la orden según la SPEC?
  ```
- Resumen de la respuesta: Se creó Express en `backend/` con `POST /payments/mercadopago/checkout` usando la API de Orders (`checkout_url`, no Preferences) y página de retorno.
- Qué se usó / modificado / descartó:
  - Propuesto por la IA: `backend/src/server.js`, `mercadopagoOrders.js`, `config.js`, `.env.example`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `backend/package.json`, `backend/.env.example`, `backend/src/config.js`, `backend/src/mercadopagoOrders.js`, `backend/src/server.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: `npm --prefix backend start` con `MP_ACCESS_TOKEN` y cuenta de servicio Firebase_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #57
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Que solo el backend marque el viaje como pagado tras verificar en MP
- Prompt:
  ```text
  Además, según la SPEC el backend tiene que verificar el estado del pago antes de actualizar el viaje. ¿Me ayudas con eso?
  ```
- Resumen de la respuesta: `verify` y webhook consultan `GET /v1/orders/{id}`; si `processed`/`accredited`, Admin SDK escribe `paymentStatus: approved`, `paymentId` y `status: paid`.
- Qué se usó / modificado / descartó:
  - Propuesto por la IA: `firestoreAdmin.js`, `tripPayments.js`, rutas verify/webhook
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `backend/src/firestoreAdmin.js`, `backend/src/tripPayments.js`, `backend/src/server.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: viaje `completed` + orden acreditada → documento `paid`/`approved` en Firestore_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #58
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Abrir Checkout Pro desde el resumen del conductor
- Prompt:
  ```text
  Perfecto. Ahora sí: en el resumen necesito poder pagar con Mercado Pago, no solo cash. Ceñirte a la SPEC.
  ```
- Resumen de la respuesta: `TripSummaryScreen` crea el checkout vía backend y abre WebView; al detectar la URL de retorno (o al tocar Verificar) llama a `verify`. Cash sigue marcándose en la app.
- Qué se usó / modificado / descartó:
  - Propuesto por la IA: `paymentsService`, `MercadoPagoCheckoutScreen`, cambios en resumen/contexto
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/services/paymentsService.js`, `src/config/backend.js`, `src/screens/MercadoPagoCheckoutScreen.js`, `src/screens/TripSummaryScreen.js`, `src/context/ActiveTripContext.js`, `src/navigation/TripStack.js`, `package.json`, `README.md`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: `adb reverse tcp:8787 tcp:8787` + backend + viaje `--payment=mercadopago` hasta Checkout_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #59
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Tests de calculateFare e isTechnicalInspectionRequired
- Prompt:
  ```text
  ¿Los casos de la SPEC de calculateFare y de la revisión técnico-mecánica ya los puedo correr como test? Además el de un día antes del plazo me estaba saliendo raro con las fechas.
  ```
- Resumen de la respuesta: Se agregó `npm test` con los casos de las secciones 10 y 5. Se normalizó el parseo a día calendario para que `2021-10-27` con hoy `2026-10-26` dé `false`.
- Qué se usó / modificado / descartado:
  - Propuesto por la IA: `test/*.test.mjs` + ajuste en `isTechnicalInspectionRequired.js` + `.env.example`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `test/calculateFare.test.mjs`, `test/isTechnicalInspectionRequired.test.mjs`, `src/validation/isTechnicalInspectionRequired.js`, `.env.example`, `.gitignore`, `package.json`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: `npm test` (9 tests en verde)_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #60
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Retorno de Mercado Pago por constante HTTPS interceptada en el WebView
- Prompt:
  ```text
  Lee docs/PROJECT_SPEC.md sección 9. La URL de retorno de Mercado Pago no apunta al backend: es una constante HTTPS (PAYMENT_RETURN_URL en src/config/payments.js) que el WebView intercepta con onShouldStartLoadWithRequest sin cargarla. Al interceptarla, la app llama a POST /payments/verify y el backend consulta el estado real del pago en la API de Mercado Pago. Elimina PUBLIC_BASE_URL y cualquier ruta de retorno del backend. Muéstrame el plan antes de cambiar código.
  ```
- Resumen de la respuesta: Se movió el retorno a `PAYMENT_RETURN_URL`, el WebView lo corta con `onShouldStartLoadWithRequest`, verify quedó en `POST /payments/verify` y se quitaron `PUBLIC_BASE_URL` y la ruta HTML de retorno.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: constante en app + interceptación WebView + cleanup del backend
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/config/payments.js`, `src/config/backend.js`, `src/services/paymentsService.js`, `src/screens/MercadoPagoCheckoutScreen.js`, `backend/src/config.js`, `backend/src/mercadopagoOrders.js`, `backend/src/server.js`, `backend/.env.example`, `README.md`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: checkout MP → redirect a PAYMENT_RETURN_URL → verify → trip `paid`/`approved`_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #61
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Corregir el formato de monto rechazado por Mercado Pago
- Prompt:
  ```text
  Recibí este error

  Mercado Pago create order failed: {"errors": [{"code":"property_value","message":"Invalid value for property","details":["'$.items[0].unit_price' - does not match pattern","'$.total_amount' - does not match pattern"]}]}
  ```
- Resumen de la respuesta: En COP la Orders API no acepta decimales; `formatAmount` ahora manda enteros (`"19200"` en vez de `"19200.00"`).
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: cambio en `formatAmount` del backend
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `backend/src/mercadopagoOrders.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: reiniciar backend y volver a "Pagar con Mercado Pago"_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #62
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: No mostrar Verificar pago durante el checkout
- Prompt:
  ```text
  Cuando hice el pago con Mercado Pago, en la parte inferior mientras estoy en el checkout, me sale el botón de Verificar pago. ¿No debería retirarse mientras se realiza el pago?
  ```
- Resumen de la respuesta: El botón se oculta durante el Checkout; solo aparece si, tras interceptar el retorno, el pago sigue pendiente o falla la verificación.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `showVerifyButton` en `MercadoPagoCheckoutScreen`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/screens/MercadoPagoCheckoutScreen.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: abrir checkout y confirmar que no hay footer; solo tras retorno pendiente_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #63
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Mapear rechazo de tarjeta cuando la orden sigue en waiting_retry
- Prompt:
  ```text
  Es que es aquí en esta pantalla. Muestra que fue fallido, pero al darle volver sale lo del pago pendiente. Y así sale en Mercado Pago: Estado del recurso Fallido / Detalle Fallido.
  ```
- Resumen de la respuesta: La orden llega como `action_required`/`waiting_retry`, pero el pago interno ya es `failed`. `mapOrderPaymentStatus` ahora mira también `transactions.payments`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: ajuste del mapeo en `mercadopagoOrders.js`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `backend/src/mercadopagoOrders.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: reiniciar backend → Volver al sitio / Verificar pago → alert de rechazado_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #64
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Notificaciones FCM para solicitudes en segundo plano
- Prompt:
  ```text
  Según la SPEC, FCM es obligatorio para las solicitudes con la app en segundo plano. ¿Me ayudas a dejar eso cableado?
  ```
- Resumen de la respuesta: Se registró el token con `expo-notifications`, se guarda en `drivers.fcmToken`, hay listener de push y el backend puede notificar conductores disponibles; el script `request-trip` intenta disparar ese aviso.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: servicio/listener push + endpoint `/notifications/trip-request`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/services/pushNotifications.js`, `src/components/PushNotificationListener.js`, `App.js`, `app.config.js`, `backend/src/pushNotifications.js`, `backend/src/server.js`, `scripts/createTripRequest.mjs`, `README.md`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: rebuild Android + Disponible + request-trip con backend; revisar `fcmToken` en Firestore_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #65
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Perfil editable según la SPEC
- Prompt:
  ```text
  En perfil solo puedo ver los datos y cerrar sesión. Según la SPEC deberían ser editables. ¿Cómo lo dejo?
  ```
- Resumen de la respuesta: Perfil pasó a modo edición para nombre, celular, Mercado Pago, marca, modelo, color y capacidad; documento/correo/placa/categoría quedan de solo lectura.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: `driverProfileService` + formulario en `ProfileSettingsScreen`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/services/driverProfileService.js`, `src/screens/ProfileSettingsScreen.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: Editar perfil → Guardar → ver el cambio en Firestore y al reabrir_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #66
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Cancelar viaje antes de in_progress
- Prompt:
  ```text
  Además, según la tabla de estados debería poder cancelar el viaje mientras voy al pickup. ¿Me ayudas con eso?
  ```
- Resumen de la respuesta: `cancelTrip` valida con `canTransition` y escribe `cancelled`; el botón aparece en viaje en curso solo en `accepted` / `driver_arriving`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: acción en `ActiveTripContext` + UI en `TripInProgressScreen`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/context/ActiveTripContext.js`, `src/screens/TripInProgressScreen.js`, `src/utils/displayLabels.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: aceptar viaje → Cancelar viaje → documento `cancelled` y vuelta a Inicio_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #67
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: Filtro por rango de fechas en el historial
- Prompt:
  ```text
  En el historial me faltaría el rango de fechas que pide la SPEC, no solo hoy/semana/mes.
  ```
- Resumen de la respuesta: Se agregó el chip **Rango** con `DateField` Desde/Hasta y el filtrado sobre la fecha del viaje.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: cambios en `TripHistoryScreen`
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `src/screens/TripHistoryScreen.js`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: Historial → Rango → elegir Desde/Hasta y ver la lista filtrada_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_

### Entrada #68
- Fecha: 2026-11-10
- Integrante: Juan Pablo Carvajal Restrepo
- Herramienta: Cursor (modo: Agent, modelo: Composer)
- Objetivo: FCM nativo con @react-native-firebase/messaging (app en segundo plano)
- Prompt:
  ```text
  Lee docs/PROJECT_SPEC.md secciones 2 y 12. Ya coloqué google-services.json en la raíz del proyecto (registrado en Firebase como app Android com.juanp.uberclone, mismo proyecto que Firestore).

  Objetivo: dejar funcionando las notificaciones push con @react-native-firebase/messaging para nuevas solicitudes, también con la app en segundo plano.

  Haz lo siguiente:
  1. En app.json: agrega "googleServicesFile": "./google-services.json" dentro de "android" y agrega el plugin "@react-native-firebase/app" a "plugins". Conserva todos los plugins que ya existen. Verifica que android.package sea exactamente com.juanp.uberclone.
  2. Verifica que @react-native-firebase/app y @react-native-firebase/messaging estén instalados con versiones compatibles entre sí. Si falta alguno, instálalo con npx expo install.
  3. No copies ni edites archivos dentro de android/ a mano: la configuración nativa debe salir de app.json vía prebuild.
  4. Revisa el código existente de notificaciones y confirma que:
     - se solicita el permiso POST_NOTIFICATIONS (Android 13+) antes de obtener el token;
     - el token FCM nativo se guarda en drivers/{uid}.fcmToken y se actualiza con onTokenRefresh (con limpieza en useEffect);
     - existe messaging().setBackgroundMessageHandler registrado en el archivo de entrada (index.js), fuera de cualquier componente;
     - con la app en primer plano, onMessage muestra la solicitud entrante.
  5. No uses expo-notifications ni tokens ExponentPushToken.
  6. Mantén el SDK web de Firebase (paquete "firebase") para Firestore y Auth; no lo migres. Si hay alguna llamada a getAnalytics, elimínala porque no funciona en React Native.

  Antes de cambiar código, muéstrame el plan con la lista de archivos que vas a modificar. Al terminar, dime los comandos exactos para reconstruir la app y registra la entrada en docs/AI_LOG.md.
  ```
- Resumen de la respuesta: Se migró el push a `@react-native-firebase/app` + `messaging` (ambos 27.1.1), se quitó `expo-notifications`, se cableó permiso/token/`onTokenRefresh`/`onMessage`/`setBackgroundMessageHandler` y `googleServicesFile` en `app.json`.
- Qué se usó / modificó / descartó:
  - Propuesto por la IA: config Expo + servicio FCM nativo + listener + index.js + ajuste backend
  - Decisión del integrante: _pendiente — completar: usado tal cual / modificado (cómo) / descartado (por qué)_
- Archivos y commit: `app.json`, `app.config.js`, `package.json`, `index.js`, `src/services/pushNotifications.js`, `src/components/PushNotificationListener.js`, `App.js`, `backend/src/pushNotifications.js`, `README.md`, `docs/AI_LOG.md` — Commit: pendiente
- Verificación: _pendiente — sugerida: `npx expo prebuild --clean --platform android` + `npx expo run:android`; Disponible + backend + request-trip con app en segundo plano; `fcmToken` nativo en Firestore y `sent>=1`_
- Aprendizaje: _pendiente — lo escribe el integrante con sus palabras_
