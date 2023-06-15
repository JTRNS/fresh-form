import { Handlers } from "$fresh/server.ts";
import { CreateFormSchema } from "$utils/form.ts";
import { createForm } from "$kv/form.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    const body = await req.json();
    const formParams = await CreateFormSchema.parseAsync(body);
    const formdata = await createForm(formParams);
    const accept = req.headers.get("Accept");
    if (accept?.includes("text/html")) {
      return new Response(
        `<html><body><h1>Form Created</h1><p>Form ID: ${formdata.id}</p><p>Form API Key: ${formdata.apiKey}</p></body></html>`,
        {
          status: 201,
          headers: {
            "Content-Type": "text/html",
          },
        },
      );
    }
    return new Response(JSON.stringify(formdata), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}