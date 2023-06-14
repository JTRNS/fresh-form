import { MiddlewareHandler } from "$fresh/server.ts";
import { isHttpError } from "$std/http/http_errors.ts";


export const handler: MiddlewareHandler[] = [
  async function cors(_req, ctx) {
    const resp = await ctx.next();
    resp.headers.set("Access-Control-Allow-Origin", "*");
    resp.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS, HEAD");
    resp.headers.set("Access-Control-Max-Age", "86400");
    return resp;
  },
  async function error(_req, ctx) {
    try {
      return await ctx.next();
    } catch (e) {
      if (isHttpError(e)) {
        const response = new Response(e.message, { status: e.status });
        return response;
      } else {
        return new Response("Internal Server Error", { status: 500 });
      }
    }
  }
];
