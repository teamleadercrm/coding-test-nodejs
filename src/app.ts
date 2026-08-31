import path from 'node:path';
import { fileURLToPath } from 'node:url';

import autoload from '@fastify/autoload';
import type { FastifyInstance, FastifyPluginOptions } from 'fastify';

export function app(fastify: FastifyInstance, opts: FastifyPluginOptions) {
  const dirname = path.dirname(fileURLToPath(import.meta.url));

  // Loaded in dependency order. See INSTRUCTIONS.md: external -> app -> routes.
  fastify.register(autoload, {
    dir: path.join(dirname, 'plugins/external'),
    options: { ...opts },
    ignorePattern: /^[._]/,
  });

  fastify.register(autoload, {
    dir: path.join(dirname, 'plugins/app'),
    options: { ...opts },
    indexPattern: /^$/,
    ignorePattern: /^[._]|^index\./,
  });

  fastify.register(autoload, {
    dir: path.join(dirname, 'routes'),
    autoHooks: true,
    cascadeHooks: true,
    ignorePattern: /^[._]/,
    options: { ...opts },
  });
}
