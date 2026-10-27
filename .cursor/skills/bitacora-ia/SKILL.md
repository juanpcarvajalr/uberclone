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

## E. Estilo de redacción (obligatorio)

La bitácora debe parecer trabajo conjunto estudiante–IA: preguntas o correcciones concretas, **no** un changelog de “la IA implementó el módulo” ni chat informal exagerado.

**Fuente de tono:** el historial real del chat del integrante (Juan Pablo). Al inventar o reescribir prompts, imitar *ese* registro, no un estereotipo de “estudiante en Discord”.

### E.0 Cómo escribe realmente el integrante (extraído del chat)

- Español claro, directo y sobrio; a veces con pequeños typos.
- Frases completas o cortas y puntuales; suele usar “Además,” para sumar un punto.
- Imperativos concretos: “Corrige esto”, “Modifica la skill”, “Impleméntalo”.
- Preguntas precisas: “¿Es correcto?”, “¿O sí?”, “¿El babel config sí es necesario?”.
- Reportes de bug sin adorno: “Las pantallas de registro siguen teniendo otros estilos.”
- Explica contexto y alcance cuando importa (“Debemos ceñirnos al alcance del proyecto”).
- Prefiere “¿Cómo hago X?” / “¿Por qué está fallando Y?” sobre briefs de feature.

### E.1 Prompt (cuando se inventa o se reescribe a pedido)

- Registro **neutro-profesional**, no slang.
- Una idea clara por entrada; puede ser pregunta o corrección observada en la UI/código.
- Anclar a un síntoma o duda concreta (número, warning, estilo distinto, safe area, etc.).
- Se permiten 1–2 oraciones de contexto, como en el chat real.

**Usar:**

```text
¿El babel config sí es necesario? Creo que es algo que era necesario antes, pero ahora no.
```

```text
Las pantallas de registro siguen teniendo otros estilos.
```

```text
No está en safe area el registro, ya que se sube mucho en la pantalla. Además, no se ven los íconos.
```

```text
¿Cómo hago calculateFare? Con 8.5 km y 22 min economy debería dar 19200 y no me cuadra el redondeo respecto a la comisión.
```

**Evitar:**

- Emojis, “bro”, “😭”, “😬”, “💀”, muletillas de chat.
- Minúscula forzada tipo tuit / tono memético.
- Prompts que suenan a ticket de producto (“Implementa el módulo X con A, B y C”).
- Lenguaje demasiado “pasado de natural” que no se parece al chat real.

### E.2 Resumen de la respuesta

- 2–3 líneas, tono neutro: qué se aclaró o qué se cambió para esa duda.
- Evitar “implementó todo el flujo / todas las pantallas”.

### E.3 Objetivo

- Una línea sobre la duda, el bug o la corrección pedida.

### E.4 Decisión / Verificación / Aprendizaje (solo si el integrante pide completarlos)

- Primera persona, sobria (como el chat), sin emojis ni jerga.
- Decisión: usado / modificado (qué) / descartado (por qué).
- Verificación: qué se comprobó en Expo o con un caso concreto.
- Aprendizaje: una frase práctica, sin dramatizar.

### E.5 Qué no hacer

- No reescribir el Prompt de una entrada real si el integrante no lo pidió (manda el texto literal).
- No inventar hashes de commit.
- No “sobre-naturalizar” los prompts inventados: si dudan entre formal y meme, elegir el registro del chat real (E.0).
- No registrar solicitudes marcadas como excluidas (sección A.0).
