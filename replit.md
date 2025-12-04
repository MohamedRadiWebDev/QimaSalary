# Employee Payroll Management System

## Overview

This is a comprehensive Employee Payroll Management System built for managing employee data, salaries, commissions, deductions, and generating reports. The system is designed specifically for Arabic-speaking users with full RTL (Right-to-Left) support and handles complex payroll calculations across 77+ data columns per employee.

The application provides Excel import/export capabilities, inline cell editing, change tracking, backup management, and detailed reporting features. It's designed to handle large datasets efficiently with pagination, filtering, and sorting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build Tool**
- **React 18** with TypeScript using Vite as the build tool
- **Rationale**: Modern React development with fast HMR (Hot Module Replacement) and optimized production builds
- **File Structure**: Client code organized under `/client/src` with pages, components, hooks, and lib directories

**UI Component System**
- **shadcn/ui** components built on Radix UI primitives with Tailwind CSS styling
- **Design System**: Follows Carbon Design System + Fluent Design principles for data-heavy enterprise applications
- **Typography**: Cairo font family for excellent Arabic support with clear numerals
- **RTL Support**: Full right-to-left layout with `dir="rtl"` on HTML root
- **Rationale**: Pre-built accessible components reduce development time while maintaining consistency and accessibility

**State Management & Data Fetching**
- **TanStack Query (React Query)** for server state management
- **Local State**: React hooks (useState, useCallback) for component-level state
- **Rationale**: React Query handles caching, background updates, and optimistic updates automatically, reducing boilerplate

**Routing**
- **Wouter** - lightweight routing library
- **Routes**: `/` (employees list), `/dashboard` (statistics), `/not-found` (404 page)
- **Rationale**: Minimal bundle size compared to React Router while providing necessary routing features

**Key UI Features**
- **Inline Editing**: Editable cells with optimistic updates for 30 numeric fields
- **Data Tables**: TanStack Table with frozen columns, sorting, pagination, and horizontal scroll
- **Modals & Panels**: Import preview, add employee, notes, delete confirmation, history tracking
- **Theme Support**: Light/dark mode toggle with localStorage persistence

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript running on Node.js
- **Build Process**: esbuild bundles server code with selected dependencies for faster cold starts
- **Static Serving**: Serves built Vite client from `/dist/public` directory

**API Design**
- **RESTful API** under `/api/*` routes
- **Key Endpoints**:
  - Employee CRUD: GET/POST/PUT/DELETE `/api/employees`
  - Import/Export: POST `/api/import`, GET `/api/export`
  - Filtering: GET `/api/employees/filters`
  - History: GET `/api/history`
  - Notes: GET/POST/DELETE `/api/notes/:employeeId`
  - Backups: GET `/api/backups`, POST `/api/backup`, POST `/api/backup/restore`
  - Dashboard: GET `/api/dashboard/stats`

**File Upload**
- **Multer** middleware for handling Excel file uploads
- In-memory storage strategy for processing imports

**Excel Processing**
- **XLSX (SheetJS)** library for reading and writing Excel files
- Handles 77-column employee data structure with Arabic headers
- Column mapping from Excel's internal names to Arabic field names

### Data Storage

**Primary Storage: File-Based JSON**
- **Storage Files**:
  - `/data/employees.json` - Employee records
  - `/data/history.json` - Change tracking log
  - `/data/notes.json` - Employee notes
  - `/data/backups/` - Timestamped backup files
- **Rationale**: Simple deployment without database setup; suitable for single-instance applications with moderate data volumes
- **Trade-offs**: Not suitable for concurrent multi-user editing; all data loads into memory

**Storage Interface Pattern**
- Abstracted storage layer in `server/storage.ts` implementing IStorage interface
- **Benefit**: Easy migration path to PostgreSQL/SQLite if needed later
- Methods include: getEmployees (paginated), createEmployee, updateEmployee, deleteEmployee, getAllEmployees, setEmployees

**Data Models (TypeScript/Zod)**
- **Employee Schema**: 77+ fields including basic info, salary components, deductions, commissions
- **Editable Fields**: 30 numeric fields defined in shared schema (salary, allowances, deductions, commissions)
- **History Entry**: Tracks field changes with old/new values, timestamps, user info
- **Note**: Employee-specific notes with timestamps
- **Pagination**: Page, limit, total, totalPages structure

### Schema & Validation

**Shared Schema Layer**
- Located in `/shared/schema.ts` - shared between client and server
- **Zod** for runtime validation and TypeScript type inference
- **drizzle-zod** integration ready (though currently using JSON storage)

**Employee Data Structure**
- **Basic Info**: Code, name, national ID, branch, department, sector, position, hire date
- **Salary Components**: Monthly salary, allowances, bonuses, incentives, overtime
- **Deductions**: Advances, penalties, absences, early departures, delays
- **Commissions**: 30+ commission fields for different products/legal services
- **Calculated Fields**: Daily rate, net salary, total deductions

### External Dependencies

**Core Runtime Dependencies**
- **Express.js** - Web server framework
- **Drizzle ORM** - Database toolkit (configured for PostgreSQL but currently unused)
- **XLSX (SheetJS)** - Excel file processing
- **Multer** - File upload handling
- **Zod** - Schema validation
- **date-fns** - Date formatting and manipulation with Arabic locale support

**UI Component Libraries**
- **Radix UI** - Headless accessible UI primitives (20+ component packages)
- **TanStack React Query** - Server state management
- **TanStack React Table** - Headless table library for complex data grids
- **React Hook Form** - Form state management with validation
- **Tailwind CSS** - Utility-first CSS framework

**Build & Development Tools**
- **Vite** - Frontend build tool with HMR
- **esbuild** - Server bundler for production builds
- **TypeScript** - Type safety across the stack
- **tsx** - TypeScript execution for development server

**Fonts & Icons**
- **Cairo & IBM Plex Mono** (Google Fonts) - Primary UI fonts with Arabic support
- **Lucide React** - Icon library

**Replit-Specific Plugins** (development only)
- `@replit/vite-plugin-runtime-error-modal`
- `@replit/vite-plugin-cartographer`
- `@replit/vite-plugin-dev-banner`

### Configuration Files

- **drizzle.config.ts**: Configured for PostgreSQL migrations (ready for future DB migration)
- **vite.config.ts**: Frontend build configuration with path aliases
- **tsconfig.json**: TypeScript compiler options with path mapping
- **tailwind.config.ts**: Design system tokens and theme configuration
- **components.json**: shadcn/ui configuration for component generation