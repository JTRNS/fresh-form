import { InputField } from "$utils/form.ts";
import { useState } from "preact/hooks";

interface FieldEditorProps {
  field: InputField;
  onChange: (field: InputField) => void;
}

export default function FieldEditor({ field, onChange }: FieldEditorProps) {
  const [label, setLabel] = useState(field.label);
  const [name, setName] = useState(field.name);
  const [required, setRequired] = useState(field.required);

  const handleLabelChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    setLabel(target.value);
    onChange({ ...field, label: target.value });
  };

  const handleNameChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    setName(target.value);
    onChange({ ...field, name: target.value });
  };

  const handleRequiredChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    setRequired(target.checked);
    onChange({ ...field, required: target.checked });
  };

  return (
    <div class="field-editor">
      <label>
        Label:
        <input type="text" value={label} onInput={handleLabelChange} />
      </label>
      <label>
        Name:
        <input type="text" value={name} onInput={handleNameChange} />
      </label>
      <label>
        Required:
        <input type="checkbox" checked={required} onChange={handleRequiredChange} />
      </label>
    </div>
  );
}