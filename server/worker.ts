import { handleAIRequest, type AIEnvironment } from './ai';

interface Environment extends AIEnvironment { ASSETS: { fetch(request: Request): Promise<Response> } }

export default {
  async fetch(request: Request, env: Environment): Promise<Response> {
    if (new URL(request.url).pathname.startsWith('/api/ai/')) return handleAIRequest(request, env);
    return env.ASSETS.fetch(request);
  },
};
