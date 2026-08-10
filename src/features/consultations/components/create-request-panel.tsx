import { type FormEvent } from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import type { HealthRecordItem, CareServicePackage } from "../types"

export function CreateRequestPanel({
  form,
  healthRecords,
  packages,
  loading,
  onChange,
  onSubmit,
}: {
  form: { packageId: string; healthRecordId: string; reason: string; preferredDoctorId: string }
  healthRecords: HealthRecordItem[]
  packages: CareServicePackage[]
  loading: boolean
  onChange: (form: { packageId: string; healthRecordId: string; reason: string; preferredDoctorId: string }) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Consultation Request</CardTitle>
        <CardDescription>Member sends request; chat opens only after admin approves and session is created.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Care Service Package <span className="text-red-500">*</span>
            <Select required value={form.packageId || ""} onValueChange={(value) => onChange({ ...form, packageId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a service package" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={String(pkg.id)}>
                      {pkg.name} - {pkg.priceAmount.toLocaleString("vi-VN", { style: "currency", currency: pkg.currency || "VND" })} ({pkg.durationDays} days)
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Health record
            {healthRecords.length > 0 ? (
              <Select value={form.healthRecordId || "none"} onValueChange={(value) => onChange({ ...form, healthRecordId: value === "none" ? "" : value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select health record" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">No record attached</SelectItem>
                    {healthRecords.map((record) => (
                      <SelectItem key={record.id} value={String(record.id)}>
                        #{record.id} {record.predictionLabel ? `- ${record.predictionLabel}` : ""}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <Input value={form.healthRecordId} onChange={(event) => onChange({ ...form, healthRecordId: event.target.value })} placeholder="123" />
            )}
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Preferred doctor ID
            <Input value={form.preferredDoctorId} onChange={(event) => onChange({ ...form, preferredDoctorId: event.target.value })} placeholder="Leave blank for admin to assign" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Reason
            <Textarea value={form.reason} onChange={(event) => onChange({ ...form, reason: event.target.value })} required maxLength={1000} placeholder="I would like further consultation on these measurement results" />
          </label>
          <Button type="submit" disabled={loading || !form.reason.trim() || !form.packageId}>
            <Send data-icon="inline-start" />
            Send request
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
