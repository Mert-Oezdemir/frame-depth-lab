import { start } from '@mert/project-agent-bridge';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

await start({ project: 'frame-depth-lab', root: dirname(fileURLToPath(import.meta.url)) });
