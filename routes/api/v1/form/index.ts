import { Handlers } from "$fresh/server.ts";
import { errors } from "$std/http/http_errors.ts";
import { CreateFormSchema, createForm } from "$utils/form.ts";

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