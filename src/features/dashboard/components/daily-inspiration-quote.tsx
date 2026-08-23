import { useState, useEffect, useCallback } from "react"
import { 
  Quote as QuoteIcon, 
  RefreshCw, 
  Languages, 
  Copy, 
  Check, 
  SunMedium
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface QuoteItem {
  _id: string
  content: string
  author: string
  tags?: string[]
  translatedContent?: string
}

// Curated fallbacks in case quotable.io is unavailable or offline
const FALLBACK_QUOTES: QuoteItem[] = [
  {
    _id: "fb-1",
    content: "The greatest wealth is health.",
    author: "Virgil",
    tags: ["Health", "Wisdom"],
    translatedContent: "Tài sản lớn nhất của đời người chính là sức khỏe.",
  },
  {
    _id: "fb-2",
    content: "Take care of your body. It's the only place you have to live.",
    author: "Jim Rohn",
    tags: ["Health", "Lifestyle"],
    translatedContent: "Hãy chăm sóc cơ thể của bạn. Đó là nơi duy nhất bạn phải sống.",
  },
  {
    _id: "fb-3",
    content: "A healthy outside starts from the inside.",
    author: "Robert Urich",
    tags: ["Health", "Wellness"],
    translatedContent: "Một vẻ ngoài khỏe mạnh luôn bắt nguồn từ sự khỏe khoắn bên trong.",
  },
  {
    _id: "fb-4",
    content: "Always be yourself, express yourself, have faith in yourself, do not go out and look for a successful personality and duplicate it.",
    author: "Bruce Lee",
    tags: ["Famous Quotes", "Success"],
    translatedContent: "Hãy luôn là chính mình, thể hiện bản thân, tin tưởng vào chính mình; đừng tìm kiếm một hình mẫu thành công nào khác để sao chép.",
  },
  {
    _id: "fb-5",
    content: "Happiness is nothing more than good health and a bad memory.",
    author: "Albert Schweitzer",
    tags: ["Happiness", "Health"],
    translatedContent: "Hạnh phúc chẳng có gì hơn ngoài một cơ thể khỏe mạnh và một trí nhớ biết buông bỏ.",
  },
]

// Auto translation helper (English -> Vietnamese)
async function translateToVietnamese(englishText: string): Promise<string> {
  if (!englishText) return ""

  // Method 1: Google Translate public API
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(englishText)}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map((item: [string, ...any[]]) => item[0]).join("")
        if (translated.trim()) return translated.trim()
      }
    }
  } catch (err) {
    console.warn("Google translate fetch error, trying MyMemory fallback:", err)
  }

  // Method 2: MyMemory Translate API fallback
  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishText)}&langpair=en|vi`
    const mmRes = await fetch(mmUrl)
    if (mmRes.ok) {
      const mmData = await mmRes.json()
      if (mmData?.responseData?.translatedText) {
        return mmData.responseData.translatedText
      }
    }
  } catch (err) {
    console.warn("MyMemory fallback error:", err)
  }

  // Return original text if offline
  return englishText
}

export function DailyInspirationQuote() {
  const [quote, setQuote] = useState<QuoteItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchRandomQuote = useCallback(async () => {
    setRefreshing(true)

    try {
      // 1. Fetch from quotable API
      const res = await fetch("https://api.quotable.io/quotes/random?tags=health|wisdom|happiness|inspirational|success|life")
      let quoteData: QuoteItem | null = null

      if (res.ok) {
        const json = await res.json()
        if (Array.isArray(json) && json.length > 0) {
          quoteData = json[0]
        } else if (json && json.content) {
          quoteData = json
        }
      }

      // If API failed or rate-limited, fallback to alternative endpoint or curated list
      if (!quoteData) {
        const altRes = await fetch("https://api.quotable.io/random")
        if (altRes.ok) {
          quoteData = await altRes.json()
        }
      }

      if (!quoteData) {
        const randomFallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
        quoteData = randomFallback
      }

      // 2. Auto-translate content into Vietnamese
      let translated = quoteData.translatedContent
      if (!translated) {
        translated = await translateToVietnamese(quoteData.content)
      }

      setQuote({
        ...quoteData,
        translatedContent: translated,
      })
    } catch (err) {
      console.warn("Failed to fetch from quotable API, using fallback:", err)
      const randomFallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)]
      setQuote(randomFallback)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchRandomQuote()
  }, [fetchRandomQuote])

  const handleCopy = () => {
    const textToCopy = showOriginal ? quote?.content : (quote?.translatedContent || quote?.content)
    if (textToCopy) {
      navigator.clipboard.writeText(`"${textToCopy}" — ${quote?.author || ""}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="rounded-3xl border border-emerald-500/25 dark:border-emerald-500/35 shadow-xs bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-sky-500/15 dark:from-emerald-950/40 dark:via-card dark:to-teal-950/40 overflow-hidden relative min-h-[230px] sm:min-h-[250px] flex flex-col justify-between group transition-all">
      {/* Inline Keyframes for Gentle Floating Objects */}
      <style>{`
        @keyframes floatSlow1 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-14px) translateX(10px) rotate(12deg) scale(1.08); }
        }
        @keyframes floatSlow2 {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(12px) translateX(-8px) rotate(-10deg) scale(1.12); }
        }
        @keyframes floatSlow3 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          50% { transform: translateY(-10px) translateX(-6px) scale(1.18); }
        }
      `}</style>

      {/* High-Opacity Floating Organic Objects */}
      {/* Object 1: Top-Right Vivid Emerald Sphere */}
      <div 
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 via-teal-300 to-emerald-500 opacity-75 dark:opacity-40 blur-xl pointer-events-none"
        style={{ animation: "floatSlow1 7s ease-in-out infinite" }}
      />

      {/* Object 2: Bottom-Left Vivid Teal-Cyan Sphere */}
      <div 
        className="absolute -bottom-10 -left-8 w-32 h-32 rounded-full bg-gradient-to-tr from-teal-400 via-emerald-300 to-sky-400 opacity-70 dark:opacity-35 blur-xl pointer-events-none"
        style={{ animation: "floatSlow2 8s ease-in-out infinite" }}
      />

      {/* Object 3: Center-Right Sun-Gold Glowing Particle */}
      <div 
        className="absolute top-1/3 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-emerald-400 opacity-65 dark:opacity-30 blur-lg pointer-events-none"
        style={{ animation: "floatSlow3 6s ease-in-out infinite" }}
      />

      {/* Object 4: Floating Vibrant Glass Pill (Top-Center) */}
      <div 
        className="absolute top-3 left-1/3 w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-300 to-teal-200 opacity-80 dark:opacity-40 blur-xs pointer-events-none"
        style={{ animation: "floatSlow1 9s ease-in-out infinite" }}
      />

      {/* Object 5: Floating Mini Star Pill (Bottom-Right) */}
      <div 
        className="absolute bottom-5 right-28 w-6 h-6 rounded-full bg-gradient-to-br from-sky-300 to-teal-300 opacity-75 dark:opacity-40 blur-xs pointer-events-none"
        style={{ animation: "floatSlow2 5.5s ease-in-out infinite" }}
      />

      {/* Decorative Background Quote Icon */}
      <QuoteIcon className="absolute -right-4 -bottom-6 w-36 h-36 text-emerald-500/10 dark:text-emerald-400/5 pointer-events-none select-none group-hover:scale-105 transition-transform duration-500" />

      <CardContent className="p-6 sm:p-7 flex-1 flex flex-col justify-between gap-4 relative z-10">
        {/* Top bar: Vibrant Badge & Tool buttons */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/80 dark:bg-slate-800/80 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 shadow-2xs backdrop-blur-xs">
            <span className="p-1 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-pulse">
              <SunMedium className="w-3 h-3" />
            </span>
            <span>Năng Lượng & Sức Khỏe Mỗi Ngày</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/60 dark:bg-slate-900/60 p-1 rounded-2xl border border-border/60 shadow-2xs backdrop-blur-xs">
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              title="Sao chép câu danh ngôn"
              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors flex items-center justify-center cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setShowOriginal((prev) => !prev)}
              title={showOriginal ? "Xem bản dịch Tiếng Việt" : "Xem câu gốc Tiếng Anh"}
              className={`h-8 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                showOriginal
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{showOriginal ? "Gốc (EN)" : "Tiếng Việt"}</span>
            </button>

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRandomQuote}
              disabled={refreshing}
              title="Lấy câu danh ngôn mới"
              className="h-8 w-8 p-0 rounded-xl text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Quote Content */}
        {loading ? (
          <div className="space-y-3 py-4 flex-1 flex flex-col justify-center">
            <div className="h-4 bg-emerald-200/40 dark:bg-emerald-900/30 rounded-md animate-pulse w-5/6" />
            <div className="h-4 bg-teal-200/40 dark:bg-teal-900/30 rounded-md animate-pulse w-3/4" />
          </div>
        ) : (
          <div className="flex-1 flex items-center my-2">
            <blockquote className="text-base sm:text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 leading-relaxed italic">
              “{showOriginal ? quote?.content : quote?.translatedContent || quote?.content}”
            </blockquote>
          </div>
        )}

        {/* Bottom Author & Tags Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-emerald-500/15 dark:border-emerald-500/20 text-xs mt-auto">
          {/* Author info */}
          <span className="font-bold text-foreground text-xs sm:text-sm">
            — {quote?.author || "Khuyết danh"}
          </span>

          {/* Tags */}
          {quote?.tags && quote.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              {quote.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-white/80 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 shadow-2xs backdrop-blur-xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
