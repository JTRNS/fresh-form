import { escape } from "$std/html/mod.ts";

export default function Home() {
  return (
    <>
      <header class="hero">
        <div class="hero-body">
          <h1>Fresh Forms</h1>
          <p>
            Developer focused forms powered by <a href="https://deno.com/kv" target="_blank" rel="noopener noreferrer">Deno KV</a>
          </p>
        </div>
      </header>
      <section>
        <div class="container">
          <h2>Get started</h2>
          <ol>
            <li><a href="/create">Create a new form</a></li>
            <li>Point the <code>action</code> to unique form id <pre><code>&lt;form action=&quot;https://fresh-form.deno.dev/api/v1/submit/[form_id]&quot; method=&quot;post&quot;&gt;</code></pre></li>
            <li>Fetch form submissions at <code>/api/v1/form/[form_id]</code> using API Key </li>
          </ol>
        </div>
      </section>
    </>
  );
}
