import { errors } from "$std/http/http_errors.ts";
import { FreshForm, FreshFormData, CreateFormParams, PatchFormParams, createFormSchema, parseFormData } from "./form.ts";

const PREFIX = ["form"];

const kv = await Deno.openKv();


export async function getForm(id: string) {
  const { value } = await kv.get<FreshForm>([...PREFIX, id]);
  return value;
}

export async function getFormEntries(id: string) {
  const entries = kv.list<FreshFormData>({ prefix: [...PREFIX, id] });
  const result: FreshFormData[] = [];
  for await (const entry of entries) {
    result.push(entry.value);
  }
  return result;
}

export async function createForm(form: CreateFormParams): Promise<Pick<FreshForm, "id" | "apiKey">> {
  const id = crypto.randomUUID();
  const apiKey = crypto.randomUUID();
  await kv.set([...PREFIX, id], { id, ...form, apiKey });
  return { id, apiKey };
}

export async function updateForm(id: string, update: PatchFormParams) {
  const existing = await getForm(id);
  if (!existing) throw new Error("Form not found");
  const { fields } = existing;

  if (update.fields) {
    const updatedFields = fields.map((currentField) => {
      const updatedField = update.fields?.find(f => f.name === currentField.name);
      if (!updatedField) return currentField;
      return Object.assign({}, currentField, updatedField);
    });

    // Probably should not add new fields
    // const newFields = update.fields.filter(f => !fields.find(cf => cf.name === f.name));

    await kv.set([...PREFIX, id], { ...existing, fields: updatedFields });
  }

  if (update.url) {
    await kv.set([...PREFIX, id], { ...existing, url: update.url });
  }
}

export async function deleteForm(id: string) {
  await kv.delete([...PREFIX, id]);
}

export async function createFormEntry(id: string, data: FormData) {
  const form = await getForm(id);
  if (!form) return null;
  const schema = createFormSchema(form.fields);
  const parsedData = parseFormData(data);
  const validatedData = await schema.safeParseAsync(parsedData);
  if (!validatedData.success) {
    throw new errors.BadRequest(validatedData.error.message, {
      headers: { "Content-Type": "application/json" },
    });
  }
  const entryId = crypto.randomUUID();
  await kv.set([...PREFIX, id, entryId], validatedData);
  return validatedData.data as Record<string, string | string[] | number | number[]>;
}
