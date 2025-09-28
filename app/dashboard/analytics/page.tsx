"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Analytics & Insights</h2>
          <p className="text-muted-foreground">Performance metrics and usage analytics</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Analytics & Insights</CardTitle>
            <CardDescription>Performance metrics and usage analytics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Analytics dashboard coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">
                This page will contain detailed charts, metrics, and performance insights.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
