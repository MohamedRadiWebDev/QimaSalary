# Design Guidelines: Employee Payroll Management System

## Design Approach
**System-Based Approach**: Carbon Design System + Fluent Design principles
- **Rationale**: Data-heavy enterprise application requiring clarity, efficiency, and information density management
- **Key Principles**: Functional hierarchy, data-first design, RTL Arabic support, minimal cognitive load

## Typography
**Font Family**: 
- Primary: 'Cairo' (Google Fonts) - excellent Arabic support with clear numerals
- Weights: Regular (400), Medium (500), SemiBold (600), Bold (700)

**Type Scale**:
- Page Headers: text-2xl (24px) font-bold
- Section Titles: text-lg (18px) font-semibold
- Table Headers: text-sm (14px) font-medium uppercase tracking-wide
- Body/Data: text-sm (14px) font-regular
- Labels: text-xs (12px) font-medium
- Numbers in tables: font-mono for alignment

## Layout System
**Spacing Units**: Tailwind scale of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6
- Section gaps: gap-6, gap-8
- Table cell padding: px-4 py-3
- Modal padding: p-6, p-8

**Grid Structure**:
- Main container: max-w-[1920px] mx-auto (accommodate wide tables)
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Content padding: px-6 py-4

## Core Components

### Navigation
- Horizontal top bar with logo, main sections (الموظفين، التقارير، الإحصائيات، الإعدادات)
- Action buttons in top-right: استيراد، تصدير، نسخ احتياطي
- Breadcrumb navigation below for context

### Data Table (Primary Component)
- Sticky header row with sort indicators
- Frozen first 2 columns (الكود، الاسم) for horizontal scroll
- Editable cells: inline input on click, blue border focus state
- Row hover: subtle background change
- Zebra striping for rows (every other row)
- Compact density: 40px row height
- Horizontal scroll container with shadow indicators on edges

### Search & Filters Bar
- Full-width bar above table: flex layout
- Search input (w-64): بحث (الاسم، الكود، الرقم القومي...)
- Filter dropdowns: الفرع، الإدارة، القطاع (each w-40)
- Results count display: عرض 1-50 من 500 موظف
- Clear filters button (text-sm)

### Modals
- Centered overlay with backdrop blur
- Modal width: max-w-2xl for forms, max-w-4xl for import preview
- Header: title + close button (absolute top-right)
- Body: scrollable content area max-h-[70vh]
- Footer: action buttons (إلغاء on left, primary action on right)

### Forms (Add/Edit Employee)
- Two-column layout: grid-cols-2 gap-6
- Field groups with labels above inputs
- Required fields marked with red asterisk
- Input fields: h-10 with border and rounded-md
- Numeric inputs: font-mono with rtl override for numbers

### Dashboard Cards
- Stat cards: h-32 with metric prominently displayed
- Icon top-right, value center-left, label below
- Charts: use recharts library with Arabic labels
- Top performers table: compact 5-row display

### Notes System
- Side panel or modal with timeline layout
- Each note: card with timestamp, user badge, text content
- Add note: textarea at top with submit button
- Delete icon (subtle) on note hover

### History/Audit Log
- Table layout with columns: التاريخ، الموظف، الحقل، القيمة القديمة، القيمة الجديدة، المستخدم
- Filterable by date range, employee, field
- Diff highlighting: old value struck-through, new value highlighted

## RTL & Arabic Support
- Root dir="rtl" on <html>
- Text alignment: text-right for Arabic content
- Flex/grid reverse where needed: flex-row-reverse
- Icons: mirror horizontally for directional icons
- Number inputs: dir="ltr" to keep numbers left-to-right

## Interactive States
- Editable cells: border-2 border-blue-500 on focus, save icon appears
- Buttons: hover shadow-md, active shadow-sm
- Dropdowns: smooth open animation (100ms)
- Toast notifications: slide in from top-left (RTL)
- Loading states: skeleton loaders for table rows

## Accessibility
- Focus visible ring on all interactive elements
- Aria labels in Arabic for screen readers
- Keyboard navigation: Tab through editable cells, Enter to edit
- Error messages in red text below invalid inputs
- Sufficient contrast ratios (WCAG AA minimum)

## Visual Hierarchy
- Primary actions: solid backgrounds with medium weight
- Secondary actions: outline buttons
- Destructive actions: red/warning treatment
- Data emphasis: bold for totals, medium for regular values
- Grouping: subtle borders or backgrounds for related content sections

## Images
No hero images needed. This is a data-management application. Include:
- Empty state illustrations for "No employees found" (simple line art)
- Dashboard placeholder icons for stat cards (salary, allowances, commissions icons)
- PDF export: company logo placeholder in header