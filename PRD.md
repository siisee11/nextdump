# Product Requirements Document (PRD)

## Project: Web Crawler Service

### Overview

A web-based service that helps users analyze a base URL, generate NextRows app prompts, and load NextRows app output directly into their own PostgreSQL database.

---

## Problem Statement

Users want structured data from websites without building a custom crawler or managing data pipelines. They also want guidance on what to extract and to keep the data in their own database.

---

## Solution

A web application where users:
1. Enter a base URL for a website
2. Run a browsing agent to understand the site and recommend extraction targets
3. Receive a list of suggested prompts to build NextRows apps
4. Create apps in NextRows and provide the resulting app IDs
5. For each app, create a table in the user's database, run the app, and insert the data

---

## Core Features

### 1. Base URL Input
- Accept a base URL (hostname or full URL)
- Validate URL format
- Store as context for browsing analysis

### 2. Browsing Agent Analysis && NextRows Prompt Suggestions
- Use the `/browsing` endpoint to analyze the base URL
- Generate a list of app prompts based on the browsing report
- Each prompt includes: goal, target pages, expected output fields
- Allow user to copy/edit prompts before creating apps in NextRows

### 3. NextRows App ID Collection
- User pastes one or more NextRows app IDs after creating apps
- Allow naming each app for table naming and reporting

### 4. App Execution and Database Loading
- For each app ID:
  - Create a destination table in the user's PostgreSQL database
  - Run the app with NextRows `runAppJson`
  - Insert returned rows into the table
- Process mirrors `scripts/run-app-json.ts` with per-app tables

### 5. Progress and Status
- Per-app run status (queued, running, success, failed)
- Per-app row counts inserted
- Clear error messages for connection or run failures

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + TypeScript (Vite) |
| Styling | Tailwind CSS + shadcn/ui |
| API Integration | NextRows API |
| Database | User-provided PostgreSQL |

---

## Data Storage (Per App Tables)

Each NextRows app writes to its own table in the user's database.

- Table name: user-provided name or default `app_<appId>`
- Columns: derived from app output keys (camelCase -> snake_case)
- Types: infer from values (TEXT, NUMERIC, BOOLEAN, TIMESTAMPTZ), fallback to TEXT
- System columns: `id` (SERIAL PK), `created_at` (TIMESTAMPTZ)

Example (for a sample app output):

```sql
CREATE TABLE IF NOT EXISTS app_0smoimgaw6 (
    id SERIAL PRIMARY KEY,
    manager_fund TEXT NOT NULL,
    updated TEXT NOT NULL,
    holdings_url TEXT NOT NULL,
    manager_code TEXT NOT NULL,
    source_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## User Flow

```
┌─────────────────┐
│  Landing Page   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Enter Base URL  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Run Browsing    │
│ Agent Analysis  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Show Prompt     │
│ Suggestions     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create NextRows │
│ Apps + App IDs  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Connect DB &    │
│ Run Apps        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Insert Data &   │
│ Show Results    │
└─────────────────┘
```

---

## API Requirements

### Browsing Agent (Backend)
- **Endpoint**: `POST /browsing`
- **Input**: `{ url: string }`
- **Output**: browsing report with extraction opportunities

### NextRows API Integration
- **Endpoint**: `runAppJson` (via `@wordbricks/nextrows-client`)
- **Authentication**: `NEXTROWS_API_KEY` (env)
- **Response Format**: JSON array of objects (rows)

---

## Non-Functional Requirements

- **Security**: Never store user's PostgreSQL credentials (use only in-session)
- **Data Privacy**: Do not log credentials or app outputs with secrets
- **Performance**: Handle multiple apps and large result sets
- **Error Handling**: Clear per-app errors and rollback on failed inserts
- **Responsive**: Mobile-friendly UI

---

## MVP Scope

### In Scope
- [ ] Base URL input and validation
- [ ] Browsing agent report
- [ ] Prompt suggestions for NextRows apps
- [ ] App ID input (multi-app)
- [ ] Per-app table creation + `runAppJson` execution
- [ ] Per-app data insertion and status display

### Out of Scope (Future)
- Automatic app creation in NextRows
- Scheduled/recurring runs
- Multiple database types
- User accounts and saved configurations
- Advanced schema mapping UI

---

## Open Questions

1. What is the full NextRows API configuration (endpoint, rate limits, auth details)?
2. How should schema inference handle nested objects and arrays?
3. Should we allow user-defined table names and unique constraints?
4. What inputs (besides base URL) should be passed into each app run?

---

## Timeline

| Phase | Description | Duration |
|-------|-------------|----------|
| Phase 1 | Browsing agent + prompt suggestions | 1-2 days |
| Phase 2 | App ID input + DB connection | 1 day |
| Phase 3 | runAppJson + table creation + insert | 1-2 days |
| Phase 4 | Progress tracking + polish | 1 day |

---

## Demo Mode

### Overview

Demo Mode provides a simplified, non-technical experience for showcasing NextDump's capabilities. It hides the complexity of app creation and presents a streamlined "magic" flow where users see their data extracted and loaded into their database.

### Goals

1. **Reduce friction** - No need to understand NextRows apps or copy prompts
2. **Showcase value** - Demonstrate end-to-end web scraping → database flow
3. **Build confidence** - Let users test with their real database before committing to full flow

### Demo Mode User Flow

```
┌─────────────────────────┐
│  Landing Page           │
│  [Try Demo] button      │
└───────────┬─────────────┘
            │ User enters URL + clicks "Try Demo"
            ▼
┌─────────────────────────┐
│  Live Browser Preview   │
│  (Browsing agent runs)  │
│  ↳ No report shown      │
└───────────┬─────────────┘
            │ Browsing completes
            ▼
┌─────────────────────────┐
│  "Creating Apps..."     │
│  15-second animation    │
│  (Nothing happens)      │
└───────────┬─────────────┘
            │ Timer completes
            ▼
┌─────────────────────────┐
│  Show 3 Premade Apps    │
│  - sheow0b5m0           │
│  - 5uq0m2gxq4           │
│  - 4ep0tzmt4o           │
└───────────┬─────────────┘
            │ Apps displayed
            ▼
┌─────────────────────────┐
│  Database Connection    │
│  Form (PostgreSQL)      │
└───────────┬─────────────┘
            │ User connects DB
            ▼
┌─────────────────────────┐
│  Running Apps Animation │
│  (Real app execution)   │
└───────────┬─────────────┘
            │ All apps complete
            ▼
┌─────────────────────────┐
│  Table View Dashboard   │
│  Show data in tables    │
└─────────────────────────┘
```

### Detailed Scenario

| Step | User Sees | What Happens (Backend) |
|------|-----------|------------------------|
| 1 | Landing page with URL input + "Try Demo" button | — |
| 2 | Live preview of browser navigating site | `POST /browsing/session` + `POST /browsing` (real) |
| 3 | "Analyzing website..." with live preview | Browsing agent explores site |
| 4 | "Creating NextRows Apps..." (15s animation) | **Nothing** - pure UI animation |
| 5 | 3 premade apps displayed with names | Static app list rendered |
| 6 | Database connection form | User inputs connection string |
| 7 | "Extracting data..." animation | `POST /apps/run` with 3 premade app IDs |
| 8 | Table view showing extracted data | Query database and display results |

### UI Components Needed

| Component | Purpose | New/Modify |
|-----------|---------|------------|
| `DemoButton` | "Try Demo" button on landing page | Modify `landing-page.tsx` |
| `DemoProjectPage` | Simplified demo flow page | New component |
| `AppCreatingAnimation` | 15-second "creating apps" animation | New component |
| `PremadeAppsList` | Display 3 premade apps with names | New component |
| `TableViewDashboard` | Show database tables with data | New component |

### Route Structure

| Route | Component | Mode |
|-------|-----------|------|
| `/` | `LandingPage` | Normal |
| `/p/:projectId` | `ProjectPage` | Normal |
| `/demo/:projectId` | `DemoProjectPage` | Demo |

### Premade Apps Configuration

```typescript
const DEMO_APPS = [
  { appId: "sheow0b5m0", tableName: "sec_filings", description: "SEC 13F filings data" },
  { appId: "5uq0m2gxq4", tableName: "fund_holdings", description: "Fund holdings information" },
  { appId: "4ep0tzmt4o", tableName: "manager_details", description: "Investment manager details" },
];
```

### Key Differences from Normal Flow

| Aspect | Normal Flow | Demo Flow |
|--------|-------------|-----------|
| Report display | Shows crawling report | Hidden |
| Extraction prompts | User copies prompts | Skipped entirely |
| App creation | User creates in NextRows | Uses premade apps |
| App ID input | User pastes app IDs | Pre-filled |
| Final view | Run status only | Table data view |

### Backend Changes

No new endpoints required. Demo mode reuses existing endpoints:
- `POST /browsing/session` - Create browser session
- `POST /browsing` - Run website analysis (result hidden from user)
- `POST /apps/run` - Run premade apps

**Optional Enhancement**: Add `GET /db/tables/:tableName` endpoint to fetch table data for display.

### State Machine

```
IDLE → BROWSING → CREATING_APPS → APPS_READY → CONNECTING_DB → RUNNING_APPS → COMPLETE
  │         │            │              │             │              │            │
  └─────────┴────────────┴──────────────┴─────────────┴──────────────┴────────────┘
                              Demo flow states
```

### Animation Specs

**"Creating Apps..." Animation (15 seconds)**
- Animated progress bar or spinner
- Text phases:
  - 0-5s: "Analyzing website structure..."
  - 5-10s: "Generating extraction apps..."
  - 10-15s: "Finalizing app configuration..."
- Subtle particle/pulse effect (optional)

**"Extracting Data..." Animation**
- Per-app progress indicators
- Real-time status updates from backend
- Row count display as data is inserted

### Table View Dashboard

After successful completion, display:
1. Summary card with total rows inserted
2. Tab interface or accordion for each table
3. First 10-50 rows of each table in a data grid
4. Column headers with inferred types
5. "View in your database" reminder with table names

### Security Considerations

- Same credential handling as normal flow (never stored)
- Premade app IDs are public (no secrets exposed)
- Database queries for table view should be read-only SELECTs
- Limit row count in table view to prevent large data transfers

---

*Last Updated: January 1, 2026*

---

## Demo Mode Implementation Checklist

### Phase 1: Landing Page + Demo Route ✅ Complete

| Task | Status | Notes |
|------|--------|-------|
| Add "Try Demo" button to landing page | ✅ Done | Next to "Get Started" button |
| Create `/demo/:projectId` route | ✅ Done | New route in `App.tsx` |
| Create `DemoProjectPage` component | ✅ Done | Simplified version of `ProjectPage` |
| Create `demo-config.ts` | ✅ Done | DEMO_APPS constant + state types |

### Phase 2: Demo Flow - Browsing Phase ✅ Complete

| Task | Status | Notes |
|------|--------|-------|
| Reuse browsing session creation | ✅ Done | Uses `useBrowsingSession` hook |
| Show live preview during browsing | ✅ Done | Shows `LivePreview` component |
| Hide browsing report from user | ✅ Done | No report accordion rendered |
| Trigger "Creating Apps" animation on complete | ✅ Done | Transitions to `CREATING_APPS` state |

### Phase 3: App Creation Animation ✅ Complete

| Task | Status | Notes |
|------|--------|-------|
| Create `AppCreatingAnimation` component | ✅ Done | `src/components/app-creating-animation.tsx` |
| Implement phased text transitions | ✅ Done | 3 phases with status indicators |
| Add progress bar or spinner | ✅ Done | Animated progress bar + spinner |
| Auto-transition to apps display | ✅ Done | Transitions to `APPS_READY` after 15s |

### Phase 4: Premade Apps Display ✅ Complete

| Task | Status | Notes |
|------|--------|-------|
| Create `PremadeAppsList` component | ✅ Done | `src/components/premade-apps-list.tsx` |
| Define `DEMO_APPS` constant | ✅ Done | Already in `src/lib/demo-config.ts` |
| Show app cards with descriptions | ✅ Done | Polished card UI with badges |
| Database connection form | ✅ Done | Reuses `DatabaseConnectionForm` |
| Run Demo button | ✅ Done | Enabled when connection valid |

### Phase 5: Database Connection ✅ Complete

| Task | Status | Notes |
|------|--------|-------|
| Reuse `DatabaseConnectionForm` | ✅ Done | Same component as normal flow |
| Show connection form after apps | ✅ Done | State-based rendering in `APPS_READY` |
| Add "Run Demo" button | ✅ Done | Triggers app execution, transitions to `RUNNING_APPS` |

### Phase 6: App Execution + Table View ✅ Complete

| Task | Status | Notes |
|------|--------|-------|
| Run premade apps via `/apps/run` | ✅ Done | Uses `useRunApps` hook in demo page |
| Show execution animation | ✅ Done | Uses `AppRunStatus` component |
| Create `TableViewDashboard` component | ✅ Done | TanStack Table with sorting + pagination |
| Add `GET /db/tables/:tableName` endpoint | ✅ Done | `server/routes/db/tables.ts` |
| Create `useTableData` hook | ✅ Done | `src/hooks/useTableData.ts` |
| Display data grid for each table | ✅ Done | Scrollable table view with TanStack Table |

### Files to Create

| File | Purpose | Status |
|------|---------|--------|
| `src/components/demo-project-page.tsx` | Main demo flow component | ✅ Done |
| `src/components/app-creating-animation.tsx` | 15s animation component | ✅ Done |
| `src/components/premade-apps-list.tsx` | Display premade apps | ✅ Done |
| `src/components/table-view-dashboard.tsx` | Show table data | ✅ Done |
| `src/hooks/useTableData.ts` | Fetch table data hook | ✅ Done |
| `src/lib/demo-config.ts` | Demo constants (app IDs, etc.) | ✅ Done |
| `server/routes/db/tables.ts` | Table data endpoint | ✅ Done |

### Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/demo/:projectId` route |
| `src/components/landing-page.tsx` | Add "Try Demo" button |
| `server/index.ts` | Mount tables route |

---

## Implementation Checklist

### Phase 1: Browsing Agent + Prompt Suggestions ✅ Complete

| Feature | Status | Notes |
|---------|--------|-------|
| Landing page with URL input | ✅ Done | `src/components/landing-page.tsx` |
| URL validation | ✅ Done | Handles both full URLs and hostnames |
| Project page routing | ✅ Done | `/p/:projectId` with base64 encoded URL |
| Browser session creation | ✅ Done | `POST /browsing/session` endpoint |
| Live browser preview | ✅ Done | `src/components/live-preview.tsx` |
| Browsing agent analysis | ✅ Done | `POST /browsing` endpoint |
| Display browsing report | ✅ Done | Collapsible raw report in accordion |
| Parse structured prompts from report | ✅ Done | `server/routes/browsing/extraction-prompts.ts` |
| Display prompt suggestions UI | ✅ Done | `src/components/prompt-list.tsx`, `src/components/prompt-card.tsx` |
| Copy/edit prompt functionality | ✅ Done | Copy individual/all prompts, inline editing |

### Phase 2: App ID Input + DB Connection ✅ Complete

| Feature | Status | Notes |
|---------|--------|-------|
| App ID input field(s) | ✅ Done | `src/components/app-id-input.tsx` |
| Multi-app support | ✅ Done | Can add/remove multiple app IDs |
| App naming for tables | ✅ Done | Custom table name input per app |
| PostgreSQL connection string input | ✅ Done | `src/components/database-connection-form.tsx` |
| Connection validation | ✅ Done | `POST /db/test` endpoint + test button |
| Secure in-session credential handling | ✅ Done | Password input, not logged/stored |

### Phase 3: runAppJson + Table Creation + Insert ✅ Complete

| Feature | Status | Notes |
|---------|--------|-------|
| Backend endpoint for app execution | ✅ Done | `POST /apps/run` endpoint with multi-app support |
| Dynamic table creation | ✅ Done | AI-powered schema inference from app output |
| Schema inference (camelCase → snake_case) | ✅ Done | Handled by `NextRowsPGWrapper` via AI |
| Type inference (TEXT, NUMERIC, BOOLEAN) | ✅ Done | AI infers types from sample data |
| Data insertion with transactions | ✅ Done | Full transaction support with rollback |
| Error handling and rollback | ✅ Done | Sanitized errors shown in UI |

### Backend Endpoints Needed

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/browsing/session` | POST | Create browser session | ✅ Done |
| `/browsing` | POST | Analyze website | ✅ Done |
| `/apps/run` | POST | Execute apps + insert data | ✅ Done |
| `/apps/run/single` | POST | Execute single app | ✅ Done |
| `/db/test` | POST | Test database connection | ✅ Done |

### Frontend Hooks Needed

| Hook | Purpose | Status |
|------|---------|--------|
| `useBrowsingSession` | Create browser session | ✅ Done |
| `useAnalyzeBrowsing` | Run website analysis | ✅ Done |
| `useRunApps` | Execute NextRows apps | ✅ Done |
| `useTestConnection` | Validate DB connection | ✅ Done |

### UI Components Needed

| Component | Purpose | Status |
|-----------|---------|--------|
| `PromptCard` | Display single prompt suggestion | ✅ Done |
| `PromptList` | List of prompt suggestions | ✅ Done |
| `AppIdInput` | Input for NextRows app IDs | ✅ Done |
| `DatabaseConnectionForm` | PostgreSQL connection input | ✅ Done |
| `AppRunStatus` | Per-app status display | ✅ Done |

---

## Next Steps (Priority Order)

1. ~~**Parse browsing report** - Extract structured prompt suggestions from the AI report~~ ✅
2. ~~**Build prompt suggestion UI** - Display prompts with copy functionality~~ ✅
3. ~~**Add app ID input** - Allow users to paste app IDs after creating in NextRows~~ ✅
4. ~~**Database connection form** - Secure input for PostgreSQL connection string~~ ✅
5. ~~**Create `/apps/run` endpoint** - Expose `runAppJson` logic via API~~ ✅
6. ~~**Build status tracking UI** - Show per-app progress and results~~ ✅
