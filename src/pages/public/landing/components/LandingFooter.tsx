import { ArrowUpRight } from "lucide-react"
import { Link } from "react-router-dom"
import { Trans, useTranslation } from "react-i18next"
import { BrandSlogan } from "@/components/custom/BrandSlogan"

export function LandingFooter() {
  const { t } = useTranslation("landing")
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="w-full bg-slate-950 text-slate-300 relative overflow-hidden border-t border-white/10 pt-16 sm:pt-20 pb-12">
      
      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        
        {/* Main 3-Column Balanced Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-white/10">
          
          {/* Col 1: Brand & Mission (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col justify-start space-y-4">
            <div>
              {/* Brand Logo */}
              <div className="inline-flex items-center gap-2.5 mb-4">
                <img
                  src="/logo.png"
                  alt="HealthSense Logo"
                  className="w-9 h-9 object-contain rounded-xl shrink-0"
                />
                <div className="flex flex-col">
                  <span className="text-xl font-black font-heading tracking-tight text-white">HealthSense</span>
                  <BrandSlogan className="text-[11px] text-slate-400 font-medium -mt-0.5" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md font-sans">
                {t("footer.description")}
              </p>
            </div>
          </div>

          {/* Col 2: Technology & Pipeline (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold font-heading uppercase text-white tracking-wider">
              {t("footer.techHeading")}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-slate-400">
              <li>
                <button 
                  onClick={() => scrollToSection("features")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t("footer.tech.hrv")}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("pipeline")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t("footer.tech.stacking")}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("benchmark")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t("footer.tech.benchmark")}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("benchmark")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t("footer.tech.xai")}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("benchmark")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t("footer.tech.mimic")}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Company & Values (3 Cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold font-heading uppercase text-white tracking-wider">
              {t("footer.aboutHeading")}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-sans text-slate-400">
              <li>
                <button 
                  onClick={() => scrollToSection("about")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t("footer.about.story")}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection("about")} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t("footer.about.care")}
                </button>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>{t("footer.about.loginPage")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white text-primary-400 transition-colors flex items-center gap-1 font-bold">
                  <span>{t("footer.about.terms")}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Medical Disclaimer & Copyright Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 font-sans">
          <p className="text-[11px] leading-relaxed max-w-2xl text-center md:text-left text-slate-500">
            <Trans
              t={t}
              i18nKey="footer.disclaimer"
              components={{
                strong: <strong />,
                termsLink: <Link to="/terms" className="text-primary-400 underline font-bold hover:text-primary-300" />,
              }}
            />
          </p>
          <div className="text-center md:text-right shrink-0 text-slate-400">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </div>
        </div>

      </div>
    </footer>
  )
}
