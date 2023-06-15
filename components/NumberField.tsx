import { JSX } from "preact";
import { NumberField } from "$utils/form.ts";

interface NumberFieldProps {
  field: NumberField;
  onChange: (field: NumberField) => void;
}

export default function NumberFieldEditor({ field, onChange }: NumberFieldProps) {
  const handleMinChange: JSX.GenericEventHandler<HTMLInputElement> = (event) => {
    onChange({ ...field, min: event.currentTarget.valueAsNumber });
  }

  const handleMaxChange: JSX.GenericEventHandler<HTMLInputElement> = (event) => {
    onChange({ ...field, max: event.currentTarget.valueAsNumber });
  }

  return (
    <>
      <label>
        min:
        <input type="number" value={field.min} onInput={handleMinChange} />
      </label>
      <label>
        max:
        <input type="number" value={field.max} onInput={handleMaxChange} min={field?.min} />
      </label>
    </>
  );
}