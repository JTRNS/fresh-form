import { renderToString } from "preact-render-to-string";
import { InputField } from "../utils/form.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";

export default function FormSnippet({ fields }: { fields: InputField[] }) {
  const snippetHtml = renderToString(<form>
    {fields.map(({ label, ...field }) => (
      <>
        <label for={field.name}>
          {label}
        </label>
        {field.type === "textarea"
          ? (
            <textarea
              {...field}
              id={field.name}
            />
          )
          : (
            <input
              {...field}
              id={field.name}
            />
          )}
      </>
    ))}
  </form>, { pretty: true })


  return (<p>
    {IS_BROWSER && <button onClick={() => navigator.clipboard.writeText(snippetHtml)}>copy</button>}
    <br />
    <code>
      {snippetHtml}
    </code>
  </p>)
}