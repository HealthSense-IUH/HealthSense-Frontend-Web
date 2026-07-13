import { Activity, Heart, Wind, Search, Bell, Mail } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Top Bar matching Figma */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search anything..." 
            className="w-full pl-10 bg-white dark:bg-card border-0 rounded-2xl h-12 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-0 bg-white dark:bg-card shadow-sm">
            <Bell className="h-5 w-5 text-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-0 bg-white dark:bg-card shadow-sm">
            <Mail className="h-5 w-5 text-foreground" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-5">
        {/* Welcome Section */}
        <div className="md:col-span-4 lg:col-span-5 grid gap-6 md:grid-cols-4">
          
          {/* Greeting Card - Similar to the large blue card in Figma */}
          <Card className="md:col-span-1 rounded-3xl border-0 bg-primary text-primary-foreground shadow-lg overflow-hidden relative min-h-[300px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <Activity className="w-32 h-32" />
            </div>
            <CardHeader className="relative z-10 pt-8">
              <div className="text-4xl mb-4">☀️</div>
              <CardTitle className="text-4xl font-bold leading-tight">
                Hello,<br />User!
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p className="text-primary-foreground/80 text-lg">
                It's time for your routine health checkup today!
              </p>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="md:col-span-3 grid gap-6 grid-cols-2 lg:grid-cols-3">
            <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold text-muted-foreground">Heart Rate</CardTitle>
                <div className="p-2 bg-health-heart/10 rounded-full">
                  <Heart className="h-5 w-5 text-health-heart" />
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <div className="text-4xl font-bold text-foreground">72 <span className="text-lg font-normal text-muted-foreground">BPM</span></div>
                <div className="mt-4 h-12 w-full flex items-end">
                  {/* Fake sparkline */}
                  <svg viewBox="0 0 100 40" className="w-full h-full stroke-health-heart fill-none stroke-[3] stroke-linecap-round stroke-linejoin-round">
                    <path d="M0,20 L10,20 L15,10 L25,35 L35,5 L45,25 L50,20 L100,20" />
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm bg-health-heart text-white flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold text-white/90">SpO2</CardTitle>
                <Wind className="h-5 w-5 text-white" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/20 text-xs font-medium w-fit mb-4">
                  NORMAL
                </div>
                <div className="text-4xl font-bold">98<span className="text-lg font-normal text-white/80">%</span></div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-0 shadow-sm bg-health-sleep text-white flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold text-white/90">HRV (SDNN)</CardTitle>
                <Activity className="h-5 w-5 text-white" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <div className="flex items-end gap-1 h-12 mb-4 opacity-80">
                  <div className="w-1/6 bg-white rounded-t-sm h-[40%]"></div>
                  <div className="w-1/6 bg-white rounded-t-sm h-[70%]"></div>
                  <div className="w-1/6 bg-white rounded-t-sm h-[30%]"></div>
                  <div className="w-1/6 bg-white rounded-t-sm h-[90%]"></div>
                  <div className="w-1/6 bg-white rounded-t-sm h-[50%]"></div>
                  <div className="w-1/6 bg-white rounded-t-sm h-[60%]"></div>
                </div>
                <div className="text-4xl font-bold">45 <span className="text-lg font-normal text-white/80">ms</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 rounded-3xl border-0 shadow-sm bg-white dark:bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Analytics</CardTitle>
            <CardDescription>
              Real-time PPG signal and historical data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="mb-4 bg-muted/50 rounded-xl">
                <TabsTrigger value="analytics" className="rounded-lg">Real-time PPG</TabsTrigger>
                <TabsTrigger value="overview" className="rounded-lg">HRV Overview</TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg">History</TabsTrigger>
              </TabsList>
              <TabsContent value="analytics" className="space-y-4">
                <div className="h-[250px] w-full bg-blue-50 dark:bg-blue-950/20 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-900 flex items-center justify-center">
                  <span className="text-primary font-medium">Live Signal Graph Area</span>
                </div>
              </TabsContent>
              <TabsContent value="overview" className="space-y-4">
                <div className="h-[250px] w-full bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  <span className="text-muted-foreground font-medium">Recharts Graph Area</span>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm bg-white dark:bg-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Rhythm Status</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
              <Activity className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Normal Rhythm</h3>
            <p className="text-muted-foreground">
              No signs of Atrial Fibrillation (AFib) detected in your recent measurements.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
