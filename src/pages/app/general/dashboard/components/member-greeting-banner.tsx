import { useMemo } from "react"
import { useAuthStore } from "@/stores/auth-store"

export function MemberGreetingBanner() {
  const userSession = useAuthStore((state) => state.userSession)

  const displayName = useMemo(() => {
    if (userSession?.fullName?.trim()) {
      return userSession.fullName.trim()
    }
    if (userSession?.email) {
      return userSession.email.split("@")[0]
    }
    return "Bạn"
  }, [userSession])

  const greetingInfo = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      return {
        text: "Chào buổi sáng",
        subtext: "Chúc bạn một ngày mới dồi dào năng lượng và luôn có một trái tim khỏe mạnh.",
      }
    }
    if (hour >= 12 && hour < 18) {
      return {
        text: "Chào buổi chiều",
        subtext: "Hãy duy trì năng lượng tích cực và lắng nghe nhịp tim sinh hiệu của bạn nhé.",
      }
    }
    return {
      text: "Chào buổi tối",
      subtext: "Thư giãn tinh thần, chăm sóc giấc ngủ và kiểm tra sự ổn định của nhịp tim.",
    }
  }, [])

  return (
    <div className="relative overflow-hidden rounded-3xl border border-sky-500/20 dark:border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-emerald-500/5 to-indigo-500/10 dark:from-sky-950/40 dark:via-emerald-950/20 dark:to-indigo-950/40 p-6 sm:p-7 shadow-xs">
      {/* Decorative ambient background blur lights */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-400/20 dark:bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-1/3 w-40 h-40 bg-emerald-400/15 dark:bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-1.5 max-w-2xl">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground flex items-center flex-wrap gap-2">
          <span>{greetingInfo.text},</span>
          <span className="bg-gradient-to-r from-sky-600 via-primary to-indigo-600 bg-clip-text text-transparent">
            {displayName}
          </span>
          <span className="inline-block animate-bounce text-xl sm:text-2xl">👋</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {greetingInfo.subtext}
        </p>
      </div>
    </div>
  )
}
