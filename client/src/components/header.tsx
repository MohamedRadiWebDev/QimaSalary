import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Users, LayoutDashboard, History, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onOpenHistory: () => void;
}

export function Header({ onOpenHistory }: HeaderProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "الموظفين", icon: Users },
    { href: "/dashboard", label: "الإحصائيات", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-6">
          <Link href="/">
            <span className="text-lg font-bold text-primary cursor-pointer">
              نظام المرتبات
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn("gap-2", isActive && "bg-secondary")}
                    data-testid={`nav-${item.href.replace("/", "") || "home"}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHistory}
            className="gap-2"
            data-testid="button-open-history"
          >
            <History className="h-4 w-4" />
            السجل
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
