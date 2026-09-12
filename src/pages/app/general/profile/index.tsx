import { useState, useEffect, useCallback } from "react"
import { AlertCircle, RotateCw, Loader2, User as UserIcon } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"
import { Button } from "@/components/ui/button"

import { profileApi, consultationApi } from "@/services"
import type { UserResponse, ProfileUpdateRequest } from "@/types/profile"
import type { DoctorCareProfileResponse } from "@/types/consultation"
import { USER_ROLES } from "@/constants"
import { Calendar, Stethoscope } from "lucide-react"
import { UnifiedProfileCard } from "@/pages/app/general/profile/components/unified-profile-card"
import { DoctorScheduleDialog } from "@/pages/app/management/doctor-consultations/components/doctor-schedule-dialog"

export default function ProfilePage() {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Doctor Care Profile states
  const [careProfile, setCareProfile] = useState<DoctorCareProfileResponse | null>(null)
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  // Auth Store bindings for real-time synchronization across Topbar & Sidebar
  const userSession = useAuthStore((state) => state.userSession)
  const setUserSession = useAuthStore((state) => state.setUserSession)

  const fetchDoctorProfile = useCallback(async () => {
    try {
      const res = await consultationApi.getMyDoctorCareProfile()
      setCareProfile(res.data)
    } catch {
      setCareProfile(null)
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    try {
      const response = await profileApi.getMe()
      const userData: UserResponse = response.data || {}
      setUser(userData)
      setError(null)
      if (userData.role === USER_ROLES.DOCTOR) {
        void fetchDoctorProfile()
      }
      if (userSession && setUserSession && userData.avatarUrl !== userSession.avatarUrl) {
        setUserSession({
          ...userSession,
          avatarUrl: userData.avatarUrl,
        })
      }
    } catch (err: unknown) {
      const anyErr = err as { message?: string; response?: { data?: { message?: string } } }
      console.error("Failed to load profile data:", anyErr)
      setError(
        anyErr?.response?.data?.message ||
          anyErr?.message ||
          "Could not retrieve your profile from the backend server."
      )
    } finally {
      setLoading(false)
    }
  }, [userSession, setUserSession, fetchDoctorProfile])

  useEffect(() => {
    let isMounted = true
    profileApi
      .getMe()
      .then((response) => {
        if (isMounted) {
          const userData: UserResponse = response.data || {}
          setUser(userData)
          setError(null)
          if (userSession && setUserSession && userData.avatarUrl !== userSession.avatarUrl) {
            setUserSession({
              ...userSession,
              avatarUrl: userData.avatarUrl,
            })
          }
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const anyErr = err as { message?: string; response?: { data?: { message?: string } } }
          console.error("Failed to load profile data:", anyErr)
          setError(
            anyErr?.response?.data?.message ||
              anyErr?.message ||
              "Could not retrieve your profile from the backend server."
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false)
        }
      })
    return () => {
      isMounted = false
    }
  }, [userSession, setUserSession])

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    fetchProfile()
  }

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    if (user) {
      setUser({ ...user, avatarUrl: newAvatarUrl })
    }
  }

  const handleSave = async (payload: ProfileUpdateRequest) => {
    setSaving(true)
    try {
      const response = await profileApi.updateMe(payload)
      const updatedUser: UserResponse = response.data || { ...user, ...payload }
      setUser(updatedUser)

      // Automatically sync updated display name across global Auth Store (Topbar/Sidebar update immediately without F5)
      if (userSession && setUserSession) {
        const nextFullName = updatedUser.displayName || updatedUser.fullName || payload.displayName || userSession.fullName
        setUserSession({
          ...userSession,
          fullName: nextFullName,
          email: updatedUser.email || userSession.email,
          role: updatedUser.role || userSession.role,
          avatarUrl: updatedUser.avatarUrl || userSession.avatarUrl,
        })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-200/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 shadow-2xs">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              My Account Profile
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              View and manage your personal contact details and account security specifications.
            </p>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && !user && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse">
          <div className="lg:col-span-4 h-96 rounded-2xl bg-slate-100 border border-slate-200/60 flex flex-col items-center justify-center p-6 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-600" />
            <span className="text-xs font-bold text-slate-600">Loading account credentials...</span>
          </div>
          <div className="lg:col-span-8 h-96 rounded-2xl bg-slate-100 border border-slate-200/60" />
        </div>
      )}

      {/* Error Fallback with Inline Retry Button */}
      {error && !loading && !user && (
        <div className="p-8 rounded-3xl bg-red-50/80 border border-red-200 text-center max-w-lg mx-auto my-8">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <h3 className="text-base font-black text-slate-900">Failed to load profile</h3>
          <p className="text-xs font-medium text-slate-600 max-w-sm mx-auto mt-1 mb-5 leading-relaxed">
            {error}
          </p>
          <Button
            onClick={handleRetry}
            className="h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold px-5 shadow-sm shadow-red-500/20 flex items-center gap-2 mx-auto cursor-pointer"
          >
            <RotateCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </Button>
        </div>
      )}

      {/* Loaded Content: Unified View/Edit Profile Card */}
      {!loading && user && (
        <div className="w-full space-y-6">
          {user.role === USER_ROLES.DOCTOR && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800">
                      Hồ sơ Trực & Lịch làm việc Bác sĩ
                    </h3>
                    {careProfile ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Đã kích hoạt
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Chưa khởi tạo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {careProfile
                      ? `Chuyên khoa: ${careProfile.specialty} • Lịch trực: ${careProfile.availability?.weekly?.length || 0} khung giờ/tuần • Múi giờ: ${careProfile.timezone || "Asia/Ho_Chi_Minh"}`
                      : "Tài khoản bác sĩ chưa được quản trị viên cấu hình chuyên khoa. Bạn vẫn có thể mở xem thông tin lịch trực."}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsScheduleOpen(true)}
                className="text-xs font-semibold shrink-0 cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                <span>Cập nhật Lịch trực & Múi giờ</span>
              </Button>
            </div>
          )}

          <UnifiedProfileCard user={user} onSave={handleSave} onAvatarUpdate={handleAvatarUpdate} loading={saving} />
        </div>
      )}

      {user?.role === USER_ROLES.DOCTOR && (
        <DoctorScheduleDialog
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          currentProfile={careProfile}
          onSuccess={() => {
            void fetchDoctorProfile()
          }}
        />
      )}
    </div>
  )
}
