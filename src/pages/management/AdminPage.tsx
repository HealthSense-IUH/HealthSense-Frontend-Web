import React from "react"
import { Users, Settings, Database, ServerCrash } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Management</h2>
        <p className="text-neutral-500 dark:text-neutral-400">Admin overview of connected devices and backend services.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">ESP32 Nodes online</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Service Status</CardTitle>
            <ServerCrash className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">Healthy</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Latency: 45ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Storage</CardTitle>
            <Database className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.2 GB</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">85% capacity remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Version</CardTitle>
            <Settings className="h-4 w-4 text-neutral-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v1.2.0</div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Last updated: 2 days ago</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connected Devices</CardTitle>
          <CardDescription>Recent ESP32 nodes connected to the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Last Sync</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">ESP32-A1B2</TableCell>
                <TableCell><Badge variant="default" className="bg-green-500">Online</Badge></TableCell>
                <TableCell>85%</TableCell>
                <TableCell>Just now</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">ESP32-C3D4</TableCell>
                <TableCell><Badge variant="default" className="bg-green-500">Online</Badge></TableCell>
                <TableCell>42%</TableCell>
                <TableCell>2 mins ago</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">ESP32-E5F6</TableCell>
                <TableCell><Badge variant="outline" className="text-neutral-500">Offline</Badge></TableCell>
                <TableCell>--</TableCell>
                <TableCell>5 hours ago</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
