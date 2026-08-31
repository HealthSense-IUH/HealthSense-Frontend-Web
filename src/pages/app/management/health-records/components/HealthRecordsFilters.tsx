import { useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface HealthRecordsFiltersProps {
  onFilterChange: (filters: {
    keyword?: string
    status?: string
    predictionLabel?: string
  }) => void
}

export function HealthRecordsFilters({ onFilterChange }: HealthRecordsFiltersProps) {
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState<string>("ALL")
  const [predictionLabel, setPredictionLabel] = useState<string>("ALL")

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value)
    // Optionally add debounce here if needed, or rely on a search button.
    // For simplicity, we can trigger change immediately, though debounce is better.
  }

  const handleKeywordBlur = () => {
    applyFilters(keyword, status, predictionLabel)
  }
  
  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyFilters(keyword, status, predictionLabel)
    }
  }

  const handleStatusChange = (val: string) => {
    setStatus(val)
    applyFilters(keyword, val, predictionLabel)
  }

  const handlePredictionChange = (val: string) => {
    setPredictionLabel(val)
    applyFilters(keyword, status, val)
  }

  const applyFilters = (k: string, s: string, p: string) => {
    onFilterChange({
      keyword: k || undefined,
      status: s === "ALL" ? undefined : s,
      predictionLabel: p === "ALL" ? undefined : p,
    })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            type="search"
            placeholder="Search records..."
            className="w-full pl-8"
            value={keyword}
            onChange={handleKeywordChange}
            onBlur={handleKeywordBlur}
            onKeyDown={handleKeywordKeyDown}
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="PENDING_UPLOAD">Pending</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={predictionLabel} onValueChange={handlePredictionChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Prediction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Predictions</SelectItem>
            <SelectItem value="NORMAL">Normal</SelectItem>
            <SelectItem value="AFIB">AFib</SelectItem>
            <SelectItem value="UNCERTAIN">Uncertain</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
