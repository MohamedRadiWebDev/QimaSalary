import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedBranch: string;
  onBranchChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (value: string) => void;
  selectedSector: string;
  onSectorChange: (value: string) => void;
  branches: string[];
  departments: string[];
  sectors: string[];
  totalResults: number;
  onClearFilters: () => void;
  className?: string;
}

export function SearchFilter({
  searchQuery,
  onSearchChange,
  selectedBranch,
  onBranchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedSector,
  onSectorChange,
  branches,
  departments,
  sectors,
  totalResults,
  onClearFilters,
  className,
}: SearchFilterProps) {
  const hasFilters = searchQuery || selectedBranch || selectedDepartment || selectedSector;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="بحث (الاسم، الكود، الرقم القومي...)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-10 h-10"
            data-testid="input-search"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          
          <Select value={selectedBranch} onValueChange={onBranchChange}>
            <SelectTrigger className="w-40 h-10" data-testid="select-branch">
              <SelectValue placeholder="الفرع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفروع</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
            <SelectTrigger className="w-40 h-10" data-testid="select-department">
              <SelectValue placeholder="الإدارة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الإدارات</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedSector} onValueChange={onSectorChange}>
            <SelectTrigger className="w-40 h-10" data-testid="select-sector">
              <SelectValue placeholder="القطاع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل القطاعات</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="gap-1"
            data-testid="button-clear-filters"
          >
            <X className="h-3 w-3" />
            مسح الفلاتر
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span data-testid="text-results-count">
          عرض {totalResults.toLocaleString("ar-EG")} موظف
        </span>
      </div>
    </div>
  );
}
