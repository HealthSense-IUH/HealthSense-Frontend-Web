import { useCallback, useEffect, useRef, useState } from "react"
import {
  Edit2,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { parseApiError } from "@/lib/errorHandler"
import { creditsApi } from "@/services/credits.service"
import { CREDIT_PACKAGE_STATUS_CONFIG, formatVndPrice } from "@/constants/credits"
import type {
  AdminCreditPackage,
  CreateAdminCreditPackageRequest,
  CreditPackageStatus,
  UpdateAdminCreditPackageRequest,
} from "@/types/credits"

export function CreditPackagesTab() {
  const { toast } = useToast()

  const [packages, setPackages] = useState<AdminCreditPackage[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createForm, setCreateForm] = useState<CreateAdminCreditPackageRequest>({
    code: "",
    name: "",
    description: "",
    creditQuantity: 5,
    priceVnd: 250000,
  })

  const [editingPackage, setEditingPackage] = useState<AdminCreditPackage | null>(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editForm, setEditForm] = useState<{
    name: string
    description: string
    creditQuantity: number
    priceVnd: number
    status: CreditPackageStatus
  }>({
    name: "",
    description: "",
    creditQuantity: 1,
    priceVnd: 50000,
    status: "INACTIVE",
  })

  // Synchronous lock refs
  const createSubmittingRef = useRef(false)
  const editSubmittingRef = useRef(false)

  // Load packages
  const loadPackages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const res = await creditsApi.adminGetPackages()
      setPackages(res.data || [])
    } catch (err) {
      const parsed = parseApiError(err)
      toast({
        variant: "destructive",
        title: "Lỗi tải danh sách",
        description: parsed.userMessage || "Không thể tải danh sách gói lượt.",
      })
    } finally {
      if (!silent) setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadPackages()
  }, [loadPackages])

  // Filter packages
  const filteredPackages = packages.filter((pkg) => {
    if (statusFilter !== "ALL" && pkg.status !== statusFilter) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchName = pkg.name.toLowerCase().includes(q)
      const matchCode = pkg.code.toLowerCase().includes(q)
      const matchDesc = pkg.description?.toLowerCase().includes(q)
      return matchName || matchCode || matchDesc
    }
    return true
  })

  // Create package submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (createSubmittingRef.current) return

    // Validation
    const codePattern = /^[A-Z0-9_-]{2,80}$/
    if (!codePattern.test(createForm.code.trim())) {
      toast({
        variant: "destructive",
        title: "Mã gói không hợp lệ",
        description: "Mã code chỉ gồm chữ hoa, số, gạch dưới (_) hoặc gạch nối (-), từ 2 đến 80 ký tự.",
      })
      return
    }
    if (!createForm.name.trim() || createForm.name.trim().length > 160) {
      toast({
        variant: "destructive",
        title: "Tên gói không hợp lệ",
        description: "Tên gói không được để trống và tối đa 160 ký tự.",
      })
      return
    }
    if (createForm.creditQuantity <= 0) {
      toast({
        variant: "destructive",
        title: "Số lượt không hợp lệ",
        description: "Số lượt tư vấn trong gói phải lớn hơn 0.",
      })
      return
    }
    if (createForm.priceVnd <= 0) {
      toast({
        variant: "destructive",
        title: "Đơn giá không hợp lệ",
        description: "Đơn giá gói phải lớn hơn 0 VND.",
      })
      return
    }

    createSubmittingRef.current = true
    setCreateSubmitting(true)
    try {
      await creditsApi.adminCreatePackage({
        code: createForm.code.trim().toUpperCase(),
        name: createForm.name.trim(),
        description: createForm.description?.trim() || undefined,
        creditQuantity: Number(createForm.creditQuantity),
        priceVnd: Number(createForm.priceVnd),
      })
      toast({
        title: "Tạo gói thành công",
        description: `Gói "${createForm.name}" đã được tạo ở trạng thái Chờ kích hoạt (INACTIVE).`,
      })
      setIsCreateOpen(false)
      setCreateForm({
        code: "",
        name: "",
        description: "",
        creditQuantity: 5,
        priceVnd: 250000,
      })
      await loadPackages(true)
    } catch (err) {
      const parsed = parseApiError(err)
      toast({
        variant: "destructive",
        title: "Tạo gói thất bại",
        description: parsed.userMessage || "Không thể tạo gói lượt mới.",
      })
    } finally {
      createSubmittingRef.current = false
      setCreateSubmitting(false)
    }
  }

  // Open edit dialog
  const handleOpenEdit = (pkg: AdminCreditPackage) => {
    setEditingPackage(pkg)
    setEditForm({
      name: pkg.name,
      description: pkg.description || "",
      creditQuantity: pkg.creditQuantity,
      priceVnd: pkg.priceVnd,
      status: pkg.status,
    })
  }

  // Edit package submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPackage || editSubmittingRef.current) return

    if (!editForm.name.trim() || editForm.name.trim().length > 160) {
      toast({
        variant: "destructive",
        title: "Tên gói không hợp lệ",
        description: "Tên gói không được để trống và tối đa 160 ký tự.",
      })
      return
    }
    if (editForm.creditQuantity <= 0) {
      toast({
        variant: "destructive",
        title: "Số lượt không hợp lệ",
        description: "Số lượt tư vấn trong gói phải lớn hơn 0.",
      })
      return
    }
    if (editForm.priceVnd <= 0) {
      toast({
        variant: "destructive",
        title: "Đơn giá không hợp lệ",
        description: "Đơn giá gói phải lớn hơn 0 VND.",
      })
      return
    }

    editSubmittingRef.current = true
    setEditSubmitting(true)
    try {
      const payload: UpdateAdminCreditPackageRequest = {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        creditQuantity: Number(editForm.creditQuantity),
        priceVnd: Number(editForm.priceVnd),
        status: editForm.status,
        version: editingPackage.version,
      }

      await creditsApi.adminUpdatePackage(editingPackage.id, payload)
      toast({
        title: "Cập nhật thành công",
        description: `Gói "${editForm.name}" đã được cập nhật.`,
      })
      setEditingPackage(null)
      await loadPackages(true)
    } catch (err: any) {
      const parsed = parseApiError(err)
      const status = err?.response?.status
      const code = err?.response?.data?.code || err?.response?.data?.errorCode

      if (status === 409 || code === 4110) {
        toast({
          variant: "destructive",
          title: "Xung đột phiên bản (Optimistic Locking)",
          description:
            "Gói lượt này vừa được chỉnh sửa bởi quản trị viên khác. Hệ thống đã tự động tải lại dữ liệu mới nhất.",
        })
        await loadPackages(true)
        setEditingPackage(null)
      } else {
        toast({
          variant: "destructive",
          title: "Cập nhật thất bại",
          description: parsed.userMessage || "Không thể cập nhật gói lượt.",
        })
      }
    } finally {
      editSubmittingRef.current = false
      setEditSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Table Card */}
      <Card className="rounded-2xl border shadow-xs">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-bold">Danh mục gói lượt tư vấn</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Tổng cộng {filteredPackages.length} gói ({packages.filter((p) => p.status === "ACTIVE").length} đang mở bán toàn hệ thống)
              </CardDescription>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm mã, tên gói..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[145px] h-9 rounded-xl text-xs">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                    <SelectItem value="ACTIVE">Đang mở bán</SelectItem>
                    <SelectItem value="INACTIVE">Tạm ẩn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadPackages()}
                disabled={loading}
                className="rounded-xl h-9 text-xs gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Làm mới
              </Button>

              <Button
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="rounded-xl h-9 text-xs gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Tạo gói mới
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[140px] font-semibold text-xs">Mã gói</TableHead>
                  <TableHead className="min-w-[180px] font-semibold text-xs">Tên gói</TableHead>
                  <TableHead className="font-semibold text-xs text-center">Số lượt</TableHead>
                  <TableHead className="font-semibold text-xs text-right">Đơn giá</TableHead>
                  <TableHead className="font-semibold text-xs text-center">Trạng thái</TableHead>
                  <TableHead className="font-semibold text-xs text-center">Phiên bản</TableHead>
                  <TableHead className="font-semibold text-xs">Cập nhật lúc</TableHead>
                  <TableHead className="w-[90px] text-right font-semibold text-xs">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && packages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-36 text-center text-muted-foreground text-xs">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                      Đang tải danh sách gói lượt...
                    </TableCell>
                  </TableRow>
                ) : filteredPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-36 text-center text-muted-foreground text-xs">
                      Không tìm thấy gói lượt nào phù hợp với bộ lọc.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPackages.map((pkg) => {
                    const statusConfig = CREDIT_PACKAGE_STATUS_CONFIG[pkg.status]
                    return (
                      <TableRow key={pkg.id} className="hover:bg-muted/20">
                        <TableCell className="font-mono text-xs font-semibold text-primary">
                          {pkg.code}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm text-foreground">{pkg.name}</div>
                          {pkg.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {pkg.description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {pkg.creditQuantity} lượt
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-sm">
                          {formatVndPrice(pkg.priceVnd)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`text-xs font-medium ${statusConfig.className}`}
                          >
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          v{pkg.version}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {pkg.updatedAt || pkg.createdAt
                            ? new Date(pkg.updatedAt || pkg.createdAt!).toLocaleDateString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(pkg)}
                            className="h-8 px-2 text-xs gap-1 hover:text-primary rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Sửa
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Tạo gói lượt mới */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" />
                <DialogTitle className="text-lg font-bold">Tạo gói lượt tư vấn mới</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                Gói mới tạo sẽ mặc định ở trạng thái <strong>Tạm ẩn (INACTIVE)</strong>. Bạn có thể bật bán sau khi kiểm tra thông tin.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-xs font-semibold">
                  Mã code gói <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder="VD: PACK_5_SESSIONS"
                  value={createForm.code}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })
                  }
                  required
                  className="rounded-xl font-mono uppercase text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Chỉ gồm chữ in hoa, số, dấu gạch dưới (_) hoặc gạch ngang (-). Không được thay đổi sau khi tạo.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">
                  Tên gói hiển thị <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="VD: Gói Chăm Sóc Tiêu Chuẩn 5 Lượt"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                  maxLength={160}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="creditQuantity" className="text-xs font-semibold">
                    Số lượt cộng vào ví <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="creditQuantity"
                    type="number"
                    min={1}
                    value={createForm.creditQuantity}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        creditQuantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                      })
                    }
                    required
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="priceVnd" className="text-xs font-semibold">
                    Đơn giá (VND) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="priceVnd"
                    type="number"
                    min={1000}
                    step={1000}
                    value={createForm.priceVnd}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        priceVnd: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    required
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold">
                  Mô tả chi tiết (Tùy chọn)
                </Label>
                <Textarea
                  id="description"
                  placeholder="VD: Phù hợp cho nhu cầu tư vấn định kỳ hàng tháng cùng bác sĩ gia đình..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                  maxLength={1000}
                  className="rounded-xl resize-none text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                disabled={createSubmitting}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createSubmitting}
                className="rounded-xl gap-2 font-semibold shadow-xs"
              >
                {createSubmitting ? "Đang tạo..." : "Xác nhận tạo gói"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Chỉnh sửa gói lượt */}
      <Dialog
        open={Boolean(editingPackage)}
        onOpenChange={(open) => !open && setEditingPackage(null)}
      >
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <form onSubmit={handleEditSubmit}>
            <DialogHeader>
              <div className="flex items-center gap-2 text-primary">
                <Edit2 className="w-5 h-5" />
                <DialogTitle className="text-lg font-bold">Chỉnh sửa gói lượt tư vấn</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                Cập nhật thông tin gói #{editingPackage?.code}. Quá trình lưu áp dụng cơ chế khóa lạc quan (Optimistic Locking v{editingPackage?.version}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mã code gói</Label>
                <Input
                  value={editingPackage?.code || ""}
                  disabled
                  className="rounded-xl font-mono uppercase bg-muted/50 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Mã gói là định danh cố định không thể chỉnh sửa.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-semibold">
                  Tên gói hiển thị <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                  maxLength={160}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-creditQuantity" className="text-xs font-semibold">
                    Số lượt trong gói <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-creditQuantity"
                    type="number"
                    min={1}
                    value={editForm.creditQuantity}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        creditQuantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                      })
                    }
                    required
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-priceVnd" className="text-xs font-semibold">
                    Đơn giá (VND) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="edit-priceVnd"
                    type="number"
                    min={1000}
                    step={1000}
                    value={editForm.priceVnd}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        priceVnd: Math.max(0, parseInt(e.target.value, 10) || 0),
                      })
                    }
                    required
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-status" className="text-xs font-semibold">
                  Trạng thái mở bán <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val: CreditPackageStatus) =>
                    setEditForm({ ...editForm, status: val })
                  }
                >
                  <SelectTrigger id="edit-status" className="rounded-xl text-xs">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="ACTIVE">Mở bán (ACTIVE) - Thành viên có thể mua</SelectItem>
                    <SelectItem value="INACTIVE">Tạm ẩn (INACTIVE) - Ẩn khỏi danh mục mua</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-description" className="text-xs font-semibold">
                  Mô tả chi tiết (Tùy chọn)
                </Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  maxLength={1000}
                  className="rounded-xl resize-none text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingPackage(null)}
                disabled={editSubmitting}
                className="rounded-xl"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={editSubmitting}
                className="rounded-xl gap-2 font-semibold shadow-xs"
              >
                {editSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
