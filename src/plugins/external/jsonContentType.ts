import { fastifyPlugin } from 'fastify-plugin';
import type { FastifyPluginAsync } from 'fastify';

// The infrastructure layer, and the bottom of the dependency arrow:
//
//   routes/  tools/   ->   plugins/app/   ->   plugins/external/
//
// Nothing in here knows anything about discounts. It is where the plumbing
// lives — anything that wraps the outside world, or reaches across every
// response the way this hook does. Your own external concerns go beside it.
//
// This one is lifted from the service this test mirrors: it normalises the
// `content-type` on JSON responses, which Fastify otherwise sends with a
// charset appended.

const JSON_CONTENT_TYPE = 'application/json';

const jsonContentType: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onSend', (_request, reply, payload, done) => {
    const contentType = reply.getHeader('content-type');

    if (typeof contentType === 'string' && contentType.startsWith(JSON_CONTENT_TYPE)) {
      reply.header('content-type', JSON_CONTENT_TYPE);
    }

    done(null, payload);
  });
};

export default fastifyPlugin(jsonContentType, { name: 'jsonContentType' });
