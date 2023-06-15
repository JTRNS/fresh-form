import { fieldTypes, type InputField } from "$utils/form.ts";
import { useEffect, useState } from "preact/hooks";
import FieldEditor from "../components/FieldEditor.tsx";
import FormSnippet from "../components/FormSnippet.tsx";

export default function FormBuilder(
  { initialFields }: { initialFields?: InputField[] },
) {
  const [url, setUrl] = useState<string>("");
  const [fields, setFields] = useState<InputField[]>(
    initialFields ||
    [{ type: "text", label: "username", name: "name-1", required: true }],
  );
  const [activeField, setActiveField] = useState<InputField | null>(null);
  const [newField, setNewField] = useState<InputField["type"]>("text");

  useEffect(() => {
    if (activeField === null && fields.length > 0) {
      setActiveField(fields[0]);
    }
  }, [activeField, fields]);



  const addField = (fieldtype: InputField["type"]) => {
    const nameIndex = fields.filter((f) => f.type === fieldtype).length;
    const field: InputField = {
      type: fieldtype,
      label: `${fieldtype} label`,
      name: `${fieldtype}-${nameIndex}`,
      required: false,
    };
    setFields([...fields, field]);
    setActiveField(field);
  };

  function updateField(field: InputField) {
    console.log(field);
    setFields((currentFields) => {
      return currentFields.map((f) => f.name === field.name ? field : f);
    });
    setActiveField(field);
  }

  function removeField(field: InputField) {
    setFields((currentFields) => {
      return currentFields.length === 1
        ? currentFields
        : currentFields.filter((f) => f.name !== field.name);
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
    <div>
      <div class="form-builder">
        <form class="preview">
          <h2>Form Fields</h2>
          <p>
            The fields that will be included in your form data endpoint. Focus a field to change its settings. Don't fuss about the order of the fields. You can rearange them on your own website.
          </p>
          {fields.map(({ label, ...field }) => (
            <>
              <label for={field.name}>
                {label} {field.required && "(required)"}
              </label>
              {field.type === "textarea"
                ? (
                  <textarea
                    {...field}
                    id={field.name}
                    onFocus={() => setActiveField({ label, ...field })}
                    autoComplete="off"
                  />
                )
                : (
                  <input
                    {...field}
                    id={field.name}
                    onFocus={() => setActiveField({ label, ...field })}
                    autoComplete="off"
                  />
                )}
            </>
          ))}
          <div class="add-field">
            <select aria-label="new field type" onChange={(e) => setNewField(e.currentTarget.value as InputField['type'])}>
              {fieldTypes.map((type) => (
                <option value={type}>{type}</option>
              ))}
            </select>
            <button aria-label="add new field" onClick={(e) => {
              e.preventDefault();
              addField(newField);
            }}>+</button>
          </div>
        </form>
        <form class="editor">
          <h2>Field Settings</h2>
          {activeField && (
            <FieldEditor
              field={activeField}
              onChange={updateField}
              onRemove={fields.length === 1 ? undefined : (f) => removeField(f)}
            />
          )}
        </form>
      </div>
      <input
        type="url"
        name="url"
        id="url"
        value={url}
        onChange={(e) => setUrl(e.currentTarget.value)}
      />
      <button onClick={() => createForm()}>create form</button>

      <section>
        <h2>Snippet</h2>
        <FormSnippet fields={fields} />
      </section>
    </div>
  );
}
