import { Fragment, useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import {
  ArrowUp,
  ShieldAlert,
  ChevronRight,
  FileDown,
  FileCode,
  Layers,
  Copy,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDocumentTitle, useDocumentTitle } from "@/hooks/use-document-title"
import { BrandSlogan } from "@/components/custom/BrandSlogan"

type ViewStyle = "interactive" | "document"

/**
 * Cấu trúc văn bản: mỗi mục có tiêu đề (terms:sections.<key>.title / .articleTitle) và các khoản
 * (terms:sections.<key>.clauses.<clause>). Hai chế độ xem (tương tác / A4) dùng chung nội dung này.
 */
const SECTIONS = [
  { id: "section-1", key: "s1", clauses: ["c1", "c2"] },
  { id: "section-2", key: "s2", clauses: ["c1", "c2", "c3"] },
  { id: "section-3", key: "s3", clauses: ["c1", "c2"] },
  { id: "section-4", key: "s4", clauses: ["c1", "c2"] },
  { id: "section-5", key: "s5", clauses: ["c1", "c2"] },
  { id: "section-6", key: "s6", clauses: ["c1", "c2", "c3"] },
  { id: "section-7", key: "s7", clauses: ["c1", "c2", "c3"] },
  { id: "section-8", key: "s8", clauses: ["c1", "c2", "c3"] },
] as const

/** Khoá terms:emergencySymptoms.<key> — chỉ hiển thị trong mục 3 của chế độ tương tác. */
const EMERGENCY_SYMPTOMS = [
  "chestPain",
  "breathlessness",
  "fainting",
  "strokeSigns",
  "palpitations",
  "unconsciousness",
] as const

const handleScrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" })
}

/** Ngày cập nhật của văn bản (trùng dòng "Cập nhật lần cuối" trên trang), dùng trong tên file PDF. */
const TERMS_UPDATED = "23-08-2026"

/** Thẻ inline dùng trong các đoạn văn bản có định dạng (<strong>, <em>). */
const RICH_TEXT = { strong: <strong />, em: <em /> }

export default function TermsAndConditionsPage() {
  const { t } = useTranslation("terms")
  const termsTitle = t("documentTitle")
  useDocumentTitle(termsTitle)
  const [viewStyle, setViewStyle] = useState<ViewStyle>("interactive")
  const [activeSection, setActiveSection] = useState("section-1")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [copied, setCopied] = useState(false)

  /**
   * "Tải PDF" dùng hộp thoại in của trình duyệt; tên file mặc định lấy từ tiêu đề tab, nên đổi tiêu đề trong lúc in
   * để file có tên rõ ràng, rồi trả lại như cũ.
   */
  const handleDownloadPdf = () => {
    const previous = document.title
    document.title = formatDocumentTitle(t("pdfFileTitle", { title: termsTitle, date: TERMS_UPDATED }))
    const restore = () => {
      document.title = previous
      window.removeEventListener("afterprint", restore)
    }
    window.addEventListener("afterprint", restore)
    window.print()
  }

  const renderClause = (sectionKey: string, clause: string) => (
    <Trans t={t} i18nKey={`sections.${sectionKey}.clauses.${clause}`} components={RICH_TEXT} />
  )

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const yOffset = -90
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: "smooth" })
      setActiveSection(id)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)

      if (viewStyle === "interactive") {
        const scrollPosition = window.scrollY + 120
        for (const section of SECTIONS) {
          const el = document.getElementById(section.id)
          if (el) {
            const top = el.offsetTop
            const height = el.offsetHeight
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveSection(section.id)
              break
            }
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [viewStyle])

  // Copy plain text document
  const handleCopyText = () => {
    const docElement = document.getElementById("formal-document-content")
    if (!docElement) return

    const plainText = docElement.innerText
    navigator.clipboard.writeText(plainText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-500 selection:text-white">
      {/* Embedded Print CSS for pristine A4 PDF export */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 18mm 15mm 18mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          header, footer, nav, aside, button, .print\\:hidden {
            display: none !important;
          }
          #formal-document-content {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            font-size: 11pt !important;
            line-height: 1.5 !important;
          }
          #formal-document-content * {
            color: #000000 !important;
          }
          #formal-document-content h1 {
            font-size: 14pt !important;
            font-weight: bold !important;
            text-align: center !important;
          }
          #formal-document-content h2 {
            font-size: 12pt !important;
            font-weight: bold !important;
          }
          #formal-document-content p, #formal-document-content li {
            font-size: 10.5pt !important;
            text-align: justify !important;
          }
        }
      `}</style>

      {/* Sticky Topbar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
        <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="HealthSense" className="w-8 h-8 object-contain rounded-lg" />
              <span className="hidden sm:flex flex-col">
                <span className="font-heading font-black text-lg tracking-tight text-slate-900">HealthSense</span>
                <BrandSlogan className="text-[11px] text-slate-500 font-medium -mt-0.5" />
              </span>
            </Link>
          </div>

          {/* Center Style Switcher: Cây HTML vs Văn bản soạn thảo */}
          <div className="flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-2xl shadow-2xs">
            <button
              type="button"
              onClick={() => setViewStyle("interactive")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewStyle === "interactive"
                  ? "bg-white text-primary-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("topbar.viewInteractive")}</span>
              <span className="sm:hidden">{t("topbar.viewInteractiveShort")}</span>
            </button>

            <button
              type="button"
              onClick={() => setViewStyle("document")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewStyle === "document"
                  ? "bg-white text-primary-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("topbar.viewDocument")}</span>
              <span className="sm:hidden">{t("topbar.viewDocumentShort")}</span>
            </button>
          </div>

          {/* Right Actions: Đăng nhập */}
          <div className="flex items-center gap-2.5">
            <Link to="/login">
              <Button size="sm" className="rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-2xs">
                {t("topbar.login")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section (Hidden in print) */}
      <section className="w-full bg-gradient-to-b from-slate-950 to-slate-900 text-white py-10 px-4 sm:px-6 relative overflow-hidden border-b border-white/10 print:hidden">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 w-80 h-80 bg-primary-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full text-center relative z-10 space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight text-white">
            {t("hero.title")}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="pt-1 flex items-center justify-center text-xs text-slate-400 font-medium">
            <span><Trans t={t} i18nKey="hero.lastUpdated" components={RICH_TEXT} /></span>
          </div>
        </div>
      </section>

      {/* VIEW 1: INTERACTIVE WEB / HTML TREE STYLE */}
      {viewStyle === "interactive" && (
        <main className="w-full px-4 sm:px-6 py-6 print:hidden">

          {/* Critical Emergency Alert Banner */}
          <div className="w-full mb-6 rounded-2xl border-2 border-danger-300 bg-danger-50/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start gap-4">
            <div className="p-3 rounded-2xl bg-danger-100 text-danger-600 shrink-0">
              <ShieldAlert className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-danger-900 tracking-tight font-heading flex items-center gap-2">
                <span>{t("alert.title")}</span>
              </h3>
              <p className="text-xs sm:text-sm text-danger-800 leading-relaxed font-sans">
                <Trans t={t} i18nKey="alert.body" components={RICH_TEXT} />
              </p>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Table of Contents (Sticky on Desktop) */}
            <aside className="lg:col-span-3 sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-heading mb-3">
                  {t("toc.title")}
                </h3>
                <nav className="space-y-1">
                  {SECTIONS.map((item) => {
                    const isActive = activeSection === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${isActive
                            ? "bg-primary-50 text-primary-700 font-extrabold border border-primary-200/80 shadow-2xs"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                      >
                        <span className="truncate pr-2">{t(`sections.${item.key}.title`)}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary-600 shrink-0" />}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Document export quick helper */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t("export.label")}</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t("export.desc")}
                </p>
                <div className="pt-1">
                  <Button
                    size="sm"
                    onClick={handleDownloadPdf}
                    className="w-full rounded-xl bg-danger-600 hover:bg-danger-700 text-white text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>{t("export.downloadPdf")}</span>
                  </Button>
                </div>
              </div>
            </aside>

            {/* Right Document Content */}
            <article className="lg:col-span-9 space-y-10 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs">

              {SECTIONS.map((section, index) => (
                <Fragment key={section.id}>
                  {index > 0 && <hr className="border-slate-100" />}

                  <section id={section.id} className="space-y-3 scroll-mt-24">
                    <h2 className="text-xl font-black font-heading tracking-tight text-slate-900">
                      {t(`sections.${section.key}.title`)}
                    </h2>
                    <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                      {section.clauses.map((clause) => (
                        <p key={clause}>
                          {renderClause(section.key, clause)}
                        </p>
                      ))}
                      {section.id === "section-3" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          {EMERGENCY_SYMPTOMS.map((symptom) => (
                            <div key={symptom} className="flex items-start gap-2 p-2.5 rounded-xl bg-danger-50/60 border border-danger-100 text-xs text-danger-900 font-medium">
                              <span className="text-danger-500 font-bold">•</span>
                              <span>{t(`emergencySymptoms.${symptom}`)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                </Fragment>
              ))}

            </article>

          </div>

        </main>
      )}

      {/* VIEW 2: FORMAL DRAFTED DOCUMENT (A4 PAPER STYLE) */}
      <div className={`w-full py-8 px-4 sm:px-6 lg:px-8 ${viewStyle === "document" ? "block" : "hidden print:block"}`}>

        {/* Document Action Toolbar (Screen only) */}
        <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-success-500" />
            <span className="text-xs font-bold text-slate-700">{t("document.toolbarLabel")}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleDownloadPdf}
              className="rounded-xl bg-danger-600 hover:bg-danger-700 text-white text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
              title={t("export.downloadPdfTitle")}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{t("export.downloadPdf")}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyText}
              className="rounded-xl text-xs font-bold gap-1.5 text-slate-700 hover:bg-slate-100"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-success-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t("document.copied") : t("document.copyAll")}</span>
            </Button>
          </div>
        </div>

        {/* Paper Document Container */}
        <div
          id="formal-document-content"
          className="max-w-4xl mx-auto bg-white border border-slate-200 sm:rounded-2xl shadow-lg p-8 sm:p-14 text-slate-900 font-sans leading-relaxed print:shadow-none print:border-none print:p-0 print:m-0"
        >
          {/* Official Document Header */}
          <div className="text-center space-y-1 mb-8 pb-6 border-b border-slate-300">
            <p className="text-sm font-bold tracking-wider uppercase">
              {t("document.nationalTitle")}
            </p>
            <p className="text-xs font-bold italic tracking-wide underline pb-4">
              {t("document.nationalMotto")}
            </p>
            <p className="text-xs text-slate-500 italic">
              {t("document.placeDate")}
            </p>

            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-900 pt-4">
              {t("document.title")}
            </h1>
            <p className="text-xs italic text-slate-600">
              {t("document.subtitle")}
            </p>
          </div>

          {/* Legal Document Preamble */}
          <div className="space-y-3 text-xs sm:text-sm text-justify mb-8">
            <p>
              {t("document.preamble1")}
            </p>
            <p>
              <Trans t={t} i18nKey="document.preamble2" components={RICH_TEXT} />
            </p>
          </div>

          {/* Critical Box in Document */}
          <div className="border-2 border-danger-600 bg-danger-50 p-4 sm:p-5 rounded-lg mb-8 space-y-2">
            <p className="text-xs sm:text-sm font-bold text-danger-900 uppercase text-center">
              {t("document.specialTitle")}
            </p>
            <p className="text-xs text-danger-800 text-justify leading-relaxed">
              <Trans t={t} i18nKey="document.specialBody" components={RICH_TEXT} />
            </p>
          </div>

          {/* Document Articles */}
          <div className="space-y-6 text-xs sm:text-sm text-justify">

            {SECTIONS.map((section) => (
              <div key={section.id}>
                <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 mb-2">
                  {t(`sections.${section.key}.articleTitle`)}
                </h2>
                {section.clauses.map((clause) => (
                  <p key={clause}>
                    {renderClause(section.key, clause)}
                  </p>
                ))}
              </div>
            ))}

          </div>

          {/* Document Signatures Footer */}
          <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-6 text-center text-xs sm:text-sm">
            <div className="space-y-1">
              <p className="font-bold uppercase text-slate-800">{t("document.signatures.userTitle")}</p>
              <p className="text-[11px] text-slate-500 italic">{t("document.signatures.userNote")}</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-slate-400 italic text-[11px]">{t("document.signatures.userPlaceholder")}</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold uppercase text-slate-800">{t("document.signatures.boardTitle")}</p>
              <p className="text-[11px] text-slate-500 italic">{t("document.signatures.boardNote")}</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-primary-700 font-bold tracking-wider text-sm border-b border-primary-300 pb-0.5">
                  HealthSense Development Team
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Footer (Screen only) */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500 print:hidden">
        <div className="w-full px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>{t("footer.copyright", { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-slate-900 transition-colors">{t("footer.home")}</Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">{t("footer.login")}</Link>
            <button onClick={() => setViewStyle("document")} className="text-primary-600 font-bold hover:underline cursor-pointer">
              {t("footer.viewA4")}
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Scroll to Top Button (Screen only) */}
      {showScrollTop && (
        <button
          onClick={handleScrollToTop}
          type="button"
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl text-slate-700 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200 hover:-translate-y-1 active:translate-y-0 cursor-pointer group print:hidden"
          title={t("scrollToTop")}
          aria-label={t("scrollToTop")}
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

    </div>
  )
}
