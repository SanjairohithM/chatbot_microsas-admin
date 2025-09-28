"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Zap } from "lucide-react"

export default function IntegrationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Integrations</h2>
          <p className="text-muted-foreground">Connect with external services and APIs</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect with external services and APIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Integrations panel coming soon</p>
              <p className="text-sm text-muted-foreground mt-2">
                This page will allow you to connect with third-party services and configure API integrations.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
