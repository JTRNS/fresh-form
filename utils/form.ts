import { z } from 'zod';

export const fieldTypes = ["text", "email", "url", "textarea", "number", "range"] as const;

export const BaseInputFieldSchema = z.object({
  name: z.string(),
  label: z.string(),
  type: z.enum(fieldTypes).default("text"),
  required: z.boolean().default(false),
  placeholder: z.string().optional(),
});

export const TextFieldSchema = BaseInputFieldSchema.merge(
  z.object({
    type: z.enum(["text", "email", "url", "textarea"]).default("text"),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
  })
);

export type TextField = z.infer<typeof TextFieldSchema>;

export const NumberFieldSchema = BaseInputFieldSchema.merge(
  z.object({
    type: z.enum(["number", "range"]).default("number"),
    min: z.number().optional(),
    max: z.number().optional(),
  })
);

export type NumberField = z.infer<typeof NumberFieldSchema>;

export const InputFieldSchema = TextFieldSchema.or(NumberFieldSchema);

export type InputField = z.infer<typeof InputFieldSchema>;

export const CreateFormSchema = z.object({
  fields: z.array(InputFieldSchema),
  url: z.string().url(),
});

function createTextFieldSchema(field: TextField) {
  let schema = z.string();
  if (field.minLength) {
    schema = schema.min(field.minLength);
  }
  if (field.maxLength) {
    schema = schema.max(field.maxLength);
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

function createNumberFieldSchema(field: NumberField) {
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

function createFieldSchema(field: InputField) {
  if (isNumberField(field)) {
    return createNumberFieldSchema(field);
  } else {
    return createTextFieldSchema(field);
  }
}

export function createFormSchema(fields: InputField[]) {
  const schemas = fields.map(createFieldSchema);
  return schemas.reduce((acc, schema) => acc.merge(schema), z.object({}));
}

function isNumberField(field: InputField): field is NumberField {
  return field.type === "number" || field.type === "range";
}

export type CreateFormParams = z.infer<typeof CreateFormSchema>;

export const PatchFormSchema = CreateFormSchema.partial();

export type PatchFormParams = z.infer<typeof PatchFormSchema>;

export function validateFormData(formData: FormData, fields: InputField[]) {
  const parsedData = parseFormData(formData);
  const schema = createFormSchema(fields);
  return schema.safeParseAsync(parsedData);
}

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