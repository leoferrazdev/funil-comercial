import { markdownResponse, notFoundResponse } from './scripts/agent-negotiation.mjs';

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
};

export default async function middleware(request) {
  return (await markdownResponse(request)) || (await notFoundResponse(request)) || undefined;
}
