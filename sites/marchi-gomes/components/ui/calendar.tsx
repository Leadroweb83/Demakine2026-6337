"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/** Calendario shadcn na API do react-day-picker v9, com os tokens da marca. */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "relative flex flex-col",
        month: "space-y-4",
        month_caption: "flex h-9 items-center justify-center",
        caption_label: "font-display text-xl capitalize text-bone",
        nav: "absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(buttonVariants({ variant: "outline", size: "icon" }), "h-9 w-9 rounded-full"),
        button_next: cn(buttonVariants({ variant: "outline", size: "icon" }), "h-9 w-9 rounded-full"),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-10 text-[0.68rem] font-normal uppercase tracking-[0.14em] text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "h-10 w-10 p-0 text-center text-sm",
        day_button: cn(buttonVariants({ variant: "ghost" }), "h-10 w-10 p-0 font-normal"),
        selected: "[&>button]:!bg-primary [&>button]:!text-ink [&>button]:hover:bg-primary [&>button]:font-semibold",
        today: "[&>button]:border [&>button]:border-copper/60",
        outside: "text-muted-foreground/50",
        disabled: "text-muted-foreground/35 [&>button]:pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: c }) =>
          orientation === "left" ? <ChevronLeft className={cn("h-4 w-4", c)} /> : <ChevronRight className={cn("h-4 w-4", c)} />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
