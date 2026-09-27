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

  // Traceability to USDA FNDDS (internal only)
  sourceFoodCode?: string
  sourceDescription?: string

  // Nutrition Profile
  servingReference: {
    amount: number
    unit: string
  }
  nutrients: NutrientValue[]
  highlightNutrientCodes: NutrientCode[]
  evidenceSources: EvidenceSource[]

  // Compatible / Visual assets
  imageUrl?: string
  name?: string
  categoryId?: string
  familyId?: string
  primaryGuidanceType?: GuidanceType
}

export interface FoodGroup {
  id: FoodGroupId
  name: string
  slug: string
  description: string
  dietaryPattern: 'PRIORITIZE' | 'LIMIT' | 'CAUTION' | 'BALANCED'
  icon?: string
  imageUrl?: string
}

// Aliases for compatibility
export type FoodCategory = FoodGroup
