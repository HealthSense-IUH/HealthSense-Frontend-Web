import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Activity, UserPlus } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/services/authentication"
import { getAuthErrorMessage } from "@/utils/authErrorHandler"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setIsSubmitting(true)

    try {
      await authApi.register({ fullName, email, password })
      navigate("/login", { replace: true, state: { registered: true } })
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center gap-6">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Activity />
          HealthSense
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Tao tai khoan</CardTitle>
            <CardDescription>
              Dang ky tai khoan moi de theo doi chi so suc khoe ca nhan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertTitle>Khong the dang ky</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="fullName">Ho ten</Label>
                <Input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Mat khau</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                <UserPlus data-icon="inline-start" />
                {isSubmitting ? "Dang tao tai khoan..." : "Dang ky"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Da co tai khoan?{" "}
                <Link to="/login" className="font-medium text-primary">
                  Dang nhap
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
