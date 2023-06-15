import { JSX } from "preact";
import { TextField } from "$utils/form.ts";

interface TextFieldProps {
  field: TextField;
  onChange: (field: TextField) => void;
}

export default function TextFieldEditor({ field, onChange }: TextFieldProps) {

  const handleMinChange: JSX.GenericEventHandler<HTMLInputElement> = (event) => {
    onChange({ ...field, minLength: event.currentTarget.valueAsNumber });
  }

  const handleMaxChange: JSX.GenericEventHandler<HTMLInputElement> = (event) => {
    onChange({ ...field, maxLength: event.currentTarget.valueAsNumber });
  }

  return (
    <>
      <label>
        min length:
        <input type="number" onInput={handleMinChange} value={field?.minLength ?? ""} />
        {field.minLength !== undefined && <button onClick={() => {
          const { minLength, ...rest } = field;
          onChange(rest);
        }}>reset</button>}
      </label>
      <label>
        max length:
        <input type="number" onInput={handleMaxChange} value={field?.maxLength ?? ""} />
        {field.maxLength !== undefined && <button onClick={() => {
          const { maxLength, ...rest } = field;
          onChange(rest);
        }}>reset</button>}
      </label>
    </>
  );
}