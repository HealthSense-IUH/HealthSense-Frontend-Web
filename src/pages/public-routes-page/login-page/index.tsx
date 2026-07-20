import { useState, type FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Activity, LogIn } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authApi } from "@/services/authentication"
import { useAuthStore } from "@/features/auth/auth-store"
import { getAuthErrorMessage } from "@/utils/authErrorHandler"

type LoginLocationState = {
  from?: {
    pathname?: string
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuthenticatedSession = useAuthStore((state) => state.setAuthenticatedSession)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const state = location.state as LoginLocationState | null
  const redirectTo = state?.from?.pathname ?? "/app/dashboard"

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage("")
    setIsSubmitting(true)

    try {
      const response = await authApi.login({ email, password })
      setAuthenticatedSession(response.data.accessToken, response.data.userSession)
      navigate(redirectTo, { replace: true })
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
            <CardTitle>Dang nhap</CardTitle>
            <CardDescription>
              Su dung tai khoan HealthSense de vao dashboard suc khoe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertTitle>Khong the dang nhap</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

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
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting}>
                <LogIn data-icon="inline-start" />
                {isSubmitting ? "Dang dang nhap..." : "Dang nhap"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Chua co tai khoan?{" "}
                <Link to="/register" className="font-medium text-primary">
                  Dang ky
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
