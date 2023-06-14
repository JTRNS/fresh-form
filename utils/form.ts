import kv from "$utils/kv.ts";
import { z } from 'zod';
import { errors } from "$std/http/http_errors.ts";

export const InputFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(["text", "email", "url", "textarea", "checkbox", "radio", "select", "number", "range"]),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  multiple: z.boolean().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
});

export type InputField = z.infer<typeof InputFieldSchema>;

export const CreateFormSchema = z.object({
  fields: z.array(InputFieldSchema),
  url: z.string().url(),
});

function createTextFieldSchema(field: InputField) {
  let schema = z.string();
  if (field.min) {
    schema = schema.min(field.min);
  }
  if (field.max) {
    schema = schema.max(field.max);
  }
  if (field.type === "email") {
    schema = schema.email()
  }
  if (field.type === "url") {
    schema = schema.url()
  }
  return field.required
    ? z.object({ [field.name]: schema })
    : z.object({ [field.name]: schema.optional() });
}

function createNumberFieldSchema(field: InputField) {
  let schema = z.number();
  if (field.min) {
    schema = schema.min(field.min);
  }
  if (field.max) {
    schema = schema.max(field.max);
  }
  return field.required
    ? z.object({ [field.name]: schema })
    : z.object({ [field.name]: schema.optional() });
}

function createGroupFieldSchema(field: InputField) {
  const str = 'options' in field ? z.string().refine((value) => field.options!.includes(value)) : z.string();
  let schema = z.array(str);
  if (field.min) {
    schema = schema.min(field.min);
  }
  if (field.max) {
    schema = schema.max(field.max);
  }
  return field.required
    ? z.object({ [field.name]: schema })
    : z.object({ [field.name]: schema.optional() });
}

function createFieldSchema(field: InputField) {
  switch (field.type) {
    case "text":
    case "email":
    case "url":
      return createTextFieldSchema(field);
    case "number":
    case "range":
      return createNumberFieldSchema(field);
    case "radio":
    case "select":
      return createGroupFieldSchema(field);
    default:
      throw new Error(`Unknown field type: ${field.type}`);
  }
}

export function createFormSchema(fields: InputField[]) {
  const schemas = fields.map(createFieldSchema);
  return schemas.reduce((acc, schema) => acc.merge(schema), z.object({}));
}



export type CreateFormParams = z.infer<typeof CreateFormSchema>;

export const PatchFormSchema = CreateFormSchema.partial();

export type PatchFormParams = z.infer<typeof PatchFormSchema>;


const PREFIX = ["form"];

type FreshForm = {
  id: string;
  fields: InputField[];
  url: string;
  apiKey: string;
}

type FreshFormData = Record<string, FormDataEntryValue | FormDataEntryValue[]>;

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



export function parseFormData(formData: FormData): Record<string, FormDataEntryValue | FormDataEntryValue[]> {
  const data: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};

  for (const [key, value] of formData.entries()) {
    const existing = data[key];
    if (existing) {
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        data[key] = [existing, value];
      }
    } else {
      data[key] = value;
    }
  }
  return data;
}

/** Limit file size, defaults to 3 Megabytes (3.145.728 bytes) */
export function limitFileSize(file: File, maxSize = 3 * 1024 * 1024) {
  return file.size <= maxSize;
}