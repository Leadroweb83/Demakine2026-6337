import { useState } from "react";
import { authClient } from "../lib/auth";
import { Btn, Field, inputCls } from "./ui";

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await authClient.signIn.email({ email: email.trim().toLowerCase(), password });
    setBusy(false);
    if (res.error) {
      setError(
        res.error.status === 401 || res.error.status === 403
          ? "E-mail ou senha incorretos."
          : res.error.message || "Não foi possível entrar.",
      );
      return;
    }
    onSuccess();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dm-blue-deep px-6">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 15%, rgba(16,61,148,0.85) 0%, transparent 70%), radial-gradient(45% 45% at 85% 80%, rgba(228,20,27,0.35) 0%, transparent 70%)",
        }}
      />
      <form
        onSubmit={submit}
        className="relative w-full max-w-[400px] rounded-3xl bg-white p-8 shadow-2xl"
      >
        <img
          src="/img/site/logo-blue.png"
          alt="Demakine"
          className="mx-auto h-10 w-auto object-contain"
        />
        <h1 className="mt-6 text-center font-display text-[20px] font-extrabold text-dm-ink">
          Painel Demakine
        </h1>
        <p className="mt-1 text-center text-[13px] text-dm-ink/55">
          Acesso restrito à equipe. Entre com seu e-mail.
        </p>

        <div className="mt-7 space-y-4">
          <Field label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              autoComplete="username"
              autoFocus
              required
            />
          </Field>
          <Field label="Senha">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              autoComplete="current-password"
              required
            />
          </Field>
        </div>

        {error && <p className="mt-3 text-[12.5px] font-semibold text-dm-red">{error}</p>}

        <Btn type="submit" disabled={busy} className="mt-6 w-full">
          {busy ? "Entrando..." : "Entrar"}
        </Btn>

        <p className="mt-5 text-center text-[12px] text-dm-ink/45">
          Esqueceu a senha? Fale com o super admin para gerar uma nova.
        </p>
      </form>
    </div>
  );
}
