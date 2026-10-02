export type GuidanceType = 'PRIORITIZE' | 'LIMIT' | 'CAUTION'

export type EvidenceSourceType =
  | 'GUIDELINE'
  | 'SYSTEMATIC_REVIEW'
  | 'META_ANALYSIS'
  | 'RCT'
  | 'OTHER'

export interface EvidenceSource {
  id: string
  title: string
  sourceType: EvidenceSourceType
  authors?: string
  journal?: string
  year?: number
  url?: string
  summary?: string
}

export type NutrientCode =
  | 'energy'
  | 'protein'
  | 'carbohydrate'
  | 'fiber'
  /** Xơ thô (celluloza) - chỉ Bảng thành phần thực phẩm Việt Nam có; khác phương pháp với 'fiber' */
  | 'fiber_crude'
  | 'sugars'
  | 'fat_total'
  | 'fat_saturated'
  | 'fat_monounsaturated'
  | 'fat_polyunsaturated'
  | 'cholesterol'
  | 'sodium'
  | 'potassium'
  | 'magnesium'
  | 'caffeine'
  | 'alcohol'
  | 'vitamin_k'
  | 'epa'
  | 'dha'

export interface NutrientValue {
  nutrientCode: NutrientCode
  name: string
  amount: number
  unit: string
  isKey?: boolean
}

/** Nhóm thực phẩm chung cho mọi nguồn (Việt Nam, USDA) và cho món có khuyến nghị */
export type FoodGroupId =
  | 'CEREAL'
  | 'TUBER'
  | 'LEGUMES_NUTS'
  | 'VEGETABLE'
  | 'FRUIT'
  | 'MEAT'
  | 'FISH'
  | 'EGG'
  | 'DAIRY'
  | 'FAT_OIL'
  | 'SWEET'
  | 'CONDIMENT'
  | 'BEVERAGE'
  | 'MIXED_DISH'
  | 'OTHER'

/**
 * Cấu trúc 5 Field cốt lõi của HealthSense:
 * 1. group: Nhóm lớn (FISH, DAIRY, VEGETABLE...)
 * 2. foodName: Tên thực phẩm chung (Cá hồi, Sữa, Rau chân vịt, Chuối...)
 * 3. foodNameSpecific: Biến thể cụ thể mang giá trị dinh dưỡng và nhãn guidance (Cá hồi nướng, Sữa ít béo 1%...)
 * 4. description: Diễn giải thân thiện cho member
 * 5. guidance: Khuyến nghị hành động (PRIORITIZE / LIMIT / CAUTION)
 */
export interface Food {
  id: string
  // 5 core fields
  group: FoodGroupId
  groupName: string
  foodName: string
  foodNameSpecific: string
  description: string
  guidance: GuidanceType

  // Clinical Rationale & Health Context
  guidanceTitle: string
  guidanceReason: string
  cardiovascularContext?: string
  afContext?: string
  medicationContext?: string

  // Traceability to USDA FNDDS
  sourceFoodCode: string
  sourceDescription: string

  // Nutrition Profile
  servingReference: {
    amount: number
    unit: string
  }
  nutrients: NutrientValue[]
  highlightNutrientCodes: NutrientCode[]
  evidenceSources: EvidenceSource[]

  imageUrl?: string
}

export interface FoodGroup {
  id: FoodGroupId
  name: string
  slug: string
  description?: string
  /** Tên icon lucide-react */
  icon?: string
  imageUrl?: string
  /** Số thực phẩm của nhóm trong cơ sở dữ liệu tham chiếu (mọi nguồn) */
  foodCount: number
  /** Số thực phẩm theo nguồn; nguồn không có món nào thì không có khóa */
  sourceCounts: Partial<Record<ReferenceFoodSource, number>>
  /** Số món có khuyến nghị tim mạch trong nhóm */
  guidanceFoodCount: number
}

// Aliases for compatibility
export type FoodCategory = FoodGroup

// ---------------------------------------------------------------------------
// Tra cứu toàn bộ cơ sở dữ liệu tham chiếu: số liệu kèm đánh giá theo quy tắc cho người rung nhĩ (advice).
// Mọi giá trị tính trên 100 g phần ăn được. Hai nguồn:
//   VN_FCT     - Bảng thành phần thực phẩm Việt Nam, Viện Dinh dưỡng 2007 (526 thực phẩm)
//   USDA_FNDDS - USDA FNDDS 2021-2023 (5.431 thực phẩm, món ăn)
// ---------------------------------------------------------------------------

export type ReferenceFoodSource = 'VN_FCT' | 'USDA_FNDDS'

export interface ReferenceFoodSummary {
  id: string
  source: ReferenceFoodSource
  sourceFoodCode: string
  /**
   * Tên hiển thị. USDA: tên gốc tiếng Anh. Việt Nam: tên tiếng Việt.
   */
  displayName: string
  /**
   * Tên tiếng Việt. USDA: tên dịch. Việt Nam: trùng displayName.
   */
  localName?: string
  /** Nhóm chung */
  group: FoodGroupId
  groupName: string
  energyKcal?: number
  proteinG?: number
  carbohydrateG?: number
  fatTotalG?: number
  /** Màu theo đơn ăn uống; chỉ có khi người xem là hội viên */
  advice?: DietAdvice
}

export interface ReferenceFoodPortion {
  description: string
  gramWeight: number
  /** Khẩu phần nguồn dùng khi không rõ số lượng */
  isDefault: boolean
}

export interface ReferenceFood {
  id: string
  sourceFoodCode: string
  /**
   * Tên hiển thị. USDA: tên gốc tiếng Anh. Việt Nam: tên tiếng Việt.
   */
  displayName: string
  /**
   * Tên tiếng Việt. USDA: tên dịch. Việt Nam: trùng displayName.
   */
  localName?: string
  /** Nhóm chung */
  group: FoodGroupId
  groupName: string
  /** Phân loại gốc của nguồn (USDA: nhóm WWEIA tiếng Anh; Việt Nam: nhóm của sách) */
  sourceCategory?: string
  source: ReferenceFoodSource
  sourceVersion: string
  /** Tỉ lệ thải bỏ khi sơ chế (%), chỉ nguồn VN_FCT có */
  wastePct?: number
  nutrients: NutrientValue[]
  portions: ReferenceFoodPortion[]
  /** Màu và lý do theo đơn ăn uống; chỉ có khi người xem là hội viên */
  advice?: DietAdvice
}

export interface ReferenceFoodSearchParams {
  q?: string
  /** id hoặc slug của nhóm chung */
  group?: string
  source?: ReferenceFoodSource
  page?: number
  size?: number
}

// ---------------------------------------------------------------------------
// Đơn ăn uống: bác sĩ tick vài cờ, mọi món hội viên tra cứu được chấm xanh/vàng/đỏ theo đơn.
// ---------------------------------------------------------------------------

/**
 * GOOD = xanh (tốt cho nhịp tim), OK = không có lưu ý, CAUTION = vàng, LIMIT = đỏ,
 * UNKNOWN = xám (thiếu số liệu để đánh giá)
 */
export type DietAdviceLevel = 'GOOD' | 'OK' | 'CAUTION' | 'LIMIT' | 'UNKNOWN'

export interface DietAdviceReason {
  code: string
  level: DietAdviceLevel
  message: string
}

export interface DietAdvice {
  level: DietAdviceLevel
  /** Nặng trước rồi theo mức ưu tiên; GOOD thì là các điểm tốt; OK thì rỗng */
  reasons: DietAdviceReason[]
  /** true: có đơn của bác sĩ; false: chỉ theo bộ quy tắc chung cho người rung nhĩ */
  personalized: boolean
}

/** Mỗi cờ ứng với một quy tắc bác sĩ dặn riêng; onWarfarin bật thêm quy tắc vitamin K */
export interface DietPrescriptionFlags {
  limitSodium: boolean
  /** Đang dùng warfarin: giữ lượng vitamin K ổn định */
  onWarfarin: boolean
  avoidAlcohol: boolean
  limitCaffeine: boolean
  limitSugars: boolean
  watchSodiumPotassium: boolean
  limitSaturatedFat: boolean
  encourageMagnesium: boolean
}

/** Theo thứ tự ưu tiên (V28). VITAMIN_K chỉ áp dụng khi đơn ghi đang dùng warfarin. */
export type DietRuleCode =
  | 'ALCOHOL'
  | 'CAFFEINE'
  | 'SUGARS'
  | 'NA_K_RATIO'
  | 'SODIUM'
  | 'SATURATED_FAT'
  | 'MAGNESIUM'
  | 'VITAMIN_K'

/**
 * Ngưỡng trên 100 g (tỷ lệ Na/K không có đơn vị), so "vượt quá": limit = đỏ (Nên hạn chế), caution = vàng
 * (Cần lưu ý); good = mức tốt (Na/K: từ mức này trở xuống; magie: từ mức này trở lên, chỉ admin sửa).
 * Vắng = không có mức đó (admin) hoặc dùng mặc định (ngưỡng riêng của bác sĩ).
 */
export interface DietThreshold {
  code: DietRuleCode
  limit?: number | null
  caution?: number | null
  good?: number | null
}

/** Ngưỡng mặc định của cả hệ thống (trang quản trị) */
export interface DietRule {
  code: DietRuleCode
  name: string
  unit: string
  limit?: number
  caution?: number
  good?: number
  /** Mức ưu tiên 1-4; 5 = chỉ theo đơn (vitamin K) */
  priority: number
  /** Áp cho mọi người (bộ quy tắc nền cho người rung nhĩ) */
  base: boolean
  /** Bác sĩ chỉnh ngưỡng riêng cho từng hội viên được */
  overridable: boolean
  /** Nguồn của quy tắc */
  evidence?: string
  evidenceUrl?: string
  updatedAt?: string
  updatedBy?: string
}

/** Một quy tắc trong đơn: mặc định, ngưỡng riêng (nếu bác sĩ chỉnh) và ngưỡng đang áp dụng */
export interface DietPrescriptionRule {
  code: DietRuleCode
  name: string
  unit: string
  /** Đang áp dụng cho hội viên (quy tắc nền luôn áp dụng; vitamin K khi dùng warfarin) */
  enabled: boolean
  /** Bác sĩ dặn riêng */
  prescribed: boolean
  /** Bác sĩ chỉnh ngưỡng riêng được */
  overridable: boolean
  defaultGood?: number
  /** Mức tốt riêng của hội viên (Na/K, magie); vắng = dùng mặc định */
  good?: number
  effectiveGood?: number
  defaultLimit?: number
  defaultCaution?: number
  limit?: number
  caution?: number
  effectiveLimit?: number
  effectiveCaution?: number
}

export interface DietPrescription extends DietPrescriptionFlags {
  memberId: number
  /** false: bác sĩ chưa kê, các cờ là lời khuyên chung */
  personalized: boolean
  note?: string
  prescribedBy?: number
  consultationSessionId?: number
  updatedAt?: string
  rules: DietPrescriptionRule[]
}

export interface UpdateDietPrescriptionRequest extends DietPrescriptionFlags {
  note?: string
  /** Ngưỡng riêng cho hội viên; quy tắc/mức không gửi thì dùng mặc định */
  thresholds?: DietThreshold[]
}
