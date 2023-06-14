import { z } from 'zod';
import { errors } from "$std/http/http_errors.ts";

export const fieldTypes = ["text", "email", "url", "textarea", "checkbox", "radio", "select", "number", "range"] as const;

export const InputFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(fieldTypes).default("text"),
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




export type FreshForm = {
  id: string;
  fields: InputField[];
  url: string;
  apiKey: string;
}

export type FreshFormData = Record<string, FormDataEntryValue | FormDataEntryValue[]>;



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