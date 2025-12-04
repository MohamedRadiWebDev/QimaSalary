import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SearchFilter } from "@/components/search-filter";
import { EmployeesTable } from "@/components/employees-table";
import { DataTablePagination } from "@/components/data-table-pagination";
import { AddEmployeeModal } from "@/components/add-employee-modal";
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { NotesModal } from "@/components/notes-modal";
import { ImportModal } from "@/components/import-modal";
import { ExportDropdown } from "@/components/export-dropdown";
import { BackupDropdown } from "@/components/backup-dropdown";
import { Plus, Upload } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Employee, Note, PaginatedResponse, ImportPreview, BackupInfo } from "@shared/schema";

export default function EmployeesPage() {
  const { toast } = useToast();
  
  // State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const [notesEmployee, setNotesEmployee] = useState<Employee | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);

  // Queries
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery<PaginatedResponse<Employee>>({
    queryKey: ["/api/employees", page, pageSize, searchQuery, selectedBranch, selectedDepartment, selectedSector, sortField, sortDirection],
  });

  const { data: filtersData } = useQuery<{ branches: string[]; departments: string[]; sectors: string[] }>({
    queryKey: ["/api/employees/filters"],
  });

  const { data: backupsData } = useQuery<BackupInfo[]>({
    queryKey: ["/api/backups"],
  });

  const { data: notesData, isLoading: isLoadingNotes } = useQuery<Note[]>({
    queryKey: ["/api/notes", notesEmployee?.id],
    enabled: !!notesEmployee,
  });

  // Mutations
  const updateFieldMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: number | null }) => {
      return apiRequest("PUT", `/api/employees/${id}`, { field, value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({ title: "تم الحفظ بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في الحفظ", variant: "destructive" });
    },
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/employees", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "تم إضافة الموظف بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في إضافة الموظف", variant: "destructive" });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      setDeleteEmployee(null);
      toast({ title: "تم حذف الموظف بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل في حذف الموظف", variant: "destructive" });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: async ({ employeeId, text }: { employeeId: string; text: string }) => {
      return apiRequest("POST", `/api/notes/${employeeId}`, { text });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", notesEmployee?.id] });
      toast({ title: "تم إضافة الملاحظة" });
    },
    onError: () => {
      toast({ title: "فشل في إضافة الملاحظة", variant: "destructive" });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      return apiRequest("DELETE", `/api/notes/${noteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", notesEmployee?.id] });
      toast({ title: "تم حذف الملاحظة" });
    },
    onError: () => {
      toast({ title: "فشل في حذف الملاحظة", variant: "destructive" });
    },
  });

  const createBackupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/backup");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/backups"] });
      toast({ title: "تم إنشاء النسخة الاحتياطية" });
    },
    onError: () => {
      toast({ title: "فشل في إنشاء النسخة الاحتياطية", variant: "destructive" });
    },
  });

  const restoreBackupMutation = useMutation({
    mutationFn: async (filename: string) => {
      return apiRequest("POST", "/api/backup/restore", { filename });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/backups"] });
      toast({ title: "تم استرجاع النسخة الاحتياطية" });
    },
    onError: () => {
      toast({ title: "فشل في استرجاع النسخة الاحتياطية", variant: "destructive" });
    },
  });

  // Handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : sortDirection === "desc" ? null : "asc");
      if (sortDirection === "desc") {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedBranch("");
    setSelectedDepartment("");
    setSelectedSector("");
  };

  const handleUpdateField = async (employeeId: string, field: string, value: number | null) => {
    await updateFieldMutation.mutateAsync({ id: employeeId, field, value });
  };

  const handleAddEmployee = async (data: any) => {
    const processedData: any = { ...data };
    if (data["الراتب الشهري"]) {
      processedData["الراتب الشهري"] = parseFloat(data["الراتب الشهري"]);
    }
    await addEmployeeMutation.mutateAsync(processedData);
  };

  const handleImport = async (file: File, keyColumn: string): Promise<ImportPreview> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("keyColumn", keyColumn);
    
    const response = await fetch("/api/import/preview", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error("Failed to preview import");
    }
    
    const preview = await response.json();
    setImportPreview(preview);
    return preview;
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    
    const response = await fetch("/api/import/confirm", {
      method: "POST",
    });
    
    if (!response.ok) {
      throw new Error("Failed to confirm import");
    }
    
    queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    queryClient.invalidateQueries({ queryKey: ["/api/history"] });
    setImportPreview(null);
  };

  const handleExportExcel = () => {
    window.open("/api/export/excel", "_blank");
  };

  const handleExportJson = () => {
    window.open("/api/export/json", "_blank");
  };

  const handleExportPayslip = (employee: Employee) => {
    window.open(`/api/export/payslip/${employee.id}`, "_blank");
  };

  const employees = employeesData?.data ?? [];
  const totalItems = employeesData?.total ?? 0;
  const totalPages = employeesData?.totalPages ?? 1;

  return (
    <div className="container py-6 px-6 space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">إدارة الموظفين</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAddModal(true)} className="gap-2" data-testid="button-add-employee">
            <Plus className="h-4 w-4" />
            إضافة موظف
          </Button>
          <Button variant="outline" onClick={() => setShowImportModal(true)} className="gap-2" data-testid="button-import">
            <Upload className="h-4 w-4" />
            استيراد
          </Button>
          <ExportDropdown
            onExportExcel={handleExportExcel}
            onExportJson={handleExportJson}
          />
          <BackupDropdown
            backups={backupsData ?? []}
            onCreateBackup={() => createBackupMutation.mutate()}
            onRestoreBackup={(filename) => restoreBackupMutation.mutate(filename)}
            isLoading={createBackupMutation.isPending || restoreBackupMutation.isPending}
          />
        </div>
      </div>

      {/* Search & Filters */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        selectedSector={selectedSector}
        onSectorChange={setSelectedSector}
        branches={filtersData?.branches ?? []}
        departments={filtersData?.departments ?? []}
        sectors={filtersData?.sectors ?? []}
        totalResults={totalItems}
        onClearFilters={handleClearFilters}
      />

      {/* Data Table */}
      <EmployeesTable
        employees={employees}
        isLoading={isLoadingEmployees}
        onUpdateField={handleUpdateField}
        onDelete={setDeleteEmployee}
        onOpenNotes={setNotesEmployee}
        onExportPayslip={handleExportPayslip}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Pagination */}
      {totalItems > 0 && (
        <DataTablePagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      )}

      {/* Modals */}
      <AddEmployeeModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={handleAddEmployee}
        branches={filtersData?.branches ?? []}
        departments={filtersData?.departments ?? []}
        sectors={filtersData?.sectors ?? []}
        isLoading={addEmployeeMutation.isPending}
      />

      <DeleteConfirmDialog
        open={!!deleteEmployee}
        onOpenChange={(open) => !open && setDeleteEmployee(null)}
        title="حذف الموظف"
        description={`هل أنت متأكد من حذف الموظف "${deleteEmployee?.الاسم}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={() => deleteEmployee && deleteEmployeeMutation.mutate(deleteEmployee.id)}
        isLoading={deleteEmployeeMutation.isPending}
      />

      <NotesModal
        open={!!notesEmployee}
        onOpenChange={(open) => !open && setNotesEmployee(null)}
        employeeId={notesEmployee?.id ?? ""}
        employeeName={notesEmployee?.الاسم ?? ""}
        notes={notesData ?? []}
        onAddNote={async (text) => {
          if (notesEmployee) {
            await addNoteMutation.mutateAsync({ employeeId: notesEmployee.id, text });
          }
        }}
        onDeleteNote={async (noteId) => {
          await deleteNoteMutation.mutateAsync(noteId);
        }}
        isLoading={isLoadingNotes}
      />

      <ImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImport={handleImport}
        onConfirmImport={handleConfirmImport}
      />
    </div>
  );
}
