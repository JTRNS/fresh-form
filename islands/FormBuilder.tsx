import { type InputField, fieldTypes } from "$utils/form.ts";
import { useEffect, useState } from "preact/hooks";
import FieldEditor from "../components/FieldEditor.tsx";

export default function FormBuilder({ initialFields }: { initialFields?: InputField[] }) {
  const [url, setUrl] = useState<string>("");
  const [fields, setFields] = useState<InputField[]>(initialFields || [{ type: "text", label: "username", name: "name-1", required: true }]);
  const [activeField, setActiveField] = useState<InputField | null>(null);
  const [newField, setNewField] = useState<InputField['type']>('text');

  useEffect(() => {
    if (activeField === null && fields.length > 0) {
      setActiveField(fields[0]);
    }
  }, [activeField, fields]);

  const addField = (fieldtype: InputField['type']) => {
    const nameIndex = fields.filter(f => f.type === fieldtype).length;
    const field: InputField = { type: fieldtype, label: `${fieldtype} label`, name: `${fieldtype}-${nameIndex}`, required: false };
    setFields([...fields, field]);
    setActiveField(field);
  }

  function updateField(field: InputField) {
    console.log(field)
    setFields(currentFields => {
      return currentFields.map(f => f.name === field.name ? field : f);
    });
    setActiveField(field);
  }

  function removeField(field: InputField) {
    setFields(currentFields => {
      return currentFields.length === 1
        ? currentFields
        : currentFields.filter(f => f.name !== field.name);
    });
    setActiveField(null);
  }

  async function createForm() {
    const res = await fetch("/api/v1/form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields, url }),
    });
    const json = await res.json();
    console.log(json);
  }

  return (
    <div class="form-builder">
      <section class="form-editor">
        <h2>Field Settings</h2>
        {activeField && <FieldEditor field={activeField} onChange={updateField} onRemove={fields.length === 1 ? undefined : (f) => removeField(f)} />}
      </section>
      <section class="form-preview">
        <h2>Form Preview</h2>
        <p>Preview of form fields. You are free to reorder the fields on your own website.</p>
        {fields.map(({ label, ...field }) => (
          <>
            <label for={field.name}>{label} {field.required && "(required)"}</label>
            {field.type === "textarea" ? (
              <textarea {...field} id={field.name} onFocus={() => setActiveField(({ label, ...field }))} autoComplete="off" />
            ) : (<input {...field} id={field.name} onFocus={() => setActiveField(({ label, ...field }))} autoComplete="off" />)
            }
          </>
        ))}
        <div className="form-field add-field">
          {/* <label htmlFor="field-type">create field</label> */}
          <select name="field-type" id="field-type" onChange={(e) => setNewField(e.currentTarget.value as InputField['type'])} value={newField}>
            {fieldTypes.map(type => <option value={type}>{type}</option>)}
          </select>
          <button onClick={() => addField(newField)}>add field</button>
        </div>
      </section>
      <input type="url" name="url" id="url" value={url} onChange={(e) => setUrl(e.currentTarget.value)} />
      <button onClick={() => createForm()}>create form</button>
    </div>)
}
