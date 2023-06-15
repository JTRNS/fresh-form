import { CreateFormParams, FreshForm } from "$utils/form.ts";

const kv = await Deno.openKv();

const keyspace = "form";

export async function createForm(form: CreateFormParams): Promise<Pick<FreshForm, "id" | "apiKey">> {
  const id = genFormId();
  // TODO: change to something more secure
  const apiKey = crypto.randomUUID();
  const res = await kv.atomic()
    .check({ key: [keyspace, id], versionstamp: null })
    .set([keyspace, id], { ...form, apiKey })
    .commit();
  if (!res.ok) {
    // TODO: retry on duplicate form ID
    throw new TypeError("Generated duplicate form ID");
  }
  return { id, apiKey };
}

export async function getForm(id: string) {
  const { value } = await kv.get<FreshForm>([keyspace, id]);
  return value;
}

export async function updateFormUrl(id: string, url: string) {
  const { value: currentValue } = await kv.get<FreshForm>([keyspace, id]);
  if (!currentValue) throw new Error("Form not found");
  await kv.set([keyspace, id], { ...currentValue, url });
}

export function deleteForm(id: string) {
  const key = [keyspace, id];
  return kv.delete(key);
}

function genFormId() {
  return crypto.randomUUID().split("-")[0];
}