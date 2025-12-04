import { useQuery } from "@tanstack/react-query";
import { DashboardStatsComponent } from "@/components/dashboard-stats";
import type { DashboardStats } from "@shared/schema";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  return (
    <div className="container py-6 px-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      </div>

      <DashboardStatsComponent stats={stats ?? null} isLoading={isLoading} />
    </div>
  );
}
