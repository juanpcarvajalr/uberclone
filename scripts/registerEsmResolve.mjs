// AI-assisted: see docs/AI_LOG.md #44
import { register } from 'node:module';

register('./esmResolveHook.mjs', import.meta.url);
