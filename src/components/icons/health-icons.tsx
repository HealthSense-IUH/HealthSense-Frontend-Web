import type { SVGProps } from "react"

export type HsIconProps = SVGProps<SVGSVGElement> & { className?: string }

function BaseIcon({ className = "h-5 w-5", children, ...props }: HsIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}

/** Bảng điều khiển tổng quan: 4 ô bo mềm có nhịp nhấn */
export function HsDashboardIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="3" width="8" height="8" rx="2.5" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="3" width="8" height="5.5" rx="2" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.8" />
      <rect x="3" y="13" width="8" height="8" rx="2.5" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="10.5" width="8" height="10.5" rx="2.5" fill="currentColor" fillOpacity="0.28" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="7" cy="7" r="1.2" fill="currentColor" />
    </BaseIcon>
  )
}

/** Trái tim kèm đường sóng điện tim */
export function HsHeartPulseIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M12 20.5C12 20.5 4 15.2 4 9.3C4 6.4 6.2 4.2 8.9 4.2C10.5 4.2 11.4 5.1 12 6.1C12.6 5.1 13.5 4.2 15.1 4.2C17.8 4.2 20 6.4 20 9.3C20 15.2 12 20.5 12 20.5Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6.8 11.5H9.3L10.6 8.8L12.7 14L14.1 11.5H17.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </BaseIcon>
  )
}

/** Đánh giá nguy cơ AFib / radar xu hướng tim mạch */
export function HsAfibRadarIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6.5 13H9L10.7 9L13.3 15.5L15 12H17.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17.8" cy="6.2" r="2.2" fill="currentColor" />
    </BaseIcon>
  )
}

/** Biến thiên nhịp tim HRV */
export function HsHrvWaveIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3" y="4.5" width="18" height="15" rx="4" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M6 12.5C7.4 8.5 9.2 8.5 10.6 12.5C12 16.5 13.8 16.5 15.2 12.5C16.1 10 17.1 9.5 18 11"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <circle cx="8.3" cy="9.4" r="1.2" fill="currentColor" />
      <circle cx="12.9" cy="15.3" r="1.2" fill="currentColor" />
    </BaseIcon>
  )
}

/** Tổng lượt tầm soát & xác nhận */
export function HsScreeningCheckIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4.5" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.2 12.2L10.8 14.8L16 9.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
  )
}

/** Thống kê biểu đồ cột bo tròn */
export function HsChartBarsIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="4" y="13" width="3.8" height="7" rx="1.6" fill="currentColor" fillOpacity="0.28" stroke="currentColor" strokeWidth="1.7" />
      <rect x="10.1" y="9" width="3.8" height="11" rx="1.6" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.7" />
      <rect x="16.2" y="5" width="3.8" height="15" rx="1.6" fill="currentColor" fillOpacity="0.34" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 9.5L10.5 6L17.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </BaseIcon>
  )
}

/** Báo cáo sức khỏe */
export function HsReportDocIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M6.5 3.5H14.2L18.5 7.8V18.5C18.5 19.6 17.6 20.5 16.5 20.5H6.5C5.4 20.5 4.5 19.6 4.5 18.5V5.5C4.5 4.4 5.4 3.5 6.5 3.5Z"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M14 3.5V8H18.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 12.8H9.8L10.8 10.8L12.1 14.6L13.1 12.8H15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 17H14.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </BaseIcon>
  )
}

/** Tư vấn sức khỏe: bong bóng chat + trái tim */
export function HsConsultationChatIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M4.5 6.5C4.5 4.8 5.8 3.5 7.5 3.5H16.5C18.2 3.5 19.5 4.8 19.5 6.5V13.2C19.5 14.9 18.2 16.2 16.5 16.2H10.5L6.5 19.8V16.2H7.5C5.8 16.2 4.5 14.9 4.5 13.2V6.5Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 13C12 13 9 11.1 9 9.1C9 8.1 9.8 7.3 10.7 7.3C11.3 7.3 11.7 7.6 12 8.1C12.3 7.6 12.7 7.3 13.3 7.3C14.2 7.3 15 8.1 15 9.1C15 11.1 12 13 12 13Z"
        fill="currentColor"
      />
    </BaseIcon>
  )
}

/** Ăn uống & dinh dưỡng lành mạnh: bát salad + lá xanh */
export function HsNutritionBowlIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M3.5 12H20.5C20.5 16.7 16.7 20 12 20C7.3 20 3.5 16.7 3.5 12Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M7.5 11.5C7.5 7.8 9.8 5.8 13 5.5C12.5 8.5 10.8 10.5 7.5 11.5Z" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="15.8" cy="8.8" r="2.2" fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="1.6" />
    </BaseIcon>
  )
}

/** Hồ sơ cá nhân thân thiện */
export function HsProfileFamilyIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="8.2" r="3.7" fill="currentColor" fillOpacity="0.24" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M5 19.5C5.6 15.8 8.3 14 12 14C15.7 14 18.4 15.8 19 19.5"
        fill="currentColor"
        fillOpacity="0.16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </BaseIcon>
  )
}

/** Cộng đồng / gia đình nhiều thành viên */
export function HsCommunityUsersIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="9.2" cy="8.5" r="3" fill="currentColor" fillOpacity="0.24" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16.2" cy="9.5" r="2.3" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19C4.1 15.8 6.4 14.2 9.2 14.2C12 14.2 14.3 15.8 14.9 19" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M15.2 14.6C17.6 14.8 19.5 16.2 20.2 18.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </BaseIcon>
  )
}

/** Bác sĩ tim mạch: ống nghe bo mềm */
export function HsDoctorStethoscopeIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 4V9.5C6 12.5 8.2 14.8 11 14.8C13.8 14.8 16 12.5 16 9.5V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M11 14.8V16.8C11 18.8 12.6 20.2 14.8 20.2C17 20.2 18.5 18.8 18.5 16.5V14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="18.5" cy="11.5" r="2.5" fill="currentColor" fillOpacity="0.28" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="6" cy="4" r="1.2" fill="currentColor" />
      <circle cx="16" cy="4" r="1.2" fill="currentColor" />
    </BaseIcon>
  )
}

/** Lượt tư vấn / ví sức khỏe */
export function HsCreditWalletIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="10.5" cy="12" r="6.5" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.8" />
      <path d="M15 6.8C18 7.5 20 9.6 20 12C20 14.4 18 16.5 15 17.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M10.5 8.8V15.2M8.3 10.6C8.3 9.7 9.3 9.2 10.5 9.2C11.7 9.2 12.7 9.7 12.7 10.6C12.7 11.9 8.3 11.7 8.3 13.3C8.3 14.2 9.3 14.8 10.5 14.8C11.7 14.8 12.7 14.2 12.7 13.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </BaseIcon>
  )
}

/** Ngưỡng dinh dưỡng / bộ điều chỉnh */
export function HsNutritionRulesIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="9" cy="7" r="2.3" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="15.5" cy="12" r="2.3" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="10.5" cy="17" r="2.3" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.7" />
    </BaseIcon>
  )
}

/** Vòng đeo tay đo nhịp tim HealthSense */
export function HsWatchBandIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M9 2.8H15L15.8 6H8.2L9 2.8ZM8.2 18H15.8L15 21.2H9L8.2 18Z" fill="currentColor" fillOpacity="0.22" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="6.5" y="6" width="11" height="12" rx="3" fill="currentColor" fillOpacity="0.16" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8.8 12H10.5L11.5 10L12.7 14L13.6 12H15.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
  )
}

/** Chuông nhắc sớm thân thiện */
export function HsBellHeartIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M6.5 10.5C6.5 7.2 8.9 4.5 12 4.5C15.1 4.5 17.5 7.2 17.5 10.5V14.8L19.2 17H4.8L6.5 14.8V10.5Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.8 19.2C10.3 20.1 11.1 20.6 12 20.6C12.9 20.6 13.7 20.1 14.2 19.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="17.5" cy="6.2" r="2.1" fill="currentColor" />
    </BaseIcon>
  )
}

/** Khiên bảo vệ sức khỏe gia đình */
export function HsShieldCareIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M12 3L19 5.8V11.4C19 15.8 16 19.3 12 21C8 19.3 5 15.8 5 11.4V5.8L12 3Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M9.2 11.8L11.2 13.8L15.2 9.6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </BaseIcon>
  )
}

/** Gia đình gắn kết yêu thương */
export function HsFamilyHeartIcon(props: HsIconProps) {
  return (
    <BaseIcon {...props}>
      <path
        d="M12 20.2C12 20.2 4.2 15.2 4.2 9.6C4.2 6.8 6.3 4.6 9 4.6C10.5 4.6 11.4 5.4 12 6.4C12.6 5.4 13.5 4.6 15 4.6C17.7 4.6 19.8 6.8 19.8 9.6C19.8 15.2 12 20.2 12 20.2Z"
        fill="currentColor"
        fillOpacity="0.24"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="9.6" cy="10.2" r="1.4" fill="currentColor" />
      <circle cx="14.4" cy="10.2" r="1.4" fill="currentColor" />
      <path d="M9.6 13.4C10.6 14.4 13.4 14.4 14.4 13.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </BaseIcon>
  )
}
