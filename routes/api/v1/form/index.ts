import { Handlers } from "$fresh/server.ts";
import { CreateFormSchema } from "$utils/form.ts";
import { createForm } from "$utils/kv.ts"

export const handler: Handlers = {
  async POST(req, ctx) {
    const body = await req.json();
    const formParams = await CreateFormSchema.parseAsync(body);
    const formdata = await createForm(formParams);
    return new Response(JSON.stringify(formdata), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}