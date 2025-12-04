import { z } from "zod";

// Employee schema - matching the 77 columns from the Excel file
export const employeeSchema = z.object({
  id: z.string(),
  // Basic info columns
  الكود: z.string().optional(),
  الاسم: z.string().optional(),
  "الرقم القومي": z.string().optional(),
  الفرع: z.string().optional(),
  الإدارة: z.string().optional(),
  القطاع: z.string().optional(),
  الوظيفة: z.string().optional(),
  "تاريخ التعيين": z.string().optional(),
  "نوع التعاقد": z.string().optional(),
  الحالة: z.string().optional(),
  
  // Editable numeric fields (30 fields)
  "الراتب الشهري": z.number().nullable().optional(),
  عدد: z.number().nullable().optional(),
  عدد2: z.number().nullable().optional(),
  عدد4: z.number().nullable().optional(),
  عدد6: z.number().nullable().optional(),
  السلف: z.number().nullable().optional(),
  بدلات: z.number().nullable().optional(),
  مكافات: z.number().nullable().optional(),
  حافز: z.number().nullable().optional(),
  "اوفر تايم": z.number().nullable().optional(),
  تسويات: z.number().nullable().optional(),
  كونتست: z.number().nullable().optional(),
  "عمولات رايا": z.number().nullable().optional(),
  "عمولات شركه حالا": z.number().nullable().optional(),
  "عمولات سفن": z.number().nullable().optional(),
  "عمولات الاسكندريه": z.number().nullable().optional(),
  "عمولات كريدي": z.number().nullable().optional(),
  "عمولات ماني": z.number().nullable().optional(),
  "عمولات رايه قانوني": z.number().nullable().optional(),
  "عمولات فاليو قانونى": z.number().nullable().optional(),
  "بلتون قانونى": z.number().nullable().optional(),
  "عمولات تنمية قانونى": z.number().nullable().optional(),
  "عمولات وسيلة قانونى": z.number().nullable().optional(),
  "وسيلة 10": z.number().nullable().optional(),
  "وسيلة 9": z.number().nullable().optional(),
  تنمية: z.number().nullable().optional(),
  "عمولات ميد قانوني": z.number().nullable().optional(),
  "ميد بنك": z.number().nullable().optional(),
  ارادة: z.number().nullable().optional(),
  "عمولة سهولة قانوني": z.number().nullable().optional(),
});

// List of editable fields
export const editableFields = [
  "الراتب الشهري",
  "عدد",
  "عدد2",
  "عدد4",
  "عدد6",
  "السلف",
  "بدلات",
  "مكافات",
  "حافز",
  "اوفر تايم",
  "تسويات",
  "كونتست",
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
  "وسيلة 10",
  "وسيلة 9",
  "تنمية",
  "عمولات ميد قانوني",
  "ميد بنك",
  "ارادة",
  "عمولة سهولة قانوني",
] as const;

export type EditableField = typeof editableFields[number];

export type Employee = z.infer<typeof employeeSchema>;

// Insert schema for new employees
export const insertEmployeeSchema = employeeSchema.omit({ id: true });
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

// History entry schema
export const historyEntrySchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  employeeName: z.string().optional(),
  field: z.string(),
  oldValue: z.union([z.string(), z.number(), z.null()]),
  newValue: z.union([z.string(), z.number(), z.null()]),
  user: z.string().default("guest"),
  timestamp: z.string(),
});

export type HistoryEntry = z.infer<typeof historyEntrySchema>;
export const insertHistorySchema = historyEntrySchema.omit({ id: true });
export type InsertHistory = z.infer<typeof insertHistorySchema>;

// Note schema
export const noteSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  text: z.string(),
  user: z.string().default("guest"),
  timestamp: z.string(),
});

export type Note = z.infer<typeof noteSchema>;
export const insertNoteSchema = noteSchema.omit({ id: true });
export type InsertNote = z.infer<typeof insertNoteSchema>;

// Dashboard stats schema
export const dashboardStatsSchema = z.object({
  totalEmployees: z.number(),
  totalSalaries: z.number(),
  totalAllowances: z.number(),
  totalCommissions: z.number(),
  averageSalary: z.number(),
  topEarners: z.array(z.object({
    id: z.string(),
    name: z.string(),
    totalCommissions: z.number(),
  })),
});

export type DashboardStats = z.infer<typeof dashboardStatsSchema>;

// Pagination params
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(200).default(50),
  search: z.string().optional(),
  branch: z.string().optional(),
  department: z.string().optional(),
  sector: z.string().optional(),
  sortField: z.string().optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export type PaginationParams = z.infer<typeof paginationSchema>;

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Import preview type
export interface ImportPreview {
  changes: Array<{
    employeeId: string;
    employeeName: string;
    field: string;
    oldValue: string | number | null;
    newValue: string | number | null;
  }>;
  newRecords: number;
  updatedRecords: number;
}

// Backup info
export interface BackupInfo {
  filename: string;
  timestamp: string;
  employeeCount: number;
}
