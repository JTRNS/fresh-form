import { MiddlewareHandler } from "$fresh/server.ts";

export const handler: MiddlewareHandler[] = [
  async function cors(_req, ctx) {
    const resp = await ctx.next();
    resp.headers.set("Access-Control-Allow-Origin", "*");
    resp.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS, HEAD");
    resp.headers.set("Access-Control-Max-Age", "86400");
    return resp;
  }
];
