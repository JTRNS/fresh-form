import { Handlers } from "$fresh/server.ts";
import { errors } from "$std/http/http_errors.ts";
import { PatchFormSchema } from "$utils/form.ts";
import { getForm, updateForm } from "$utils/kv.ts"

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
    const formdata = await getForm(id);
    if (formdata === null) throw new errors.NotFound();
    checkApiKey(req, formdata.apiKey);
    return new Response(JSON.stringify(formdata), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
  async PATCH(req, ctx) {
    const { id } = ctx.params;
    const formdata = await getForm(id);
    if (formdata === null) throw new errors.NotFound();
    checkApiKey(req, formdata.apiKey);
    const body = await req.json();
    const patch = await PatchFormSchema.parseAsync(body);
    await updateForm(id, patch);
    return new Response(null, {
      status: 204,
    });
  }
}