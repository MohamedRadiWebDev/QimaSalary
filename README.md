
# نظام إدارة رواتب الموظفين | Employee Payroll Management System

<div dir="rtl">

## 📋 نظرة عامة

نظام شامل لإدارة رواتب الموظفين مصمم خصيصاً للشركات العربية. يوفر النظام واجهة سهلة الاستخدام مع دعم كامل للغة العربية واتجاه النص من اليمين لليسار (RTL).

### ✨ المميزات الرئيسية

- 📊 **إدارة بيانات الموظفين**: عرض وتعديل بيانات أكثر من 77 عمود لكل موظف
- 💰 **حسابات الرواتب**: حساب تلقائي للرواتب والعمولات والخصومات
- 📈 **لوحة التحكم**: إحصائيات مفصلة ورسوم بيانية تفاعلية
- 📥 **استيراد/تصدير**: دعم ملفات Excel وJSON
- 🔍 **البحث والتصفية**: بحث متقدم وتصفية حسب الفرع والإدارة والقطاع
- ✏️ **التعديل المباشر**: تعديل البيانات مباشرة من الجدول
- 📝 **سجل التغييرات**: تتبع جميع التعديلات على البيانات
- 💾 **النسخ الاحتياطي**: إنشاء واستعادة نسخ احتياطية تلقائياً
- 🌙 **الوضع الليلي**: دعم الثيم الفاتح والداكن

</div>

---

## 🚀 Quick Start for Users

### Accessing the System

1. Open the application URL in your browser
2. You'll see the main employees table (جدول الموظفين)
3. Use the search bar to find employees by name, code, or national ID
4. Use filters to narrow down by branch (الفرع), department (الإدارة), or sector (القطاع)

### Basic Operations

#### Viewing Employee Data
- Scroll horizontally to view all 77+ columns
- First two columns (Code & Name) are frozen for easy reference
- Click on any row to see full details

#### Editing Employee Data
- Click on any editable cell (salary, commissions, allowances, etc.)
- Type the new value
- Press Enter or click outside to save
- Changes are saved automatically and logged in history

#### Adding New Employee
1. Click "إضافة موظف" (Add Employee) button
2. Fill in the required fields
3. Click "حفظ" (Save)

#### Importing from Excel
1. Click "استيراد" (Import) button
2. Upload your Excel file
3. Preview changes before confirming
4. Click "تأكيد الاستيراد" (Confirm Import)

#### Exporting Data
- Click "تصدير" (Export) dropdown
- Choose format: Excel, JSON, or Payslip
- File downloads automatically

---

<div dir="rtl">

## 👨‍💻 دليل المطور

### 🏗️ البنية التقنية

#### Frontend
- **React 18** مع TypeScript
- **Vite** كأداة بناء
- **TanStack Query** لإدارة البيانات
- **TanStack Table** لجداول البيانات المعقدة
- **shadcn/ui** مكونات واجهة المستخدم
- **Tailwind CSS** للتصميم
- **Wouter** للتوجيه

#### Backend
- **Express.js** مع TypeScript
- **Node.js** بيئة التشغيل
- **XLSX (SheetJS)** لمعالجة ملفات Excel
- **Multer** لرفع الملفات

#### التخزين
- **JSON Files** تخزين البيانات في ملفات
- **File System** نظام ملفات Node.js

</div>

---

## 📦 Installation & Setup

### Prerequisites
- Node.js 20.x or higher
- npm or yarn package manager

### Local Development

```bash
# Clone the repository (or fork on Replit)
git clone <repository-url>
cd employee-payroll-system

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will start on `http://localhost:5000`

### Environment Variables

Create a `.env` file if needed (optional for basic setup):

```env
PORT=5000
NODE_ENV=development
```

---

## 🗂️ Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   ├── employees-table.tsx
│   │   │   ├── editable-cell.tsx
│   │   │   ├── import-modal.tsx
│   │   │   └── ...
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   └── lib/          # Utilities and helpers
│   └── index.html
│
├── server/               # Backend Express server
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data storage layer
│   └── vite.ts          # Vite dev server integration
│
├── shared/              # Shared code between frontend & backend
│   └── schema.ts        # Zod schemas and TypeScript types
│
├── data/                # JSON data storage
│   ├── employees.json   # Employee records
│   ├── history.json     # Change history
│   ├── notes.json       # Employee notes
│   └── backups/         # Backup files
│
└── package.json
```

---

## 🔌 API Endpoints

### Employees

#### `GET /api/employees`
Get paginated list of employees

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 50)
- `search` (string): Search query
- `branch` (string): Filter by branch
- `department` (string): Filter by department
- `sector` (string): Filter by sector
- `sortField` (string): Field to sort by
- `sortDirection` ('asc' | 'desc'): Sort direction

**Response:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 50,
  "totalPages": 2
}
```

#### `POST /api/employees`
Create new employee

**Body:** Employee object (without id)

#### `PUT /api/employees/:id`
Update employee field

**Body:**
```json
{
  "field": "الراتب الشهري",
  "value": 5000
}
```

#### `DELETE /api/employees/:id`
Delete employee

### Import/Export

#### `POST /api/import/preview`
Preview Excel import

**Body:** FormData with file

#### `POST /api/import/confirm`
Confirm pending import

#### `GET /api/export/excel`
Export to Excel

#### `GET /api/export/json`
Export to JSON

#### `GET /api/export/payslip/:id`
Generate payslip HTML

### History & Notes

#### `GET /api/history`
Get change history

#### `GET /api/notes/:employeeId`
Get employee notes

#### `POST /api/notes/:employeeId`
Add note

#### `DELETE /api/notes/:noteId`
Delete note

### Backups

#### `GET /api/backups`
List backups

#### `POST /api/backup`
Create backup

#### `POST /api/backup/restore`
Restore backup

### Dashboard

#### `GET /api/dashboard/stats`
Get dashboard statistics

---

<div dir="rtl">

## 📊 نموذج البيانات

### هيكل بيانات الموظف

```typescript
{
  id: string,                    // معرف فريد
  الكود: string,                 // كود الموظف
  الاسم: string,                 // اسم الموظف
  "الرقم القومي": string,       // الرقم القومي
  الفرع: string,                 // الفرع
  الإدارة: string,               // الإدارة
  القطاع: string,                // القطاع
  الوظيفة: string,               // الوظيفة
  "تاريخ التعيين": string,      // تاريخ التعيين
  
  // حقول الراتب (قابلة للتعديل)
  "الراتب الشهري": number,      // الراتب الأساسي
  السلف: number,                 // السلف
  بدلات: number,                 // البدلات
  مكافات: number,                // المكافآت
  حافز: number,                  // الحوافز
  "اوفر تايم": number,           // أوفر تايم
  
  // العمولات (30+ حقل)
  "عمولات رايا": number,
  "عمولات شركه حالا": number,
  "عمولات سفن": number,
  // ... والمزيد
}
```

### الحقول القابلة للتعديل (30 حقل)

```typescript
const editableFields = [
  "الراتب الشهري",
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
  // ... إلخ
];
```

</div>

---

## 🎨 Design System

### Typography
- **Primary Font:** Cairo (Arabic support)
- **Monospace Font:** IBM Plex Mono (for numbers)

### Colors
- Support for light and dark themes
- Primary color: Blue
- Secondary color: Gray
- Accent colors for stats and alerts

### RTL Support
- Full right-to-left layout
- Proper Arabic text rendering
- Mirrored UI components

---

## 🔒 Data Security

### Data Storage
- All data stored in JSON files
- Automatic backup creation
- Change history tracking
- No external database required

### Backup System
- Timestamped backup files
- One-click restore
- Backup listing and management

---

## 🚀 Deployment on Replit

### Production Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Configuration

The `.replit` file is already configured with:
- Build command: `npm run build`
- Run command: `npm start`
- Port forwarding: 5000 → 80

### Environment
- Deployment target: Autoscale
- Port: 5000 (forwarded to 80/443)

---

## 🧪 Development Workflow

### Making Changes

1. **Frontend Components:**
   - Modify files in `client/src/components/`
   - Hot reload is enabled in development

2. **Backend API:**
   - Edit `server/routes.ts` for API endpoints
   - Edit `server/storage.ts` for data operations

3. **Shared Types:**
   - Update `shared/schema.ts` for data models
   - Types are shared between frontend and backend

### Testing Changes

```bash
# Development mode with hot reload
npm run dev

# Type checking
npm run check
```

---

<div dir="rtl">

## 📝 أمثلة الاستخدام

### مثال: تعديل راتب موظف

```typescript
// في الكود
const updateSalary = async (employeeId: string, newSalary: number) => {
  const response = await fetch(`/api/employees/${employeeId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      field: 'الراتب الشهري',
      value: newSalary
    })
  });
  return response.json();
};
```

### مثال: استيراد من Excel

```typescript
const importFromExcel = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('keyColumn', 'الكود');
  
  // معاينة
  const preview = await fetch('/api/import/preview', {
    method: 'POST',
    body: formData
  });
  
  // تأكيد
  await fetch('/api/import/confirm', {
    method: 'POST'
  });
};
```

</div>

---

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Import Not Working:**
- Check Excel file format matches the column mapping
- Ensure the key column (الكود) exists in the file
- Verify file encoding is UTF-8

**Data Not Saving:**
- Check file permissions in `data/` directory
- Verify JSON files are not corrupted
- Check server console for errors

---

## 🤝 Contributing

### How to Contribute

1. Fork the repository on Replit
2. Make your changes
3. Test thoroughly
4. Submit a pull request with description

### Code Style

- Use TypeScript for type safety
- Follow existing naming conventions
- Write descriptive commit messages
- Add comments for complex logic

---

## 📄 License

This project is licensed under the MIT License.

---

<div dir="rtl">

## 📞 الدعم

للحصول على المساعدة أو الإبلاغ عن مشكلة:

1. تحقق من قسم Troubleshooting أعلاه
2. راجع سجل التغييرات في `/api/history`
3. تحقق من console المتصفح للأخطاء
4. افحص ملفات البيانات في `/data`

## 🎯 الخطوات التالية

- [ ] إضافة مصادقة المستخدمين
- [ ] دعم قاعدة بيانات PostgreSQL
- [ ] تقارير PDF متقدمة
- [ ] إشعارات البريد الإلكتروني
- [ ] تطبيق الجوال
- [ ] واجهة API متقدمة

</div>

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [TanStack Query](https://tanstack.com/query)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Built with ❤️ for Arabic-speaking businesses**

**Version:** 1.0.0  
**Last Updated:** January 2025
