"use client";

import { useEffect, useState } from "react";

/** Indice lateral do artigo: marca a secao que esta sendo lida. */
export function Toc({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-30% 0px -60% 0px" },
    );
    items.forEach((i) => { const el = document.getElementById(i.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  return (
    <nav aria-label="Neste artigo" className="sticky top-32 self-start max-lg:hidden">
      <p className="eyebrow !text-copper-lo">Neste artigo</p>
      <ul className="mt-5">
        {items.map((i) => (
          <li key={i.id}>
            <a href={`#${i.id}`} aria-current={active === i.id ? "true" : undefined} className={`toc-link block py-2 pl-4 text-sm text-ink/55 hover:text-ink ${active === i.id ? "is-active" : ""}`}>{i.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
