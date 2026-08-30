import * as React from "react"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

export type CheckedState = boolean | "indeterminate"

export interface CheckboxProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "checked" | "defaultChecked" | "onChange"
  > {
  checked?: CheckedState
  defaultChecked?: CheckedState
  onCheckedChange?: (checked: CheckedState) => void
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  (
    {
      className,
      checked: checkedProp,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      onClick,
      onKeyDown,
      type = "button",
      ...props
    },
    ref
  ) => {
    const [uncontrolledChecked, setUncontrolledChecked] =
      React.useState<CheckedState>(defaultChecked)
    const isControlled = checkedProp !== undefined
    const checked = isControlled ? checkedProp : uncontrolledChecked

    const state =
      checked === "indeterminate"
        ? "indeterminate"
        : checked
          ? "checked"
          : "unchecked"

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e)
      if (e.defaultPrevented || disabled) return

      const nextChecked: CheckedState =
        checked === "indeterminate" ? true : !checked
      if (!isControlled) {
        setUncontrolledChecked(nextChecked)
      }
      onCheckedChange?.(nextChecked)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(e)
      if (e.key === "Enter") {
        e.preventDefault()
      }
    }

    return (
      <button
        type={type}
        role="checkbox"
        aria-checked={checked === "indeterminate" ? "mixed" : !!checked}
        data-state={state}
        data-disabled={disabled ? "" : undefined}
        disabled={disabled}
        ref={ref}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-neutral-900 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-neutral-900 data-[state=checked]:text-neutral-50 dark:border-neutral-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 dark:data-[state=checked]:bg-neutral-50 dark:data-[state=checked]:text-neutral-900",
          className
        )}
        {...props}
      >
        {checked === "indeterminate" ? (
          <span className="flex items-center justify-center text-current pointer-events-none">
            <Minus className="h-3.5 w-3.5 stroke-[3]" />
          </span>
        ) : checked ? (
          <span className="flex items-center justify-center text-current pointer-events-none">
            <Check className="h-3.5 w-3.5 stroke-[3]" />
          </span>
        ) : null}
      </button>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }

