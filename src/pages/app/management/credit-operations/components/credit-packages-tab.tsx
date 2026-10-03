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
import { Trans, useTranslation } from "react-i18next"
import i18n, { currentIntlLocale } from "@/lib/i18n"

export function CreditPackagesTab() {
  const { t } = useTranslation("credits")
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
        title: i18n.t("credits:admin.packages.toast.loadErrorTitle"),
        description: parsed.userMessage || i18n.t("credits:data.errors.packages"),
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
        title: t("admin.packages.validation.codeTitle"),
        description: t("admin.packages.validation.codeDescription"),
      })
      return
    }
    if (!createForm.name.trim() || createForm.name.trim().length > 160) {
      toast({
        variant: "destructive",
        title: t("admin.packages.validation.nameTitle"),
        description: t("admin.packages.validation.nameDescription"),
      })
      return
    }
    if (createForm.creditQuantity <= 0) {
      toast({
        variant: "destructive",
        title: t("admin.packages.validation.creditsTitle"),
        description: t("admin.packages.validation.creditsDescription"),
      })
      return
    }
    if (createForm.priceVnd <= 0) {
      toast({
        variant: "destructive",
        title: t("admin.packages.validation.priceTitle"),
        description: t("admin.packages.validation.priceDescription"),
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
        title: t("admin.packages.toast.createdTitle"),
        description: t("admin.packages.toast.createdDescription", { name: createForm.name }),
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
        title: t("admin.packages.toast.createFailedTitle"),
        description: parsed.userMessage || t("admin.packages.toast.createFailedDescription"),
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
        title: t("admin.packages.validation.nameTitle"),
        description: t("admin.packages.validation.nameDescription"),
      })
      return
    }
    if (editForm.creditQuantity <= 0) {
      toast({
        variant: "destructive",
        title: t("admin.packages.validation.creditsTitle"),
        description: t("admin.packages.validation.creditsDescription"),
      })
      return
    }
    if (editForm.priceVnd <= 0) {
      toast({
        variant: "destructive",
        title: t("admin.packages.validation.priceTitle"),
        description: t("admin.packages.validation.priceDescription"),
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
        title: t("admin.packages.toast.updatedTitle"),
        description: t("admin.packages.toast.updatedDescription", { name: editForm.name }),
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
          title: t("admin.packages.toast.conflictTitle"),
          description:
            t("admin.packages.toast.conflictDescription"),
        })
        await loadPackages(true)
        setEditingPackage(null)
      } else {
        toast({
          variant: "destructive",
          title: t("admin.packages.toast.updateFailedTitle"),
          description: parsed.userMessage || t("admin.packages.toast.updateFailedDescription"),
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
              <CardTitle className="text-lg font-bold">{t("admin.packages.title")}</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {t("admin.packages.summary", { total: filteredPackages.length, active: packages.filter((p) => p.status === "ACTIVE").length })}
              </CardDescription>
            </div>

            {/* Actions & Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t("admin.packages.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[145px] h-9 rounded-xl text-xs">
                    <SelectValue placeholder={t("admin.memberSummary.statusPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="ALL">{t("filters.allStatuses")}</SelectItem>
                    <SelectItem value="ACTIVE">{t("packageStatus.active")}</SelectItem>
                    <SelectItem value="INACTIVE">{t("admin.packages.hidden")}</SelectItem>
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
                {t("shared.refresh")}
              </Button>

              <Button
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="rounded-xl h-9 text-xs gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                {t("admin.packages.create")}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[140px] font-semibold text-xs">{t("admin.packages.columns.code")}</TableHead>
                  <TableHead className="min-w-[180px] font-semibold text-xs">{t("admin.packages.columns.name")}</TableHead>
                  <TableHead className="font-semibold text-xs text-center">{t("admin.packages.columns.credits")}</TableHead>
                  <TableHead className="font-semibold text-xs text-right">{t("admin.packages.columns.price")}</TableHead>
                  <TableHead className="font-semibold text-xs text-center">{t("admin.packages.columns.status")}</TableHead>
                  <TableHead className="font-semibold text-xs text-center">{t("admin.packages.columns.version")}</TableHead>
                  <TableHead className="font-semibold text-xs">{t("admin.packages.columns.updatedAt")}</TableHead>
                  <TableHead className="w-[90px] text-right font-semibold text-xs">{t("admin.packages.columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && packages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-36 text-center text-muted-foreground text-xs">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
                      {t("admin.packages.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-36 text-center text-muted-foreground text-xs">
                      {t("admin.packages.empty")}
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
                            {t("quantity.credits", { count: pkg.creditQuantity, value: pkg.creditQuantity })}
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
                            ? new Date(pkg.updatedAt || pkg.createdAt!).toLocaleDateString(currentIntlLocale(), {
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
                            {t("admin.packages.edit")}
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
                <DialogTitle className="text-lg font-bold">{t("admin.packages.createDialog.title")}</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                <Trans t={t} i18nKey="admin.packages.createDialog.description" components={{ strong: <strong /> }} />
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-xs font-semibold">
                  {t("admin.packages.form.code")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  placeholder={t("admin.packages.form.codePlaceholder")}
                  value={createForm.code}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })
                  }
                  required
                  className="rounded-xl font-mono uppercase text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  {t("admin.packages.form.codeHint")}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold">
                  {t("admin.packages.form.name")} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder={t("admin.packages.form.namePlaceholder")}
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
                    {t("admin.packages.form.creditsCreate")} <span className="text-destructive">*</span>
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
                    {t("admin.packages.form.price")} <span className="text-destructive">*</span>
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
                  {t("admin.packages.form.description")}
                </Label>
                <Textarea
                  id="description"
                  placeholder={t("admin.packages.form.descriptionPlaceholder")}
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
                {t("admin.packages.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={createSubmitting}
                className="rounded-xl gap-2 font-semibold shadow-xs"
              >
                {createSubmitting ? t("admin.packages.createDialog.submitting") : t("admin.packages.createDialog.submit")}
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
                <DialogTitle className="text-lg font-bold">{t("admin.packages.editDialog.title")}</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                {t("admin.packages.editDialog.description", { code: editingPackage?.code, version: editingPackage?.version })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t("admin.packages.form.code")}</Label>
                <Input
                  value={editingPackage?.code || ""}
                  disabled
                  className="rounded-xl font-mono uppercase bg-muted/50 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  {t("admin.packages.form.codeLocked")}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-semibold">
                  {t("admin.packages.form.name")} <span className="text-destructive">*</span>
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
                    {t("admin.packages.form.creditsEdit")} <span className="text-destructive">*</span>
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
                    {t("admin.packages.form.price")} <span className="text-destructive">*</span>
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
                  {t("admin.packages.form.status")} <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={editForm.status}
                  onValueChange={(val: CreditPackageStatus) =>
                    setEditForm({ ...editForm, status: val })
                  }
                >
                  <SelectTrigger id="edit-status" className="rounded-xl text-xs">
                    <SelectValue placeholder={t("admin.packages.form.statusPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl text-xs">
                    <SelectItem value="ACTIVE">{t("admin.packages.form.statusActive")}</SelectItem>
                    <SelectItem value="INACTIVE">{t("admin.packages.form.statusInactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-description" className="text-xs font-semibold">
                  {t("admin.packages.form.description")}
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
                {t("admin.packages.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={editSubmitting}
                className="rounded-xl gap-2 font-semibold shadow-xs"
              >
                {editSubmitting ? t("admin.packages.editDialog.submitting") : t("admin.packages.editDialog.submit")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
