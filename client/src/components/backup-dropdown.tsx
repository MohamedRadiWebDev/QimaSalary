import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, Clock, RotateCcw } from "lucide-react";
import type { BackupInfo } from "@shared/schema";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface BackupDropdownProps {
  backups: BackupInfo[];
  onCreateBackup: () => void;
  onRestoreBackup: (filename: string) => void;
  isLoading?: boolean;
}

export function BackupDropdown({
  backups,
  onCreateBackup,
  onRestoreBackup,
  isLoading = false,
}: BackupDropdownProps) {
  const formatDate = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "dd/MM/yyyy hh:mm a", { locale: ar });
    } catch {
      return timestamp;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isLoading} data-testid="button-backup-dropdown">
          <Save className="h-4 w-4" />
          نسخ احتياطي
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuItem onClick={onCreateBackup} data-testid="button-create-backup">
          <Save className="h-4 w-4 ml-2" />
          إنشاء نسخة احتياطية الآن
        </DropdownMenuItem>
        
        {backups.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              النسخ السابقة
            </div>
            <ScrollArea className="h-48">
              {backups.slice(0, 10).map((backup) => (
                <DropdownMenuItem
                  key={backup.filename}
                  onClick={() => onRestoreBackup(backup.filename)}
                  className="flex items-start gap-2 py-2"
                  data-testid={`button-restore-${backup.filename}`}
                >
                  <RotateCcw className="h-4 w-4 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(backup.timestamp)}
                    </div>
                    <div className="text-xs mt-0.5">
                      {backup.employeeCount.toLocaleString("ar-EG")} موظف
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
