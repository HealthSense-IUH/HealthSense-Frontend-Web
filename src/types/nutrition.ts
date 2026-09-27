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

export type FoodGroupId =
  | 'FISH'
  | 'DAIRY'
  | 'VEGETABLE'
  | 'FRUIT'
  | 'LEGUMES_NUTS'
  | 'BEVERAGES_CAUTION'
  | 'BEVERAGES_ALCOHOL'
  | 'PROCESSED_FOODS'

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
  description: string
  dietaryPattern: 'PRIORITIZE' | 'LIMIT' | 'CAUTION' | 'BALANCED'
  icon?: string
  imageUrl?: string
  /** Số món trong nhóm */
  foodCount: number
}

// Aliases for compatibility
export type FoodCategory = FoodGroup

// ---------------------------------------------------------------------------
// Tra cứu toàn bộ cơ sở dữ liệu tham chiếu (USDA FNDDS). Chỉ có số liệu, không kèm khuyến nghị.
// Mọi giá trị tính trên 100 g.
// ---------------------------------------------------------------------------

export interface ReferenceFoodSummary {
  id: string
  sourceFoodCode: string
  /** Tên gốc tiếng Anh của USDA */
  name: string
  category?: string
  energyKcal?: number
  proteinG?: number
  carbohydrateG?: number
  fatTotalG?: number
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
  name: string
  category?: string
  source: string
  sourceVersion: string
  nutrients: NutrientValue[]
  portions: ReferenceFoodPortion[]
}

export interface ReferenceFoodCategory {
  name: string
  foodCount: number
}

export interface ReferenceFoodSearchParams {
  q?: string
  category?: string
  page?: number
  size?: number
}
