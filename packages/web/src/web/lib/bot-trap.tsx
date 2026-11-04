import { useRef, useState } from "react";

/**
 * Defesa contra robô nos formulários públicos. `field` é um campo invisível (gente não vê nem
 * preenche; robô costuma preencher) e `trap()` devolve o que vai junto no envio: o campo (`hp`) e
 * quantos milissegundos o formulário ficou aberto (`elapsed`), que o servidor usa para barrar envio
 * rápido demais. É um intervalo medido só no navegador, então relógio errado no aparelho não atrapalha.
 * O nome do campo foge de "website", "url" e "email" para o preenchimento automático do navegador
 * não mexer nele e fazer perder um pedido de verdade.
 */
export function useBotTrap() {
  const openedAt = useRef(performance.now());
  const [hp, setHp] = useState("");
  const field = (
    <input
      type="text"
      name="hp_confirmacao"
      value={hp}
      onChange={(e) => setHp(e.target.value)}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
    />
  );
  return { field, trap: () => ({ hp, elapsed: Math.round(performance.now() - openedAt.current) }) };
}
