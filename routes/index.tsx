import FormBuilder from "../islands/FormBuilder.tsx";

export default function Home() {
  return (
    <>
      <header class="hero">
        <div class="container hero-body">
          <h1>Fresh Forms</h1>
          <p>
            Developer focused forms powered by <a href="https://deno.com/kv" target="_blank" rel="noopener noreferrer">Deno KV</a>
          </p>
        </div>
      </header>
      <main>
        <div class="container">
          <FormBuilder />
        </div>
      </main>
    </>
  );
}
