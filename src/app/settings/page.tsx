'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile, preferences, and connections.
        </p>
      </div>
      <Card className="min-h-[60vh] flex flex-col items-center justify-center bg-card/60 border-border/60 border-dashed">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 bg-primary/10 rounded-full">
            <Construction className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Under Construction</CardTitle>
          <CardDescription className="text-muted-foreground">
            The Settings page is coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="max-w-md text-center text-muted-foreground">
            This section will allow you to manage your profile, linked accounts, notification preferences, and theme settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
