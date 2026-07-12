import React from "react"
import { Activity, Heart, Thermometer, Wind } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-neutral-500 dark:text-neutral-400">Welcome back! Here's an overview of your health metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72 bpm</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">+2% from last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SpO2</CardTitle>
            <Wind className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Normal</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HRV (SDNN)</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 ms</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Resting</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rhythm Status</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">Normal</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">No AFib detected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Real-time PPG</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>
                Your heart rate variability over the last 24 hours. (Chart Placeholder)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center border-dashed border-2 border-neutral-200 dark:border-neutral-800 rounded-md m-4 mt-0 bg-neutral-50 dark:bg-neutral-900/50">
              <span className="text-neutral-400 font-medium">Recharts Graph will go here</span>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Real-time PPG Signal</CardTitle>
              <CardDescription>
                Live data streaming from ESP32 MAX30102 sensor.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center border-dashed border-2 border-neutral-200 dark:border-neutral-800 rounded-md m-4 mt-0 bg-neutral-50 dark:bg-neutral-900/50">
              <span className="text-neutral-400 font-medium">Live Signal Graph will go here</span>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
