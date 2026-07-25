import { Stethoscope, UserCheck, ShieldAlert, Sparkles, Activity, Clock, Shield } from "lucide-react"

export function PlaceholderDashboard({ role }: { role: string }) {
  const getRoleContent = () => {
    switch (role) {
      case "DOCTOR":
        return {
          title: "Doctor Clinical Desk",
          description: "Patient telemetry oversight and diagnosis schedule.",
          icon: <Stethoscope className="h-8 w-8 text-teal-600" />,
          bg: "from-teal-500/10 via-emerald-500/5 to-transparent",
          border: "border-teal-200",
          stats: [
            { label: "Assigned Patients", value: "32 Patients", sub: "4 Critical AFib monitors", color: "text-teal-700 bg-teal-50" },
            { label: "Tele-Consultations", value: "6 Appointments", sub: "Next at 14:00 PM today", color: "text-blue-700 bg-blue-50" },
            { label: "Pending Prescriptions", value: "12 Records", sub: "Awaiting e-signature", color: "text-amber-700 bg-amber-50" },
          ],
        }
      case "MEMBER":
        return {
          title: "Patient Health Hub",
          description: "Your connected wearable health telemetry & appointments.",
          icon: <UserCheck className="h-8 w-8 text-blue-600" />,
          bg: "from-blue-500/10 via-cyan-500/5 to-transparent",
          border: "border-blue-200",
          stats: [
            { label: "Real-Time Health Score", value: "98 / 100", sub: "Optimal heart health range", color: "text-emerald-700 bg-emerald-50" },
            { label: "Linked Wearable Devices", value: "2 Devices", sub: "Apple Watch Ultra & Omron BP", color: "text-blue-700 bg-blue-50" },
            { label: "Next Clinical Checkup", value: "Aug 15, 2026", sub: "Dr. Nguyễn Minh (Cardiology)", color: "text-purple-700 bg-purple-50" },
          ],
        }
      default:
        return {
          title: "Tenant Admin Operations",
          description: "Hospital organization user management and audit compliance.",
          icon: <ShieldAlert className="h-8 w-8 text-purple-600" />,
          bg: "from-purple-500/10 via-indigo-500/5 to-transparent",
          border: "border-purple-200",
          stats: [
            { label: "Hospital Staff Accounts", value: "84 Staffs", sub: "All accounts active", color: "text-purple-700 bg-purple-50" },
            { label: "HIPAA Compliance Log", value: "100% Verified", sub: "Last audit: 12 hours ago", color: "text-emerald-700 bg-emerald-50" },
            { label: "Active Department Units", value: "6 Departments", sub: "Cardiology, ICU, Pediatrics...", color: "text-slate-700 bg-slate-100" },
          ],
        }
    }
  }

  const content = getRoleContent()

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={`rounded-3xl border ${content.border} bg-gradient-to-br ${content.bg} bg-white p-8 shadow-xs`}>
        <div className="flex items-start gap-5">
          <div className="p-4 rounded-2xl bg-white shadow-md border border-slate-100 shrink-0">
            {content.icon}
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>ROLE VIEW: {role}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{content.title}</h1>
            <p className="text-sm font-medium text-slate-600 max-w-2xl">{content.description}</p>
          </div>
        </div>
      </div>

      {/* Role-specific simulated KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {content.stats.map((st, i) => (
          <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{st.label}</span>
            <div className="my-3">
              <h3 className="text-2xl font-black text-slate-900">{st.value}</h3>
            </div>
            <span className={`inline-flex w-fit rounded-lg px-2.5 py-1 text-xs font-bold border ${st.color}`}>
              {st.sub}
            </span>
          </div>
        ))}
      </div>

      {/* Notice box */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white text-slate-600 shadow-xs border border-slate-200">
            <Activity className="h-6 w-6 text-teal-600 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Dedicated Portal Under Construction</h4>
            <p className="text-xs text-slate-500">
              The full operational dashboard for <strong className="text-slate-800">{role}</strong> is being engineered with specialized high-frequency telemetry widgets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
          <Clock className="h-4 w-4 text-slate-400" />
          <span>Release Scheduled: Next Sprint</span>
        </div>
      </div>

      {/* Security & Access tag */}
      <div className="text-center text-xs font-medium text-slate-400 pt-4 flex items-center justify-center gap-2">
        <Shield className="w-3.5 h-3.5 text-slate-400" />
        <span>Protected route authorization enabled for role: <strong>{role}</strong></span>
      </div>
    </div>
  )
}
