import { type FormEvent } from "react"
import { CalendarClock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function CreateAdminSessionPanel({
  form,
  loading,
  onChange,
  onSubmit,
}: {
  form: { memberId: string; doctorId: string; healthRecordId: string; endsAt: string; supportEndsAt: string; initialSystemMessage: string }
  loading: boolean
  onChange: (form: { memberId: string; doctorId: string; healthRecordId: string; endsAt: string; supportEndsAt: string; initialSystemMessage: string }) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Consultation Session</CardTitle>
        <CardDescription>Admin creates direct session without member request.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Member ID
            <Input required value={form.memberId} onChange={(event) => onChange({ ...form, memberId: event.target.value })} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Doctor ID
            <Input required value={form.doctorId} onChange={(event) => onChange({ ...form, doctorId: event.target.value })} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Health record ID
            <Input value={form.healthRecordId} onChange={(event) => onChange({ ...form, healthRecordId: event.target.value })} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Ends at
            <Input type="datetime-local" required value={form.endsAt} onChange={(event) => onChange({ ...form, endsAt: event.target.value })} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Support ends at
            <Input type="datetime-local" value={form.supportEndsAt} onChange={(event) => onChange({ ...form, supportEndsAt: event.target.value })} />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2">
            Initial system message
            <Textarea value={form.initialSystemMessage} onChange={(event) => onChange({ ...form, initialSystemMessage: event.target.value })} />
          </label>
          <Button type="submit" className="md:col-span-2" disabled={loading}>
            <CalendarClock data-icon="inline-start" />
            Create session
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
