import { JSX } from "preact";
import { InputField, NumberField, fieldTypes } from "$utils/form.ts";
import NumberFieldEditor from "./NumberField.tsx";
import TextFieldEditor from "./TextField.tsx";

interface FieldEditorProps {
  field: InputField;
  onChange: (field: InputField) => void;
  onRemove?: (field: InputField) => void;
}

export default function FieldEditor({ field, onChange, onRemove }: FieldEditorProps) {
  const handleLabelChange: JSX.GenericEventHandler<HTMLInputElement> = (
    event,
  ) => {
    onChange({ ...field, label: event.currentTarget.value });
  };

  const handleNameChange: JSX.GenericEventHandler<HTMLInputElement> = (
    event,
  ) => {
    onChange({ ...field, name: event.currentTarget.value });
  };

  const handleRequiredChange: JSX.GenericEventHandler<HTMLInputElement> = (
    event,
  ) => {
    onChange({ ...field, required: event.currentTarget.checked });
  };

  const handleTypeChange: JSX.GenericEventHandler<HTMLSelectElement> = (
    event,
  ) => {
    if (!isNumberField(field) && event.currentTarget.value === "number") {
      delete (field.minLength);
      delete (field.maxLength);
    } else if (isNumberField(field) && event.currentTarget.value !== "number") {
      delete (field.min);
      delete (field.max);
    }
    onChange({ ...field, type: event.currentTarget.value as InputField["type"] });
  };

  const handleRemoveClick: JSX.GenericEventHandler<HTMLButtonElement> = (
    event,
  ) => {
    event.preventDefault();
    if (onRemove) onRemove(field);
  };

  function isNumberField(field: InputField): field is NumberField {
    return field.type === "number" || field.type === "range";
  }

  return (
    <>
      <label>
        Type:
        <select value={field.type} onChange={handleTypeChange}>
          {fieldTypes.map(type => <option value={type}>{type}</option>)}
        </select>
      </label>
      <label>
        Label:
        <input type="text" defaultValue={field.label} onInput={handleLabelChange} />
      </label>
      <label>
        Name:
        <input type="text" defaultValue={field.name} onInput={handleNameChange} />
      </label>
      {isNumberField(field)
        ? <NumberFieldEditor field={field} onChange={onChange} />
        : <TextFieldEditor field={field} onChange={onChange} />}
      <label>
        <input
          type="checkbox"
          defaultChecked={field.required}
          onChange={handleRequiredChange}
        />
        Required
      </label>
      {onRemove && <button class="remove-button" onClick={handleRemoveClick}>Remove</button>}
    </>
  );
}
