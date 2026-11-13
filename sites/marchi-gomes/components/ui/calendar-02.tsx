"use client";

import { ptBR } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";

/**
 * Adaptado do "Calendar with Custom Select Day Style" (21st.dev).
 * Diferencas para o original: sem @faker-js/faker (dias "ocupados" falsos
 * seriam disponibilidade inventada), controlado por props, em pt-BR, com
 * passado e fins de semana bloqueados. `booked` aceita datas reais quando
 * houver integracao com a agenda do escritorio.
 */
export default function CalendarTwo({
  value,
  onChange,
  booked = [],
}: {
  value?: Date;
  onChange: (date?: Date) => void;
  booked?: Date[];
}) {
  const today = new Date();
  return (
    <Calendar
      mode="single"
      locale={ptBR}
      selected={value}
      onSelect={onChange}
      startMonth={today}
      disabled={[{ before: today }, { dayOfWeek: [0, 6] }, ...booked]}
      modifiers={{ booked }}
      modifiersClassNames={{ booked: "line-through" }}
      className="border hairline"
      classNames={{ day_button: "rounded-full h-10 w-10 p-0 font-normal inline-flex items-center justify-center transition-colors hover:bg-accent hover:text-accent-foreground", day: "rounded-full h-10 w-10 p-0 text-center text-sm" }}
    />
  );
}
