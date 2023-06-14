import { type InputField, fieldTypes } from "$utils/form.ts";
import { useState, useCallback } from "preact/hooks";
import FieldEditor from "./FieldEditor.tsx";

export default function FormBuilder({ initialFields }: { initialFields?: InputField[] }) {
  const [fields, setFields] = useState<InputField[]>(initialFields || [{ type: "text", label: "", name: "", required: false }]);
  const [activeField, setActiveField] = useState<InputField | null>(null);
  const [newField, setNewField] = useState<InputField['type']>('text');

  const addField = (fieldtype: InputField['type']) => {
    const field: InputField = { type: fieldtype, label: "", name: "", required: false };
    setFields([...fields, field]);
    setActiveField(field);
  }

  const updateField = (field: InputField) => {
    const index = fields.findIndex(f => f === activeField);
    const newFields = [...fields];
    newFields[index] = field;
    setFields(newFields);
  }

  return (
    <div class="container">
      <select name="field-type" id="field-type" onChange={(e) => setNewField(e.currentTarget.value as InputField['type'])} value={newField}>
        {fieldTypes.map(type => <option value={type}>{type}</option>)}
      </select>
      <button onClick={() => addField(newField)}>add field</button>
      <div class="form-fields">
        {fields.map(field => <input {...field} onFocus={() => setActiveField(field)} />)}
      </div>
      {activeField && <FieldEditor field={activeField} onChange={updateField} />}
    </div>)
}
