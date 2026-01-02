# Demo Animation PRD

## Overview

A redesigned demo experience that presents the entire flow in a **single, non-scrollable viewport** with a **carousel-based step indicator**. Each step is displayed within the carousel, automatically advancing as steps complete.

---

## Goals

1. **Single Viewport** - No scrolling required; all content fits within the browser window
2. **Visual Step Progression** - Carousel shows current step with clear visual indicators
3. **Automatic Advancement** - Steps auto-transition when complete
4. **Polished Experience** - Smooth animations between steps

---

## Demo Flow Steps

| Step | Name | Description |
|------|------|-------------|
| 1 | **Live View** | Browser session opens, shows live preview of target site |
| 2 | **Analyzing** | AI agent analyzes the website structure |
| 3 | **Creating Apps** | Animated "creating apps" phase (15s animation) |
| 4 | **Database Connection** | Form prompts user for PostgreSQL connection string |
| 5 | **Running Apps** | Apps execute and data is saved to database |
| 6 | **Complete** | Success confirmation with summary |
| 7 | **Table View** | Display extracted data in table format |

---

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  [← Back]                    NextDump Demo                          │ ← Header (fixed height)
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌───────────────────────────────────────────────────────────┐    │
│   │                                                           │    │
│   │                    CAROUSEL CONTENT                       │    │
│   │                    (Current Step)                         │    │ ← Main Content
│   │                                                           │    │   (flexible height)
│   │                                                           │    │
│   └───────────────────────────────────────────────────────────┘    │
│                                                                     │
│     ○ ● ○ ○ ○ ○ ○     Step 2 of 7: Analyzing...                   │ ← Step Indicator
│                                                                     │   (fixed height)
└─────────────────────────────────────────────────────────────────────┘
```

### Layout Specifications

| Section | Height | Behavior |
|---------|--------|----------|
| Header | `64px` fixed | Contains back button, logo, "Demo" badge |
| Carousel Content | `calc(100vh - 64px - 80px)` | Flexible, contains current step content |
| Step Indicator | `80px` fixed | Dots + step label, fixed at bottom |

---

## Step Details

### Step 1: Live View

**State:** `LIVE_VIEW`

**Content:**
- Target URL display (compact)
- Live browser preview iframe (fills available space)
- Loading spinner overlay if session not yet created

**Transition:**
- Auto-advance to Step 2 when session is created

---

### Step 2: Analyzing

**State:** `ANALYZING`

**Content:**
- Live browser preview (continues showing)
- Overlay with "Analyzing website..." message
- Subtle progress indicator

**Transition:**
- Auto-advance to Step 3 when analysis completes
- Minimum 3 seconds to prevent jarring transition

---

### Step 3: Creating Apps

**State:** `CREATING_APPS`

**Content:**
- Animated "Creating Apps" component
- Phased messages:
  - "Analyzing website structure..." (0-5s)
  - "Generating extraction apps..." (5-10s)
  - "Finalizing app configuration..." (10-15s)
- Progress bar
- Checkmarks as phases complete

**Transition:**
- Auto-advance to Step 4 after 15 seconds

---

### Step 4: Database Connection

**State:** `DB_CONNECT`

**Content:**
- List of created apps (3 premade apps)
- Database connection form:
  - Connection string input
  - Test connection button
  - Validation status
- "Run Demo" button (disabled until valid connection)

**User Action Required:**
- User must enter valid connection string and click "Run Demo"

**Transition:**
- Advance to Step 5 when user clicks "Run Demo"

---

### Step 5: Running Apps

**State:** `RUNNING_APPS`

**Content:**
- List of apps being executed
- Per-app progress indicators:
  - Spinner for running
  - Checkmark for success
  - X for error
- Row count updates as data is inserted

**Transition:**
- Auto-advance to Step 6 when all apps complete

---

### Step 6: Complete

**State:** `COMPLETE`

**Content:**
- Success animation (checkmark)
- Summary stats:
  - Total apps run
  - Total rows inserted
  - Tables created
- "View Data" button

**User Action:**
- Click "View Data" to advance to Step 7

**Transition:**
- Advance to Step 7 when user clicks "View Data"

---

### Step 7: Table View

**State:** `TABLE_VIEW`

**Content:**
- Tab interface for each table
- Data grid showing rows
- Pagination controls
- "Run Again" button

**User Actions:**
- Browse table data
- Click "Run Again" to restart from Step 4

---

## Step Indicator Component

### Design

```
     ●──────○──────○──────○──────○──────○──────○
   Live    Analyze  Create   DB     Run    Done   Data
   View            Apps    Connect  Apps
```

### Indicator States

| State | Visual |
|-------|--------|
| Completed | Solid filled circle (primary color) with checkmark |
| Current | Larger filled circle with pulse animation |
| Upcoming | Hollow circle (muted) |

### Step Labels

| Step | Short Label | Full Label |
|------|-------------|------------|
| 1 | Live View | Viewing Website |
| 2 | Analyzing | Analyzing Structure |
| 3 | Creating | Creating Apps |
| 4 | Connect | Database Connection |
| 5 | Running | Running Apps |
| 6 | Complete | Complete |
| 7 | Data | Your Data |

---

## State Machine

```
IDLE → LIVE_VIEW → ANALYZING → CREATING_APPS → DB_CONNECT → RUNNING_APPS → COMPLETE → TABLE_VIEW
  │         │           │             │              │             │           │          │
  │         │           │             │              │             │           │          │
  │         │           │             │              └─────────────┴───────────┴──────────┘
  │         │           │             │                            │
  │         │           │             │                     (User can restart from DB_CONNECT)
  │         │           │             │
  │         │           │             └───────────────────────────────────────────────────────
  │         │           │                              (15 second timer)
  │         │           │
  │         │           └─────────────────────────────────────────────────────────────────────
  │         │                                   (Analysis completes)
  │         │
  │         └─────────────────────────────────────────────────────────────────────────────────
  │                                         (Session created)
  │
  └────────────────────────────────────────────────────────────────────────────────────────────
                                      (Page loads with URL)
```

---

## Component Structure

### New Components

| Component | File | Description |
|-----------|------|-------------|
| `DemoCarousel` | `demo-carousel.tsx` | Main carousel container with step management |
| `DemoStepIndicator` | `demo-step-indicator.tsx` | Bottom step dots and labels |
| `DemoLiveViewStep` | `demo-steps/live-view.tsx` | Step 1: Live browser preview |
| `DemoAnalyzingStep` | `demo-steps/analyzing.tsx` | Step 2: Analysis in progress |
| `DemoCreatingAppsStep` | `demo-steps/creating-apps.tsx` | Step 3: App creation animation |
| `DemoDbConnectStep` | `demo-steps/db-connect.tsx` | Step 4: Database connection form |
| `DemoRunningAppsStep` | `demo-steps/running-apps.tsx` | Step 5: App execution progress |
| `DemoCompleteStep` | `demo-steps/complete.tsx` | Step 6: Success summary |
| `DemoTableViewStep` | `demo-steps/table-view.tsx` | Step 7: Data display |

### Modified Components

| Component | Changes |
|-----------|---------|
| `demo-project-page.tsx` | Replace with carousel-based layout |
| `demo-config.ts` | Add new step types and labels |

---

## Type Definitions

```typescript
// Step identifiers
export type DemoStep = 
  | "LIVE_VIEW"
  | "ANALYZING"
  | "CREATING_APPS"
  | "DB_CONNECT"
  | "RUNNING_APPS"
  | "COMPLETE"
  | "TABLE_VIEW";

// Step configuration
export interface StepConfig {
  id: DemoStep;
  index: number;          // 0-6
  shortLabel: string;     // For indicator
  fullLabel: string;      // For display
  autoAdvance: boolean;   // True if step advances automatically
}

export const DEMO_STEPS: StepConfig[] = [
  { id: "LIVE_VIEW", index: 0, shortLabel: "Live View", fullLabel: "Viewing Website", autoAdvance: true },
  { id: "ANALYZING", index: 1, shortLabel: "Analyzing", fullLabel: "Analyzing Structure", autoAdvance: true },
  { id: "CREATING_APPS", index: 2, shortLabel: "Creating", fullLabel: "Creating Apps", autoAdvance: true },
  { id: "DB_CONNECT", index: 3, shortLabel: "Connect", fullLabel: "Database Connection", autoAdvance: false },
  { id: "RUNNING_APPS", index: 4, shortLabel: "Running", fullLabel: "Running Apps", autoAdvance: true },
  { id: "COMPLETE", index: 5, shortLabel: "Complete", fullLabel: "Complete", autoAdvance: false },
  { id: "TABLE_VIEW", index: 6, shortLabel: "Data", fullLabel: "Your Data", autoAdvance: false },
];
```

---

## Carousel Behavior

### No Manual Navigation

- Users **cannot** manually navigate between steps using carousel controls
- Steps only advance when conditions are met (auto or user action)
- No prev/next buttons visible

### Transition Animation

- Slide transition: 300ms ease-out
- Current step slides out left, new step slides in from right
- Fade effect on step indicator update

### Viewport Fitting

- Use `100vh` with proper header/footer subtraction
- `overflow: hidden` on main container
- Each step content must be self-contained and not exceed available height
- Table view uses internal scrolling for data grid only

---

## Responsive Considerations

### Mobile (< 640px)

- Step indicator uses dots only (no labels)
- Compact header
- Full-width carousel content
- Live preview shows at reduced size

### Tablet (640px - 1024px)

- Step indicator shows short labels
- Standard carousel sizing

### Desktop (> 1024px)

- Full step indicator with labels
- Live preview at comfortable size
- Side margins for content containment

---

## Implementation Phases

### Phase 1: Carousel Structure

- [ ] Create `DemoCarousel` component with step management
- [ ] Create `DemoStepIndicator` component
- [ ] Update `demo-config.ts` with new step definitions
- [ ] Replace `DemoProjectPage` with carousel-based layout

### Phase 2: Step Components

- [ ] Implement `DemoLiveViewStep` (Step 1)
- [ ] Implement `DemoAnalyzingStep` (Step 2)
- [ ] Adapt existing `AppCreatingAnimation` for Step 3
- [ ] Implement `DemoDbConnectStep` (Step 4)
- [ ] Implement `DemoRunningAppsStep` (Step 5)
- [ ] Implement `DemoCompleteStep` (Step 6)
- [ ] Adapt existing `TableViewDashboard` for Step 7

### Phase 3: Integration & Polish

- [ ] Connect step transitions to real API calls
- [ ] Add transition animations
- [ ] Test responsive behavior
- [ ] Performance optimization

---

## Success Metrics

1. **No vertical scrolling** - Entire demo fits in viewport
2. **Clear progress** - User always knows current step and remaining steps
3. **Smooth transitions** - < 300ms transition between steps
4. **No confusion** - User understands what to do at each step

---

## Open Questions

1. Should Step 6 (Complete) auto-advance to Step 7 (Table View) after a delay, or require user click?
2. On mobile, should the live preview be hidden to save space?
3. Should there be a "Skip Demo" option to jump to database connection?

---

## Related Files

- Current implementation: `src/components/demo-project-page.tsx`
- Animation component: `src/components/app-creating-animation.tsx`
- Carousel UI: `src/components/ui/carousel.tsx`
- Demo config: `src/lib/demo-config.ts`
- Table dashboard: `src/components/table-view-dashboard.tsx`

---

*Created: January 1, 2026*
