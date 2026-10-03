import { useState, useEffect } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  Play,
  ChevronDown,
  ArrowUp
} from "lucide-react"
import { useNavigate, Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslation } from "react-i18next"

import { AIPipelineSection } from "./components/AIPipelineSection"
import { AIFeaturesSection } from "./components/AIFeaturesSection"
import { AIClinicalBenchmarkSection } from "./components/AIClinicalBenchmarkSection"
import { HealthSenseBrandStorySection } from "./components/HealthSenseBrandStorySection"
import { LandingFooter } from "./components/LandingFooter"
import { useAuthStore } from "@/stores/auth-store"
import { BrandSlogan } from "@/components/custom/BrandSlogan"
import { UserMenu } from "@/components/layout/user-menu"
import { LanguageSwitcher } from "@/components/layout/language-switcher"
import { getDefaultRouteForRole } from "@/constants"

/** Nhãn của từng mục lấy từ landing:nav.<id> lúc render. */
const navItems = [
  { id: "about" },
  { id: "features" },
  { id: "pipeline" },
  { id: "benchmark" },
] as const

export default function LandingPage() {
  const { t } = useTranslation("landing")
  const navigate = useNavigate()
  const userSession = useAuthStore((state) => state.userSession)

  const [activeSection, setActiveSection] = useState<string>("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30)
      setShowScrollTop(window.scrollY > 350)

      const scrollPosition = window.scrollY + 220
      const sectionElements = navItems.map((item) => ({
        id: item.id,
        el: document.getElementById(item.id)
      }))

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const item = sectionElements[i]
        if (item.el && item.el.offsetTop <= scrollPosition) {
          setActiveSection(item.id)
          return
        }
      }

      if (window.scrollY < 200) {
        setActiveSection("")
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-background text-slate-900 font-sans overflow-x-hidden flex flex-col relative selection:bg-primary-500/20">

      {/* Modern Background Grid Pattern */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.035] pointer-events-none"
      />

      {/* Dynamic Ambient Glowing Blobs */}
      <div className="absolute -top-24 -right-24 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-primary-400/20 via-primary-300/15 to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute top-[35%] -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-primary-400/10 via-primary-300/10 to-transparent blur-[130px] pointer-events-none" />
      <div className="absolute top-[60%] right-10 w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-primary-400/10 via-success-300/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Fixed Glassmorphism Navigation Header */}
      <header className={`fixed top-0 left-0 right-0 w-full px-4 sm:px-6 lg:px-8 z-50 transition-all duration-300 ${isScrolled ? "pt-2.5 pb-2" : "pt-4 sm:pt-5 pb-2"
        }`}>
        <nav className={`relative w-full px-4 sm:px-6 xl:px-7 py-2.5 sm:py-3 flex items-center justify-between max-w-7xl mx-auto rounded-2xl sm:rounded-full border transition-all duration-300 ${isScrolled
          ? "bg-white/95 backdrop-blur-xl border-slate-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.08)]"
          : "bg-white/85 backdrop-blur-xl border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          }`}>

          {/* Logo & Tag */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/logo.png"
              alt="HealthSense Logo"
              className="w-10 h-10 object-contain rounded-xl group-hover:scale-105 transition-transform duration-300 shrink-0"
            />
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900 tracking-tight font-heading whitespace-nowrap">HealthSense</span>
              <BrandSlogan className="text-[11px] text-slate-500 font-medium hidden sm:block -mt-0.5 whitespace-nowrap" />
            </div>
          </Link>

          {/* Navigation Links with Active Scroll Spy */}
          <div className="hidden lg:flex items-center gap-0.5 xl:gap-1 text-xs xl:text-sm font-semibold text-slate-600">
            {navItems.map((item) => {
              const isActive = activeSection === item.id
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection(item.id)
                  }}
                  className={`px-3 xl:px-4 py-1.5 xl:py-2 rounded-full transition-all relative cursor-pointer whitespace-nowrap shrink-0 ${isActive
                    ? "text-primary-700 bg-primary-50/90 font-bold shadow-2xs"
                    : "hover:text-primary-600 hover:bg-slate-100/60"
                    }`}
                >
                  <span className="whitespace-nowrap">{t(`nav.${item.id}`)}</span>
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-1 left-3 right-3 xl:left-4 xl:right-4 h-0.5 bg-primary-500 rounded-full"
                    />
                  )}
                </a>
              )
            })}
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2 text-xs xl:text-sm font-semibold shrink-0">
            <LanguageSwitcher />
            {userSession ? (
              <>
                <button
                  onClick={() => navigate(getDefaultRouteForRole(userSession.role))}
                  className="hidden sm:flex bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white transition-all px-4 sm:px-5 py-2 rounded-full shadow-md shadow-primary-900/20 font-bold items-center gap-1.5 hover:-translate-y-0.5 cursor-pointer font-heading whitespace-nowrap shrink-0"
                >
                  <span>{t("nav.dashboard")}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <UserMenu showAppLink />
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-primary-700 hover:bg-slate-100/80 font-bold px-3 sm:px-4 py-2 rounded-full transition-all cursor-pointer font-heading whitespace-nowrap shrink-0"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white transition-all px-4 sm:px-5 py-2 rounded-full shadow-md shadow-primary-900/20 font-bold flex items-center gap-1 hover:-translate-y-0.5 cursor-pointer font-heading whitespace-nowrap shrink-0"
                >
                  <span className="whitespace-nowrap">{t("nav.tryIt")}</span>
                  <ArrowUpRight className="w-4 h-4 shrink-0" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Hero Section with clean, minimalist, spacious layout */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 lg:px-14 pb-12 pt-28 sm:pt-36">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center h-full">

          {/* Left Content (Clean Typography, CTAs, and Measured Metrics) */}
          <div className="col-span-1 lg:col-span-5 flex flex-col justify-center order-2 lg:order-1 z-20">

            {/* Main Headline - Crystal Clear & Impactful */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black leading-[1.12] mb-5 tracking-tight text-slate-900 font-heading uppercase">
              {t("hero.titleLine1")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-primary-600 to-primary-600">
                {t("hero.titleLine2")}
              </span>
            </h1>

            {/* Subtitle - Crisp, easy to understand value proposition */}
            <p className="text-slate-600 text-base sm:text-lg mb-8 max-w-[490px] leading-relaxed font-normal">
              {t("hero.subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              {userSession ? (
                <button
                  onClick={() => navigate('/app/general/dashboard')}
                  className="bg-gradient-to-r from-primary-600 via-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white font-extrabold px-7 py-3.5 rounded-full shadow-lg shadow-primary-900/25 hover:shadow-primary-900/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2.5 cursor-pointer text-sm sm:text-base font-heading"
                >
                  <span>{t("hero.ctaDashboard")}</span>
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-primary-600 via-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white font-extrabold px-7 py-3.5 rounded-full shadow-lg shadow-primary-900/25 hover:shadow-primary-900/35 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2.5 cursor-pointer text-sm sm:text-base font-heading"
                >
                  <span>{t("hero.ctaJoin")}</span>
                  <ArrowUpRight className="w-5 h-5" />
                </Link>
              )}

              <button
                onClick={() => scrollToSection("about")}
                className="px-5 py-3.5 rounded-full font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex items-center gap-2 text-sm sm:text-base cursor-pointer font-heading"
              >
                <Play className="w-4 h-4 text-primary-600 fill-primary-600" />
                <span>{t("hero.ctaHowItWorks")}</span>
              </button>
            </div>

            {/* Real Measured Performance Metrics Strip */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-slate-900 font-heading tracking-tight">98.65%</span>
                <span className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">{t("hero.metrics.accuracy")}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-primary-600 font-heading tracking-tight">99.11%</span>
                <span className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">{t("hero.metrics.recall")}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-success-600 font-heading tracking-tight">&lt; 100ms</span>
                <span className="text-[11px] text-slate-500 font-medium leading-snug mt-0.5">{t("hero.metrics.latency")}</span>
              </div>
            </div>

          </div>

          {/* Right Hero (Clean, Focused Product Video Mockup Showcase) */}
          <div className="col-span-1 lg:col-span-7 relative flex flex-col items-center justify-center order-1 lg:order-2 w-full max-w-[800px] mx-auto">

            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary-400/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary-400/15 rounded-full blur-[100px] -z-10 pointer-events-none" />

            {/* Dark Modern Device Mockup */}
            <div className="relative w-full bg-slate-900 rounded-[2.2rem] sm:rounded-[2.6rem] shadow-[0_30px_80px_-15px_rgba(15,23,42,0.35)] p-3.5 sm:p-4.5 overflow-hidden border-[6px] sm:border-8 border-slate-800 ring-1 ring-black/20 hover:-translate-y-1 transition-all duration-300">

              {/* Device Camera Notch / Bar */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-800 rounded-full z-30" />

              {/* Interactive Screen Container */}
              <div className="w-full aspect-[16/9] rounded-[1.4rem] sm:rounded-[1.7rem] overflow-hidden bg-slate-950 relative shadow-inner">
                <video
                  src="/video/promo.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />

                {/* Subtle Gradient Overlay on video edge */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

        {/* Floating Scroll Down Explorer Button */}
        <div className="w-full flex justify-center mt-12 sm:mt-16">
          <button
            onClick={() => scrollToSection("about")}
            className="group flex flex-col items-center gap-2 text-slate-400 hover:text-primary-600 transition-all cursor-pointer"
          >
            <span className="text-[11px] font-bold tracking-wider uppercase font-heading text-slate-500 group-hover:text-primary-600 transition-colors">
              {t("hero.scrollExplore")}
            </span>
            <div className="w-9 h-9 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center group-hover:border-primary-300 group-hover:bg-primary-50 group-hover:scale-105 transition-all animate-bounce">
              <ChevronDown className="w-4 h-4 text-slate-600 group-hover:text-primary-600" />
            </div>
          </button>
        </div>
      </main>

      {/* 01. Brand Story & Mission Section */}
      <div id="about" className="scroll-mt-20 sm:scroll-mt-24">
        <HealthSenseBrandStorySection />
      </div>

      {/* 02. Bio Features Section (16 Core Biological Features) */}
      <div id="features" className="scroll-mt-20 sm:scroll-mt-24">
        <AIFeaturesSection />
      </div>

      {/* 03. AI Pipeline Section (6-Step Architecture Flow & Terminal) */}
      <div id="pipeline" className="scroll-mt-20 sm:scroll-mt-24">
        <AIPipelineSection />
      </div>

      {/* 04. Unified Clinical Benchmark & Dataset Section */}
      <div id="benchmark" className="scroll-mt-20 sm:scroll-mt-24">
        <AIClinicalBenchmarkSection />
      </div>

      {/* Professional Full Footer */}
      <LandingFooter />

      {/* Scroll to Top Floating Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            aria-label={t("scrollToTop")}
            className="fixed bottom-6 right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/95 hover:bg-white text-slate-700 hover:text-primary-600 border border-slate-200/90 shadow-lg shadow-primary-950/10 backdrop-blur-md flex items-center justify-center cursor-pointer transition-all hover:scale-110 hover:shadow-xl active:scale-95 group"
          >
            <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  )
}



