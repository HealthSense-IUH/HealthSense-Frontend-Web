import type { Food, FoodGroup, EvidenceSource, GuidanceType } from '@/types/nutrition'

export const mockEvidenceSources: Record<string, EvidenceSource> = {
  "accAha2023": {
    "id": "acc-aha-2023",
    "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation",
    "sourceType": "GUIDELINE",
    "authors": "Joglar JA, Chung MK, Armbruster AL, et al.",
    "journal": "Circulation / JACC",
    "year": 2023,
    "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193",
    "summary": "Khuyến cáo quản lý toàn diện yếu tố lối sống, hạn chế rượu bia và duy trì dinh dưỡng lành mạnh cho tim mạch ở bệnh nhân rung nhĩ."
  },
  "ahaLifestyle2020": {
    "id": "aha-lifestyle-2020",
    "title": "Lifestyle and Risk Factor Modification for Reduction of Atrial Fibrillation: A Scientific Statement From the American Heart Association",
    "sourceType": "GUIDELINE",
    "authors": "Chung MK, Eckhardt LL, Chen LY, et al.",
    "journal": "Circulation",
    "year": 2020,
    "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000748",
    "summary": "Tổng hợp bằng chứng về giảm cân, kiểm soát huyết áp, chế độ ăn Địa Trung Hải và các yếu tố kích hoạt kịch phát AF."
  },
  "predimedTrial": {
    "id": "predimed-trial",
    "title": "Extravirgin olive oil consumption reduces risk of atrial fibrillation: the PREDIMED trial",
    "sourceType": "RCT",
    "authors": "Martínez-González MÁ, Toledo E, Arós F, et al.",
    "journal": "Circulation",
    "year": 2014,
    "url": "https://pubmed.ncbi.nlm.nih.gov/24787471/",
    "summary": "Thử nghiệm ngẫu nhiên có đối chứng cho thấy chế độ ăn Địa Trung Hải giàu chất béo chưa bão hòa có liên quan đến việc giảm nguy cơ AF."
  },
  "coffeeAfMetaAnalysis": {
    "id": "coffee-af-meta-2021",
    "title": "Coffee and Caffeine Consumption and Risk of Atrial Fibrillation: A Systematic Review and Meta-Analysis",
    "sourceType": "META_ANALYSIS",
    "authors": "Grobbee DE, et al.",
    "journal": "European Journal of Preventive Cardiology",
    "year": 2021,
    "url": "https://pubmed.ncbi.nlm.nih.gov/39149585/",
    "summary": "Tiêu thụ caffeine ở mức độ vừa phải (1-3 tách cà phê mỗi ngày) không liên quan đến tăng nguy cơ rung nhĩ trong dân số chung."
  },
  "alcoholAfStudy": {
    "id": "alcohol-af-review",
    "title": "Alcohol Consumption and Risk of Atrial Fibrillation: A Dose-Response Meta-Analysis",
    "sourceType": "SYSTEMATIC_REVIEW",
    "authors": "Larsson SC, Drca N, Wolk A.",
    "journal": "Journal of the American College of Cardiology",
    "year": 2014,
    "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
    "summary": "Nguy cơ xuất hiện hoặc tái phát AF tăng theo liều lượng cồn tiêu thụ, ngay cả ở mức độ uống vừa phải đến nhiều."
  },
  "clevelandDietaryGuidance": {
    "id": "cleveland-dietary-af",
    "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
    "sourceType": "OTHER",
    "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
    "journal": "Cleveland Clinic Health Essentials",
    "year": 2023,
    "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
    "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
  }
}

export const mockFoodGroups: FoodGroup[] = [
  {
    "id": "FISH",
    "slug": "fish-seafood",
    "name": "Cá & Hải sản",
    "description": "Nhóm thường được khuyến khích trong chế độ ăn tốt cho tim mạch nhờ giàu axit béo Omega-3.",
    "dietaryPattern": "PRIORITIZE",
    "icon": "Fish"
  },
  {
    "id": "DAIRY",
    "slug": "dairy",
    "name": "Sữa & Chế phẩm từ sữa",
    "description": "Nguồn cung cấp canxi và protein dồi dào. Lựa chọn dạng ít béo giúp kiểm soát chất béo bão hòa.",
    "dietaryPattern": "BALANCED",
    "icon": "Milk"
  },
  {
    "id": "VEGETABLE",
    "slug": "vegetables",
    "name": "Rau củ",
    "description": "Giàu chất xơ, kali và các chất chống oxy hóa tự nhiên hỗ trợ duy trì huyết áp và tim mạch.",
    "dietaryPattern": "PRIORITIZE",
    "icon": "Carrot"
  },
  {
    "id": "FRUIT",
    "slug": "fruits",
    "name": "Trái cây",
    "description": "Cung cấp vitamin, khoáng chất điện giải tự nhiên và chất xơ hòa tan.",
    "dietaryPattern": "PRIORITIZE",
    "icon": "Apple"
  },
  {
    "id": "LEGUMES_NUTS",
    "slug": "legumes-nuts",
    "name": "Đậu & Hạt dinh dưỡng",
    "description": "Nguồn chất béo chưa bão hòa, đạm thực vật và magie dồi dào có lợi cho tim.",
    "dietaryPattern": "PRIORITIZE",
    "icon": "Nut"
  },
  {
    "id": "BEVERAGES_CAUTION",
    "slug": "beverages-caution",
    "name": "Đồ uống cần theo dõi",
    "description": "Các loại đồ uống chứa caffeine cần lưu ý ngưỡng tiêu thụ cá nhân và phản xạ nhịp tim.",
    "dietaryPattern": "CAUTION",
    "icon": "Coffee"
  },
  {
    "id": "BEVERAGES_ALCOHOL",
    "slug": "beverages-alcohol",
    "name": "Đồ uống có cồn",
    "description": "Nhóm nên hạn chế tối đa vì liên quan đến nguy cơ kích phát hoặc tái phát rung nhĩ.",
    "dietaryPattern": "LIMIT",
    "icon": "Wine"
  },
  {
    "id": "PROCESSED_FOODS",
    "slug": "processed-foods",
    "name": "Thực phẩm chế biến sẵn & Nhiều muối",
    "description": "Thường có lượng natri và chất béo bão hòa cao, dễ làm tăng gánh nặng lên huyết áp.",
    "dietaryPattern": "LIMIT",
    "icon": "Beef"
  }
]

// Alias for compatibility
export const mockCategories = mockFoodGroups

export const mockFoods: Food[] = [
  {
    "id": "milk-low-fat-1",
    "group": "DAIRY",
    "groupName": "Sữa & Chế phẩm từ sữa",
    "foodName": "Sữa",
    "foodNameSpecific": "Sữa ít béo 1%",
    "description": "Sữa bò có hàm lượng chất béo khoảng 1%, ít chất béo bão hòa hơn sữa nguyên kem trong khi vẫn giàu canxi và kali.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Phù hợp trong chế độ ăn tốt cho tim mạch",
    "guidanceReason": "Lượng chất béo bão hòa thấp (0.6g/100g), giúp hạn chế cholesterol xấu LDL mà vẫn duy trì đủ đạm và khoáng chất.",
    "cardiovascularContext": "Ưu tiên các nguồn sữa ít béo hoặc tách béo giúp hạn chế lượng chất béo bão hòa nạp vào, hỗ trợ duy trì mức lipid máu ổn định.",
    "afContext": "Chứa kali và magie — các chất điện giải có vai trò trong hoạt động điện bình thường của tim.",
    "sourceFoodCode": "11112210",
    "sourceDescription": "Milk, low fat (1%)",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 43,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 3.4,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 5.2,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 5,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0.6,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0.2,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 5,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 39,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 159,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 12,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0.1,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "protein",
      "fat_saturated",
      "sodium",
      "potassium"
    ],
    "evidenceSources": [
      {
        "id": "acc-aha-2023",
        "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation",
        "sourceType": "GUIDELINE",
        "authors": "Joglar JA, Chung MK, Armbruster AL, et al.",
        "journal": "Circulation / JACC",
        "year": 2023,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193",
        "summary": "Khuyến cáo quản lý toàn diện yếu tố lối sống, hạn chế rượu bia và duy trì dinh dưỡng lành mạnh cho tim mạch ở bệnh nhân rung nhĩ."
      },
      {
        "id": "cleveland-dietary-af",
        "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
        "sourceType": "OTHER",
        "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
        "journal": "Cleveland Clinic Health Essentials",
        "year": 2023,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
      }
    ],
    "name": "Sữa ít béo 1%",
    "categoryId": "dairy",
    "familyId": "s-a",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "milk-skim",
    "group": "DAIRY",
    "groupName": "Sữa & Chế phẩm từ sữa",
    "foodName": "Sữa",
    "foodNameSpecific": "Sữa tách béo (Skim milk)",
    "description": "Sữa bò đã được tách béo hoàn toàn (fat-free), hàm lượng calo và chất béo bão hòa thấp nhất.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Lựa chọn nạc tối ưu cho người kiểm soát mỡ máu & cân nặng",
    "guidanceReason": "Lượng chất béo bão hòa gần như bằng 0 (dưới 0.1g/100g), phù hợp với người cần kiểm soát chặt chẽ lipid máu.",
    "cardiovascularContext": "Giúp đáp ứng nhu cầu vi chất canxi và kali mà không làm tăng lượng chất béo bão hòa trong ngày.",
    "afContext": "Cung cấp khoáng chất điện giải hỗ trợ dẫn truyền thần kinh cơ tim.",
    "sourceFoodCode": "11113000",
    "sourceDescription": "Milk, fat free (skim)",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 34,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 3.4,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 4.9,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 5.1,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 3,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 41,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 167,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 12,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "protein",
      "fat_saturated",
      "sodium",
      "potassium"
    ],
    "evidenceSources": [
      {
        "id": "acc-aha-2023",
        "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation",
        "sourceType": "GUIDELINE",
        "authors": "Joglar JA, Chung MK, Armbruster AL, et al.",
        "journal": "Circulation / JACC",
        "year": 2023,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193",
        "summary": "Khuyến cáo quản lý toàn diện yếu tố lối sống, hạn chế rượu bia và duy trì dinh dưỡng lành mạnh cho tim mạch ở bệnh nhân rung nhĩ."
      }
    ],
    "name": "Sữa tách béo (Skim milk)",
    "categoryId": "dairy",
    "familyId": "s-a",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "milk-reduced-fat-2",
    "group": "DAIRY",
    "groupName": "Sữa & Chế phẩm từ sữa",
    "foodName": "Sữa",
    "foodNameSpecific": "Sữa giảm béo 2%",
    "description": "Sữa giảm béo vừa phải, giữ độ thơm béo tự nhiên nhẹ với lượng chất béo bão hòa trung bình.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Lựa chọn chuyển tiếp hợp lý",
    "guidanceReason": "Chất béo bão hòa thấp hơn sữa nguyên kem (khoảng 1.1g/100g), có thể dùng xen kẽ trước khi chuyển sang loại 1% hoặc tách béo.",
    "cardiovascularContext": "Cân nhắc tổng lượng chất béo bão hòa từ các bữa ăn khác trong ngày để giữ ở mức khuyến nghị dưới 10% tổng năng lượng.",
    "sourceFoodCode": "11112110",
    "sourceDescription": "Milk, reduced fat (2%)",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 50,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 3.4,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 4.9,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 4.9,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 1.9,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 1.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0.4,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0.1,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 8,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 39,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 159,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 12,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0.2,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "protein",
      "fat_saturated",
      "sodium",
      "potassium"
    ],
    "evidenceSources": [
      {
        "id": "cleveland-dietary-af",
        "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
        "sourceType": "OTHER",
        "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
        "journal": "Cleveland Clinic Health Essentials",
        "year": 2023,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
      }
    ],
    "name": "Sữa giảm béo 2%",
    "categoryId": "dairy",
    "familyId": "s-a",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "milk-whole",
    "group": "DAIRY",
    "groupName": "Sữa & Chế phẩm từ sữa",
    "foodName": "Sữa",
    "foodNameSpecific": "Sữa nguyên kem",
    "description": "Sữa bò nguyên chất giữ nguyên độ béo tự nhiên (khoảng 3.2g chất béo/100g).",
    "guidance": "CAUTION",
    "guidanceTitle": "Cân nhắc lượng dùng nếu cần kiểm soát mỡ máu",
    "guidanceReason": "Chứa lượng chất béo bão hòa cao hơn sữa ít béo hoặc tách béo (khoảng 1.9g/100g). Người có rối loạn lipid máu nên cân đối lượng nạp.",
    "cardiovascularContext": "Hiệp hội Tim mạch Hoa Kỳ (AHA) khuyến nghị người trưởng thành nên ưu tiên sản phẩm từ sữa ít béo hoặc không béo để kiểm soát cholesterol LDL.",
    "sourceFoodCode": "11111000",
    "sourceDescription": "Milk, whole",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 61,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 3.3,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 4.6,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 4.8,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 3.2,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 1.9,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0.7,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0.1,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 12,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 38,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 150,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 12,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0.3,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 1,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "protein",
      "fat_saturated",
      "sodium",
      "potassium"
    ],
    "evidenceSources": [
      {
        "id": "aha-lifestyle-2020",
        "title": "Lifestyle and Risk Factor Modification for Reduction of Atrial Fibrillation: A Scientific Statement From the American Heart Association",
        "sourceType": "GUIDELINE",
        "authors": "Chung MK, Eckhardt LL, Chen LY, et al.",
        "journal": "Circulation",
        "year": 2020,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000748",
        "summary": "Tổng hợp bằng chứng về giảm cân, kiểm soát huyết áp, chế độ ăn Địa Trung Hải và các yếu tố kích hoạt kịch phát AF."
      }
    ],
    "name": "Sữa nguyên kem",
    "categoryId": "dairy",
    "familyId": "s-a",
    "primaryGuidanceType": "CAUTION",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "milk-lactose-free-low-fat",
    "group": "DAIRY",
    "groupName": "Sữa & Chế phẩm từ sữa",
    "foodName": "Sữa",
    "foodNameSpecific": "Sữa không lactose ít béo 1%",
    "description": "Sữa ít béo đã được phân giải đường lactose, thân thiện với hệ tiêu hóa nhạy cảm.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Lựa chọn tốt cho người không dung nạp lactose",
    "guidanceReason": "Vừa kiểm soát chất béo bão hòa thấp, vừa tránh đầy hơi khó tiêu mà không làm giảm lượng canxi và kali.",
    "sourceFoodCode": "11114300",
    "sourceDescription": "Milk, lactose free, low fat (1%)",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 43,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 3.4,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 5.2,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 5,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0.6,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0.2,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 5,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 39,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 159,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 12,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0.1,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "protein",
      "fat_saturated",
      "sodium",
      "potassium"
    ],
    "evidenceSources": [
      {
        "id": "cleveland-dietary-af",
        "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
        "sourceType": "OTHER",
        "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
        "journal": "Cleveland Clinic Health Essentials",
        "year": 2023,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
      }
    ],
    "name": "Sữa không lactose ít béo 1%",
    "categoryId": "dairy",
    "familyId": "s-a",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "milk-lactose-free-skim",
    "group": "DAIRY",
    "groupName": "Sữa & Chế phẩm từ sữa",
    "foodName": "Sữa",
    "foodNameSpecific": "Sữa không lactose tách béo",
    "description": "Sữa tách béo hoàn toàn kết hợp công nghệ loại bỏ đường lactose.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Ít béo, không lactose, giàu khoáng chất",
    "guidanceReason": "Hàm lượng chất béo bão hòa gần như bằng 0, an toàn cho cả tim mạch lẫn tiêu hóa.",
    "sourceFoodCode": "11114320",
    "sourceDescription": "Milk, lactose free, fat free (skim)",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 34,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 3.4,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 4.9,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 5.1,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 3,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 41,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 167,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 12,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "protein",
      "fat_saturated",
      "sodium",
      "potassium"
    ],
    "evidenceSources": [
      {
        "id": "cleveland-dietary-af",
        "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
        "sourceType": "OTHER",
        "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
        "journal": "Cleveland Clinic Health Essentials",
        "year": 2023,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
      }
    ],
    "name": "Sữa không lactose tách béo",
    "categoryId": "dairy",
    "familyId": "s-a",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "milk-lactose-free-whole",
    "group": "DAIRY",
    "groupName": "Sữa & Chế phẩm từ sữa",
    "foodName": "Sữa",
    "foodNameSpecific": "Sữa không lactose nguyên kem",
    "description": "Sữa nguyên chất không lactose giữ trọn vẹn chất béo tự nhiên.",
    "guidance": "CAUTION",
    "guidanceTitle": "Hỗ trợ tiêu hóa, cân nhắc lượng chất béo",
    "guidanceReason": "Phù hợp người dị ứng lactose, nhưng giữ lượng chất béo bão hòa tương đương sữa nguyên kem thông thường.",
    "sourceFoodCode": "11114350",
    "sourceDescription": "Milk, lactose free, whole",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 61,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 3.3,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 4.6,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 4.8,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 3.2,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 1.9,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0.7,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0.1,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 12,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 38,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 150,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 12,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0.3,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 1,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "protein",
      "fat_saturated",
      "sodium",
      "potassium"
    ],
    "evidenceSources": [
      {
        "id": "aha-lifestyle-2020",
        "title": "Lifestyle and Risk Factor Modification for Reduction of Atrial Fibrillation: A Scientific Statement From the American Heart Association",
        "sourceType": "GUIDELINE",
        "authors": "Chung MK, Eckhardt LL, Chen LY, et al.",
        "journal": "Circulation",
        "year": 2020,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000748",
        "summary": "Tổng hợp bằng chứng về giảm cân, kiểm soát huyết áp, chế độ ăn Địa Trung Hải và các yếu tố kích hoạt kịch phát AF."
      }
    ],
    "name": "Sữa không lactose nguyên kem",
    "categoryId": "dairy",
    "familyId": "s-a",
    "primaryGuidanceType": "CAUTION",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "salmon-baked",
    "imageUrl": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
    "group": "FISH",
    "groupName": "Cá & Hải sản",
    "foodName": "Cá hồi",
    "foodNameSpecific": "Cá hồi nướng",
    "description": "Cá hồi được nướng chín mộc hoặc áp chảo với ít dầu, giữ lại tối đa nguồn axit béo omega-3 quý giá.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Rất khuyến khích cho sức khỏe tim mạch",
    "guidanceReason": "Giàu axit béo omega-3 chuỗi dài (EPA và DHA) và protein chất lượng cao, đồng thời natri tự nhiên thấp.",
    "cardiovascularContext": "Chế độ ăn giàu cá béo (2 bữa/tuần) được khuyến cáo bởi các hướng dẫn tim mạch lớn để giảm nguy cơ bệnh mạch vành và hỗ trợ điều hòa lipid máu.",
    "afContext": "Các nghiên cứu dịch tễ và thử nghiệm chế độ ăn Địa Trung Hải cho thấy dinh dưỡng giàu omega-3 tự nhiên hỗ trợ bảo vệ mô cơ tim và nội mạc mạch máu.",
    "sourceFoodCode": "26137120",
    "sourceDescription": "Fish, salmon, baked or broiled",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 274,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 25.4,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 18.4,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 4.3,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 5.5,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 5.2,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 69,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 294,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 452,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 34,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 4.3,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 860,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 1132,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "protein",
      "epa",
      "dha",
      "sodium"
    ],
    "evidenceSources": [
      {
        "id": "acc-aha-2023",
        "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation",
        "sourceType": "GUIDELINE",
        "authors": "Joglar JA, Chung MK, Armbruster AL, et al.",
        "journal": "Circulation / JACC",
        "year": 2023,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193",
        "summary": "Khuyến cáo quản lý toàn diện yếu tố lối sống, hạn chế rượu bia và duy trì dinh dưỡng lành mạnh cho tim mạch ở bệnh nhân rung nhĩ."
      },
      {
        "id": "predimed-trial",
        "title": "Extravirgin olive oil consumption reduces risk of atrial fibrillation: the PREDIMED trial",
        "sourceType": "RCT",
        "authors": "Martínez-González MÁ, Toledo E, Arós F, et al.",
        "journal": "Circulation",
        "year": 2014,
        "url": "https://pubmed.ncbi.nlm.nih.gov/24787471/",
        "summary": "Thử nghiệm ngẫu nhiên có đối chứng cho thấy chế độ ăn Địa Trung Hải giàu chất béo chưa bão hòa có liên quan đến việc giảm nguy cơ AF."
      }
    ],
    "name": "Cá hồi nướng",
    "categoryId": "fish-seafood",
    "familyId": "c--h-i",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "salmon-fried",
    "group": "FISH",
    "groupName": "Cá & Hải sản",
    "foodName": "Cá hồi",
    "foodNameSpecific": "Cá hồi chiên ngập dầu",
    "description": "Cá hồi tẩm bột chiên ngập dầu làm tăng đáng kể tổng calo, chất béo chuyển hóa và natri.",
    "guidance": "LIMIT",
    "guidanceTitle": "Nên hạn chế cách chế biến chiên giòn",
    "guidanceReason": "Quá trình chiên ngập dầu làm giảm giá trị của omega-3 và bổ sung lượng lớn chất béo xấu cùng natri từ lớp bột tẩm.",
    "cardiovascularContext": "Thay vì chiên ngập dầu, các chuyên gia khuyến khích phương pháp áp chảo nhẹ, hấp hoặc nướng cùng gia vị thảo mộc tự nhiên.",
    "sourceFoodCode": "26137140",
    "sourceDescription": "Fish, salmon, fried",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 307,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 17.5,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 11.7,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0.5,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 0.2,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 20.7,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 3.6,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 7.5,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 7,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 46,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 391,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 301,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 25,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 12.3,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 528,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 695,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "fat_total",
      "fat_saturated",
      "sodium",
      "energy"
    ],
    "evidenceSources": [
      {
        "id": "aha-lifestyle-2020",
        "title": "Lifestyle and Risk Factor Modification for Reduction of Atrial Fibrillation: A Scientific Statement From the American Heart Association",
        "sourceType": "GUIDELINE",
        "authors": "Chung MK, Eckhardt LL, Chen LY, et al.",
        "journal": "Circulation",
        "year": 2020,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000748",
        "summary": "Tổng hợp bằng chứng về giảm cân, kiểm soát huyết áp, chế độ ăn Địa Trung Hải và các yếu tố kích hoạt kịch phát AF."
      }
    ],
    "name": "Cá hồi chiên ngập dầu",
    "categoryId": "fish-seafood",
    "familyId": "c--h-i",
    "primaryGuidanceType": "LIMIT",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "mackerel-grilled",
    "group": "FISH",
    "groupName": "Cá & Hải sản",
    "foodName": "Cá thu",
    "foodNameSpecific": "Cá thu nướng",
    "description": "Cá thu biển nướng mộc, nguồn cung cấp khoáng chất và omega-3 nồng độ cao.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Nguồn omega-3 biển sâu dồi dào",
    "guidanceReason": "Chứa hàm lượng EPA và DHA rất cao, cùng với magie tự nhiên tốt cho cơ tim.",
    "cardiovascularContext": "Thuộc nhóm cá béo lý tưởng trong mô hình ăn uống có lợi cho hệ tuần hoàn.",
    "sourceFoodCode": "26121120",
    "sourceDescription": "Fish, mackerel, baked or broiled",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 237,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 24.9,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 14.3,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 4,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 4.9,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 3.7,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 62,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 322,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 505,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 35,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 3.9,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 632,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 1157,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "protein",
      "epa",
      "dha",
      "magnesium"
    ],
    "evidenceSources": [
      {
        "id": "acc-aha-2023",
        "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation",
        "sourceType": "GUIDELINE",
        "authors": "Joglar JA, Chung MK, Armbruster AL, et al.",
        "journal": "Circulation / JACC",
        "year": 2023,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193",
        "summary": "Khuyến cáo quản lý toàn diện yếu tố lối sống, hạn chế rượu bia và duy trì dinh dưỡng lành mạnh cho tim mạch ở bệnh nhân rung nhĩ."
      }
    ],
    "name": "Cá thu nướng",
    "categoryId": "fish-seafood",
    "familyId": "c--thu",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "tuna-canned",
    "group": "FISH",
    "groupName": "Cá & Hải sản",
    "foodName": "Cá ngừ",
    "foodNameSpecific": "Cá ngừ đóng hộp (ngâm nước)",
    "description": "Cá ngừ ngâm nước cung cấp nguồn đạm nạc, ít chất béo, tiện lợi cho bữa ăn hàng ngày.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Nguồn đạm nạc tiện dụng",
    "guidanceReason": "Rất ít chất béo bão hòa, tuy nhiên cần lưu ý kiểm tra nhãn để tránh loại ngâm muối quá nhiều natri.",
    "sourceFoodCode": "26155110",
    "sourceDescription": "Fish, tuna, canned",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 85,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 19,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 0.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0.9,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0.2,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0.1,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0.3,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 36,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 219,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 176,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 23,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0.2,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 25,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 197,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "protein",
      "sodium",
      "energy",
      "fat_total"
    ],
    "evidenceSources": [
      {
        "id": "cleveland-dietary-af",
        "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
        "sourceType": "OTHER",
        "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
        "journal": "Cleveland Clinic Health Essentials",
        "year": 2023,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
      }
    ],
    "name": "Cá ngừ đóng hộp (ngâm nước)",
    "categoryId": "fish-seafood",
    "familyId": "c--ng-",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "spinach-cooked",
    "group": "VEGETABLE",
    "groupName": "Rau củ",
    "foodName": "Rau chân vịt",
    "foodNameSpecific": "Rau chân vịt luộc",
    "description": "Rau cải bó xôi nấu chín mộc không thêm dầu mỡ, giàu kali, magie và chất xơ.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Thực phẩm vàng cho chế độ ăn tim mạch",
    "guidanceReason": "Hàm lượng kali và magie tự nhiên cao, ít calo và giàu chất xơ.",
    "cardiovascularContext": "Chế độ ăn giàu rau lá xanh đậm là trụ cột của chế độ ăn DASH và Địa Trung Hải giúp hỗ trợ kiểm soát huyết áp.",
    "afContext": "Kali và magie là các chất điện giải có vai trò trong hoạt động điện bình thường của tim.",
    "medicationContext": "Nếu bạn đang sử dụng warfarin, lượng vitamin K trong chế độ ăn nên được duy trì tương đối ổn định. Không cần tự ý loại bỏ hoàn toàn các thực phẩm giàu vitamin K, mà nên trao đổi với bác sĩ để điều chỉnh liều thuốc tương thích với thói quen ăn uống.",
    "sourceFoodCode": "72125211",
    "sourceDescription": "Spinach, fresh, cooked, no added fat",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 33,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 3.4,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 3.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 1.9,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 0.5,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0.7,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0.2,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 262,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 540,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 109,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 566.4,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "vitamin_k",
      "potassium",
      "magnesium",
      "fiber"
    ],
    "evidenceSources": [
      {
        "id": "acc-aha-2023",
        "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation",
        "sourceType": "GUIDELINE",
        "authors": "Joglar JA, Chung MK, Armbruster AL, et al.",
        "journal": "Circulation / JACC",
        "year": 2023,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193",
        "summary": "Khuyến cáo quản lý toàn diện yếu tố lối sống, hạn chế rượu bia và duy trì dinh dưỡng lành mạnh cho tim mạch ở bệnh nhân rung nhĩ."
      },
      {
        "id": "cleveland-dietary-af",
        "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
        "sourceType": "OTHER",
        "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
        "journal": "Cleveland Clinic Health Essentials",
        "year": 2023,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
      }
    ],
    "name": "Rau chân vịt luộc",
    "categoryId": "vegetables",
    "familyId": "rau-ch-n-v-t",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "spinach-raw",
    "group": "VEGETABLE",
    "groupName": "Rau củ",
    "foodName": "Rau chân vịt",
    "foodNameSpecific": "Rau chân vịt tươi sống",
    "description": "Lá rau non tươi giòn, thích hợp dùng làm salad hoặc sinh tố xanh.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Giàu vi chất tự nhiên chưa qua nhiệt",
    "guidanceReason": "Bảo toàn tối đa vitamin C, folate và các chất chống oxy hóa tự nhiên.",
    "medicationContext": "Người dùng thuốc chống đông warfarin cần duy trì lượng ăn ổn định như với rau chân vịt nấu chín.",
    "sourceFoodCode": "72125100",
    "sourceDescription": "Spinach, raw",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 27,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 2.9,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 2.4,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 1.6,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 0.4,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0.6,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0.2,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 111,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 582,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 93,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 482.9,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "vitamin_k",
      "potassium",
      "magnesium",
      "fiber"
    ],
    "evidenceSources": [
      {
        "id": "cleveland-dietary-af",
        "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
        "sourceType": "OTHER",
        "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
        "journal": "Cleveland Clinic Health Essentials",
        "year": 2023,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
      }
    ],
    "name": "Rau chân vịt tươi sống",
    "categoryId": "vegetables",
    "familyId": "rau-ch-n-v-t",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "broccoli-cooked",
    "group": "VEGETABLE",
    "groupName": "Rau củ",
    "foodName": "Bông cải xanh",
    "foodNameSpecific": "Bông cải xanh luộc",
    "description": "Súp lơ xanh luộc chín tới, giàu chất xơ, vitamin C, kali và sulforaphane.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Nguồn chất xơ và vi chất tự nhiên dồi dào",
    "guidanceReason": "Hàm lượng natri rất thấp, hỗ trợ sức khỏe thành mạch và tiêu hóa.",
    "sourceFoodCode": "72201190",
    "sourceDescription": "Broccoli, cooked, from restaurant",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 77,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 2.6,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 6.2,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 2.4,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 1.4,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 4.7,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 1.2,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 1.5,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 1.3,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 3,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 241,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 300,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 21,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 104.3,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "fiber",
      "potassium",
      "vitamin_k",
      "energy"
    ],
    "evidenceSources": [
      {
        "id": "aha-lifestyle-2020",
        "title": "Lifestyle and Risk Factor Modification for Reduction of Atrial Fibrillation: A Scientific Statement From the American Heart Association",
        "sourceType": "GUIDELINE",
        "authors": "Chung MK, Eckhardt LL, Chen LY, et al.",
        "journal": "Circulation",
        "year": 2020,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000748",
        "summary": "Tổng hợp bằng chứng về giảm cân, kiểm soát huyết áp, chế độ ăn Địa Trung Hải và các yếu tố kích hoạt kịch phát AF."
      }
    ],
    "name": "Bông cải xanh luộc",
    "categoryId": "vegetables",
    "familyId": "b-ng-c-i-xanh",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "tomato-raw",
    "group": "VEGETABLE",
    "groupName": "Rau củ",
    "foodName": "Cà chua",
    "foodNameSpecific": "Cà chua tươi",
    "description": "Cà chua chín mọng ăn sống hoặc nấu canh, giàu lycopene và kali.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Giàu kali và chất chống oxy hóa tự nhiên",
    "guidanceReason": "Rất ít năng lượng, không chất béo bão hòa, thích hợp dùng hàng ngày.",
    "sourceFoodCode": "74101000",
    "sourceDescription": "Tomatoes, raw",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 20,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 0.8,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 4,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 1.2,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 2.6,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0.3,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0.1,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 4,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 226,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 10,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 7.5,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "potassium",
      "energy",
      "fiber",
      "sodium"
    ],
    "evidenceSources": [
      {
        "id": "cleveland-dietary-af",
        "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
        "sourceType": "OTHER",
        "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
        "journal": "Cleveland Clinic Health Essentials",
        "year": 2023,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
      }
    ],
    "name": "Cà chua tươi",
    "categoryId": "vegetables",
    "familyId": "c--chua",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "carrot-raw",
    "group": "VEGETABLE",
    "groupName": "Rau củ",
    "foodName": "Cà rốt",
    "foodNameSpecific": "Cà rốt tươi",
    "description": "Củ cà rốt giòn ngọt tự nhiên, giàu chất xơ và beta-carotene.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Rau củ củ lành mạnh, vị ngọt thanh tự nhiên",
    "guidanceReason": "Nguồn chất xơ tốt hỗ trợ điều hòa đường huyết và tiêu hóa.",
    "sourceFoodCode": "73101010",
    "sourceDescription": "Carrots, raw",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 44,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 0.9,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 9.7,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 2.9,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 4.8,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0.2,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0.1,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 75,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 258,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 12,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 11.3,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "fiber",
      "potassium",
      "energy",
      "sugars"
    ],
    "evidenceSources": [
      {
        "id": "aha-lifestyle-2020",
        "title": "Lifestyle and Risk Factor Modification for Reduction of Atrial Fibrillation: A Scientific Statement From the American Heart Association",
        "sourceType": "GUIDELINE",
        "authors": "Chung MK, Eckhardt LL, Chen LY, et al.",
        "journal": "Circulation",
        "year": 2020,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000748",
        "summary": "Tổng hợp bằng chứng về giảm cân, kiểm soát huyết áp, chế độ ăn Địa Trung Hải và các yếu tố kích hoạt kịch phát AF."
      }
    ],
    "name": "Cà rốt tươi",
    "categoryId": "vegetables",
    "familyId": "c--r-t",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "banana-raw",
    "group": "FRUIT",
    "groupName": "Trái cây",
    "foodName": "Chuối",
    "foodNameSpecific": "Chuối chín tươi",
    "description": "Trái cây nhiệt đới ngọt dịu, nổi tiếng là nguồn bổ sung kali và magie tự nhiên dễ hấp thu.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Nguồn khoáng chất điện giải tự nhiên",
    "guidanceReason": "Cung cấp lượng kali và magie tự nhiên dồi dào, hỗ trợ cân bằng điện giải cho người ăn uống hàng ngày.",
    "cardiovascularContext": "Chế độ ăn đủ kali từ rau củ quả hỗ trợ đào thải natri qua thận và duy trì mức huyết áp khỏe mạnh.",
    "afContext": "Kali và magie là các chất điện giải có vai trò trong hoạt động điện bình thường của tim.",
    "sourceFoodCode": "63107010",
    "sourceDescription": "Banana, raw",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 97,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 0.7,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 22.7,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 1.7,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 15.8,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0.3,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0.1,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 0,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 326,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 28,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0.1,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "potassium",
      "magnesium",
      "fiber",
      "energy"
    ],
    "evidenceSources": [
      {
        "id": "acc-aha-2023",
        "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation",
        "sourceType": "GUIDELINE",
        "authors": "Joglar JA, Chung MK, Armbruster AL, et al.",
        "journal": "Circulation / JACC",
        "year": 2023,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193",
        "summary": "Khuyến cáo quản lý toàn diện yếu tố lối sống, hạn chế rượu bia và duy trì dinh dưỡng lành mạnh cho tim mạch ở bệnh nhân rung nhĩ."
      },
      {
        "id": "cleveland-dietary-af",
        "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
        "sourceType": "OTHER",
        "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
        "journal": "Cleveland Clinic Health Essentials",
        "year": 2023,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
      }
    ],
    "name": "Chuối chín tươi",
    "categoryId": "fruits",
    "familyId": "chu-i",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "apple-raw",
    "group": "FRUIT",
    "groupName": "Trái cây",
    "foodName": "Táo",
    "foodNameSpecific": "Táo tươi cả vỏ",
    "description": "Táo tươi giòn ngọt, giàu chất xơ hòa tan pectin và các hợp chất flavonoid.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Giàu chất xơ hòa tan tốt cho mạch máu",
    "guidanceReason": "Chất xơ pectin trong táo hỗ trợ giảm hấp thu cholesterol từ đường tiêu hóa.",
    "sourceFoodCode": "63101000",
    "sourceDescription": "Apple, raw",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 61,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 0.2,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 14.8,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 2.1,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 12.1,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0.2,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0.1,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 0,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 104,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 5,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 2.2,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "fiber",
      "energy",
      "potassium",
      "sugars"
    ],
    "evidenceSources": [
      {
        "id": "aha-lifestyle-2020",
        "title": "Lifestyle and Risk Factor Modification for Reduction of Atrial Fibrillation: A Scientific Statement From the American Heart Association",
        "sourceType": "GUIDELINE",
        "authors": "Chung MK, Eckhardt LL, Chen LY, et al.",
        "journal": "Circulation",
        "year": 2020,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000748",
        "summary": "Tổng hợp bằng chứng về giảm cân, kiểm soát huyết áp, chế độ ăn Địa Trung Hải và các yếu tố kích hoạt kịch phát AF."
      }
    ],
    "name": "Táo tươi cả vỏ",
    "categoryId": "fruits",
    "familyId": "t-o",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "orange-raw",
    "group": "FRUIT",
    "groupName": "Trái cây",
    "foodName": "Cam",
    "foodNameSpecific": "Cam tươi",
    "description": "Cam tươi mọng nước, giàu vitamin C và chất chống oxy hóa tự nhiên.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Bổ sung nước, vitamin và kali",
    "guidanceReason": "Ưu tiên ăn nguyên múi cam thay vì chỉ uống nước ép để nhận được trọn vẹn chất xơ hòa tan.",
    "sourceFoodCode": "61119010",
    "sourceDescription": "Orange, raw",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 50,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 0.9,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 11.8,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 2.2,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 9,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 4,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 174,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 10,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "potassium",
      "fiber",
      "energy",
      "sugars"
    ],
    "evidenceSources": [
      {
        "id": "cleveland-dietary-af",
        "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
        "sourceType": "OTHER",
        "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
        "journal": "Cleveland Clinic Health Essentials",
        "year": 2023,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
      }
    ],
    "name": "Cam tươi",
    "categoryId": "fruits",
    "familyId": "cam",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "avocado-raw",
    "group": "FRUIT",
    "groupName": "Trái cây",
    "foodName": "Quả bơ",
    "foodNameSpecific": "Quả bơ tươi",
    "description": "Trái bơ giàu axit béo không bão hòa đơn (axit oleic) lành mạnh, giàu kali và magie.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Chất béo lành mạnh thực vật",
    "guidanceReason": "Chứa lượng chất béo chưa bão hòa đơn cao kết hợp lượng kali vượt trội so với hầu hết các loại trái cây.",
    "cardiovascularContext": "Chất béo chưa bão hòa đơn có tác dụng hỗ trợ cải thiện chỉ số mỡ máu khi thay thế cho mỡ động vật giàu chất béo bão hòa.",
    "sourceFoodCode": "63105010",
    "sourceDescription": "Avocado, raw",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 160,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 2,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 8.5,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 6.7,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 0.7,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 14.7,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 2.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 9.8,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 1.8,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 7,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 485,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 29,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 21,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "fat_monounsaturated",
      "potassium",
      "fiber",
      "magnesium"
    ],
    "evidenceSources": [
      {
        "id": "predimed-trial",
        "title": "Extravirgin olive oil consumption reduces risk of atrial fibrillation: the PREDIMED trial",
        "sourceType": "RCT",
        "authors": "Martínez-González MÁ, Toledo E, Arós F, et al.",
        "journal": "Circulation",
        "year": 2014,
        "url": "https://pubmed.ncbi.nlm.nih.gov/24787471/",
        "summary": "Thử nghiệm ngẫu nhiên có đối chứng cho thấy chế độ ăn Địa Trung Hải giàu chất béo chưa bão hòa có liên quan đến việc giảm nguy cơ AF."
      },
      {
        "id": "aha-lifestyle-2020",
        "title": "Lifestyle and Risk Factor Modification for Reduction of Atrial Fibrillation: A Scientific Statement From the American Heart Association",
        "sourceType": "GUIDELINE",
        "authors": "Chung MK, Eckhardt LL, Chen LY, et al.",
        "journal": "Circulation",
        "year": 2020,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000748",
        "summary": "Tổng hợp bằng chứng về giảm cân, kiểm soát huyết áp, chế độ ăn Địa Trung Hải và các yếu tố kích hoạt kịch phát AF."
      }
    ],
    "name": "Quả bơ tươi",
    "categoryId": "fruits",
    "familyId": "qu--b-",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "almonds",
    "group": "LEGUMES_NUTS",
    "groupName": "Đậu & Hạt dinh dưỡng",
    "foodName": "Hạt hạnh nhân",
    "foodNameSpecific": "Hạt hạnh nhân sấy mộc",
    "description": "Hạnh nhân sấy mộc không muối đường, giàu magie, vitamin E và đạm thực vật.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Món ăn nhẹ giàu magie và đạm thực vật",
    "guidanceReason": "Hàm lượng magie tự nhiên cao (trên 250mg/100g) cùng chất xơ và chất béo lành mạnh.",
    "afContext": "Magie có vai trò hỗ trợ ổn định dẫn truyền thần kinh cơ và hoạt động điện bình thường của tim.",
    "sourceFoodCode": "42100100",
    "sourceDescription": "Almonds, NFS",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 598,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 21,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 21,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 10.9,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 4.9,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 52.5,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 4.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 33.1,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 13,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 3,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 713,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 279,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "magnesium",
      "protein",
      "fiber",
      "potassium"
    ],
    "evidenceSources": [
      {
        "id": "predimed-trial",
        "title": "Extravirgin olive oil consumption reduces risk of atrial fibrillation: the PREDIMED trial",
        "sourceType": "RCT",
        "authors": "Martínez-González MÁ, Toledo E, Arós F, et al.",
        "journal": "Circulation",
        "year": 2014,
        "url": "https://pubmed.ncbi.nlm.nih.gov/24787471/",
        "summary": "Thử nghiệm ngẫu nhiên có đối chứng cho thấy chế độ ăn Địa Trung Hải giàu chất béo chưa bão hòa có liên quan đến việc giảm nguy cơ AF."
      },
      {
        "id": "cleveland-dietary-af",
        "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
        "sourceType": "OTHER",
        "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
        "journal": "Cleveland Clinic Health Essentials",
        "year": 2023,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
      }
    ],
    "name": "Hạt hạnh nhân sấy mộc",
    "categoryId": "legumes-nuts",
    "familyId": "h-t-h-nh-nh-n",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "peanuts",
    "group": "LEGUMES_NUTS",
    "groupName": "Đậu & Hạt dinh dưỡng",
    "foodName": "Đậu phộng",
    "foodNameSpecific": "Đậu phộng rang mộc (không muối)",
    "description": "Đậu phộng rang không thêm muối, giàu protein thực vật và niacin.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Nguồn đạm và khoáng chất thực vật tiết kiệm",
    "guidanceReason": "Giàu protein thực vật và khoáng chất. Nên dùng loại rang không muối để tránh nạp thừa natri.",
    "sourceFoodCode": "42111000",
    "sourceDescription": "Peanuts, NFS",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 587,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 24.4,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 21.3,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 8.4,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 4.9,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 49.7,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 7.7,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 26.2,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 9.8,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 410,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 634,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 178,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "protein",
      "magnesium",
      "fiber",
      "potassium"
    ],
    "evidenceSources": [
      {
        "id": "aha-lifestyle-2020",
        "title": "Lifestyle and Risk Factor Modification for Reduction of Atrial Fibrillation: A Scientific Statement From the American Heart Association",
        "sourceType": "GUIDELINE",
        "authors": "Chung MK, Eckhardt LL, Chen LY, et al.",
        "journal": "Circulation",
        "year": 2020,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000748",
        "summary": "Tổng hợp bằng chứng về giảm cân, kiểm soát huyết áp, chế độ ăn Địa Trung Hải và các yếu tố kích hoạt kịch phát AF."
      }
    ],
    "name": "Đậu phộng rang mộc (không muối)",
    "categoryId": "legumes-nuts",
    "familyId": "--u-ph-ng",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "chickpeas",
    "group": "LEGUMES_NUTS",
    "groupName": "Đậu & Hạt dinh dưỡng",
    "foodName": "Đậu gà",
    "foodNameSpecific": "Đậu gà nấu chín",
    "description": "Hạt đậu gà nấu mềm, giàu chất xơ hòa tan và đạm nạc thực vật.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Protein thực vật tuyệt vời cho sức khỏe tim mạch",
    "guidanceReason": "Chỉ số đường huyết thấp, giàu chất xơ hòa tan giúp hỗ trợ kiểm soát mỡ máu.",
    "sourceFoodCode": "41301990",
    "sourceDescription": "Chickpeas, NFS",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 211,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 8.2,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 25.5,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 7.1,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 4.5,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 8.9,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 1.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 3.3,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 3.6,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 222,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 270,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 45,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 10.3,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "fiber",
      "protein",
      "potassium",
      "energy"
    ],
    "evidenceSources": [
      {
        "id": "acc-aha-2023",
        "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation",
        "sourceType": "GUIDELINE",
        "authors": "Joglar JA, Chung MK, Armbruster AL, et al.",
        "journal": "Circulation / JACC",
        "year": 2023,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193",
        "summary": "Khuyến cáo quản lý toàn diện yếu tố lối sống, hạn chế rượu bia và duy trì dinh dưỡng lành mạnh cho tim mạch ở bệnh nhân rung nhĩ."
      }
    ],
    "name": "Đậu gà nấu chín",
    "categoryId": "legumes-nuts",
    "familyId": "--u-g-",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "soybeans",
    "group": "LEGUMES_NUTS",
    "groupName": "Đậu & Hạt dinh dưỡng",
    "foodName": "Đậu nành",
    "foodNameSpecific": "Đậu nành luộc chín",
    "description": "Nguồn đạm thực vật hoàn chỉnh chứa đầy đủ axit amin thiết yếu.",
    "guidance": "PRIORITIZE",
    "guidanceTitle": "Đạm hoàn chỉnh thay thế thịt đỏ",
    "guidanceReason": "Hàm lượng kali và đạm cao, rất phù hợp trong chế độ ăn giảm bớt thịt đỏ nhiều mỡ.",
    "sourceFoodCode": "41107010",
    "sourceDescription": "Soybeans, cooked",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 218,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 16.9,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 7.8,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 5.6,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 2.8,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 14.8,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 2.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 4.6,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 7.2,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 217,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 479,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 80,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 24.4,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "protein",
      "potassium",
      "magnesium",
      "fiber"
    ],
    "evidenceSources": [
      {
        "id": "aha-lifestyle-2020",
        "title": "Lifestyle and Risk Factor Modification for Reduction of Atrial Fibrillation: A Scientific Statement From the American Heart Association",
        "sourceType": "GUIDELINE",
        "authors": "Chung MK, Eckhardt LL, Chen LY, et al.",
        "journal": "Circulation",
        "year": 2020,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000748",
        "summary": "Tổng hợp bằng chứng về giảm cân, kiểm soát huyết áp, chế độ ăn Địa Trung Hải và các yếu tố kích hoạt kịch phát AF."
      }
    ],
    "name": "Đậu nành luộc chín",
    "categoryId": "legumes-nuts",
    "familyId": "--u-n-nh",
    "primaryGuidanceType": "PRIORITIZE",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "coffee-brewed",
    "group": "BEVERAGES_CAUTION",
    "groupName": "Đồ uống cần theo dõi",
    "foodName": "Cà phê",
    "foodNameSpecific": "Cà phê phin / pha máy nguyên chất",
    "description": "Cà phê đen nguyên chất không thêm đường sữa, chứa caffeine và chất chống oxy hóa tự nhiên.",
    "guidance": "CAUTION",
    "guidanceTitle": "Lắng nghe phản ứng nhịp tim của cơ thể",
    "guidanceReason": "Caffeine không cần phải tránh hoàn toàn ở tất cả người có rung nhĩ. Nhiều nghiên cứu cho thấy lượng caffeine vừa phải (1-2 tách mỗi ngày) thường không làm khởi phát cơn nhịp nhanh, tuy nhiên một số người có thể nhạy cảm hơn.",
    "cardiovascularContext": "Cà phê nguyên chất không thêm đường sữa chứa các chất chống oxy hóa tự nhiên và thường an toàn với hệ tim mạch ở liều lượng hợp lý.",
    "afContext": "Nếu bạn nhận thấy nhịp tim đập nhanh hoặc cảm giác hồi hộp, đánh trống ngực sau khi uống cà phê, hãy giảm lượng dùng hoặc chuyển sang loại đã khử caffeine (decaf).",
    "sourceFoodCode": "92101000",
    "sourceDescription": "Coffee, brewed",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 1,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 0.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 2,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 49,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 3,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0.1,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 40,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "caffeine",
      "energy",
      "potassium",
      "sodium"
    ],
    "evidenceSources": [
      {
        "id": "acc-aha-2023",
        "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation",
        "sourceType": "GUIDELINE",
        "authors": "Joglar JA, Chung MK, Armbruster AL, et al.",
        "journal": "Circulation / JACC",
        "year": 2023,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193",
        "summary": "Khuyến cáo quản lý toàn diện yếu tố lối sống, hạn chế rượu bia và duy trì dinh dưỡng lành mạnh cho tim mạch ở bệnh nhân rung nhĩ."
      },
      {
        "id": "coffee-af-meta-2021",
        "title": "Coffee and Caffeine Consumption and Risk of Atrial Fibrillation: A Systematic Review and Meta-Analysis",
        "sourceType": "META_ANALYSIS",
        "authors": "Grobbee DE, et al.",
        "journal": "European Journal of Preventive Cardiology",
        "year": 2021,
        "url": "https://pubmed.ncbi.nlm.nih.gov/39149585/",
        "summary": "Tiêu thụ caffeine ở mức độ vừa phải (1-3 tách cà phê mỗi ngày) không liên quan đến tăng nguy cơ rung nhĩ trong dân số chung."
      },
      {
        "id": "cleveland-dietary-af",
        "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
        "sourceType": "OTHER",
        "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
        "journal": "Cleveland Clinic Health Essentials",
        "year": 2023,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
      }
    ],
    "name": "Cà phê phin / pha máy nguyên chất",
    "categoryId": "beverages-caution",
    "familyId": "c--ph-",
    "primaryGuidanceType": "CAUTION",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "tea-brewed",
    "group": "BEVERAGES_CAUTION",
    "groupName": "Đồ uống cần theo dõi",
    "foodName": "Trà xanh",
    "foodNameSpecific": "Trà xanh pha ấm nóng",
    "description": "Trà xanh giàu polyphenol (EGCG) và có hàm lượng caffeine thấp hơn cà phê.",
    "guidance": "CAUTION",
    "guidanceTitle": "Hàm lượng caffeine nhẹ, theo dõi sự nhạy cảm cá nhân",
    "guidanceReason": "Lượng caffeine trong trà xanh chỉ bằng khoảng 1/4 so với cà phê, giàu chất chống oxy hóa nhưng người có nhịp tim nhạy cảm vẫn nên uống điều độ.",
    "sourceFoodCode": "92301000",
    "sourceDescription": "Tea, hot, leaf, green",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 1,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 0.2,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 12,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 27,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 1,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 2,
        "unit": "mg"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 0,
        "unit": "g"
      }
    ],
    "highlightNutrientCodes": [
      "caffeine",
      "potassium",
      "energy"
    ],
    "evidenceSources": [
      {
        "id": "coffee-af-meta-2021",
        "title": "Coffee and Caffeine Consumption and Risk of Atrial Fibrillation: A Systematic Review and Meta-Analysis",
        "sourceType": "META_ANALYSIS",
        "authors": "Grobbee DE, et al.",
        "journal": "European Journal of Preventive Cardiology",
        "year": 2021,
        "url": "https://pubmed.ncbi.nlm.nih.gov/39149585/",
        "summary": "Tiêu thụ caffeine ở mức độ vừa phải (1-3 tách cà phê mỗi ngày) không liên quan đến tăng nguy cơ rung nhĩ trong dân số chung."
      }
    ],
    "name": "Trà xanh pha ấm nóng",
    "categoryId": "beverages-caution",
    "familyId": "tr--xanh",
    "primaryGuidanceType": "CAUTION",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "beer-regular",
    "group": "BEVERAGES_ALCOHOL",
    "groupName": "Đồ uống có cồn",
    "foodName": "Bia",
    "foodNameSpecific": "Bia truyền thống",
    "description": "Đồ uống có cồn lên men từ ngũ cốc và hoa bia, chứa khoảng 4.5 - 5% cồn.",
    "guidance": "LIMIT",
    "guidanceTitle": "Nên hạn chế tối đa",
    "guidanceReason": "Việc uống rượu bia có liên quan đến nguy cơ xuất hiện hoặc tái phát rung nhĩ, đặc biệt ở người uống thường xuyên hoặc uống lượng nhiều.",
    "cardiovascularContext": "Cồn có thể gây tăng huyết áp, rối loạn chức năng co bóp thất trái và tương tác bất lợi với các thuốc điều trị tim mạch.",
    "afContext": "Hướng dẫn của Hiệp hội Tim mạch Hoa Kỳ (ACC/AHA 2023) khuyến nghị bệnh nhân rung nhĩ nên kiêng hoặc giảm tối đa việc uống thức uống có cồn.",
    "sourceFoodCode": "93101000",
    "sourceDescription": "Beer",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 43,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 0.5,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 3.6,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 4,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 27,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 6,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 3.9,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "alcohol",
      "energy",
      "carbohydrate",
      "sodium"
    ],
    "evidenceSources": [
      {
        "id": "acc-aha-2023",
        "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation",
        "sourceType": "GUIDELINE",
        "authors": "Joglar JA, Chung MK, Armbruster AL, et al.",
        "journal": "Circulation / JACC",
        "year": 2023,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193",
        "summary": "Khuyến cáo quản lý toàn diện yếu tố lối sống, hạn chế rượu bia và duy trì dinh dưỡng lành mạnh cho tim mạch ở bệnh nhân rung nhĩ."
      },
      {
        "id": "alcohol-af-review",
        "title": "Alcohol Consumption and Risk of Atrial Fibrillation: A Dose-Response Meta-Analysis",
        "sourceType": "SYSTEMATIC_REVIEW",
        "authors": "Larsson SC, Drca N, Wolk A.",
        "journal": "Journal of the American College of Cardiology",
        "year": 2014,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Nguy cơ xuất hiện hoặc tái phát AF tăng theo liều lượng cồn tiêu thụ, ngay cả ở mức độ uống vừa phải đến nhiều."
      },
      {
        "id": "aha-lifestyle-2020",
        "title": "Lifestyle and Risk Factor Modification for Reduction of Atrial Fibrillation: A Scientific Statement From the American Heart Association",
        "sourceType": "GUIDELINE",
        "authors": "Chung MK, Eckhardt LL, Chen LY, et al.",
        "journal": "Circulation",
        "year": 2020,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000748",
        "summary": "Tổng hợp bằng chứng về giảm cân, kiểm soát huyết áp, chế độ ăn Địa Trung Hải và các yếu tố kích hoạt kịch phát AF."
      }
    ],
    "name": "Bia truyền thống",
    "categoryId": "beverages-alcohol",
    "familyId": "bia",
    "primaryGuidanceType": "LIMIT",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "wine-red",
    "group": "BEVERAGES_ALCOHOL",
    "groupName": "Đồ uống có cồn",
    "foodName": "Rượu vang",
    "foodNameSpecific": "Rượu vang đỏ",
    "description": "Rượu lên men từ nho với nồng độ cồn khoảng 12 - 14%.",
    "guidance": "LIMIT",
    "guidanceTitle": "Nên hạn chế ở người có triệu chứng nhịp tim",
    "guidanceReason": "Dù có chứa polyphenol, cồn trong rượu vang vẫn là yếu tố kích thích có thể làm xuất hiện cơn rung nhĩ kịch phát ở người nhạy cảm.",
    "cardiovascularContext": "Lợi ích tim mạch của chất chống oxy hóa không bù đắp được rủi ro gây rối loạn nhịp và tăng huyết áp do nồng độ cồn mang lại.",
    "sourceFoodCode": "93401010",
    "sourceDescription": "Wine, red",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 85,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 0.1,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 2.6,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 0.6,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 0,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 4,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 127,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 12,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 0.4,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 10.6,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 0,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "alcohol",
      "energy",
      "carbohydrate",
      "potassium"
    ],
    "evidenceSources": [
      {
        "id": "acc-aha-2023",
        "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation",
        "sourceType": "GUIDELINE",
        "authors": "Joglar JA, Chung MK, Armbruster AL, et al.",
        "journal": "Circulation / JACC",
        "year": 2023,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193",
        "summary": "Khuyến cáo quản lý toàn diện yếu tố lối sống, hạn chế rượu bia và duy trì dinh dưỡng lành mạnh cho tim mạch ở bệnh nhân rung nhĩ."
      },
      {
        "id": "alcohol-af-review",
        "title": "Alcohol Consumption and Risk of Atrial Fibrillation: A Dose-Response Meta-Analysis",
        "sourceType": "SYSTEMATIC_REVIEW",
        "authors": "Larsson SC, Drca N, Wolk A.",
        "journal": "Journal of the American College of Cardiology",
        "year": 2014,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Nguy cơ xuất hiện hoặc tái phát AF tăng theo liều lượng cồn tiêu thụ, ngay cả ở mức độ uống vừa phải đến nhiều."
      }
    ],
    "name": "Rượu vang đỏ",
    "categoryId": "beverages-alcohol",
    "familyId": "r--u-vang",
    "primaryGuidanceType": "LIMIT",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  },
  {
    "id": "beef-sausage",
    "group": "PROCESSED_FOODS",
    "groupName": "Thực phẩm chế biến sẵn & Nhiều muối",
    "foodName": "Xúc xích",
    "foodNameSpecific": "Xúc xích bò xông khói",
    "description": "Thịt chế biến sẵn qua xử lý tẩm ướp và xông khói, có lượng muối natri và chất béo bão hòa rất cao.",
    "guidance": "LIMIT",
    "guidanceTitle": "Nên hạn chế trong chế độ ăn hàng ngày",
    "guidanceReason": "Lượng natri rất cao (trên 800mg/100g) cùng chất béo bão hòa cao làm tăng gánh nặng lên huyết áp.",
    "cardiovascularContext": "Tiêu thụ nhiều thịt chế biến sẵn liên quan trực tiếp đến tăng huyết áp và xơ vữa động mạch.",
    "sourceFoodCode": "25220105",
    "sourceDescription": "Beef sausage",
    "nutrients": [
      {
        "nutrientCode": "energy",
        "name": "Năng lượng",
        "amount": 341,
        "unit": "kcal",
        "isKey": true
      },
      {
        "nutrientCode": "protein",
        "name": "Chất đạm (Protein)",
        "amount": 13.3,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "carbohydrate",
        "name": "Carbohydrate",
        "amount": 3.4,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fiber",
        "name": "Chất xơ tiêu hóa",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "sugars",
        "name": "Đường tổng",
        "amount": 1,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_total",
        "name": "Tổng chất béo",
        "amount": 28.7,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_saturated",
        "name": "Chất béo bão hòa",
        "amount": 11.3,
        "unit": "g",
        "isKey": true
      },
      {
        "nutrientCode": "fat_monounsaturated",
        "name": "Chất béo không bão hòa đơn",
        "amount": 12.7,
        "unit": "g"
      },
      {
        "nutrientCode": "fat_polyunsaturated",
        "name": "Chất béo không bão hòa đa",
        "amount": 1.9,
        "unit": "g"
      },
      {
        "nutrientCode": "cholesterol",
        "name": "Cholesterol",
        "amount": 61,
        "unit": "mg"
      },
      {
        "nutrientCode": "sodium",
        "name": "Natri (Sodium)",
        "amount": 866,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "potassium",
        "name": "Kali (Potassium)",
        "amount": 263,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "magnesium",
        "name": "Magie (Magnesium)",
        "amount": 20,
        "unit": "mg",
        "isKey": true
      },
      {
        "nutrientCode": "vitamin_k",
        "name": "Vitamin K",
        "amount": 2.8,
        "unit": "µg"
      },
      {
        "nutrientCode": "caffeine",
        "name": "Caffeine",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "alcohol",
        "name": "Cồn (Alcohol)",
        "amount": 0,
        "unit": "g"
      },
      {
        "nutrientCode": "epa",
        "name": "Omega-3 EPA",
        "amount": 0,
        "unit": "mg"
      },
      {
        "nutrientCode": "dha",
        "name": "Omega-3 DHA",
        "amount": 2,
        "unit": "mg"
      }
    ],
    "highlightNutrientCodes": [
      "sodium",
      "fat_saturated",
      "fat_total",
      "energy"
    ],
    "evidenceSources": [
      {
        "id": "acc-aha-2023",
        "title": "2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation",
        "sourceType": "GUIDELINE",
        "authors": "Joglar JA, Chung MK, Armbruster AL, et al.",
        "journal": "Circulation / JACC",
        "year": 2023,
        "url": "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001193",
        "summary": "Khuyến cáo quản lý toàn diện yếu tố lối sống, hạn chế rượu bia và duy trì dinh dưỡng lành mạnh cho tim mạch ở bệnh nhân rung nhĩ."
      },
      {
        "id": "cleveland-dietary-af",
        "title": "Managing Your Atrial Fibrillation: What to Eat and Avoid",
        "sourceType": "OTHER",
        "authors": "Cleveland Clinic Heart, Vascular & Thoracic Institute",
        "journal": "Cleveland Clinic Health Essentials",
        "year": 2023,
        "url": "https://health.clevelandclinic.org/managing-your-atrial-fibrillation-what-to-eat-and-avoid",
        "summary": "Hướng dẫn thực hành lâm sàng cho bệnh nhân rung nhĩ về natri, kali, magie, caffeine và tương tác thuốc kháng đông."
      }
    ],
    "name": "Xúc xích bò xông khói",
    "categoryId": "processed-foods",
    "familyId": "x-c-x-ch",
    "primaryGuidanceType": "LIMIT",
    "servingReference": {
      "amount": 100,
      "unit": "g"
    }
  }
]

export function getFoodById(id: string): Food | undefined {
  return mockFoods.find((f) => f.id === id)
}

export function getFoodsByGroup(groupId: string): Food[] {
  return mockFoods.filter((f) => f.group === groupId || f.categoryId === groupId)
}

// Alias for compatibility
export const getFoodsByCategoryId = getFoodsByGroup

export function getFoodGroupById(idOrSlug: string): FoodGroup | undefined {
  return mockFoodGroups.find((g) => g.id === idOrSlug || g.slug === idOrSlug)
}

// Alias for compatibility
export const getCategoryById = getFoodGroupById

/**
 * Lấy danh sách các 'foodName' duy nhất thuộc một nhóm (ví dụ: Cá hồi, Cá ngừ, Cá thu)
 */
export function getFoodNamesByGroup(groupId: string): string[] {
  const list = getFoodsByGroup(groupId)
  return Array.from(new Set(list.map((f) => f.foodName)))
}

/**
 * Lấy tất cả biến thể 'foodNameSpecific' của một 'foodName' cụ thể (ví dụ: tất cả loại Sữa hoặc tất cả loại Cá hồi)
 */
export function getFoodsByFoodName(foodName: string): Food[] {
  return mockFoods.filter((f) => f.foodName.toLowerCase() === foodName.toLowerCase())
}

/**
 * Gom nhóm các biến thể của một foodName theo nhãn Guidance:
 * - PRIORITIZE: []
 * - LIMIT: []
 * - CAUTION: []
 */
export function getFoodsGroupedByGuidance(foodName: string): Record<GuidanceType, Food[]> {
  const variants = getFoodsByFoodName(foodName)
  return {
    PRIORITIZE: variants.filter((f) => f.guidance === 'PRIORITIZE'),
    LIMIT: variants.filter((f) => f.guidance === 'LIMIT'),
    CAUTION: variants.filter((f) => f.guidance === 'CAUTION')
  }
}

export function searchFoods(query: string): Food[] {
  const clean = query.trim().toLowerCase()
  if (!clean) return []
  return mockFoods.filter((f) => {
    return (
      f.foodNameSpecific.toLowerCase().includes(clean) ||
      f.foodName.toLowerCase().includes(clean) ||
      (f.sourceDescription && f.sourceDescription.toLowerCase().includes(clean)) ||
      (f.description && f.description.toLowerCase().includes(clean))
    )
  })
}
