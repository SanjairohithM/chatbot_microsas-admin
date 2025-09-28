"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Settings } from "lucide-react"

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Settings</h2>
          <p className="text-muted-foreground">Configure your chatbot platform</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure your chatbot platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Settings panel coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">
                This page will contain system configuration, preferences, and platform settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
