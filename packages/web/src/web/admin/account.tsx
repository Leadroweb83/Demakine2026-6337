import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { ROLE_LABEL, type PanelUser } from "../lib/auth";
import { Badge, Btn, Card, Field, PageTitle, inputCls } from "./ui";
import { AvatarEditor } from "./avatar";

export function AdminAccount({ user, forced = false }: { user: PanelUser; forced?: boolean }) {
  const qc = useQueryClient();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "erro"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) {
      setMsg({ kind: "erro", text: "A nova senha precisa de no mínimo 8 caracteres." });
      return;
    }
    if (next !== confirm) {
      setMsg({ kind: "erro", text: "A confirmação não bate com a nova senha." });
      return;
    }
    setBusy(true);
    const res = await api.admin["change-password"].$post({
      json: { currentPassword: current, newPassword: next },
    });
    setBusy(false);
    if (!res.ok) {
      setMsg({ kind: "erro", text: "Senha atual incorreta." });
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setMsg({ kind: "ok", text: "Senha alterada. As outras sessões foram encerradas." });
    qc.invalidateQueries({ queryKey: ["admin-me"] });
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Minha conta"
        hint={forced ? "Sua senha é provisória. Defina uma senha sua para continuar." : undefined}
      />

      <Card>
        <div className="mb-5 border-b border-black/5 pb-5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/50">Foto</p>
          <div className="mt-2">
            <AvatarEditor name={user.name} image={user.image} />
          </div>
          <p className="mt-2 text-[12px] text-dm-ink/50">
            Aparece no menu do painel e nos leads que forem seus. Você pode trocar ou remover quando quiser.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/50">Nome</p>
            <p className="mt-1 text-[14.5px] font-semibold text-dm-ink">{user.name}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/50">E-mail</p>
            <p className="mt-1 text-[14.5px] text-dm-ink/75">{user.email}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-dm-ink/50">Papel</p>
            <p className="mt-1">
              <Badge>{ROLE_LABEL[user.role] ?? user.role}</Badge>
            </p>
          </div>
        </div>
      </Card>

      <Card className="max-w-xl">
        <h2 className="font-display text-[15px] font-extrabold text-dm-ink">Trocar senha</h2>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <Field label="Senha atual">
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={inputCls}
              autoComplete="current-password"
              required
            />
          </Field>
          <Field label="Nova senha" hint="Mínimo 8 caracteres.">
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={inputCls}
              autoComplete="new-password"
              required
            />
          </Field>
          <Field label="Confirmar nova senha">
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={inputCls}
              autoComplete="new-password"
              required
            />
          </Field>

          {msg && (
            <p
              className={`text-[13px] font-semibold ${
                msg.kind === "ok" ? "text-dm-green-dark" : "text-dm-red"
              }`}
            >
              {msg.text}
            </p>
          )}

          <Btn type="submit" disabled={busy}>
            {busy ? "Salvando..." : "Salvar nova senha"}
          </Btn>
        </form>
      </Card>
    </div>
  );
}
