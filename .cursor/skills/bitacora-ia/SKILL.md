---
name: bitacora-ia
description: Registrar, completar, auditar y exportar la bitácora de uso de IA (docs/AI_LOG.md) del proyecto UberClone Conductor. Usar después de cualquier respuesta de IA en el repo, o cuando el integrante pida "registrar en la bitácora", "completar hashes", "revisar la bitácora" o "exportar la bitácora a PDF".
---

# Skill: bitácora de IA

Complementa la regla `.cursor/rules/10-bitacora-ia.mdc`. Si hay conflicto, mandan la regla y el enunciado.
Proyecto individual: se trabaja directamente en `main`.

## A. Registrar una entrada

1. Calcular el siguiente ID: mayor `#N` de `docs/AI_LOG.md` + 1.
   ```bash
   grep -oE "^### Entrada #[0-9]+" docs/AI_LOG.md | grep -oE "[0-9]+" | sort -n | tail -1
   ```
2. Insertar la entrada al final del archivo con la plantilla de la regla.
3. Prompt literal en bloque `text`. Redactar secretos como `[REDACTADO]`.
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

Reportar: referencias huérfanas, IDs duplicados y entradas con campos pendientes. **No completar** Decisión, Verificación ni Aprendizaje por el integrante.

## D. Exportar a PDF (entrega)

```bash
npx md-to-pdf docs/AI_LOG.md   # genera docs/AI_LOG.pdf
```

Alternativa: extensión "Markdown PDF" en Cursor/VS Code. Antes de exportar, ejecutar la auditoría (C).
