import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import XLSX from "xlsx";
import path from "path";
import { promises as fs } from "fs";
import { storage } from "./storage";
import type { Employee, InsertEmployee, PaginationParams, ImportPreview } from "@shared/schema";
import { editableFields } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

// Column mapping from Excel to Arabic names
const excelColumnMap: Record<string, string> = {
  "__EMPTY": "الكود",
  "__EMPTY_1": "الاسم",
  "__EMPTY_2": "الفرع",
  "__EMPTY_3": "الإدارة",
  "__EMPTY_4": "القطاع",
  "__EMPTY_5": "الوظيفة",
  "__EMPTY_6": "تاريخ التعيين",
  "__EMPTY_7": "تاريخ انتهاء العقد",
  "__EMPTY_8": "الرقم القومي",
  "__EMPTY_9": "معامل الراتب",
  "__EMPTY_10": "الراتب الشهري",
  "__EMPTY_11": "زيادة",
  "__EMPTY_12": "اخرى",
  "__EMPTY_13": "إجمالي الراتب",
  "__EMPTY_14": "الراتب التأميني",
  "__EMPTY_15": "حصة التأمينات",
  "__EMPTY_16": "ضريبة كسب العمل",
  "__EMPTY_17": "بدل انتقال",
  "__EMPTY_18": "بدلات",
  "__EMPTY_19": "إجمالي السنوي",
  "__EMPTY_20": "مكافأة سنوية",
  "__EMPTY_21": "شهري",
  "__EMPTY_22": "صافي الراتب",
  "__EMPTY_23": "اليومي",
  "جزاءات": "جزاءات",
  "__EMPTY_24": "قيمة الجزاءات",
  "غياب ": "غياب",
  "__EMPTY_25": "قيمة الغياب",
  "إجازة بالخصم": "إجازة بالخصم",
  "__EMPTY_26": "قيمة إجازة بالخصم",
  "انصراف مبكر": "انصراف مبكر",
  "__EMPTY_27": "قيمة انصراف مبكر",
  "تأخير ": "تأخير",
  "__EMPTY_28": "قيمة التأخير",
  "سلف": "السلف",
  "__EMPTY_29": "إجمالي الخصومات",
  "__EMPTY_30": "صافي المستحق",
  "__EMPTY_31": "أوفر تايم ساعات",
  "__EMPTY_32": "مكافآت",
  "__EMPTY_33": "حوافز",
  "__EMPTY_34": "بدل حضور",
  "__EMPTY_35": "بدل ورادي",
  "__EMPTY_36": "بدل اضافي",
  "__EMPTY_37": "عمولة 1",
  "__EMPTY_38": "عمولة 2",
  "__EMPTY_39": "عمولة 3",
  "__EMPTY_40": "عمولة 4",
  "__EMPTY_41": "عمولة 5",
  "__EMPTY_42": "عمولة 6",
  "__EMPTY_43": "عمولة 7",
  "__EMPTY_44": "عمولة 8",
  "__EMPTY_45": "عمولة 9",
  "__EMPTY_46": "عمولة 10",
  "__EMPTY_47": "عمولة 11",
  "__EMPTY_48": "عمولة 12",
  "__EMPTY_49": "عمولة 13",
  "__EMPTY_50": "عمولة 14",
  "__EMPTY_51": "عمولة 15",
  "__EMPTY_52": "عمولة 16",
  "__EMPTY_53": "عمولة 17",
  "__EMPTY_54": "عمولة 18",
  "__EMPTY_55": "إجمالي العمولات",
  "__EMPTY_56": "إجمالي الإضافات",
  "__EMPTY_57": "تأمينات تراكمية",
  "__EMPTY_58": "تأمين سنوي",
  "__EMPTY_59": "ضريبة تراكمية",
  "__EMPTY_60": "بدل انتقال تراكمي",
  "__EMPTY_61": "بدلات تراكمية",
  "__EMPTY_62": "إجمالي سنوي تراكمي",
  "__EMPTY_63": "مكافأة سنوية تراكمية",
  "__EMPTY_64": "شهري تراكمي",
  "__EMPTY_65": "زيادة شهري",
  "__EMPTY_66": "صافي المستحق النهائي",
  "__EMPTY_67": "ملاحظات",
  "__EMPTY_68": "ملاحظات 2",
  "__EMPTY_69": "المبلغ المستحق",
  "__EMPTY_70": "طريقة الصرف",
};

// Function to map Excel columns to Arabic names
function mapExcelToArabic(row: Record<string, any>): Record<string, any> {
  const mapped: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    const arabicKey = excelColumnMap[key] || key;
    mapped[arabicKey] = value;
  }
  return mapped;
}

// Temp storage for import preview
let pendingImport: {
  changes: ImportPreview["changes"];
  newEmployees: Partial<Employee>[];
  keyColumn: string;
} | null = null;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get employees with pagination, search, and filters
  app.get("/api/employees", async (req: Request, res: Response) => {
    try {
      const params: PaginationParams = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        search: req.query.search as string,
        branch: req.query.branch as string,
        department: req.query.department as string,
        sector: req.query.sector as string,
        sortField: req.query.sortField as string,
        sortDirection: req.query.sortDirection as "asc" | "desc",
      };
      
      const result = await storage.getEmployees(params);
      res.json(result);
    } catch (err) {
      console.error("Error getting employees:", err);
      res.status(500).json({ error: "Failed to get employees" });
    }
  });

  // Get filter options
  app.get("/api/employees/filters", async (req: Request, res: Response) => {
    try {
      const filters = await storage.getFilters();
      res.json(filters);
    } catch (err) {
      console.error("Error getting filters:", err);
      res.status(500).json({ error: "Failed to get filters" });
    }
  });

  // Create employee
  app.post("/api/employees", async (req: Request, res: Response) => {
    try {
      const employeeData = req.body as InsertEmployee;
      const employee = await storage.createEmployee(employeeData);
      res.json(employee);
    } catch (err) {
      console.error("Error creating employee:", err);
      res.status(500).json({ error: "Failed to create employee" });
    }
  });

  // Update employee field
  app.put("/api/employees/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { field, value } = req.body;
      
      if (!editableFields.includes(field as any)) {
        return res.status(400).json({ error: "Field is not editable" });
      }
      
      const employee = await storage.updateEmployee(id, field, value);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      
      res.json(employee);
    } catch (err) {
      console.error("Error updating employee:", err);
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  // Delete employee
  app.delete("/api/employees/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteEmployee(id);
      
      if (!success) {
        return res.status(404).json({ error: "Employee not found" });
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting employee:", err);
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  // Get history
  app.get("/api/history", async (req: Request, res: Response) => {
    try {
      const history = await storage.getHistory();
      res.json(history);
    } catch (err) {
      console.error("Error getting history:", err);
      res.status(500).json({ error: "Failed to get history" });
    }
  });

  // Get notes for employee
  app.get("/api/notes/:employeeId", async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.params;
      const notes = await storage.getNotes(employeeId);
      res.json(notes);
    } catch (err) {
      console.error("Error getting notes:", err);
      res.status(500).json({ error: "Failed to get notes" });
    }
  });

  // Add note
  app.post("/api/notes/:employeeId", async (req: Request, res: Response) => {
    try {
      const { employeeId } = req.params;
      const { text } = req.body;
      
      const note = await storage.addNote({
        employeeId,
        text,
        user: "guest",
        timestamp: new Date().toISOString(),
      });
      
      res.json(note);
    } catch (err) {
      console.error("Error adding note:", err);
      res.status(500).json({ error: "Failed to add note" });
    }
  });

  // Delete note
  app.delete("/api/notes/:noteId", async (req: Request, res: Response) => {
    try {
      const { noteId } = req.params;
      const success = await storage.deleteNote(noteId);
      
      if (!success) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting note:", err);
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  // Get backups
  app.get("/api/backups", async (req: Request, res: Response) => {
    try {
      const backups = await storage.getBackups();
      res.json(backups);
    } catch (err) {
      console.error("Error getting backups:", err);
      res.status(500).json({ error: "Failed to get backups" });
    }
  });

  // Create backup
  app.post("/api/backup", async (req: Request, res: Response) => {
    try {
      const backup = await storage.createBackup();
      res.json(backup);
    } catch (err) {
      console.error("Error creating backup:", err);
      res.status(500).json({ error: "Failed to create backup" });
    }
  });

  // Restore backup
  app.post("/api/backup/restore", async (req: Request, res: Response) => {
    try {
      const { filename } = req.body;
      const success = await storage.restoreBackup(filename);
      
      if (!success) {
        return res.status(404).json({ error: "Backup not found" });
      }
      
      res.json({ success: true });
    } catch (err) {
      console.error("Error restoring backup:", err);
      res.status(500).json({ error: "Failed to restore backup" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (err) {
      console.error("Error getting dashboard stats:", err);
      res.status(500).json({ error: "Failed to get dashboard stats" });
    }
  });

  // Import preview
  app.post("/api/import/preview", upload.single("file"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      const keyColumn = req.body.keyColumn || "الكود";
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<any>(worksheet);
      
      if (data.length === 0) {
        return res.status(400).json({ error: "File is empty" });
      }
      
      const existingEmployees = await storage.getAllEmployees();
      const existingByKey = new Map<string, Employee>();
      
      for (const emp of existingEmployees) {
        const keyValue = (emp as any)[keyColumn];
        if (keyValue) {
          existingByKey.set(String(keyValue), emp);
        }
      }
      
      const changes: ImportPreview["changes"] = [];
      const newEmployees: Partial<Employee>[] = [];
      let updatedRecords = 0;
      let newRecords = 0;
      
      for (const row of data) {
        const keyValue = String(row[keyColumn] || "");
        if (!keyValue) continue;
        
        const existing = existingByKey.get(keyValue);
        
        if (existing) {
          // Check for changes
          for (const field of Object.keys(row)) {
            if (field === keyColumn) continue;
            
            const oldValue = (existing as any)[field];
            let newValue = row[field];
            
            // Convert to number if it's an editable field
            if (editableFields.includes(field as any)) {
              newValue = newValue !== undefined && newValue !== "" ? parseFloat(newValue) : null;
            }
            
            if (oldValue !== newValue) {
              changes.push({
                employeeId: existing.id,
                employeeName: existing.الاسم || existing.الكود || "",
                field,
                oldValue: oldValue ?? null,
                newValue: newValue ?? null,
              });
            }
          }
          updatedRecords++;
        } else {
          // New employee
          const newEmp: Partial<Employee> = {};
          for (const field of Object.keys(row)) {
            if (editableFields.includes(field as any)) {
              (newEmp as any)[field] = row[field] !== undefined && row[field] !== "" 
                ? parseFloat(row[field]) 
                : null;
            } else {
              (newEmp as any)[field] = row[field];
            }
          }
          newEmployees.push(newEmp);
          newRecords++;
        }
      }
      
      pendingImport = { changes, newEmployees, keyColumn };
      
      res.json({
        changes,
        newRecords,
        updatedRecords,
      });
    } catch (err) {
      console.error("Error previewing import:", err);
      res.status(500).json({ error: "Failed to preview import" });
    }
  });

  // Confirm import
  app.post("/api/import/confirm", async (req: Request, res: Response) => {
    try {
      if (!pendingImport) {
        return res.status(400).json({ error: "No pending import" });
      }
      
      const { changes, newEmployees, keyColumn } = pendingImport;
      const existingEmployees = await storage.getAllEmployees();
      
      // Apply changes
      for (const change of changes) {
        await storage.updateEmployee(change.employeeId, change.field, change.newValue as number | null);
      }
      
      // Add new employees
      for (const emp of newEmployees) {
        await storage.createEmployee(emp as InsertEmployee);
      }
      
      pendingImport = null;
      
      res.json({ success: true });
    } catch (err) {
      console.error("Error confirming import:", err);
      res.status(500).json({ error: "Failed to confirm import" });
    }
  });

  // Export to Excel
  app.get("/api/export/excel", async (req: Request, res: Response) => {
    try {
      const employees = await storage.getAllEmployees();
      
      // Remove id field for export
      const data = employees.map(({ id, ...rest }) => rest);
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "الموظفين");
      
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=employees.xlsx");
      res.send(buffer);
    } catch (err) {
      console.error("Error exporting Excel:", err);
      res.status(500).json({ error: "Failed to export Excel" });
    }
  });

  // Export to JSON
  app.get("/api/export/json", async (req: Request, res: Response) => {
    try {
      const employees = await storage.getAllEmployees();
      
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", "attachment; filename=employees.json");
      res.json(employees);
    } catch (err) {
      console.error("Error exporting JSON:", err);
      res.status(500).json({ error: "Failed to export JSON" });
    }
  });

  // Export payslip (simplified HTML for now - PDF generation can be added)
  app.get("/api/export/payslip/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const employee = await storage.getEmployeeById(id);
      
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      
      const html = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>قسيمة راتب - ${employee.الاسم}</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Cairo', sans-serif; padding: 40px; background: #f5f5f5; }
            .payslip { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { font-size: 24px; margin-bottom: 8px; }
            .header p { color: #666; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 30px; }
            .info-item { padding: 12px; background: #f9f9f9; border-radius: 6px; }
            .info-item label { font-size: 12px; color: #666; display: block; margin-bottom: 4px; }
            .info-item span { font-weight: 600; }
            .section { margin-bottom: 24px; }
            .section h3 { font-size: 16px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
            .table { width: 100%; border-collapse: collapse; }
            .table th, .table td { padding: 10px 12px; text-align: right; border-bottom: 1px solid #eee; }
            .table th { background: #f5f5f5; font-weight: 600; }
            .table td:last-child { text-align: left; font-family: monospace; }
            .total { font-size: 18px; font-weight: 700; margin-top: 20px; padding: 16px; background: #f0f7ff; border-radius: 6px; display: flex; justify-content: space-between; }
            @media print { body { background: white; padding: 0; } .payslip { box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="payslip">
            <div class="header">
              <h1>قسيمة راتب</h1>
              <p>شهر ${new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}</p>
            </div>
            
            <div class="info-grid">
              <div class="info-item">
                <label>الكود</label>
                <span>${employee.الكود || '-'}</span>
              </div>
              <div class="info-item">
                <label>الاسم</label>
                <span>${employee.الاسم || '-'}</span>
              </div>
              <div class="info-item">
                <label>الفرع</label>
                <span>${employee.الفرع || '-'}</span>
              </div>
              <div class="info-item">
                <label>الإدارة</label>
                <span>${employee.الإدارة || '-'}</span>
              </div>
              <div class="info-item">
                <label>الوظيفة</label>
                <span>${employee.الوظيفة || '-'}</span>
              </div>
              <div class="info-item">
                <label>القطاع</label>
                <span>${employee.القطاع || '-'}</span>
              </div>
            </div>
            
            <div class="section">
              <h3>تفاصيل الراتب</h3>
              <table class="table">
                <tr>
                  <th>البند</th>
                  <th>القيمة</th>
                </tr>
                <tr>
                  <td>الراتب الشهري</td>
                  <td>${(employee["الراتب الشهري"] || 0).toLocaleString('ar-EG')} ج.م</td>
                </tr>
                <tr>
                  <td>البدلات</td>
                  <td>${(employee.بدلات || 0).toLocaleString('ar-EG')} ج.م</td>
                </tr>
                <tr>
                  <td>المكافآت</td>
                  <td>${(employee.مكافات || 0).toLocaleString('ar-EG')} ج.م</td>
                </tr>
                <tr>
                  <td>الحافز</td>
                  <td>${(employee.حافز || 0).toLocaleString('ar-EG')} ج.م</td>
                </tr>
                <tr>
                  <td>أوفر تايم</td>
                  <td>${(employee["اوفر تايم"] || 0).toLocaleString('ar-EG')} ج.م</td>
                </tr>
              </table>
            </div>
            
            <div class="section">
              <h3>الخصومات</h3>
              <table class="table">
                <tr>
                  <th>البند</th>
                  <th>القيمة</th>
                </tr>
                <tr>
                  <td>السلف</td>
                  <td>${(employee.السلف || 0).toLocaleString('ar-EG')} ج.م</td>
                </tr>
              </table>
            </div>
            
            <div class="total">
              <span>إجمالي المستحق</span>
              <span>${(
                (employee["الراتب الشهري"] || 0) +
                (employee.بدلات || 0) +
                (employee.مكافات || 0) +
                (employee.حافز || 0) +
                (employee["اوفر تايم"] || 0) -
                (employee.السلف || 0)
              ).toLocaleString('ar-EG')} ج.م</span>
            </div>
          </div>
          <script>window.print();</script>
        </body>
        </html>
      `;
      
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    } catch (err) {
      console.error("Error exporting payslip:", err);
      res.status(500).json({ error: "Failed to export payslip" });
    }
  });

  // Reset all data (for development)
  app.post("/api/reset", async (req: Request, res: Response) => {
    try {
      await storage.reset();
      res.json({ message: "Data reset successfully" });
    } catch (err) {
      console.error("Error resetting data:", err);
      res.status(500).json({ error: "Failed to reset data" });
    }
  });

  // Import initial data from Excel file (if available)
  app.post("/api/import/initial", async (req: Request, res: Response) => {
    try {
      const filePath = path.join(process.cwd(), "attached_assets", "مرتبات_شهر_نوفمبر2025_V2_1764889114625.xlsx");
      
      // Read file as buffer
      const buffer = await fs.readFile(filePath);
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<any>(worksheet);
      
      const existingEmployees = await storage.getAllEmployees();
      if (existingEmployees.length > 0) {
        return res.json({ message: "Data already exists", count: existingEmployees.length });
      }
      
      for (const row of data) {
        // Map Excel columns to Arabic names
        const mappedRow = mapExcelToArabic(row);
        
        // Skip header row (first row with "الكود" value being "الكود")
        if (mappedRow["الكود"] === "الكود" || typeof mappedRow["الكود"] !== "number") {
          continue;
        }
        
        const employee: Partial<Employee> = {};
        for (const field of Object.keys(mappedRow)) {
          if (editableFields.includes(field as any)) {
            (employee as any)[field] = mappedRow[field] !== undefined && mappedRow[field] !== "" 
              ? parseFloat(mappedRow[field]) 
              : null;
          } else {
            (employee as any)[field] = mappedRow[field];
          }
        }
        await storage.createEmployee(employee as InsertEmployee);
      }
      
      res.json({ message: "Data imported successfully", count: data.length });
    } catch (err) {
      console.error("Error importing initial data:", err);
      res.status(500).json({ error: "Failed to import initial data" });
    }
  });

  return httpServer;
}
