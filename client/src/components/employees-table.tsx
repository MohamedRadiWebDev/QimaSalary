import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EditableCell } from "@/components/editable-cell";
import { Trash2, MessageSquare, ArrowUpDown, ArrowUp, ArrowDown, FileText } from "lucide-react";
import type { Employee } from "@shared/schema";
import { editableFields } from "@shared/schema";
import { cn } from "@/lib/utils";

interface EmployeesTableProps {
  employees: Employee[];
  isLoading?: boolean;
  onUpdateField: (employeeId: string, field: string, value: number | null) => Promise<void>;
  onDelete: (employee: Employee) => void;
  onOpenNotes: (employee: Employee) => void;
  onExportPayslip: (employee: Employee) => void;
  sortField: string | null;
  sortDirection: "asc" | "desc" | null;
  onSort: (field: string) => void;
}

// Fixed columns that are always visible
const fixedColumns = ["الكود", "الاسم"];

// Display columns (subset of all columns for better UX)
const displayColumns = [
  "الكود",
  "الاسم",
  "الفرع",
  "الإدارة",
  "الوظيفة",
  "الراتب الشهري",
  "بدلات",
  "مكافات",
  "حافز",
  "اوفر تايم",
  "السلف",
  "تسويات",
  "عمولات رايا",
  "عمولات شركه حالا",
  "عمولات سفن",
  "عمولات الاسكندريه",
  "عمولات كريدي",
  "كونتست",
];

function SortIcon({ field, sortField, sortDirection }: { field: string; sortField: string | null; sortDirection: "asc" | "desc" | null }) {
  if (sortField !== field) {
    return <ArrowUpDown className="h-3 w-3 opacity-50" />;
  }
  return sortDirection === "asc" ? (
    <ArrowUp className="h-3 w-3" />
  ) : (
    <ArrowDown className="h-3 w-3" />
  );
}

export function EmployeesTable({
  employees,
  isLoading = false,
  onUpdateField,
  onDelete,
  onOpenNotes,
  onExportPayslip,
  sortField,
  sortDirection,
  onSort,
}: EmployeesTableProps) {
  const isEditable = (column: string) => {
    return editableFields.includes(column as any);
  };

  const getCellValue = (employee: Employee, column: string) => {
    return (employee as any)[column];
  };

  if (isLoading) {
    return (
      <div className="border rounded-md">
        <div className="p-4 space-y-3">
          {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="border rounded-md flex flex-col items-center justify-center py-16 text-muted-foreground">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 opacity-50" />
        </div>
        <p className="text-lg font-medium mb-1">لا يوجد موظفين</p>
        <p className="text-sm">قم بإضافة موظف جديد أو استيراد بيانات من Excel</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <ScrollArea className="w-full">
        <div className="min-w-[1200px]">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="w-24 sticky right-0 z-20 bg-card">الإجراءات</TableHead>
                {displayColumns.map((column) => (
                  <TableHead
                    key={column}
                    className={cn(
                      "min-w-[120px] cursor-pointer select-none",
                      fixedColumns.includes(column) && "sticky z-20 bg-card",
                      column === "الكود" && "right-24",
                      column === "الاسم" && "right-[168px] min-w-[180px]",
                      isEditable(column) && "bg-primary/5"
                    )}
                    onClick={() => onSort(column)}
                  >
                    <div className="flex items-center gap-1">
                      <span>{column}</span>
                      <SortIcon field={column} sortField={sortField} sortDirection={sortDirection} />
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee, rowIndex) => (
                <TableRow
                  key={employee.id}
                  className={cn(rowIndex % 2 === 0 && "bg-muted/30")}
                  data-testid={`row-employee-${employee.id}`}
                >
                  <TableCell className="sticky right-0 z-10 bg-inherit">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onOpenNotes(employee)}
                        className="h-8 w-8"
                        data-testid={`button-notes-${employee.id}`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onExportPayslip(employee)}
                        className="h-8 w-8"
                        data-testid={`button-payslip-${employee.id}`}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(employee)}
                        className="h-8 w-8 text-destructive"
                        data-testid={`button-delete-${employee.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  {displayColumns.map((column) => {
                    const value = getCellValue(employee, column);
                    const editable = isEditable(column);

                    return (
                      <TableCell
                        key={column}
                        className={cn(
                          "min-w-[120px]",
                          fixedColumns.includes(column) && "sticky z-10 bg-inherit",
                          column === "الكود" && "right-24 font-mono",
                          column === "الاسم" && "right-[168px] font-medium min-w-[180px]",
                          editable && "p-1"
                        )}
                      >
                        {editable ? (
                          <EditableCell
                            value={typeof value === "number" ? value : null}
                            onChange={async (newValue) => {
                              await onUpdateField(employee.id, column, newValue);
                            }}
                            isEditable={true}
                          />
                        ) : (
                          <span className={cn(typeof value === "number" && "font-mono")} dir={typeof value === "number" ? "ltr" : undefined}>
                            {value !== null && value !== undefined
                              ? typeof value === "number"
                                ? value.toLocaleString("ar-EG")
                                : value
                              : "-"}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
