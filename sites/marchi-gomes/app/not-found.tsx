import Link from "next/link";

export default function NotFound() {
  return (
    <section className="hero-light">
      <div className="wrap flex min-h-[80svh] flex-col justify-center pt-24">
        <p className="eyebrow">Erro 404</p>
        <h1 className="display mt-5 text-[clamp(2.8rem,7vw,6rem)]">Página não encontrada.</h1>
        <Link href="/" className="btn btn-ghost mt-10 self-start">Voltar ao início</Link>
      </div>
    </section>
  );
}
