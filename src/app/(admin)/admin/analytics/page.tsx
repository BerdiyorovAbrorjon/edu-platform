import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
      <h1 className="mt-4 text-2xl font-bold">Analytics</h1>
      <p className="mt-2 text-muted-foreground">
        Analytics dashboard coming soon
      </p>
    </div>
  );
}
