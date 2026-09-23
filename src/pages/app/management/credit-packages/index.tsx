import { Navigate } from "react-router-dom"

export default function AdminCreditPackagesPage() {
  return <Navigate to="/app/management/credit-operations?tab=packages" replace />
}
