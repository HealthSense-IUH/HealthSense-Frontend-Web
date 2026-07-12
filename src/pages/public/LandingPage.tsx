
import { ArrowRight, Activity, ShieldCheck, HeartPulse } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12">
      <div className="space-y-6 max-w-3xl">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-100/80 dark:bg-neutral-800 dark:text-neutral-50 mb-4">
          <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          AI-Powered AFib Detection
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl text-neutral-900 dark:text-white">
          Monitor your heart health <br className="hidden sm:inline" />
          <span className="text-red-500">with precision.</span>
        </h1>
        <p className="text-xl text-neutral-500 dark:text-neutral-400">
          HealthSense uses advanced PPG sensors and Machine Learning to track your Heart Rate Variability and detect Atrial Fibrillation in real-time.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button size="lg" asChild>
          <Link to="/general">
            View Dashboard <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/management">
            Admin Access
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-5xl mt-16 pt-16 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl">
            <HeartPulse className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold">Continuous Tracking</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">24/7 monitoring of your pulse rate and HRV metrics.</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl">
            <Activity className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold">Smart Algorithms</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Random Forest ML model validated against clinical ECGs.</p>
        </div>
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl">
            <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold">Early Warning</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Detect Atrial Fibrillation early and consult your doctor.</p>
        </div>
      </div>
    </div>
  )
}
