// A API vem empacotada num arquivo só pelo buildCommand do vercel.json: o Node em ESM
// não resolve os imports sem extensão do código-fonte.
// @ts-ignore gerado no build
import app from "../server-build/index.js";

// O vercel.json reescreve /api/<caminho> para /api?__path=<caminho>; aqui o caminho original volta.
export default {
  fetch(request: Request) {
    const url = new URL(request.url);
    const path = url.searchParams.get("__path");
    if (path === null) return app.fetch(request);

    url.searchParams.delete("__path");
    url.pathname = `/api/${path}`;
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    return app.fetch(
      new Request(url, {
        method: request.method,
        headers: request.headers,
        body: hasBody ? request.body : undefined,
        // @ts-ignore exigido pelo Node para repassar corpo em stream
        duplex: hasBody ? "half" : undefined,
      }),
    );
  },
};
