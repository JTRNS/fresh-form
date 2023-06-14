import { Handlers, HandlerContext } from "$fresh/server.ts";
import { errors } from "$std/http/http_errors.ts";
import { getForm, updateForm, PatchFormSchema, getFormEntries, createFormEntry } from "$utils/form.ts";

function checkHost(ctx: HandlerContext, url: string) {
  if (url.includes('localhost')) return;
  const remoteHost = 'hostname' in ctx.remoteAddr ? ctx.remoteAddr.hostname : null;
  if (!remoteHost) throw new errors.BadRequest("Unable to determine remote host");
  if (!url.startsWith(remoteHost) && remoteHost !== '127.0.0.0') throw new errors.BadRequest("URL does not match host");
}

function checkApiKey(req: Request, apiKey: string) {
  const auth = req.headers.get("Authorization");
  if (!auth) throw new errors.Unauthorized("Missing Authorization header");
  const match = auth.match(/^Bearer (.+)$/);
  if (!match) throw new errors.Unauthorized("Invalid Authorization header");
  if (match[1] !== apiKey) throw new errors.Unauthorized("Invalid API key");
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const { id } = ctx.params;
    const form = await getForm(id);
    if (form === null) throw new errors.NotFound();
    checkApiKey(req, form.apiKey);
    const formEntries = await getFormEntries(id);
    return new Response(JSON.stringify(formEntries), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
  async POST(req, ctx) {
    const { id } = ctx.params;
    const form = await getForm(id);
    if (form === null) throw new errors.NotFound();
    checkApiKey(req, form.apiKey);
    checkHost(ctx, form.url);
    const formData = await req.formData();
    const result = await createFormEntry(id, formData);
    if (result === null) throw new errors.BadRequest("Invalid form data");
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}