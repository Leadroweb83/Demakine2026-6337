// A API vem empacotada num arquivo só pelo buildCommand do vercel.json: o Node em ESM
// não resolve os imports sem extensão do código-fonte.
// @ts-ignore gerado no build
import app from "../server-build/index.js";

export default app;
