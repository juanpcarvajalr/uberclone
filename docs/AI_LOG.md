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
