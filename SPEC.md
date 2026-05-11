# Phase 1: Frontend Foundation Specification

## Overview

Build the frontend foundation for the application with React + TypeScript, following Swiss Style UI principles. This phase establishes the core architecture, design system, and reusable layout components.

## Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router v6
- **State**: React Context (for auth)

### Swiss Style Design System

Swiss Style (International Typographic Style) principles:
- **Grid-based layouts**: Consistent 8px grid system
- **Typography hierarchy**: Clear sans-serif fonts, mathematical spacing
- **Minimal decoration**: Content-focused, no gradients or unnecessary embellishment
- **High contrast**: Strong black/white with limited accent colors
- **Asymmetric balance**: Dynamic layouts within grid constraints

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#FAFAFA` | Page background |
| `--foreground` | `#0A0A0A` | Primary text |
| `--muted` | `#F5F5F5` | Secondary backgrounds |
| `--muted-foreground` | `#737373` | Secondary text |
| `--border` | `#E5E5E5` | Borders, dividers |
| `--accent` | `#18181B` | Primary actions |
| `--accent-foreground` | `#FAFAFA` | Text on accent |
| `--destructive` | `#DC2626` | Errors, destructive actions |
| `--success` | `#16A34A` | Success states |

### Typography Scale

| Name | Size | Weight | Usage |
|------|------|--------|-------|
| `display` | 48px | 700 | Hero headings |
| `h1` | 36px | 600 | Page titles |
| `h2` | 24px | 600 | Section headings |
| `h3` | 18px | 600 | Subsection headings |
| `body` | 16px | 400 | Default text |
| `small` | 14px | 400 | Helper text |
| `caption` | 12px | 400 | Labels, captions |

### Spacing Scale (8px Grid)

- `0` → 0px
- `1` → 4px
- `2` → 8px
- `3` → 12px
- `4` → 16px
- `6` → 24px
- `8` → 32px
- `12` → 48px
- `16` → 64px

## Component Architecture

```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── avatar.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── ...
│   └── layout/
│       ├── Sidebar.tsx        # Navigation sidebar
│       ├── Header.tsx         # Top header bar
│       ├── MainContent.tsx    # Main content wrapper
│       └── DashboardShell.tsx # Full dashboard layout
├── contexts/
│   └── AuthContext.tsx        # Authentication state
├── hooks/
│   └── useAuth.ts             # Auth hook
├── pages/
│   ├── Login.tsx              # Login page
│   ├── Dashboard.tsx           # Main dashboard
│   └── ProtectedRoute.tsx      # Route guard
├── lib/
│   └── utils.ts               # cn() utility
├── App.tsx                    # Root component with routing
├── main.tsx                   # Entry point
└── index.css                 # Global styles + Tailwind
```

## Layout Components

### Sidebar
- **Width**: 256px (collapsed: 64px)
- **Position**: Fixed left
- **Content**: Logo, navigation items, user menu
- **Responsive**: Collapses to icon-only on mobile, hidden with hamburger menu
- **Navigation items**: Dashboard, Settings (placeholder for future)

### Header
- **Height**: 64px
- **Position**: Fixed top, offset by sidebar
- **Content**: Page title, search (placeholder), user avatar
- **Responsive**: Title adapts, search hidden on mobile

### MainContent
- **Position**: Fixed, offset by sidebar (left) and header (top)
- **Padding**: 32px desktop, 16px mobile
- **Max-width**: 1400px (centered)
- **Overflow**: Auto scroll

### DashboardShell
- **Composition**: Sidebar + Header + MainContent
- **Responsive**: Full layout on desktop, drawer sidebar on mobile

## Protected Routes

### AuthContext
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

### ProtectedRoute Component
- Redirects to `/login` if not authenticated
- Preserves attempted URL for post-login redirect
- Shows loading spinner during auth check
- Protected routes: `/dashboard`

## Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | Redirect to `/dashboard` | No |
| `/login` | Login page | No |
| `/dashboard` | Dashboard page | Yes |

## Features

### Login Page
- Email + password form
- Form validation (required fields, email format)
- Loading state on submit
- Error message display
- Demo mode: any non-empty credentials succeed

### Dashboard Page
- Welcome message with user name
- Stats cards grid (placeholder data)
- Recent activity section
- Clean, content-focused layout

## Responsive Breakpoints

| Breakpoint | Min Width | Layout |
|------------|-----------|--------|
| Mobile | 0px | Hidden sidebar, hamburger menu |
| Tablet | 768px | Collapsed sidebar (icons) |
| Desktop | 1024px | Full sidebar |
| Wide | 1280px | Constrained content width |

## Accessibility Requirements

- All interactive elements keyboard accessible
- ARIA labels on icon-only buttons
- Focus visible outlines
- Semantic HTML structure
- Color contrast ratio ≥ 4.5:1
- Skip to content link (hidden visually)

## Build Requirements

- [x] Vite build configuration
- [x] TypeScript strict mode
- [x] Tailwind with custom theme
- [x] shadcn/ui CLI configuration
- [x] ESLint + Prettier configuration

## Verification Checklist

- [x] Application builds without errors
- [x] Dev server starts successfully
- [x] Login flow works (demo mode)
- [x] Protected route redirects unauthenticated users
- [x] Sidebar navigation works
- [x] Responsive at all breakpoints
- [x] No console errors
- [x] Keyboard navigation functional

---

# Phase 2: Student Dashboard Specification

## Overview

Student Dashboard provides internship management features for students, including internship suggestions, application status tracking, progress timeline, and internship log preview.

## Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/student` | Student Dashboard | Yes |

## Student Dashboard Features

### 1. Internship Suggestions
- Display recommended internships based on student profile (mock data)
- Show company name, position, location, duration
- Quick apply button (UI only, no backend)
- Match score indicator

### 2. Application Status Cards
- Grid of application cards
- Each card shows: company, position, status, applied date
- Status badges: Applied, Interview, Offer, Rejected
- Click to view details (modal or expand)

### 3. Progress Timeline
- Visual timeline showing internship journey stages
- Stages: Application Submitted → Screening → Interview → Offer → Accepted
- Current stage highlighted
- Progress percentage

### 4. Internship Log Preview
- Recent log entries list
- Each entry: date, hours logged, activity description
- Link to full log page (placeholder)
- Quick add button for new entry (UI only)

## Component Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── InternshipSuggestions.tsx
│   │   ├── ApplicationStatus.tsx
│   │   ├── ProgressTimeline.tsx
│   │   └── InternshipLogPreview.tsx
│   └── shared/
│       ├── StatusBadge.tsx
│       ├── MatchScore.tsx
│       └── TimelineStep.tsx
├── pages/
│   └── StudentDashboard.tsx
└── types/
    └── index.ts
```

## Data Types

```typescript
interface Internship {
  id: string;
  company: string;
  position: string;
  location: string;
  duration: string;
  matchScore: number;
  postedDate: string;
}

interface Application {
  id: string;
  company: string;
  position: string;
  status: 'applied' | 'screening' | 'interview' | 'offer' | 'rejected';
  appliedDate: string;
}

interface LogEntry {
  id: string;
  date: string;
  hours: number;
  description: string;
}

interface TimelineStage {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}
```

## Responsive Grid Layout

```
Desktop (lg+): 3 columns
- Left: InternshipSuggestions (2/3 width)
- Right: ApplicationStatus (1/3 width)

Tablet (md): 2 columns
- Top: InternshipSuggestions
- Bottom: ApplicationStatus

Mobile: Single column stack
```

## Verification Checklist

- [ ] Internship suggestions display correctly
- [ ] Application status cards show all statuses
- [ ] Progress timeline is interactive
- [ ] Log preview shows recent entries
- [ ] Responsive at all breakpoints
- [ ] No console errors

---

# Phase 3: Internship Positions Listing Specification

## Overview

Public page for browsing and filtering internship positions with search, filters, pagination, and responsive card layout.

## Route

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/positions` | PositionsPage | No (public) |

## Features

### 1. Search
- Full-text search by position title and company name
- Debounced input (300ms)
- Clear button when search has value
- Search icon indicator

### 2. Filters
- **Location**: Remote, Ho Chi Minh City, Hanoi, Da Nang, Others
- **Duration**: 1 month, 2-3 months, 4-6 months, 6+ months
- **Field**: Software, Design, Marketing, Data Science, Product
- Filter chips showing active filters
- Clear all filters button

### 3. Pagination
- Items per page: 9
- Page numbers with ellipsis for large sets
- Previous/Next buttons
- Show "X results" count

### 4. Position Cards
- Company logo placeholder
- Position title
- Company name
- Location badge
- Duration badge
- Posted date
- Match score (if user is logged in)
- Quick apply button

### 5. Loading State
- Skeleton cards during initial load
- Spinner during filter/search changes

### 6. Empty State
- Illustrated empty state when no results
- Suggestions to adjust filters

## Component Structure

```
src/
├── components/
│   ├── positions/
│   │   ├── PositionCard.tsx
│   │   ├── PositionList.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   ├── ActiveFilters.tsx
│   │   └── EmptyState.tsx
│   └── shared/
│       └── ...
├── pages/
│   └── PositionsPage.tsx
└── hooks/
    └── usePositions.ts
```

## Data Types

```typescript
interface Position {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  duration: string;
  field: string;
  description: string;
  requirements: string[];
  postedDate: string;
  salary?: string;
}

interface FilterState {
  search: string;
  location: string[];
  duration: string[];
  field: string[];
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}
```

## Responsive Layout

```
Desktop (lg+): Sidebar filters + 3-column grid
Tablet (md): Collapsible filter panel + 2-column grid
Mobile: Full-width cards, filters in drawer
```

## Verification Checklist

- [ ] Search works with debounce
- [ ] Filters apply and clear correctly
- [ ] Pagination navigates properly
- [ ] Cards are responsive
- [ ] Loading skeletons display
- [ ] Empty state shows when no results

---

# Phase 4: Approval Timeline Specification

## Overview

A professional timeline component for tracking internship approval status through multiple stages. Shows the journey from submission to final approval or rejection.

## Approval Stages

### Stage Flow
1. **Submitted** - Student submits internship application
2. **Department Approval** - Department head reviews and approves
3. **Lecturer Approval** - Assigned lecturer reviews and approves
4. **Registrar Approval** - Registrar reviews and gives final approval
5. **Approved/Rejected** - Final decision

### Stage Statuses
- `pending` - Not yet reached
- `in_progress` - Currently being reviewed
- `approved` - Approved at this stage
- `rejected` - Rejected at this stage

## Component Structure

```
src/
├── components/
│   └── approval/
│       ├── ApprovalTimeline.tsx
│       ├── ApprovalStep.tsx
│       ├── ApprovalStatusBadge.tsx
│       └── ApprovalInfo.tsx
```

## Data Types

```typescript
interface ApprovalStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
  reviewer?: string;
  reviewedAt?: string;
  comment?: string;
}

interface ApprovalTimelineProps {
  steps: ApprovalStep[];
  currentStage: number;
  isRejected?: boolean;
  rejectedAt?: string;
  rejectionReason?: string;
}
```

## Design Principles

### Swiss Style Implementation
- Clean horizontal/vertical layout
- Strong visual hierarchy
- Minimal color usage (status-based)
- Professional typography
- Clear state transitions

### Status Colors
- Pending: `--color-muted-foreground` (gray)
- In Progress: `--color-accent` (dark)
- Approved: `--color-success` (green)
- Rejected: `--color-destructive` (red)

### Responsive Behavior
- Desktop: Horizontal timeline with icons
- Tablet/Mobile: Vertical timeline

## Verification Checklist

- [ ] Submitted state displays correctly
- [ ] All approval stages show proper status
- [ ] Rejected state handles correctly
- [ ] Responsive at all breakpoints
- [ ] Animations are smooth

---

# Phase 5: Admin Dashboard Specification

## Overview

Admin dashboard for managing internship approvals, users, and monitoring system activity.

## Route

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/admin` | AdminDashboard | Yes (Admin) |

## Features

### 1. Statistics Cards
- Total Students count
- Active Internships count
- Pending Approvals count
- Completed This Month count
- Each card shows value, label, and trend indicator

### 2. Recent Activity
- List of recent system activities
- Activity type icons
- User names and timestamps
- Quick action links

### 3. Pending Approvals
- Table of pending internship applications
- Quick approve/reject actions
- Student name, company, position, submitted date
- Expand to view details

### 4. User Management Table
- Paginated table of users
- Columns: Name, Email, Role, Status, Joined Date, Actions
- Search functionality
- Filter by role
- Edit/Disable user actions

## Component Structure

```
src/
├── components/
│   └── admin/
│       ├── StatsCard.tsx
│       ├── ActivityFeed.tsx
│       ├── PendingApprovals.tsx
│       └── UserManagementTable.tsx
├── pages/
│   └── AdminDashboard.tsx
└── data/
    └── admin.ts (mock data)
```

## Data Types

```typescript
interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
}

interface Activity {
  id: string;
  type: 'submission' | 'approval' | 'rejection' | 'user' | 'login';
  message: string;
  user: string;
  timestamp: string;
}

interface PendingApproval {
  id: string;
  studentName: string;
  studentEmail: string;
  company: string;
  position: string;
  submittedDate: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'lecturer';
  status: 'active' | 'inactive';
  joinedDate: string;
}
```

## Layout

```
Desktop: 4-column stats + 2-column (activity + pending) + full-width table
Tablet: 2-column stats + stacked sections
Mobile: Single column stack
```

## Verification Checklist

- [ ] Stats cards display with trend indicators
- [ ] Activity feed shows recent actions
- [ ] Pending approvals can be approved/rejected
- [ ] User table is sortable and filterable
- [ ] Responsive at all breakpoints

---

# Phase 6: Position Detail & Application Specification

## Overview

Detailed view for internship positions with tabbed content, application modal, and related positions suggestions.

## Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/positions/:id` | PositionDetailPage | No (public) |

## Features

### 1. Position Header
- Company logo placeholder
- Position title and company name
- Location, duration, field, salary badges
- Skills tags
- Apply Now button
- Posted date

### 2. Tabbed Content
- **Description**: Full job description
- **Requirements**: Skills and qualifications needed
- **Benefits**: What the company offers
- **Company**: About the company with stats

### 3. Application Modal
- Resume upload (drag & drop)
- Cover letter textarea
- LinkedIn profile field
- Portfolio/website field
- Submit with loading state
- Success confirmation

### 4. Related Positions
- Similar positions based on field/location
- Card grid display
- Quick navigation

## Component Structure

```
src/
├── components/positions/
│   ├── PositionHeader.tsx       # Header with meta info
│   ├── PositionTabs.tsx        # Tabbed content
│   ├── ApplyModal.tsx          # Application form popup
│   └── RelatedPositions.tsx    # Similar positions
└── pages/
    └── PositionDetailPage.tsx  # Full detail page
```

## Data Types

```typescript
interface ApplicationData {
  coverLetter: string;
  resume: File | null;
  linkedIn?: string;
  portfolio?: string;
}
```

## Verification Checklist

- [ ] Position detail page displays all information
- [ ] Tabs switch content correctly
- [ ] Apply modal opens and submits
- [ ] Resume drag & drop works
- [ ] Related positions display
- [ ] Responsive at all breakpoints

---

# Phase 7: Position Management Specification

## Overview

Create and edit forms for internship positions with comprehensive fields and validation.

## Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/positions/new` | PositionForm (create) | Yes (Company) |
| `/positions/:id/edit` | PositionForm (edit) | Yes (Company) |

## Features

### Position Form Fields
- Title (required)
- Company name (required)
- Location dropdown (required)
- Field dropdown (required)
- Duration dropdown (required)
- Salary range (optional)
- Description textarea (required)
- Requirements/Skills (tags input)

### Skills Input
- Add skill via text input + button
- Add skill via Enter key
- Remove skill via X button
- Tags display with removal

## Component Structure

```
src/
├── components/positions/
│   └── PositionForm.tsx          # Create/edit form
└── pages/
    └── PositionFormPage.tsx      # Form page wrapper
```

## Data Types

```typescript
interface PositionFormData {
  title: string;
  company: string;
  location: string;
  duration: string;
  field: string;
  description: string;
  requirements: string[];
  salary?: string;
}
```

## Filter Options

| Filter | Type | Options |
|--------|------|---------|
| Location | Multi-select | Remote, Ho Chi Minh City, Hanoi, Da Nang, Others |
| Work Type | Multi-select | Remote, Hybrid, On-site |
| Duration | Multi-select | 1 month, 2-3 months, 4-6 months, 6+ months |
| Field | Multi-select | Software, Design, Marketing, Data Science, Product |
| Skills | Multi-select | 25+ technical and soft skills |
| Salary | Range | Min-Max with presets |

## Verification Checklist

- [ ] Create position form works
- [ ] Edit position form pre-fills data
- [ ] Skills add/remove works
- [ ] Form validation enforced
- [ ] Submit shows loading state
- [ ] Success/error handling

---

# Phase 8: Enhanced Filter System Specification

## Overview

Advanced filtering system with skills, salary range, work type, and collapsible sections.

## Features

### Extended Filter Panel
- Collapsible filter sections
- Location multi-select
- Work type multi-select (Remote, Hybrid, On-site)
- Duration multi-select
- Field multi-select
- Skills multi-select (25+ options)
- Salary range with min/max inputs
- Quick salary presets

### Active Filters Display
- Show active filter tags
- Remove individual filters
- Clear all filters button

### Filter State

```typescript
interface ExtendedFilterState {
  search: string;
  location: string[];
  duration: string[];
  field: string[];
  skills: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  workType: ('remote' | 'hybrid' | 'on-site')[];
}
```

## Component Structure

```
src/
├── components/positions/
│   └── ExtendedFilterPanel.tsx  # Advanced filters
```

## Skills Options

```
React, TypeScript, JavaScript, Node.js, Python, Java, C++, Go, Rust,
SQL, MongoDB, PostgreSQL, AWS, Docker, Kubernetes, Git, Figma, Adobe XD,
Machine Learning, Data Analysis, Excel, Tableau, SEO, Content Writing,
Social Media, Communication
```

## Verification Checklist

- [ ] All filter types work correctly
- [ ] Collapsible sections toggle
- [ ] Salary range filters positions
- [ ] Skills filter works
- [ ] Active filters display correctly
- [ ] Clear all resets filters

---

# Phase 10: Application Workflow UI Specification

## Overview

Comprehensive internship application workflow system with approval tracking, comments, and status management.

## Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/applications/:id` | ApplicationDetailPage | Yes |

## Workflow Stages

1. **Draft** - Application started but not submitted
2. **Submitted** - Student submitted application
3. **Department Review** - Department head reviewing
4. **Lecturer Review** - Assigned lecturer reviewing
5. **Registrar Review** - Registrar giving final approval
6. **Approved/Rejected** - Final decision

## Components

### ApplicationStatusBadge
- Displays current workflow status
- Color-coded for each stage
- Sizes: sm, md, lg
- Includes status dot indicator

### ApplicationCard
- Application summary display
- Compact mode for lists
- Click to navigate to detail

### CommentSection
- List of comments with avatars
- Role badges (Student, Lecturer, Department, Registrar)
- Time ago formatting
- Add comment input
- Attachments support

### ApprovalActions
- Approve button
- Reject with required comment
- Request changes with required comment
- Permission-based visibility

### DocumentList
- File type icons
- Status badges (pending, verified, rejected)
- Preview and download actions
- File size and upload date

## Application Detail Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Application ID, Status Badge                       │
│  Back Button                                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────┬───────────────────────┐   │
│  │  Approval Timeline          │  Quick Info Card      │   │
│  │  ● Submitted ✓              │  • Application ID    │   │
│  │  ● Department ✓            │  • Applied Date      │   │
│  │  ● Lecturer ●               │  • Current Stage     │   │
│  │  ● Registrar ○               │  • Documents Count   │   │
│  │                             │                       │   │
│  │                             │  Approval Actions    │   │
│  │                             │  [Approve] [Reject]  │   │
│  └─────────────────────────────┴───────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Tabs: [Documents] [Position] [Student]              │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │  Tab Content                                    │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Comments Section                                    │   │
│  │  • Comment 1 (Department)                           │   │
│  │  • Comment 2 (Student)                              │   │
│  │  [Add comment input...]                    [Send]   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Component Structure

```
src/
├── components/
│   ├── application/
│   │   ├── ApplicationStatusBadge.tsx  # Status badge
│   │   ├── ApplicationCard.tsx         # Summary card
│   │   ├── CommentSection.tsx           # Comments + input
│   │   ├── ApprovalActions.tsx          # Action buttons
│   │   └── DocumentList.tsx             # Documents list
│   └── ui/
│       └── tabs.tsx                     # Radix tabs
└── pages/
    └── ApplicationDetailPage.tsx        # Full page
```

## Status Colors

| Status | Color | Badge Class |
|--------|-------|-------------|
| Draft | Gray | bg-gray-100 |
| Submitted | Blue | bg-blue-50 |
| Department Review | Amber | bg-amber-50 |
| Lecturer Review | Purple | bg-purple-50 |
| Registrar Review | Indigo | bg-indigo-50 |
| Approved | Green | bg-green-50 |
| Rejected | Red | bg-red-50 |

## Application Form Page

```
/apply/:positionId - ApplicationFormPage (Protected)
```

Multi-step application form:
1. **Documents** - Upload resume and additional documents (drag & drop)
2. **Cover Letter** - Write cover letter with character count
3. **Additional Info** - LinkedIn and portfolio links
4. **Summary** - Review and submit

Features:
- Step indicator with progress
- File drag & drop upload
- Form validation
- Success confirmation page

## Component Structure

```
src/
├── components/
│   ├── application/
│   │   ├── ApplicationStatusBadge.tsx  # Status badge
│   │   ├── ApplicationCard.tsx         # Summary card
│   │   ├── CommentSection.tsx           # Comments + input
│   │   ├── ApprovalActions.tsx          # Action buttons
│   │   └── DocumentList.tsx             # Documents list
│   └── ui/
│       └── tabs.tsx                     # Radix tabs
└── pages/
    ├── ApplicationDetailPage.tsx        # View application
    └── ApplicationFormPage.tsx          # Submit application
```

## Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/applications/:id` | ApplicationDetailPage | Yes |
| `/apply/:positionId` | ApplicationFormPage | Yes |

## Verification Checklist

- [x] Status badge displays correctly for all stages
- [x] Application card shows all information
- [x] Comments can be added and displayed
- [x] Role badges show correctly
- [x] Approval actions work (approve, reject, request changes)
- [x] Documents list with icons and status
- [x] Timeline shows correct progress
- [x] Responsive layout works
- [x] Permission-based action visibility
- [x] Application form multi-step works
- [x] File upload with drag & drop
- [x] Form validation
- [x] Success confirmation
