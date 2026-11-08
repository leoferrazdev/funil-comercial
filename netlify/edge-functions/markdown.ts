import { markdownResponse } from '../../scripts/agent-negotiation.mjs';

export default async (request, context) => (await markdownResponse(request)) || context.next();

export const config = {
  path: "/*",
  excludedPath: ["/*.css", "/*.js", "/*.svg", "/*.png", "/*.jpg", "/*.jpeg", "/*.webp", "/*.gif"]
};
