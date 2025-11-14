'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function LifePlanPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Life Plan</h1>
        <p className="text-muted-foreground mt-2">
          Visualize and map out your financial future.
        </p>
      </div>
      <Card className="min-h-[60vh] flex flex-col items-center justify-center bg-card/60 border-border/60 border-dashed">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 bg-primary/10 rounded-full">
            <Construction className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Under Construction</CardTitle>
          <CardDescription className="text-muted-foreground">
            The interactive Life Planning Canvas is coming soon!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="max-w-md text-center text-muted-foreground">
            This section will feature a drag-and-drop canvas to plan life events, financial milestones, and career goals.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
