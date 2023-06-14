import { UnknownPageProps } from "$fresh/server.ts";
import { asset } from "$fresh/runtime.ts";

export default function NotFoundPage({ url }: UnknownPageProps) {
  return (
    <main class="not-found">
      <h1>404</h1>
      <p>not found</p>
      <picture>
        <img src={asset('/dino_404.png')} alt="Dinosaur detective looking for webpage with spyglass." />
      </picture>

      <code>{url.href}</code>
      <p>We have looked everywhere, but the page seems to be missing.</p>
      <a href="/">return to home</a>
    </main>
  );
}