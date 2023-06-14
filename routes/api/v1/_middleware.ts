import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { errors } from "$std/http/http_errors.ts";

export function handler(
  req: Request,
  ctx: MiddlewareHandlerContext,
) {
  const token = req.headers.get("Authorization");
  if (!token) throw new errors.Unauthorized("Missing Authorization header");
  if (token !== "123") throw new errors.Unauthorized("Invalid token");
  return ctx.next();
}