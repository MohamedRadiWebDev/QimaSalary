import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { History, Search, Calendar, User, ArrowLeftRight } from "lucide-react";
import type { HistoryEntry } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface HistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: HistoryEntry[];
  isLoading?: boolean;
}

export function HistoryPanel({
  open,
  onOpenChange,
  history,
  isLoading = false,
}: HistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState<string>("all");

  const uniqueFields = [...new Set(history.map((h) => h.field))];

  const filteredHistory = history.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.employeeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesField =
      selectedField === "all" || entry.field === selectedField;
    return matchesSearch && matchesField;
  });

  const formatDate = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "dd MMMM yyyy - hh:mm a", {
        locale: ar,
      });
    } catch {
      return timestamp;
    }
  };

  const formatValue = (value: string | number | null) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "number") return value.toLocaleString("ar-EG");
    return value;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            سجل التعديلات
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
                data-testid="input-history-search"
              />
            </div>
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger className="w-40" data-testid="select-history-field">
                <SelectValue placeholder="الحقل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحقول</SelectItem>
                {uniqueFields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <History className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">لا توجد تعديلات</p>
              </div>
            ) : (
              <div className="space-y-3 pl-4">
                {filteredHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-card border border-card-border rounded-md p-4"
                    data-testid={`history-entry-${entry.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="font-medium text-sm">
                        {entry.employeeName || entry.employeeId}
                      </div>
                      <Badge variant="outline" size="sm">
                        {entry.field}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="text-muted-foreground line-through" dir="ltr">
                        {formatValue(entry.oldValue)}
                      </span>
                      <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-primary font-medium" dir="ltr">
                        {formatValue(entry.newValue)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(entry.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{entry.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
