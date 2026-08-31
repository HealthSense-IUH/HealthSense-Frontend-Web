import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
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

type ViewStyle = "interactive" | "document"

const SECTIONS = [
  { id: "section-1", title: "1. Bản chất thử nghiệm và mục đích của nền tảng" },
  { id: "section-2", title: "2. Tuyên bố miễn trừ trách nhiệm y tế toàn diện" },
  { id: "section-3", title: "3. Quy trình xử trí tình huống cấp cứu" },
  { id: "section-4", title: "4. Độ chính xác và sai số thiết bị phần cứng" },
  { id: "section-5", title: "5. Quyền riêng tư và bảo mật dữ liệu sức khỏe" },
  { id: "section-6", title: "6. Trách nhiệm và nghĩa vụ của người dùng" },
  { id: "section-7", title: "7. Giới hạn trách nhiệm pháp lý tối đa" },
  { id: "section-8", title: "8. Hiệu lực và sự tự nguyện chấp thuận" },
] as const

const EMERGENCY_SYMPTOMS = [
  "Đau thắt ngực hoặc cảm giác đè nặng vùng ngực",
  "Khó thở, thở gấp, hụt hơi đột ngột",
  "Ngất xỉu, chóng mặt mất thăng bằng đột ngột",
  "Tê yếu một bên cơ thể, nói khó (dấu hiệu đột quỵ)",
  "Tim đập thình thịch liên tục kèm vã mồ hôi lạnh",
  "Mất ý thức hoặc co giật",
] as const

const handleScrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" })
}

const handleDownloadPdf = () => {
  window.print()
}

export default function TermsAndConditionsPage() {
  const [viewStyle, setViewStyle] = useState<ViewStyle>("interactive")
  const [activeSection, setActiveSection] = useState("section-1")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [copied, setCopied] = useState(false)

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-500 selection:text-white">
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
              <span className="font-heading font-black text-lg tracking-tight text-slate-900 hidden sm:inline-block">
                HEALTHSENSE
              </span>
            </Link>
          </div>

          {/* Center Style Switcher: Cây HTML vs Văn bản soạn thảo */}
          <div className="flex items-center p-1 bg-slate-100/90 border border-slate-200/80 rounded-2xl shadow-2xs">
            <button
              type="button"
              onClick={() => setViewStyle("interactive")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewStyle === "interactive"
                  ? "bg-white text-sky-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cây HTML / Tương tác</span>
              <span className="sm:hidden">Web</span>
            </button>

            <button
              type="button"
              onClick={() => setViewStyle("document")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewStyle === "document"
                  ? "bg-white text-sky-700 shadow-xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Văn bản Soạn thảo</span>
              <span className="sm:hidden">Văn bản</span>
            </button>
          </div>

          {/* Right Actions: Đăng nhập */}
          <div className="flex items-center gap-2.5">
            <Link to="/login">
              <Button size="sm" className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-2xs">
                Đăng nhập
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section (Hidden in print) */}
      <section className="w-full bg-gradient-to-b from-[#070D1E] to-[#0D182E] text-white py-10 px-4 sm:px-6 relative overflow-hidden border-b border-white/10 print:hidden">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 bottom-0 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full text-center relative z-10 space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight text-white">
            Điều Khoản Sử Dụng &amp; Miễn Trừ Trách Nhiệm Y Khoa
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Quy định điều khoản sử dụng nền tảng thử nghiệm công nghệ y tế và AI tầm soát tim mạch HealthSense.
          </p>

          <div className="pt-1 flex items-center justify-center text-xs text-slate-400 font-medium">
            <span>📅 Cập nhật lần cuối: <strong>23 Tháng 8, 2026</strong></span>
          </div>
        </div>
      </section>

      {/* VIEW 1: INTERACTIVE WEB / HTML TREE STYLE */}
      {viewStyle === "interactive" && (
        <main className="w-full px-4 sm:px-6 py-6 print:hidden">

          {/* Critical Emergency Alert Banner */}
          <div className="w-full mb-6 rounded-2xl border-2 border-red-300 bg-red-50/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start gap-4">
            <div className="p-3 rounded-2xl bg-red-100 text-red-600 shrink-0">
              <ShieldAlert className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-red-900 tracking-tight font-heading flex items-center gap-2">
                <span>CẢNH BÁO QUAN TRỌNG: ĐÂY LÀ SẢN PHẨM THỬ NGHIỆM – KHÔNG DÙNG CHO CẤP CỨU Y TẾ</span>
              </h3>
              <p className="text-xs sm:text-sm text-red-800 leading-relaxed font-sans">
                HealthSense là <strong>nền tảng nghiên cứu và thử nghiệm công nghệ AI</strong> trong việc theo dõi nhịp tim và tầm soát rung nhĩ (AFib).
                Hệ thống <strong>KHÔNG PHẢI</strong> là cơ sở y tế, <strong>KHÔNG CÓ</strong> chức năng cấp cứu tự động và <strong>KHÔNG THAY THẾ</strong> chẩn đoán trực tiếp của bác sĩ chuyên khoa tim mạch.
                Nếu bạn cảm thấy đau ngực, khó thở, chóng mặt hoặc có dấu hiệu đột quỵ, hãy gọi ngay <strong>Cấp cứu 115</strong> hoặc đến bệnh viện gần nhất.
              </p>
            </div>
          </div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left Table of Contents (Sticky on Desktop) */}
            <aside className="lg:col-span-3 sticky top-24 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 font-heading mb-3">
                  Cây mục lục điều khoản
                </h3>
                <nav className="space-y-1">
                  {SECTIONS.map((item) => {
                    const isActive = activeSection === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full text-left text-xs font-bold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-between cursor-pointer ${isActive
                            ? "bg-sky-50 text-sky-700 font-extrabold border border-sky-200/80 shadow-2xs"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                      >
                        <span className="truncate pr-2">{item.title}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Document export quick helper */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Xuất bản tài liệu</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tải văn bản quy chế soạn thảo chính thức dạng PDF phục vụ lưu trữ hoặc ký kết:
                </p>
                <div className="pt-1">
                  <Button
                    size="sm"
                    onClick={handleDownloadPdf}
                    className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Tải tài liệu PDF</span>
                  </Button>
                </div>
              </div>
            </aside>

            {/* Right Document Content */}
            <article className="lg:col-span-9 space-y-10 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs">

              {/* Section 1 */}
              <section id="section-1" className="space-y-3 scroll-mt-24">
                <h2 className="text-xl font-black font-heading tracking-tight text-slate-900">
                  1. Bản chất thử nghiệm và mục đích của nền tảng
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    <strong>1.1. Mục đích công nghệ:</strong> HealthSense là nền tảng số đang trong giai đoạn nghiên cứu và thử nghiệm công nghệ y tế (Experimental Beta/Pilot). Mục tiêu của dự án là nghiên cứu tính khả thi của việc thu nhận tín hiệu PPG/ECG liên tục từ thiết bị đeo thông minh để tính toán 16 chỉ số biến thiên nhịp tim (HRV) và hỗ trợ nhận diện sớm nguy cơ rối loạn nhịp tim (Rung nhĩ - AFib).
                  </p>
                  <p>
                    <strong>1.2. Tính chất thử nghiệm:</strong> Là sản phẩm thử nghiệm nghiên cứu, mọi tính năng, giao diện và thuật toán có thể được điều chỉnh, nâng cấp hoặc tạm ngưng phục vụ nghiên cứu mà không phải chịu bất kỳ chế tài hay ràng buộc thương mại bắt buộc nào.
                  </p>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Section 2 */}
              <section id="section-2" className="space-y-3 scroll-mt-24">
                <h2 className="text-xl font-black font-heading tracking-tight text-slate-900">
                  2. Tuyên bố miễn trừ trách nhiệm y tế toàn diện
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    <strong>2.1. Không cấu thành chẩn đoán y khoa:</strong> Mọi thông tin, biểu đồ, điểm nguy cơ AFib, phân đoạn giấc ngủ hay báo cáo trích xuất từ HealthSense chỉ có giá trị tham khảo cá nhân và nghiên cứu học thuật. Kết quả không thay thế cho điện tâm đồ lâm sàng 12 chuyển đạo chuẩn bệnh viện (Holter ECG) hay chỉ định của bác sĩ chuyên khoa tim mạch.
                  </p>
                  <p>
                    <strong>2.2. Cấm tự ý can thiệp phác đồ y khoa:</strong> Người dùng tuyệt đối không được căn cứ vào kết quả của HealthSense để tự ý mua thuốc, ngưng thuốc, thay đổi liều lượng thuốc trợ tim, thuốc chống đông máu hoặc bất kỳ phác đồ điều trị nào mà chưa có sự đồng ý của bác sĩ điều trị.
                  </p>
                  <p>
                    <strong>2.3. Tư vấn bác sĩ trực tuyến:</strong> Mọi trao đổi trực tuyến thông qua nền tảng chỉ mang tính chất định hướng sức khỏe ban đầu, không thay thế việc thăm khám trực tiếp tại cơ sở y tế có thẩm quyền.
                  </p>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Section 3 */}
              <section id="section-3" className="space-y-3 scroll-mt-24">
                <h2 className="text-xl font-black font-heading tracking-tight text-slate-900">
                  3. Quy trình xử trí tình huống cấp cứu
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    <strong>3.1. Không có kết nối cấp cứu tự động:</strong> HealthSense không có kết nối cơ học với hệ thống xe cấp cứu 115 hay bất kỳ trung tâm cấp cứu khẩn cấp nào. Các cảnh báo nhịp tim chỉ mang tính chất hỗ trợ người dùng tự theo dõi.
                  </p>
                  <p>
                    <strong>3.2. Hành động khi có triệu chứng nguy hiểm:</strong> Khi xuất hiện các triệu chứng như đau thắt ngực lan ra vai/tay, khó thở, chóng mặt dữ dội, vã mồ hôi lạnh, ngất xỉu, mất ý thức hoặc nghi ngờ tai biến mạch máu não, Người dùng hoặc thân nhân <strong>phải lập tức gọi Tổng đài Cấp cứu 115</strong> hoặc đến bệnh viện gần nhất.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {EMERGENCY_SYMPTOMS.map((symptom) => (
                      <div key={symptom} className="flex items-start gap-2 p-2.5 rounded-xl bg-red-50/60 border border-red-100 text-xs text-red-900 font-medium">
                        <span className="text-red-500 font-bold">•</span>
                        <span>{symptom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Section 4 */}
              <section id="section-4" className="space-y-3 scroll-mt-24">
                <h2 className="text-xl font-black font-heading tracking-tight text-slate-900">
                  4. Độ chính xác và sai số thiết bị phần cứng
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    <strong>4.1. Nhiễu tín hiệu &amp; Sai số phần cứng:</strong> Tín hiệu PPG/ECG từ đồng hồ/vòng đeo tay thông minh phụ thuộc trực tiếp vào cảm biến quang học, độ siết của dây đeo, vận động mạnh, mồ hôi, màu da và độ ẩm, do đó có thể phát sinh sai số hoặc báo động giả (dương tính giả / âm tính giả).
                  </p>
                  <p>
                    <strong>4.2. Không cam kết độ chính xác 100%:</strong> Mặc dù mô hình AI được đào tạo trên cơ sở dữ liệu y tế chuẩn quốc tế (MIMIC-III / PhysioNet) với độ chính xác thực nghiệm cao, Ban phát triển không đưa ra bất kỳ bảo đảm ngụ ý hoặc minh thị nào rằng hệ thống sẽ phát hiện được 100% tất cả các đợt rối loạn nhịp tim trong mọi tình huống đời thực.
                  </p>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Section 5 */}
              <section id="section-5" className="space-y-3 scroll-mt-24">
                <h2 className="text-xl font-black font-heading tracking-tight text-slate-900">
                  5. Quyền riêng tư và bảo mật dữ liệu sức khỏe
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    <strong>5.1. Mã hóa dữ liệu an toàn:</strong> Dữ liệu sức khỏe (nhịp tim, HRV, nhật ký đo) được truyền qua giao thức HTTPS/TLS được mã hóa an toàn và lưu trữ có kiểm soát phân quyền nghiêm ngặt theo vai trò (RBAC).
                  </p>
                  <p>
                    <strong>5.2. Ẩn danh hóa dữ liệu phục vụ nghiên cứu:</strong> Nhằm phục vụ mục tiêu cải tiến thuật toán AI phát hiện bệnh tim, Người dùng đồng ý cho phép hệ thống tách bỏ định danh cá nhân (De-identified / Anonymized) dữ liệu đo đạc để phục vụ nghiên cứu học thuật theo quy chuẩn đạo đức nghiên cứu y sinh học.
                  </p>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Section 6 */}
              <section id="section-6" className="space-y-3 scroll-mt-24">
                <h2 className="text-xl font-black font-heading tracking-tight text-slate-900">
                  6. Trách nhiệm và nghĩa vụ của người dùng
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    <strong>6.1. Cung cấp thông tin trung thực:</strong> Cung cấp thông tin nhân trắc học, độ tuổi, giới tính và tiền sử sức khỏe chính xác nhằm hỗ trợ thuật toán AI đưa ra các ngưỡng cảnh báo phù hợp nhất.
                  </p>
                  <p>
                    <strong>6.2. Bảo mật tài khoản cá nhân:</strong> Tự chịu trách nhiệm bảo vệ mật khẩu và tài khoản đăng nhập cá nhân, không chia sẻ quyền truy cập cho bất kỳ bên thứ ba nào khi chưa được phép.
                  </p>
                  <p>
                    <strong>6.3. Tuân thủ hướng dẫn kỹ thuật:</strong> Sử dụng thiết bị đeo đúng quy cách hướng dẫn của nhà sản xuất phần cứng để đảm bảo chất lượng tiếp xúc cảm biến da và độ tin cậy của dữ liệu đo.
                  </p>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Section 7 */}
              <section id="section-7" className="space-y-3 scroll-mt-24">
                <h2 className="text-xl font-black font-heading tracking-tight text-slate-900">
                  7. Giới hạn trách nhiệm pháp lý tối đa
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    <strong>7.1. Miễn trừ biến cố sức khỏe:</strong> Trong phạm vi tối đa luật pháp hiện hành cho phép, Đội ngũ sáng lập, các nhà nghiên cứu, kỹ sư phần mềm, giảng viên hướng dẫn và đơn vị chủ quản của HealthSense được miễn trừ toàn bộ trách nhiệm dân sự, hình sự hoặc bồi thường thiệt hại trực tiếp/gián tiếp đối với bất kỳ sự cố y tế, thương tật thân thể, biến cố tim mạch hoặc tử vong nào của Người dùng.
                  </p>
                  <p>
                    <strong>7.2. Miễn trừ phán đoán điều trị cá nhân:</strong> Miễn trừ mọi tổn thất hoặc khiếu nại phát sinh từ việc Người dùng tự đưa ra quyết định chẩn đoán hoặc điều trị y khoa chỉ dựa trên các thông số hiển thị từ nền tảng.
                  </p>
                  <p>
                    <strong>7.3. Miễn trừ sự cố kỹ thuật bên thứ ba:</strong> Miễn trừ mọi sự cố gián đoạn kết nối Internet, mất đồng bộ Bluetooth/BLE hoặc lỗi phần cứng thiết bị đeo của bên thứ ba.
                  </p>
                </div>
              </section>

              <hr className="border-slate-100" />

              {/* Section 8 */}
              <section id="section-8" className="space-y-3 scroll-mt-24">
                <h2 className="text-xl font-black font-heading tracking-tight text-slate-900">
                  8. Hiệu lực và sự tự nguyện chấp thuận
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p>
                    <strong>8.1. Hiệu lực áp dụng:</strong> Văn bản này có hiệu lực kể từ thời điểm Người dùng thực hiện đăng ký tài khoản, kết nối thiết bị đeo hoặc sử dụng bất kỳ tính năng nào của HealthSense.
                  </p>
                  <p>
                    <strong>8.2. Sự tự nguyện cam kết:</strong> Bằng việc đăng ký tài khoản hoặc tiếp tục sử dụng dịch vụ, Người dùng xác nhận đã đủ 18 tuổi (hoặc có sự giám hộ hợp pháp), đã đọc, hiểu rõ bản chất thử nghiệm và hoàn toàn tự nguyện cam kết tuân thủ toàn bộ các điều khoản này.
                  </p>
                  <p>
                    <strong>8.3. Cập nhật điều khoản:</strong> Ban phát triển bảo lưu quyền cập nhật hoặc điều chỉnh quy chế này theo từng giai đoạn nghiên cứu khoa học. Các cập nhật quan trọng sẽ được thông báo công khai trên giao diện website.
                  </p>
                </div>
              </section>

            </article>

          </div>

        </main>
      )}

      {/* VIEW 2: FORMAL DRAFTED DOCUMENT (A4 PAPER STYLE) */}
      <div className={`w-full py-8 px-4 sm:px-6 lg:px-8 ${viewStyle === "document" ? "block" : "hidden print:block"}`}>

        {/* Document Action Toolbar (Screen only) */}
        <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-xs print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold text-slate-700">Định dạng Văn bản Soạn thảo Chuẩn A4</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleDownloadPdf}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-1.5 shadow-2xs cursor-pointer"
              title="Tải tài liệu dạng PDF (Lưu / In PDF)"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Tải tài liệu PDF</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyText}
              className="rounded-xl text-xs font-bold gap-1.5 text-slate-700 hover:bg-slate-100"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Đã sao chép" : "Sao chép toàn bộ"}</span>
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
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </p>
            <p className="text-xs font-bold italic tracking-wide underline pb-4">
              Độc lập – Tự do – Hạnh phúc
            </p>
            <p className="text-xs text-slate-500 italic">
              TP. Hồ Chí Minh, ngày 23 tháng 08 năm 2026
            </p>

            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-900 pt-4">
              QUY CHẾ SỬ DỤNG VÀ TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM Y KHOA
            </h1>
            <p className="text-xs italic text-slate-600">
              (Áp dụng cho người dùng nền tảng thử nghiệm công nghệ y tế HealthSense)
            </p>
          </div>

          {/* Legal Document Preamble */}
          <div className="space-y-3 text-xs sm:text-sm text-justify mb-8">
            <p>
              Căn cứ vào định hướng nghiên cứu và thử nghiệm khoa học công nghệ trong việc ứng dụng trí tuệ nhân tạo (AI/Machine Learning) hỗ trợ phát hiện sớm Rung nhĩ (AFib) và theo dõi các chỉ số biến thiên nhịp tim (HRV);
            </p>
            <p>
              Văn bản này quy định rõ ràng và đầy đủ các điều khoản sử dụng dịch vụ, giới hạn phạm vi công nghệ cũng như <strong>tuyên bố miễn trừ trách nhiệm y tế</strong> giữa Ban phát triển Nền tảng HealthSense (sau đây gọi là <em>&quot;HealthSense&quot;</em>) và Người sử dụng (sau đây gọi là <em>&quot;Người dùng&quot;</em>).
            </p>
          </div>

          {/* Critical Box in Document */}
          <div className="border-2 border-red-600 bg-red-50 p-4 sm:p-5 rounded-lg mb-8 space-y-2">
            <p className="text-xs sm:text-sm font-bold text-red-900 uppercase text-center">
              ⚠️ ĐIỀU KHOẢN ĐẶC BIỆT: KHÔNG THAY THẾ CHẨN ĐOÁN VÀ CẤP CỨU Y TẾ
            </p>
            <p className="text-xs text-red-800 text-justify leading-relaxed">
              HealthSense là công trình thử nghiệm kỹ thuật số hỗ trợ nghiên cứu sức khỏe. Mọi thông báo, chỉ số, cảnh báo AFib hay điểm số tim mạch được tạo ra từ thuật toán máy tính chỉ có giá trị tham khảo. Hệ thống <strong>tuyệt đối không phải là thiết bị chẩn đoán y khoa</strong>, không được dùng để thay thế bác sĩ và <strong>không có khả năng cấp cứu</strong> trong các tình huống khẩn cấp.
            </p>
          </div>

          {/* Document Articles */}
          <div className="space-y-6 text-xs sm:text-sm text-justify">

            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 mb-2">
                ĐIỀU 1. BẢN CHẤT THỬ NGHIỆM VÀ MỤC ĐÍCH CỦA NỀN TẢNG
              </h2>
              <p>
                <strong>1.1. Mục đích công nghệ:</strong> HealthSense là nền tảng số đang trong giai đoạn nghiên cứu và thử nghiệm công nghệ y tế (Experimental Beta/Pilot). Mục tiêu của dự án là nghiên cứu tính khả thi của việc thu nhận tín hiệu PPG/ECG liên tục từ thiết bị đeo thông minh để tính toán 16 chỉ số biến thiên nhịp tim (HRV) và hỗ trợ nhận diện sớm nguy cơ rối loạn nhịp tim (Rung nhĩ - AFib).
              </p>
              <p>
                <strong>1.2. Tính chất thử nghiệm:</strong> Là sản phẩm thử nghiệm nghiên cứu, mọi tính năng, giao diện và thuật toán có thể được điều chỉnh, nâng cấp hoặc tạm ngưng phục vụ nghiên cứu mà không phải chịu bất kỳ chế tài hay ràng buộc thương mại bắt buộc nào.
              </p>
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 mb-2">
                ĐIỀU 2. TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM Y TẾ TOÀN DIỆN
              </h2>
              <p>
                <strong>2.1. Không cấu thành chẩn đoán y khoa:</strong> Mọi thông tin, biểu đồ, điểm nguy cơ AFib, phân đoạn giấc ngủ hay báo cáo trích xuất từ HealthSense chỉ có giá trị tham khảo cá nhân và nghiên cứu học thuật. Kết quả không thay thế cho điện tâm đồ lâm sàng 12 chuyển đạo chuẩn bệnh viện (Holter ECG) hay chỉ định của bác sĩ chuyên khoa tim mạch.
              </p>
              <p>
                <strong>2.2. Cấm tự ý can thiệp phác đồ y khoa:</strong> Người dùng tuyệt đối không được căn cứ vào kết quả của HealthSense để tự ý mua thuốc, ngưng thuốc, thay đổi liều lượng thuốc trợ tim, thuốc chống đông máu hoặc bất kỳ phác đồ điều trị nào mà chưa có sự đồng ý của bác sĩ điều trị.
              </p>
              <p>
                <strong>2.3. Tư vấn bác sĩ trực tuyến:</strong> Mọi trao đổi trực tuyến thông qua nền tảng chỉ mang tính chất định hướng sức khỏe ban đầu, không thay thế việc thăm khám trực tiếp tại cơ sở y tế có thẩm quyền.
              </p>
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 mb-2">
                ĐIỀU 3. QUY TRÌNH XỬ TRÍ TÌNH HUỐNG CẤP CỨU
              </h2>
              <p>
                <strong>3.1. Không có kết nối cấp cứu tự động:</strong> HealthSense không có kết nối cơ học với hệ thống xe cấp cứu 115 hay bất kỳ trung tâm cấp cứu khẩn cấp nào. Các cảnh báo nhịp tim chỉ mang tính chất hỗ trợ người dùng tự theo dõi.
              </p>
              <p>
                <strong>3.2. Hành động khi có triệu chứng nguy hiểm:</strong> Khi xuất hiện các triệu chứng như đau thắt ngực lan ra vai/tay, khó thở, chóng mặt dữ dội, vã mồ hôi lạnh, ngất xỉu, mất ý thức hoặc nghi ngờ tai biến mạch máu não, Người dùng hoặc thân nhân <strong>phải lập tức gọi Tổng đài Cấp cứu 115</strong> hoặc đến bệnh viện gần nhất.
              </p>
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 mb-2">
                ĐIỀU 4. ĐỘ CHÍNH XÁC VÀ SAI SỐ THIẾT BỊ PHẦN CỨNG
              </h2>
              <p>
                <strong>4.1. Nhiễu tín hiệu &amp; Sai số phần cứng:</strong> Tín hiệu PPG/ECG từ đồng hồ/vòng đeo tay thông minh phụ thuộc trực tiếp vào cảm biến quang học, độ siết của dây đeo, vận động mạnh, mồ hôi, màu da và độ ẩm, do đó có thể phát sinh sai số hoặc báo động giả (dương tính giả / âm tính giả).
              </p>
              <p>
                <strong>4.2. Không cam kết độ chính xác 100%:</strong> Mặc dù mô hình AI được đào tạo trên cơ sở dữ liệu y tế chuẩn quốc tế (MIMIC-III / PhysioNet) với độ chính xác thực nghiệm cao, Ban phát triển không đưa ra bất kỳ bảo đảm ngụ ý hoặc minh thị nào rằng hệ thống sẽ phát hiện được 100% tất cả các đợt rối loạn nhịp tim trong mọi tình huống đời thực.
              </p>
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 mb-2">
                ĐIỀU 5. QUYỀN RIÊNG TƯ VÀ BẢO MẬT DỮ LIỆU SỨC KHỎE
              </h2>
              <p>
                <strong>5.1. Mã hóa dữ liệu an toàn:</strong> Dữ liệu sức khỏe (nhịp tim, HRV, nhật ký đo) được truyền qua giao thức HTTPS/TLS được mã hóa an toàn và lưu trữ có kiểm soát phân quyền nghiêm ngặt theo vai trò (RBAC).
              </p>
              <p>
                <strong>5.2. Ẩn danh hóa dữ liệu phục vụ nghiên cứu:</strong> Nhằm phục vụ mục tiêu cải tiến thuật toán AI phát hiện bệnh tim, Người dùng đồng ý cho phép hệ thống tách bỏ định danh cá nhân (De-identified / Anonymized) dữ liệu đo đạc để phục vụ nghiên cứu học thuật theo quy chuẩn đạo đức nghiên cứu y sinh học.
              </p>
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 mb-2">
                ĐIỀU 6. TRÁCH NHIỆM VÀ NGHĨA VỤ CỦA NGƯỜI DÙNG
              </h2>
              <p>
                <strong>6.1. Cung cấp thông tin trung thực:</strong> Cung cấp thông tin nhân trắc học, độ tuổi, giới tính và tiền sử sức khỏe chính xác nhằm hỗ trợ thuật toán AI đưa ra các ngưỡng cảnh báo phù hợp nhất.
              </p>
              <p>
                <strong>6.2. Bảo mật tài khoản cá nhân:</strong> Tự chịu trách nhiệm bảo vệ mật khẩu và tài khoản đăng nhập cá nhân, không chia sẻ quyền truy cập cho bất kỳ bên thứ ba nào khi chưa được phép.
              </p>
              <p>
                <strong>6.3. Tuân thủ hướng dẫn kỹ thuật:</strong> Sử dụng thiết bị đeo đúng quy cách hướng dẫn của nhà sản xuất phần cứng để đảm bảo chất lượng tiếp xúc cảm biến da và độ tin cậy của dữ liệu đo.
              </p>
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 mb-2">
                ĐIỀU 7. GIỚI HẠN TRÁCH NHIỆM PHÁP LÝ TỐI ĐA
              </h2>
              <p>
                <strong>7.1. Miễn trừ biến cố sức khỏe:</strong> Trong phạm vi tối đa luật pháp hiện hành cho phép, Đội ngũ sáng lập, các nhà nghiên cứu, kỹ sư phần mềm, giảng viên hướng dẫn và đơn vị chủ quản của HealthSense được miễn trừ toàn bộ trách nhiệm dân sự, hình sự hoặc bồi thường thiệt hại trực tiếp/gián tiếp đối với bất kỳ sự cố y tế, thương tật thân thể, biến cố tim mạch hoặc tử vong nào của Người dùng.
              </p>
              <p>
                <strong>7.2. Miễn trừ phán đoán điều trị cá nhân:</strong> Miễn trừ mọi tổn thất hoặc khiếu nại phát sinh từ việc Người dùng tự đưa ra quyết định chẩn đoán hoặc điều trị y khoa chỉ dựa trên các thông số hiển thị từ nền tảng.
              </p>
              <p>
                <strong>7.3. Miễn trừ sự cố kỹ thuật bên thứ ba:</strong> Miễn trừ mọi sự cố gián đoạn kết nối Internet, mất đồng bộ Bluetooth/BLE hoặc lỗi phần cứng thiết bị đeo của bên thứ ba.
              </p>
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-bold uppercase text-slate-900 mb-2">
                ĐIỀU 8. HIỆU LỰC VÀ SỰ TỰ NGUYỆN CHẤP THUẬN
              </h2>
              <p>
                <strong>8.1. Hiệu lực áp dụng:</strong> Văn bản này có hiệu lực kể từ thời điểm Người dùng thực hiện đăng ký tài khoản, kết nối thiết bị đeo hoặc sử dụng bất kỳ tính năng nào của HealthSense.
              </p>
              <p>
                <strong>8.2. Sự tự nguyện cam kết:</strong> Bằng việc đăng ký tài khoản hoặc tiếp tục sử dụng dịch vụ, Người dùng xác nhận đã đủ 18 tuổi (hoặc có sự giám hộ hợp pháp), đã đọc, hiểu rõ bản chất thử nghiệm và hoàn toàn tự nguyện cam kết tuân thủ toàn bộ các điều khoản này.
              </p>
              <p>
                <strong>8.3. Cập nhật điều khoản:</strong> Ban phát triển bảo lưu quyền cập nhật hoặc điều chỉnh quy chế này theo từng giai đoạn nghiên cứu khoa học. Các cập nhật quan trọng sẽ được thông báo công khai trên giao diện website.
              </p>
            </div>

          </div>

          {/* Document Signatures Footer */}
          <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-2 gap-6 text-center text-xs sm:text-sm">
            <div className="space-y-1">
              <p className="font-bold uppercase text-slate-800">ĐẠI DIỆN NGƯỜI SỬ DỤNG</p>
              <p className="text-[11px] text-slate-500 italic">(Đã đọc, hiểu rõ và đồng ý điện tử)</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-slate-400 italic text-[11px]">[Xác nhận tự động qua tài khoản]</span>
              </div>
            </div>

            <div className="space-y-1">
              <p className="font-bold uppercase text-slate-800">BAN ĐIỀU HÀNH HEALTHSENSE</p>
              <p className="text-[11px] text-slate-500 italic">(Đã ký duyệt phát hành)</p>
              <div className="h-16 flex items-center justify-center">
                <span className="text-sky-700 font-bold tracking-wider text-sm border-b border-sky-300 pb-0.5">
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
          <p>© {new Date().getFullYear()} HealthSense. Mọi quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:text-slate-900 transition-colors">Trang chủ</Link>
            <Link to="/login" className="hover:text-slate-900 transition-colors">Đăng nhập</Link>
            <button onClick={() => setViewStyle("document")} className="text-sky-600 font-bold hover:underline cursor-pointer">
              Xem văn bản soạn thảo A4
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Scroll to Top Button (Screen only) */}
      {showScrollTop && (
        <button
          onClick={handleScrollToTop}
          type="button"
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50 transition-colors duration-200 hover:-translate-y-1 active:translate-y-0 cursor-pointer group print:hidden"
          title="Cuộn lên đầu trang"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

    </div>
  )
}
