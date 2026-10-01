import * as React from "react"
import { User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
export type AvatarStatus = "online" | "offline" | "busy" | "away"

export interface AvatarPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  name?: string | null
  alt?: string
  size?: AvatarSize
  status?: AvatarStatus
  className?: string
  fallbackClassName?: string
  imageClassName?: string
  icon?: React.ReactNode
  colorScheme?: "auto" | "blue" | "sky" | "indigo" | "emerald" | "amber" | "rose" | "purple" | "neutral"
}

const sizeClasses: Record<AvatarSize, { root: string; text: string; icon: string; status: string }> = {
  xs: { root: "h-6 w-6", text: "text-[10px]", icon: "w-3 h-3", status: "w-1.5 h-1.5 bottom-0 right-0" },
  sm: { root: "h-8 w-8", text: "text-xs", icon: "w-4 h-4", status: "w-2 h-2 bottom-0 right-0 ring-1" },
  md: { root: "h-10 w-10", text: "text-sm", icon: "w-5 h-5", status: "w-2.5 h-2.5 bottom-0.5 right-0.5 ring-2" },
  lg: { root: "h-12 w-12", text: "text-base", icon: "w-6 h-6", status: "w-3 h-3 bottom-0.5 right-0.5 ring-2" },
  xl: { root: "h-16 w-16", text: "text-xl", icon: "w-8 h-8", status: "w-3.5 h-3.5 bottom-1 right-1 ring-2" },
  "2xl": { root: "h-24 w-24", text: "text-3xl", icon: "w-12 h-12", status: "w-5 h-5 bottom-1.5 right-1.5 ring-3" },
}

const statusColors: Record<AvatarStatus, string> = {
  online: "bg-success-500",
  offline: "bg-slate-400",
  busy: "bg-danger-500",
  away: "bg-warning-500",
}

const colorSchemes: Record<string, string> = {
  blue: "bg-gradient-to-tr from-primary-600 to-primary-500 text-white",
  sky: "bg-gradient-to-tr from-primary-500 to-primary-400 text-white",
  indigo: "bg-gradient-to-tr from-primary-600 to-primary-500 text-white",
  emerald: "bg-gradient-to-tr from-success-600 to-success-400 text-white",
  amber: "bg-gradient-to-tr from-warning-500 to-warning-400 text-white",
  rose: "bg-gradient-to-tr from-danger-600 to-danger-500 text-white",
  purple: "bg-gradient-to-tr from-primary-600 to-primary-400 text-white",
  neutral: "bg-slate-200 text-slate-700",
}

const autoGradients = [
  "bg-gradient-to-tr from-primary-600 to-primary-500 text-white",
  "bg-gradient-to-tr from-primary-600 to-primary-500 text-white",
  "bg-gradient-to-tr from-primary-600 to-primary-500 text-white",
  "bg-gradient-to-tr from-success-600 to-success-500 text-white",
  "bg-gradient-to-tr from-primary-600 to-danger-500 text-white",
  "bg-gradient-to-tr from-primary-600 to-primary-500 text-white",
  "bg-gradient-to-tr from-danger-600 to-warning-500 text-white",
]

function getInitials(name?: string | null): string {
  if (!name) return ""
  const trimmed = name.trim()
  if (!trimmed) return ""
  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getDeterministicGradient(text?: string | null): string {
  if (!text) return autoGradients[0]
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % autoGradients.length
  return autoGradients[index]
}

export const AvatarPlaceholder = React.forwardRef<HTMLDivElement, AvatarPlaceholderProps>(
  (
    {
      src,
      name,
      alt,
      size = "md",
      status,
      className,
      fallbackClassName,
      imageClassName,
      icon,
      colorScheme = "auto",
      ...props
    },
    ref
  ) => {
    const sizeConfig = sizeClasses[size] || sizeClasses.md
    const initials = getInitials(name)
    const effectiveAlt = alt || name || "User Avatar"

    const fallbackBg =
      colorScheme === "auto"
        ? getDeterministicGradient(name || alt)
        : colorSchemes[colorScheme] || colorSchemes.blue

    return (
      <div ref={ref} className={cn("relative inline-flex shrink-0 select-none", className)} {...props}>
        <Avatar className={cn(sizeConfig.root, "shadow-2xs border border-slate-200/80")}>
          {src ? (
            <AvatarImage
              src={src}
              alt={effectiveAlt}
              className={cn("h-full w-full object-cover", imageClassName)}
            />
          ) : null}
          <AvatarFallback
            className={cn(
              "flex h-full w-full items-center justify-center font-heading font-black tracking-tight",
              sizeConfig.text,
              fallbackBg,
              fallbackClassName
            )}
          >
            {initials ? (
              <span>{initials}</span>
            ) : (
              icon || <User className={cn(sizeConfig.icon, "opacity-90")} />
            )}
          </AvatarFallback>
        </Avatar>

        {status ? (
          <span
            className={cn(
              "absolute rounded-full ring-white",
              statusColors[status],
              sizeConfig.status
            )}
            aria-label={`Status: ${status}`}
          />
        ) : null}
      </div>
    )
  }
)

AvatarPlaceholder.displayName = "AvatarPlaceholder"
