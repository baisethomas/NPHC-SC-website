"use client"

import * as React from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

const CELL = "h-9 w-9"

/**
 * Date picker built on react-day-picker v9.
 *
 * Every cell has a fixed size so the grid never collapses inside a
 * fit-content popover, the month and year are dropdowns so an officer can
 * jump a year ahead without clicking through twelve months, and selection
 * uses the council's ink and gold.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "dropdown",
  startMonth,
  endMonth,
  ...props
}: CalendarProps) {
  const defaults = getDefaultClassNames()
  const thisYear = new Date().getFullYear()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      startMonth={startMonth ?? new Date(thisYear - 5, 0)}
      endMonth={endMonth ?? new Date(thisYear + 5, 11)}
      className={cn("p-3", className)}
      classNames={{
        root: cn("w-fit", defaults.root),
        months: cn("relative flex flex-col gap-4 md:flex-row", defaults.months),
        month: cn("flex flex-col gap-3", defaults.month),
        nav: cn("absolute inset-x-0 top-0 flex h-9 items-center justify-between", defaults.nav),
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 text-muted-foreground hover:text-foreground aria-disabled:opacity-40",
          defaults.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "h-8 w-8 p-0 text-muted-foreground hover:text-foreground aria-disabled:opacity-40",
          defaults.button_next
        ),
        month_caption: cn("flex h-9 items-center justify-center px-9", defaults.month_caption),
        caption_label: cn("select-none whitespace-nowrap font-headline text-base font-bold", defaults.caption_label),
        dropdowns: cn("flex items-center gap-1.5", defaults.dropdowns),
        dropdown_root: cn(
          "relative inline-flex h-8 items-center rounded-md border border-border bg-card pl-2.5 pr-7 text-sm font-semibold",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
          defaults.dropdown_root
        ),
        dropdown: cn("absolute inset-0 cursor-pointer opacity-0", defaults.dropdown),
        chevron: cn("h-4 w-4", defaults.chevron),
        table: "border-collapse",
        weekdays: cn("flex", defaults.weekdays),
        weekday: cn(
          CELL,
          "flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground select-none",
          defaults.weekday
        ),
        week: cn("mt-1 flex", defaults.week),
        day: cn(CELL, "relative p-0 text-center select-none", defaults.day),
        range_start: cn("rounded-l-md bg-gold-soft", defaults.range_start),
        range_middle: cn("rounded-none bg-gold-soft", defaults.range_middle),
        range_end: cn("rounded-r-md bg-gold-soft", defaults.range_end),
        today: cn("[&>button]:font-bold [&>button]:text-gold", defaults.today),
        outside: cn("[&>button]:text-muted-foreground/60", defaults.outside),
        disabled: cn("[&>button]:text-muted-foreground/40 [&>button]:line-through", defaults.disabled),
        hidden: cn("invisible", defaults.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...rest }) => {
          if (orientation === "down") {
            return <ChevronDown className={cn("pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", className)} {...rest} />
          }
          const Icon = orientation === "right" ? ChevronRight : ChevronLeft
          return <Icon className={cn("h-4 w-4", className)} {...rest} />
        },
        DayButton: ({ className, day, modifiers, ...rest }: React.ComponentProps<typeof DayButton>) => {
          const ref = React.useRef<HTMLButtonElement>(null)
          React.useEffect(() => {
            if (modifiers.focused) ref.current?.focus()
          }, [modifiers.focused])
          return (
            <button
              ref={ref}
              className={cn(
                CELL,
                "inline-flex items-center justify-center rounded-md text-sm tabular-nums transition-colors",
                "hover:bg-gold-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                modifiers.selected && !modifiers.range_middle && "bg-ink font-semibold text-ivory hover:bg-ink",
                modifiers.range_middle && "rounded-none bg-gold-soft",
                className
              )}
              {...rest}
            />
          )
        },
        ...props.components,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
