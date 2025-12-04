import { promises as fs } from "fs";
import { randomUUID } from "crypto";
import path from "path";
import type { Employee, InsertEmployee, Note, InsertNote, HistoryEntry, InsertHistory, DashboardStats, PaginatedResponse, PaginationParams, BackupInfo } from "@shared/schema";
import { editableFields } from "@shared/schema";

const DATA_DIR = path.join(process.cwd(), "data");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");
const EMPLOYEES_FILE = path.join(DATA_DIR, "employees.json");
const HISTORY_FILE = path.join(DATA_DIR, "history.json");
const NOTES_FILE = path.join(DATA_DIR, "notes.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(BACKUPS_DIR, { recursive: true });
  } catch (err) {
    // Directory already exists
  }
}

// Read JSON file
async function readJsonFile<T>(filePath: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return defaultValue;
  }
}

// Write JSON file
async function writeJsonFile(filePath: string, data: any): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export interface IStorage {
  // Employees
  getEmployees(params: PaginationParams): Promise<PaginatedResponse<Employee>>;
  getEmployeeById(id: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, field: string, value: number | null): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;
  getAllEmployees(): Promise<Employee[]>;
  setEmployees(employees: Employee[]): Promise<void>;
  getFilters(): Promise<{ branches: string[]; departments: string[]; sectors: string[] }>;
  reset(): Promise<void>;
  
  // History
  getHistory(): Promise<HistoryEntry[]>;
  addHistory(entry: InsertHistory): Promise<HistoryEntry>;
  
  // Notes
  getNotes(employeeId: string): Promise<Note[]>;
  addNote(note: InsertNote): Promise<Note>;
  deleteNote(noteId: string): Promise<boolean>;
  
  // Backup
  createBackup(): Promise<BackupInfo>;
  getBackups(): Promise<BackupInfo[]>;
  restoreBackup(filename: string): Promise<boolean>;
  
  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
}

export class JsonStorage implements IStorage {
  private employees: Employee[] = [];
  private history: HistoryEntry[] = [];
  private notes: Note[] = [];
  private headers: string[] = [];
  private initialized = false;

  async init() {
    if (this.initialized) return;
    this.employees = await readJsonFile<Employee[]>(EMPLOYEES_FILE, []);
    this.history = await readJsonFile<HistoryEntry[]>(HISTORY_FILE, []);
    this.notes = await readJsonFile<Note[]>(NOTES_FILE, []);
    this.initialized = true;
  }

  private async save() {
    await Promise.all([
      writeJsonFile(EMPLOYEES_FILE, this.employees),
      writeJsonFile(HISTORY_FILE, this.history),
      writeJsonFile(NOTES_FILE, this.notes),
    ]);
  }

  // Employees
  async getEmployees(params: PaginationParams): Promise<PaginatedResponse<Employee>> {
    await this.init();
    
    let filtered = [...this.employees];
    
    // Search
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter((emp) => {
        const name = (emp.الاسم || "").toLowerCase();
        const code = (emp.الكود || "").toLowerCase();
        const nationalId = (emp["الرقم القومي"] || "").toLowerCase();
        const branch = (emp.الفرع || "").toLowerCase();
        const dept = (emp.الإدارة || "").toLowerCase();
        return name.includes(searchLower) || 
               code.includes(searchLower) || 
               nationalId.includes(searchLower) ||
               branch.includes(searchLower) ||
               dept.includes(searchLower);
      });
    }
    
    // Filters
    if (params.branch && params.branch !== "all") {
      filtered = filtered.filter((emp) => emp.الفرع === params.branch);
    }
    if (params.department && params.department !== "all") {
      filtered = filtered.filter((emp) => emp.الإدارة === params.department);
    }
    if (params.sector && params.sector !== "all") {
      filtered = filtered.filter((emp) => emp.القطاع === params.sector);
    }
    
    // Sort
    if (params.sortField) {
      filtered.sort((a, b) => {
        const aVal = (a as any)[params.sortField!];
        const bVal = (b as any)[params.sortField!];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        let comparison = 0;
        if (typeof aVal === "number" && typeof bVal === "number") {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal), "ar");
        }
        
        return params.sortDirection === "desc" ? -comparison : comparison;
      });
    }
    
    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 50;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);
    
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getEmployeeById(id: string): Promise<Employee | undefined> {
    await this.init();
    return this.employees.find((e) => e.id === id);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    await this.init();
    const newEmployee: Employee = {
      ...employee,
      id: randomUUID(),
    };
    this.employees.push(newEmployee);
    await this.save();
    return newEmployee;
  }

  async updateEmployee(id: string, field: string, value: number | null): Promise<Employee | undefined> {
    await this.init();
    const index = this.employees.findIndex((e) => e.id === id);
    if (index === -1) return undefined;
    
    const employee = this.employees[index];
    const oldValue = (employee as any)[field];
    
    (employee as any)[field] = value;
    this.employees[index] = employee;
    
    // Add to history
    await this.addHistory({
      employeeId: id,
      employeeName: employee.الاسم || employee.الكود,
      field,
      oldValue,
      newValue: value,
      user: "guest",
      timestamp: new Date().toISOString(),
    });
    
    await this.save();
    return employee;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    await this.init();
    const index = this.employees.findIndex((e) => e.id === id);
    if (index === -1) return false;
    
    const employee = this.employees[index];
    
    // Add to history
    await this.addHistory({
      employeeId: id,
      employeeName: employee.الاسم || employee.الكود,
      field: "حذف",
      oldValue: employee.الاسم || null,
      newValue: null,
      user: "guest",
      timestamp: new Date().toISOString(),
    });
    
    this.employees.splice(index, 1);
    await this.save();
    return true;
  }

  async getAllEmployees(): Promise<Employee[]> {
    await this.init();
    return [...this.employees];
  }

  async setEmployees(employees: Employee[]): Promise<void> {
    await this.init();
    this.employees = employees;
    await this.save();
  }

  async getFilters(): Promise<{ branches: string[]; departments: string[]; sectors: string[] }> {
    await this.init();
    
    const branches = [...new Set(this.employees.map((e) => e.الفرع).filter(Boolean))] as string[];
    const departments = [...new Set(this.employees.map((e) => e.الإدارة).filter(Boolean))] as string[];
    const sectors = [...new Set(this.employees.map((e) => e.القطاع).filter(Boolean))] as string[];
    
    return { branches, departments, sectors };
  }

  async reset(): Promise<void> {
    this.employees = [];
    this.history = [];
    this.notes = [];
    await this.save();
  }

  // History
  async getHistory(): Promise<HistoryEntry[]> {
    await this.init();
    return [...this.history].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async addHistory(entry: InsertHistory): Promise<HistoryEntry> {
    await this.init();
    const newEntry: HistoryEntry = {
      ...entry,
      id: randomUUID(),
    };
    this.history.push(newEntry);
    await this.save();
    return newEntry;
  }

  // Notes
  async getNotes(employeeId: string): Promise<Note[]> {
    await this.init();
    return this.notes
      .filter((n) => n.employeeId === employeeId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async addNote(note: InsertNote): Promise<Note> {
    await this.init();
    const newNote: Note = {
      ...note,
      id: randomUUID(),
    };
    this.notes.push(newNote);
    await this.save();
    return newNote;
  }

  async deleteNote(noteId: string): Promise<boolean> {
    await this.init();
    const index = this.notes.findIndex((n) => n.id === noteId);
    if (index === -1) return false;
    this.notes.splice(index, 1);
    await this.save();
    return true;
  }

  // Backup
  async createBackup(): Promise<BackupInfo> {
    await this.init();
    await ensureDataDir();
    
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const filename = `backup-${timestamp}.json`;
    const filePath = path.join(BACKUPS_DIR, filename);
    
    const backupData = {
      employees: this.employees,
      history: this.history,
      notes: this.notes,
      timestamp: now.toISOString(),
    };
    
    await writeJsonFile(filePath, backupData);
    
    return {
      filename,
      timestamp: now.toISOString(),
      employeeCount: this.employees.length,
    };
  }

  async getBackups(): Promise<BackupInfo[]> {
    await ensureDataDir();
    
    try {
      const files = await fs.readdir(BACKUPS_DIR);
      const backups: BackupInfo[] = [];
      
      for (const file of files) {
        if (file.endsWith(".json")) {
          try {
            const filePath = path.join(BACKUPS_DIR, file);
            const data = await readJsonFile<any>(filePath, null);
            if (data) {
              backups.push({
                filename: file,
                timestamp: data.timestamp || new Date().toISOString(),
                employeeCount: data.employees?.length || 0,
              });
            }
          } catch (err) {
            // Skip invalid files
          }
        }
      }
      
      return backups.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (err) {
      return [];
    }
  }

  async restoreBackup(filename: string): Promise<boolean> {
    await this.init();
    
    try {
      const filePath = path.join(BACKUPS_DIR, filename);
      const data = await readJsonFile<any>(filePath, null);
      
      if (!data) return false;
      
      // Create backup before restore
      await this.createBackup();
      
      this.employees = data.employees || [];
      this.history = data.history || [];
      this.notes = data.notes || [];
      
      await this.save();
      return true;
    } catch (err) {
      return false;
    }
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    await this.init();
    
    let totalSalaries = 0;
    let totalAllowances = 0;
    let totalCommissions = 0;
    
    const commissionFields = [
      "عمولات رايا",
      "عمولات شركه حالا",
      "عمولات سفن",
      "عمولات الاسكندريه",
      "عمولات كريدي",
      "عمولات ماني",
      "عمولات رايه قانوني",
      "عمولات فاليو قانونى",
      "بلتون قانونى",
      "عمولات تنمية قانونى",
      "عمولات وسيلة قانونى",
      "عمولات ميد قانوني",
      "عمولة سهولة قانوني",
    ];
    
    const employeeCommissions: { id: string; name: string; totalCommissions: number }[] = [];
    
    for (const emp of this.employees) {
      const salary = emp["الراتب الشهري"] || 0;
      totalSalaries += salary;
      
      const allowances = (emp.بدلات || 0) + (emp.مكافات || 0) + (emp.حافز || 0);
      totalAllowances += allowances;
      
      let empCommissions = 0;
      for (const field of commissionFields) {
        const val = (emp as any)[field] || 0;
        empCommissions += val;
      }
      totalCommissions += empCommissions;
      
      employeeCommissions.push({
        id: emp.id,
        name: emp.الاسم || emp.الكود || "غير معروف",
        totalCommissions: empCommissions,
      });
    }
    
    const topEarners = employeeCommissions
      .sort((a, b) => b.totalCommissions - a.totalCommissions)
      .slice(0, 10);
    
    return {
      totalEmployees: this.employees.length,
      totalSalaries,
      totalAllowances,
      totalCommissions,
      averageSalary: this.employees.length > 0 ? totalSalaries / this.employees.length : 0,
      topEarners,
    };
  }

  // Headers (for Excel import/export)
  setHeaders(headers: string[]) {
    this.headers = headers;
  }

  getHeaders(): string[] {
    return this.headers;
  }
}

export const storage = new JsonStorage();
