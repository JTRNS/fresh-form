import { FreshFormData } from "$utils/form.ts";

const kv = await Deno.openKv();

export async function insertFormEntry(formId: string, data: FreshFormData) {
  const entryId = crypto.randomUUID();
  const entryKey = ["entries", formId, entryId];
  const res = await kv.atomic()
    .check({ key: entryKey, versionstamp: null })
    .set(entryKey, data)
    .commit();
  if (!res.ok) {
    // TODO: retry on duplicate entry ID
    throw new TypeError("Generated duplicate entry ID");
  }
}

export function deleteFormEntry(formId: string, entryId: string) {
  const entryKey = ["entries", formId, entryId];
  return kv.delete(entryKey);
}

export async function getFormEntries(formId: string) {
  const entries = kv.list<FreshFormData>({ prefix: ["entries", formId] });
  const result: FreshFormData[] = [];
  for await (const entry of entries) {
    result.push(entry.value);
  }
  return result;
}