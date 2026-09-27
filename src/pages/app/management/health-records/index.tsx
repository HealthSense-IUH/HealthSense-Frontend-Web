import { useState, useEffect, useCallback } from "react"
import { Plus } from "lucide-react"

import { Page, PageBody, PageFooter, PageHeader } from "@/components/layout/page"
import { Button } from "@/components/ui/button"
import { HealthRecordsTable } from "@/pages/app/management/health-records/components/HealthRecordsTable"
import { HealthRecordsFilters } from "@/pages/app/management/health-records/components/HealthRecordsFilters"
import { HealthRecordDetailDialog } from "@/pages/app/management/health-records/components/HealthRecordDetailDialog"
import { HealthRecordCreateDialog } from "@/pages/app/management/health-records/components/HealthRecordCreateDialog"
import { SystemStatisticsChart } from "@/pages/app/management/health-records/components/SystemStatisticsChart"
import { adminHealthRecordApi } from "@/services"
import type { HealthRecord, GetHealthRecordsParams, PaginatedResponse, HealthRecordStatus, PredictionLabel } from "@/types/health-record"

interface RecordFilters {
  keyword?: string
  status?: string
  predictionLabel?: string
}

export default function AdminHealthRecordsPage() {
  const [data, setData] = useState<PaginatedResponse<HealthRecord> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Filters & Pagination state
  const [page, setPage] = useState(1)
  const [size] = useState(10)
  const [filters, setFilters] = useState<RecordFilters>({})

  // Dialog state
  const [selectedRecordForView, setSelectedRecordForView] = useState<HealthRecord | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const fetchRecords = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: GetHealthRecordsParams = {
        page,
        size,
        keyword: filters.keyword,
        status: filters.status as HealthRecordStatus,
        predictionLabel: filters.predictionLabel as PredictionLabel,
      }
      const response = await adminHealthRecordApi.getAllHealthRecords(params)
      setData(response.data)
    } catch (error) {
      console.error("Failed to fetch health records:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, size, filters])

  useEffect(() => {
    void fetchRecords()
  }, [fetchRecords])

  const handleFilterChange = (newFilters: RecordFilters) => {
    setFilters(newFilters)
    setPage(1) // Reset to page 1 on filter change
  }

  return (
    <Page>
      <PageHeader
        title="Hồ sơ sức khỏe"
        description="Quản lý hồ sơ sức khỏe của hội viên và các đặc trưng HRV."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Mock Record
          </Button>
        }
      />

      <PageBody>
        <SystemStatisticsChart />

        <HealthRecordsFilters onFilterChange={handleFilterChange} />

        <HealthRecordsTable
          records={data?.content || []}
          isLoading={isLoading}
          onView={setSelectedRecordForView}
        />

        <HealthRecordDetailDialog
          record={selectedRecordForView}
          open={!!selectedRecordForView}
          onOpenChange={(open) => !open && setSelectedRecordForView(null)}
        />

        <HealthRecordCreateDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSuccess={fetchRecords}
        />
      </PageBody>

      <PageFooter>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>
            Showing page {data?.page || 1} of {data?.totalPages || 1}
            {data?.totalElements !== undefined && ` (${data.totalElements} total records)`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!data?.hasMore || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </PageFooter>
    </Page>
  )
}
