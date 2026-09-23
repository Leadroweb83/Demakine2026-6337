import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-black/5 bg-white p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function PageTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div>
      <h1 className="font-display text-[26px] font-extrabold tracking-tight text-dm-ink">{title}</h1>
      {hint && <p className="mt-1 max-w-2xl text-[13.5px] text-dm-ink/60">{hint}</p>}
    </div>
  );
}

export function Btn({
  children,
  onClick,
  type = "button",
  tone = "primary",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  tone?: "primary" | "ghost" | "danger" | "green";
  disabled?: boolean;
  className?: string;
}) {
  const tones: Record<string, string> = {
    primary: "bg-dm-blue text-white hover:bg-[#0d3480]",
    green: "bg-dm-green text-white hover:bg-dm-green-dark",
    ghost: "border border-black/10 bg-white text-dm-ink hover:bg-black/[0.03]",
    danger: "bg-dm-red text-white hover:bg-[#c5111a]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wide transition-colors disabled:opacity-60 ${tones[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold uppercase tracking-wide text-dm-ink/60">
        {label}
      </span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block text-[12px] text-dm-ink/50">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full rounded-lg border border-black/10 bg-white px-3.5 py-2.5 text-[14px] text-dm-ink outline-none transition-colors focus:border-dm-blue";

export function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "gray" | "red" }) {
  const tones: Record<string, string> = {
    blue: "bg-dm-blue/10 text-dm-blue",
    green: "bg-dm-green/12 text-dm-green-dark",
    gray: "bg-black/5 text-dm-ink/60",
    red: "bg-dm-red/10 text-dm-red",
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}
