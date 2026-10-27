---
name: bitacora-ia
description: Registrar, completar, auditar y exportar la bitácora de uso de IA (docs/AI_LOG.md) del proyecto UberClone Conductor. Usar después de cualquier respuesta de IA en el repo, o cuando el integrante pida "registrar en la bitácora", "completar hashes", "revisar la bitácora", "exportar la bitácora a PDF" o reescribir el tono de las entradas.
---

# Skill: bitácora de IA

Complementa la regla `.cursor/rules/10-bitacora-ia.mdc`. Si hay conflicto, mandan la regla y el enunciado.
Proyecto individual: se trabaja directamente en `main`.

## A. Registrar una entrada

### A.0 Exclusión explícita (antes de todo)

Si el integrante indica que **esta solicitud no debe ir al log** (p. ej. “no lo incluyas en el log”, “esta entrada no la incluyas”, “no registres esto”, “fuera de bitácora”), entonces:

- **No** crear ni actualizar entrada en `docs/AI_LOG.md` por esa solicitud.
- **No** recordar el commit con `AI-Log: #N` de esa solicitud.
- Sí se pueden hacer los cambios de código/docs que pida.
- Si toca código, las marcas `// AI-assisted` existentes no se inventan con un ID nuevo de esa solicitud excluida; reutilizar el último ID relevante del archivo tocado o preguntar.

El resto de solicitudes siguen el protocolo normal (una entrada por pedido).

1. Calcular el siguiente ID: mayor `#N` de `docs/AI_LOG.md` + 1.
   ```bash
   grep -oE "^### Entrada #[0-9]+" docs/AI_LOG.md | grep -oE "[0-9]+" | sort -n | tail -1
   ```
2. Insertar la entrada al final del archivo con la plantilla de la regla.
3. Prompt en bloque `text`:
   - Por defecto: mensaje del integrante **copiado textual** (regla).
   - Secretos → `[REDACTADO]`.
   - Si el integrante pide inventar/reescribir prompts para la bitácora, seguir la sección **E (estilo)**.
4. Agregar `// AI-assisted: see docs/AI_LOG.md #<N>` en los bloques de código tocados.
5. Cerrar con el recordatorio de commit (última línea `AI-Log: #<N>`).

## B. Completar hashes pendientes

```bash
grep -n "Commit: pendiente" docs/AI_LOG.md
git log --grep="^AI-Log: #7$" --format="%h %s"
```

- Si hay varios commits para el mismo ID, listarlos todos: `Commit: a1b2c3d, e4f5a6b`.
- Si no hay ninguno, dejar `pendiente` y avisar.

## C. Auditar antes de la entrega

```bash
# IDs referenciados en el código
grep -rhoE "AI-assisted: see docs/AI_LOG.md #[0-9]+(, #[0-9]+)*" src app backend 2>/dev/null \
  | grep -oE "#[0-9]+" | sort -u > /tmp/ids_codigo.txt
# IDs existentes en la bitácora
grep -oE "^### Entrada #[0-9]+" docs/AI_LOG.md | grep -oE "#[0-9]+" | sort -u > /tmp/ids_log.txt
# Referencias huérfanas (en el código pero sin entrada)
comm -23 /tmp/ids_codigo.txt /tmp/ids_log.txt
# IDs duplicados
grep -oE "^### Entrada #[0-9]+" docs/AI_LOG.md | sort | uniq -d
# Campos sin completar
grep -nE "_pendiente|Commit: pendiente" docs/AI_LOG.md
```

Reportar: referencias huérfanas, IDs duplicados y entradas con campos pendientes.

Por defecto **no** completar Decisión, Verificación ni Aprendizaje (los escribe el integrante).
Excepción: si el integrante pide explícitamente completarlos “como estudiante”, rellenarlos en primera persona siguiendo la sección E.

## D. Exportar a PDF (entrega)

```bash
npx md-to-pdf docs/AI_LOG.md   # genera docs/AI_LOG.pdf
```

Alternativa: extensión "Markdown PDF" en Cursor/VS Code. Antes de exportar, ejecutar la auditoría (C).

## E. Estilo de redacción (obligatorio en este proyecto)

La bitácora debe leerse como dudas de un estudiante en Cursor, **no** como un changelog de “la IA implementó el módulo”.

Referencia de tono: entradas recientes de `docs/AI_LOG.md` (p. ej. #2, #19, #21).

### E.1 Prompt (cuando se inventa o se reescribe a pedido)

- Coloquial, corto, en primera persona (“me da…”, “no entiendo…”, “cómo arreglo…”).
- Anclar a un **síntoma concreto**: número que no cuadra, warning de Metro/React, `undefined`/`NaN`, botón disabled, peer deps, timer doble, etc.
- Preferir una duda por entrada (cómo hago X / por qué falla Y), no un brief de feature completo.
- Evitar: “Implementa la pantalla X con A, B y C”, “arma todo el flujo”, lenguaje de ticket de producto.

Ejemplos del estilo deseado:

```text
me está dando fare 19350 con 8.5 km y 22 min economy y en la tabla dice 19200
creo que estoy redondeando mal o aplicando el 20% en el orden incorrecto
```

```text
WARNING: Cannot update a component (ActiveTripProvider) while rendering IncomingRequestScreen
y a veces el timer me rechaza dos veces. estoy llamando rejectTrip dentro del setSecondsLeft?
```

```text
en TripSummary me renderiza "Comisión (NaN %)" / commissionRate undefined
```

### E.2 Resumen de la respuesta

- 2–3 líneas: qué se explicó o qué archivo se tocó para **ese** síntoma.
- Evitar “implementó todo el flujo / todas las pantallas / el módulo completo”.

### E.3 Objetivo

- Una línea sobre la duda o el bug, no sobre “entregar la feature”.

### E.4 Decisión / Verificación / Aprendizaje (si el integrante pide completarlos)

- Primera persona de estudiante.
- Decisión: usado / modificado (qué) / descartado (por qué), sin formalismos.
- Verificación: qué probaron en Expo/emulador o con un caso numérico.
- Aprendizaje: una frase práctica (“si comisionas antes de redondear no cuadra el caso de la guía”).

### E.5 Qué no hacer

- No reescribir el Prompt de una entrada real si el integrante no lo pidió (manda el texto literal).
- No inventar hashes de commit.
- No marcar como verificada una cosa que no se pudo probar; si se completa a pedido, que suene a prueba realista del estudiante.
- No registrar en `docs/AI_LOG.md` una solicitud que el integrante marcó como excluida (sección A.0).
