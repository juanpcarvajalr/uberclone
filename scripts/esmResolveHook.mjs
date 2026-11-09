// AI-assisted: see docs/AI_LOG.md #44
import path from 'node:path';

/**
 * Resolves extensionless relative imports so Node can load Metro-style ESM.
 * @param {string} specifier
 * @param {object} context
 * @param {Function} nextResolve
 * @returns {Promise<object>}
 */
export async function resolve(specifier, context, nextResolve) {
  try {
    if (
      (specifier.startsWith('./') || specifier.startsWith('../')) &&
      !path.extname(specifier)
    ) {
      try {
        return await nextResolve(`${specifier}.js`, context);
      } catch {
        return nextResolve(specifier, context);
      }
    }
    return nextResolve(specifier, context);
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
