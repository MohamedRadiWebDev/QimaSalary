import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Wallet, Gift, TrendingUp, Award } from "lucide-react";
import type { DashboardStats } from "@shared/schema";

interface DashboardStatsProps {
  stats: DashboardStats | null;
  isLoading?: boolean;
}

function StatCard({
  title,
  value,
  icon: Icon,
  suffix = "",
  isLoading = false,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  suffix?: string;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold" dir="ltr">
            {value.toLocaleString("ar-EG")}
            {suffix && <span className="text-sm font-normal text-muted-foreground mr-1">{suffix}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardStatsComponent({
  stats,
  isLoading = false,
}: DashboardStatsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الموظفين"
          value={stats?.totalEmployees ?? 0}
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard
          title="إجمالي المرتبات"
          value={stats?.totalSalaries ?? 0}
          icon={Wallet}
          suffix="ج.م"
          isLoading={isLoading}
        />
        <StatCard
          title="إجمالي البدلات"
          value={stats?.totalAllowances ?? 0}
          icon={Gift}
          suffix="ج.م"
          isLoading={isLoading}
        />
        <StatCard
          title="إجمالي العمولات"
          value={stats?.totalCommissions ?? 0}
          icon={TrendingUp}
          suffix="ج.م"
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              أعلى 10 موظفين بالعمولات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : stats?.topEarners && stats.topEarners.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead className="text-left">العمولات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topEarners.map((earner, index) => (
                    <TableRow key={earner.id}>
                      <TableCell>
                        <Badge
                          variant={index < 3 ? "default" : "secondary"}
                          size="sm"
                        >
                          {(index + 1).toLocaleString("ar-EG")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{earner.name}</TableCell>
                      <TableCell className="font-mono text-left" dir="ltr">
                        {earner.totalCommissions.toLocaleString("ar-EG")} ج.م
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <p className="text-sm">لا توجد بيانات</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              ملخص الإحصائيات
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">متوسط الراتب</span>
                  <span className="font-mono font-medium" dir="ltr">
                    {(stats?.averageSalary ?? 0).toLocaleString("ar-EG")} ج.م
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">إجمالي المرتبات + البدلات</span>
                  <span className="font-mono font-medium" dir="ltr">
                    {((stats?.totalSalaries ?? 0) + (stats?.totalAllowances ?? 0)).toLocaleString("ar-EG")} ج.م
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">متوسط العمولة للموظف</span>
                  <span className="font-mono font-medium" dir="ltr">
                    {stats?.totalEmployees && stats.totalEmployees > 0
                      ? ((stats?.totalCommissions ?? 0) / stats.totalEmployees).toLocaleString("ar-EG", { maximumFractionDigits: 2 })
                      : 0} ج.م
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
