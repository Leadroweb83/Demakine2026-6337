"use client";

import { useEffect, useState } from "react";
import { whatsappHref } from "@/lib/site";
import { WhatsAppIcon } from "./icons";

/** Botao flutuante so no celular: aparece depois da primeira dobra e some perto do formulario. */
export function WhatsAppFloat() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let nearForm = false;
    const update = () => setShow(window.scrollY > window.innerHeight * 0.8 && !nearForm);
    const target = document.getElementById("contato");
    const io = target ? new IntersectionObserver(([e]) => { nearForm = e.isIntersecting; update(); }, { threshold: 0.05 }) : null;
    if (target) io!.observe(target);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => { window.removeEventListener("scroll", update); io?.disconnect(); };
  }, []);
  return (
    <a
      href={whatsappHref()}
      aria-label="Falar pelo WhatsApp"
      data-event="whatsapp_flutuante"
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-5 right-5 z-[65] flex h-14 w-14 items-center justify-center rounded-full bg-copper-hi text-ink shadow-xl shadow-ink/40 transition-all duration-500 lg:hidden ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
