"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, getDefaultClassNames, DayButton } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const defaultClassNames = getDefaultClassNames()
  
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between px-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 aria-disabled:opacity-50 p-0 select-none hover:bg-accent",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 aria-disabled:opacity-50 p-0 select-none hover:bg-accent",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-9 w-full px-8 mb-3",
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          "select-none font-semibold text-base text-foreground",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex mb-2", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-semibold text-sm select-none py-2",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        day: cn(
          "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md",
          "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              ref={rootRef}
              className={cn(className)}
              {...(props as any)}
            />
          )
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
            )
          }
          if (orientation === "right") {
            return (
              <ChevronRight className={cn("h-4 w-4", className)} {...props} />
            )
          }
          return null
        },
        DayButton: ({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) => {
          const ref = React.useRef<HTMLButtonElement>(null)
          React.useEffect(() => {
            if (modifiers.focused) ref.current?.focus()
          }, [modifiers.focused])
          
          return (
            <button
              ref={ref}
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "h-10 w-full p-0 font-normal rounded-md transition-colors text-sm",
                "flex items-center justify-center",
                "aria-selected:opacity-100",
                "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground data-[selected=true]:font-medium",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
              )}
              {...(props as any)}
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
