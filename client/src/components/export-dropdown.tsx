import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileJson, FileText } from "lucide-react";

interface ExportDropdownProps {
  onExportExcel: () => void;
  onExportJson: () => void;
  onExportPayslip?: () => void;
  isLoading?: boolean;
  showPayslip?: boolean;
}

export function ExportDropdown({
  onExportExcel,
  onExportJson,
  onExportPayslip,
  isLoading = false,
  showPayslip = false,
}: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={isLoading} data-testid="button-export-dropdown">
          <Download className="h-4 w-4" />
          تصدير
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onExportExcel} data-testid="button-export-excel">
          <FileSpreadsheet className="h-4 w-4 ml-2" />
          تصدير Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportJson} data-testid="button-export-json">
          <FileJson className="h-4 w-4 ml-2" />
          تصدير JSON
        </DropdownMenuItem>
        {showPayslip && onExportPayslip && (
          <DropdownMenuItem onClick={onExportPayslip} data-testid="button-export-payslip">
            <FileText className="h-4 w-4 ml-2" />
            قسيمة الراتب (PDF)
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
