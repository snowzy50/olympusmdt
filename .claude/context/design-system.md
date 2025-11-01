# MDT Dashboard Design System

> **Purpose:** This design system document serves as the single source of truth for UI/UX consistency across all MDT projects. Use this with Playwright-based design reviews to ensure pixel-perfect replication of design patterns.

**Last Updated:** 2025-11-01
**Version:** 1.0.0
**Based on:** Comprehensive Playwright analysis of MDT Dashboard

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design Tokens](#design-tokens)
3. [Component Library](#component-library)
4. [Layout Patterns](#layout-patterns)
5. [Interaction Patterns](#interaction-patterns)
6. [Responsive Design](#responsive-design)
7. [Accessibility Standards](#accessibility-standards)
8. [Animation & Transitions](#animation--transitions)
9. [Page Templates](#page-templates)
10. [Implementation Guidelines](#implementation-guidelines)

---

## Design Philosophy

### Core Principles

#### 1. **Professional Law Enforcement Aesthetic**
- Dark, sophisticated color palette evoking authority and professionalism
- Minimal distractions to support mission-critical operations
- High contrast for readability in various lighting conditions

#### 2. **Efficiency-First Design**
- Quick access to critical functions (max 2 clicks to any feature)
- Keyboard shortcuts for power users
- Bulk operations for repetitive tasks
- Smart defaults to minimize decision fatigue

#### 3. **Multi-Agency Flexibility**
- Agency-specific branding while maintaining consistent UX
- Role-based access control built into UI patterns
- Scalable to support 5+ agencies simultaneously

#### 4. **Real-Time Collaboration**
- Live updates across tabs/users via localStorage sync
- Visual indicators for data changes
- Toast notifications for important events

#### 5. **Mobile-First Responsive**
- Touch-optimized for field operations
- Graceful degradation from desktop → tablet → mobile
- Consistent experience across all breakpoints

---

## Design Tokens

### Color System

#### Primary Brand Colors
```javascript
// Blue - Primary interactive elements
primary: {
  50:  '#eff6ff',  // Hover backgrounds, badges
  100: '#dbeafe',  // Subtle highlights
  200: '#bfdbfe',  // Light borders
  300: '#93c5fd',  // Disabled states
  400: '#60a5fa',  // Hover states
  500: '#3b82f6',  // Default primary
  600: '#2563eb',  // Primary buttons, links
  700: '#1d4ed8',  // Active/pressed states
  800: '#1e40af',  // Dark emphasis
  900: '#1e3a8a',  // Headers, strong text
}
```

#### Dark Theme Palette
```javascript
// Main backgrounds and surfaces
dark: {
  100: '#1e293b',  // Cards, modals, elevated surfaces
  200: '#0f172a',  // Primary background
  300: '#020617',  // Deepest backgrounds, headers
}

// Neutral grays (for text, borders, dividers)
gray: {
  50:  '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
}
```

#### Semantic Colors
```javascript
// Success - Approvals, confirmations, positive actions
success: {
  50:  '#f0fdf4',
  500: '#22c55e',  // Default success
  600: '#16a34a',  // Buttons
  700: '#15803d',  // Hover
}

// Warning - Cautions, pending states
warning: {
  50:  '#fefce8',
  500: '#eab308',  // Default warning
  600: '#ca8a04',  // Emphasis
  700: '#a16207',  // Hover
}

// Error/Destructive - Deletions, rejections, critical issues
error: {
  50:  '#fef2f2',
  500: '#ef4444',  // Default error
  600: '#dc2626',  // Buttons
  700: '#b91c1c',  // Hover
}

// Info - Informational messages, helper text
info: {
  50:  '#eff6ff',
  500: '#3b82f6',  // Default info (same as primary)
  600: '#2563eb',
  700: '#1d4ed8',
}
```

#### Agency-Specific Colors
```javascript
// Each agency has a unique accent color for branding
agencies: {
  sasp:     '#2563eb',  // Blue - San Andreas State Police
  samc:     '#dc2626',  // Red - San Andreas Medical Center
  safd:     '#ea580c',  // Orange - San Andreas Fire Department
  dynasty8: '#16a34a',  // Green - Dynasty 8 Real Estate
  doj:      '#7c3aed',  // Purple - Department of Justice
}
```

#### Usage Guidelines
- **Primary (Blue):** Interactive elements (buttons, links, active states)
- **Dark Palette:** Backgrounds, cards, surfaces (creates depth)
- **Gray Palette:** Text hierarchy, borders, dividers, disabled states
- **Semantic Colors:** Status indicators, alerts, confirmations
- **Agency Colors:** Headers, logos, accent elements (sparingly)

**Accessibility:** All color combinations meet WCAG 2.1 AA contrast ratios (4.5:1 for normal text, 3:1 for large text).

---

### Typography

#### Font Family
```css
/* System font stack for optimal performance and native feel */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI',
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
             'Fira Sans', 'Droid Sans', 'Helvetica Neue',
             sans-serif;
```

**Why System Fonts:**
- Zero network requests (instant load)
- Native OS feel (familiar to users)
- Excellent cross-platform rendering
- Optimized for readability

#### Type Scale
```javascript
// Tailwind class → px → rem → Usage
fontSize: {
  'xs':   '0.75rem',  // 12px - Micro labels, timestamps
  'sm':   '0.875rem', // 14px - Secondary text, captions
  'base': '1rem',     // 16px - Body text (default)
  'lg':   '1.125rem', // 18px - Emphasized body text
  'xl':   '1.25rem',  // 20px - Small headings
  '2xl':  '1.5rem',   // 24px - H3
  '3xl':  '1.875rem', // 30px - H2
  '4xl':  '2.25rem',  // 36px - H1 (page titles)
  '5xl':  '3rem',     // 48px - Hero headings
  '6xl':  '3.75rem',  // 60px - Landing page display
}
```

#### Font Weights
```javascript
fontWeight: {
  light:     300,  // Rarely used (subtle de-emphasis)
  normal:    400,  // Body text default
  medium:    500,  // Slightly emphasized text
  semibold:  600,  // Buttons, labels, card titles
  bold:      700,  // Headings, strong emphasis
}
```

#### Line Heights
```javascript
lineHeight: {
  none:    1,      // Icons, badges (vertically centered)
  tight:   1.25,   // Headings (compact)
  snug:    1.375,  // Emphasized body text
  normal:  1.5,    // Body text (default)
  relaxed: 1.625,  // Long-form content
  loose:   2,      // Spacious text (rare)
}
```

#### Typography Hierarchy Example
```jsx
// Page Title (H1)
<h1 className="text-4xl font-bold text-gray-100">
  Active Cases
</h1>

// Section Heading (H2)
<h2 className="text-3xl font-bold text-gray-200">
  Recent Activity
</h2>

// Card Title (H3)
<h3 className="text-2xl font-semibold text-gray-100">
  Case #2024-001
</h3>

// Label
<label className="text-sm font-medium text-gray-300">
  Officer Name
</label>

// Body Text
<p className="text-base font-normal text-gray-400 leading-normal">
  This is standard body text with optimal readability.
</p>

// Caption/Metadata
<span className="text-xs font-normal text-gray-500">
  Updated 2 hours ago
</span>
```

---

### Spacing System

#### Base Unit: 4px
All spacing uses multiples of 4px for visual consistency and mathematical harmony.

```javascript
spacing: {
  0:    '0px',      // No space
  1:    '4px',      // Micro (tight element spacing)
  2:    '8px',      // Small (icon-text gaps)
  3:    '12px',     // Medium (input padding)
  4:    '16px',     // Base (card padding, button padding)
  5:    '20px',     // Large (section spacing)
  6:    '24px',     // XL (card spacing)
  8:    '32px',     // 2XL (component gaps)
  10:   '40px',     // 3XL (page margins)
  12:   '48px',     // 4XL (section dividers)
  16:   '64px',     // 5XL (page padding)
  20:   '80px',     // 6XL (hero sections)
  24:   '96px',     // 7XL (landing page spacing)
}
```

#### Usage Patterns
```jsx
// Card padding
<div className="p-6">          {/* 24px all sides */}

// Button padding
<button className="px-6 py-3"> {/* 24px horizontal, 12px vertical */}

// Section spacing
<section className="space-y-8"> {/* 32px gap between children */}

// Grid gaps
<div className="grid grid-cols-3 gap-6"> {/* 24px between items */}

// Page container
<main className="px-4 py-8 md:px-8 md:py-12"> {/* Responsive padding */}
```

---

### Border Radius

```javascript
borderRadius: {
  'none': '0px',      // Sharp corners (rare)
  'sm':   '4px',      // Badges, tags
  'md':   '6px',      // Buttons, inputs
  'lg':   '8px',      // Cards, modals
  'xl':   '12px',     // Hero cards, feature boxes
  '2xl':  '16px',     // Large cards
  'full': '9999px',   // Pills, circular avatars
}
```

**Usage:**
- **Buttons/Inputs:** `rounded-lg` (8px)
- **Cards:** `rounded-xl` (12px)
- **Modals:** `rounded-2xl` (16px)
- **Badges/Pills:** `rounded-full`

---

### Shadows

```javascript
boxShadow: {
  'sm':   '0 1px 2px 0 rgb(0 0 0 / 0.05)',              // Subtle elevation
  'md':   '0 4px 6px -1px rgb(0 0 0 / 0.1)',            // Cards (default)
  'lg':   '0 10px 15px -3px rgb(0 0 0 / 0.1)',          // Elevated cards
  'xl':   '0 20px 25px -5px rgb(0 0 0 / 0.1)',          // Modals, popovers
  '2xl':  '0 25px 50px -12px rgb(0 0 0 / 0.25)',        // Hero cards
  'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',       // Pressed buttons
  'none': '0 0 #0000',                                   // No shadow
}
```

**Usage:**
- **Default Cards:** `shadow-lg`
- **Hover Cards:** `shadow-xl`
- **Modals:** `shadow-2xl`
- **Pressed Buttons:** `shadow-inner`

---

## Component Library

### Buttons

#### Primary Button
**Purpose:** Main call-to-action, affirmative actions (Save, Submit, Approve)

```jsx
<button className="
  bg-primary-600 text-white
  px-6 py-3
  rounded-lg
  font-semibold
  hover:bg-primary-700
  active:bg-primary-800
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-200
  transition-colors duration-200
  shadow-lg hover:shadow-xl
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Save Changes
</button>
```

**States:**
- Default: `bg-primary-600`
- Hover: `bg-primary-700`
- Active/Pressed: `bg-primary-800`
- Focus: Blue ring with offset
- Disabled: 50% opacity, no pointer

**Variants:**
```jsx
// With Icon (Leading)
<button className="btn-primary flex items-center gap-2">
  <CheckIcon className="w-5 h-5" />
  Approve
</button>

// With Icon (Trailing)
<button className="btn-primary flex items-center gap-2">
  Next
  <ArrowRightIcon className="w-5 h-5" />
</button>

// Loading State
<button className="btn-primary" disabled>
  <Loader2Icon className="w-5 h-5 animate-spin" />
  Saving...
</button>
```

---

#### Secondary Button
**Purpose:** Secondary actions, neutral choices (Cancel, Back, View)

```jsx
<button className="
  bg-white text-primary-600
  px-6 py-3
  rounded-lg
  font-semibold
  border-2 border-primary-600
  hover:bg-primary-50
  active:bg-primary-100
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-200
  transition-colors duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Cancel
</button>
```

**When to Use:**
- Paired with primary button (Cancel/Save)
- Less important actions
- Navigation ("Back to Dashboard")

---

#### Destructive Button
**Purpose:** Dangerous actions (Delete, Reject, Archive)

```jsx
<button className="
  bg-error-600 text-white
  px-6 py-3
  rounded-lg
  font-semibold
  hover:bg-error-700
  active:bg-error-800
  focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 focus:ring-offset-dark-200
  transition-colors duration-200
  shadow-lg hover:shadow-xl
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Delete Case
</button>
```

**Critical:** Always pair with confirmation modal for irreversible actions.

---

#### Ghost/Tertiary Button
**Purpose:** Minimal visual weight, inline actions (Edit, View Details)

```jsx
<button className="
  text-primary-600
  px-4 py-2
  rounded-md
  font-medium
  hover:bg-primary-50
  active:bg-primary-100
  focus:outline-none focus:ring-2 focus:ring-primary-500
  transition-colors duration-200
">
  Edit
</button>
```

**When to Use:**
- Table row actions
- Inline editing triggers
- Less prominent secondary actions

---

#### Icon Button
**Purpose:** Compact actions with icon-only UI (Close, Menu, More Options)

```jsx
<button className="
  p-2
  rounded-md
  text-gray-400
  hover:text-gray-100 hover:bg-gray-700
  focus:outline-none focus:ring-2 focus:ring-primary-500
  transition-colors duration-200
" aria-label="Close modal">
  <XIcon className="w-5 h-5" />
</button>
```

**Accessibility:** Always include `aria-label` for screen readers.

**Common Icons:**
- Close: `XIcon`
- Menu: `MenuIcon`
- More: `MoreVerticalIcon`
- Edit: `PencilIcon`
- Delete: `TrashIcon`

---

### Cards

#### Standard Card
**Purpose:** Content containers, information grouping

```jsx
<div className="
  bg-dark-100
  rounded-xl
  shadow-lg
  p-6
  hover:shadow-xl
  transition-shadow duration-300
  border border-gray-700
">
  <h3 className="text-xl font-semibold text-gray-100 mb-4">
    Card Title
  </h3>
  <p className="text-gray-400 text-sm">
    Card content goes here...
  </p>
</div>
```

**Variants:**
```jsx
// Interactive Card (clickable)
<div className="
  bg-dark-100 rounded-xl shadow-lg p-6
  hover:shadow-xl hover:border-primary-600
  cursor-pointer transition-all duration-300
  border border-gray-700
">

// Elevated Card (more prominent)
<div className="
  bg-dark-100 rounded-2xl shadow-2xl p-8
  border border-gray-600
">

// Flat Card (no shadow)
<div className="
  bg-dark-100 rounded-lg p-4
  border border-gray-700
">
```

---

#### Feature Card
**Purpose:** Landing page features, service highlights

```jsx
<div className="
  bg-gradient-to-br from-dark-100 to-dark-200
  rounded-2xl
  shadow-2xl
  p-8
  hover:shadow-[0_20px_50px_rgba(59,130,246,0.3)]
  hover:scale-105
  transition-all duration-300
  border border-gray-700
">
  <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
    <ShieldIcon className="w-6 h-6 text-white" />
  </div>
  <h3 className="text-2xl font-bold text-gray-100 mb-3">
    Secure by Default
  </h3>
  <p className="text-gray-400 text-base leading-relaxed">
    End-to-end encryption with role-based access control.
  </p>
</div>
```

**Animation:** Scale + shadow glow on hover

---

#### Agency Card
**Purpose:** Agency selection, multi-tenant switching

```jsx
<button className="
  group
  bg-dark-100
  rounded-xl
  shadow-lg
  p-6
  hover:shadow-2xl hover:border-primary-600
  transition-all duration-300
  border-2 border-gray-700
  w-full text-left
">
  <img
    src="/assets/agency-logo.png"
    alt="SASP Logo"
    className="w-20 h-20 mb-4 group-hover:scale-110 transition-transform"
  />
  <h3 className="text-xl font-bold text-gray-100 mb-2">
    San Andreas State Police
  </h3>
  <p className="text-gray-400 text-sm">
    State law enforcement agency
  </p>
</button>
```

**Interaction:** Logo scales on hover, border highlights

---

#### Case/Record Card
**Purpose:** Data display for cases, citizens, vehicles

```jsx
<div className="
  bg-dark-100
  rounded-lg
  shadow-md
  p-5
  hover:shadow-lg
  transition-shadow duration-200
  border-l-4 border-primary-600
">
  {/* Header */}
  <div className="flex justify-between items-start mb-3">
    <h4 className="text-lg font-semibold text-gray-100">
      Case #2024-001
    </h4>
    <span className="px-3 py-1 bg-warning-600 text-white text-xs font-semibold rounded-full">
      Pending
    </span>
  </div>

  {/* Content */}
  <p className="text-gray-400 text-sm mb-3">
    Armed robbery at Fleeca Bank, Paleto Bay
  </p>

  {/* Metadata */}
  <div className="flex items-center gap-4 text-xs text-gray-500">
    <span className="flex items-center gap-1">
      <UserIcon className="w-4 h-4" />
      Officer Smith
    </span>
    <span className="flex items-center gap-1">
      <CalendarIcon className="w-4 h-4" />
      Oct 15, 2024
    </span>
  </div>

  {/* Actions */}
  <div className="flex gap-2 mt-4">
    <button className="btn-ghost text-xs">View</button>
    <button className="btn-ghost text-xs">Edit</button>
  </div>
</div>
```

**Color-Coded Border:** Use left border to indicate status/category

---

#### Stat Card
**Purpose:** Dashboard metrics, KPIs

```jsx
<div className="
  bg-gradient-to-br from-primary-600 to-primary-800
  rounded-xl
  shadow-lg
  p-6
  border border-primary-500
">
  <div className="flex items-center justify-between mb-2">
    <h4 className="text-sm font-medium text-primary-100">
      Active Cases
    </h4>
    <TrendingUpIcon className="w-5 h-5 text-primary-200" />
  </div>
  <p className="text-4xl font-bold text-white mb-1">
    27
  </p>
  <p className="text-xs text-primary-200">
    +3 from last week
  </p>
</div>
```

**Color Variants:** Use semantic colors for different metrics (success, warning, error)

---

### Forms

#### Text Input
```jsx
<div className="space-y-2">
  <label
    htmlFor="officer-name"
    className="block text-sm font-medium text-gray-300"
  >
    Officer Name
  </label>
  <input
    type="text"
    id="officer-name"
    placeholder="Enter officer name..."
    className="
      w-full
      px-4 py-3
      bg-dark-200
      border border-gray-600
      rounded-lg
      text-gray-100
      placeholder-gray-500
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
    "
  />
  <p className="text-xs text-gray-500">
    Helper text or validation message
  </p>
</div>
```

**States:**
- Default: `border-gray-600`
- Focus: Blue ring, border transparent
- Error: `border-error-600 focus:ring-error-500`
- Success: `border-success-600 focus:ring-success-500`
- Disabled: 50% opacity

---

#### Textarea
```jsx
<textarea
  rows="4"
  placeholder="Enter case description..."
  className="
    w-full
    px-4 py-3
    bg-dark-200
    border border-gray-600
    rounded-lg
    text-gray-100
    placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    transition-all duration-200
    resize-none
  "
/>
```

---

#### Select Dropdown
```jsx
<select className="
  w-full
  px-4 py-3
  bg-dark-200
  border border-gray-600
  rounded-lg
  text-gray-100
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
  transition-all duration-200
  appearance-none
  bg-[url('data:image/svg+xml;charset=UTF-8,...')] bg-no-repeat bg-right pr-10
">
  <option value="">Select agency...</option>
  <option value="sasp">San Andreas State Police</option>
  <option value="samc">San Andreas Medical Center</option>
  <option value="safd">San Andreas Fire Department</option>
</select>
```

**Note:** Custom arrow icon via background SVG for consistent styling.

---

#### Checkbox
```jsx
<label className="flex items-center gap-3 cursor-pointer">
  <input
    type="checkbox"
    className="
      w-5 h-5
      text-primary-600
      bg-dark-200
      border-gray-600
      rounded
      focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-200
      transition-colors duration-200
    "
  />
  <span className="text-sm font-medium text-gray-300">
    I confirm this information is accurate
  </span>
</label>
```

---

#### Radio Button
```jsx
<div className="space-y-3">
  <label className="flex items-center gap-3 cursor-pointer">
    <input
      type="radio"
      name="priority"
      value="low"
      className="
        w-5 h-5
        text-primary-600
        bg-dark-200
        border-gray-600
        focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-200
        transition-colors duration-200
      "
    />
    <span className="text-sm font-medium text-gray-300">Low Priority</span>
  </label>

  <label className="flex items-center gap-3 cursor-pointer">
    <input type="radio" name="priority" value="high" className="..." />
    <span className="text-sm font-medium text-gray-300">High Priority</span>
  </label>
</div>
```

---

#### Toggle/Switch
```jsx
<label className="relative inline-flex items-center cursor-pointer">
  <input type="checkbox" className="sr-only peer" />
  <div className="
    w-11 h-6
    bg-gray-600
    peer-focus:ring-2 peer-focus:ring-primary-500
    rounded-full
    peer
    peer-checked:after:translate-x-full
    peer-checked:after:border-white
    after:content-['']
    after:absolute
    after:top-[2px]
    after:left-[2px]
    after:bg-white
    after:rounded-full
    after:h-5
    after:w-5
    after:transition-all
    peer-checked:bg-primary-600
  "></div>
  <span className="ml-3 text-sm font-medium text-gray-300">
    Enable notifications
  </span>
</label>
```

---

#### File Upload
```jsx
<div className="
  border-2 border-dashed border-gray-600
  rounded-lg
  p-8
  text-center
  hover:border-primary-600
  transition-colors duration-200
  cursor-pointer
">
  <input type="file" className="hidden" id="file-upload" />
  <label htmlFor="file-upload" className="cursor-pointer">
    <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <p className="text-base font-medium text-gray-300 mb-1">
      Click to upload or drag and drop
    </p>
    <p className="text-sm text-gray-500">
      PDF, PNG, JPG up to 10MB
    </p>
  </label>
</div>
```

**Interaction:** Border highlights on hover/drag

---

### Navigation

#### Sidebar Navigation
```jsx
<nav className="
  w-64
  bg-dark-300
  border-r border-gray-700
  flex flex-col
  h-screen
  fixed left-0 top-0
">
  {/* Logo/Header */}
  <div className="p-6 border-b border-gray-700">
    <img src="/logo.png" alt="MDT" className="h-10" />
  </div>

  {/* Navigation Items */}
  <ul className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
    {/* Active Item */}
    <li>
      <a href="/dashboard" className="
        flex items-center gap-3
        px-4 py-3
        bg-primary-600 text-white
        rounded-lg
        font-medium
      ">
        <HomeIcon className="w-5 h-5" />
        Dashboard
      </a>
    </li>

    {/* Inactive Item */}
    <li>
      <a href="/cases" className="
        flex items-center gap-3
        px-4 py-3
        text-gray-400
        rounded-lg
        hover:bg-dark-100 hover:text-gray-100
        transition-colors duration-200
        font-medium
      ">
        <FolderIcon className="w-5 h-5" />
        Cases
      </a>
    </li>

    {/* Expandable Section */}
    <li>
      <button className="
        w-full flex items-center justify-between
        px-4 py-3
        text-gray-400
        rounded-lg
        hover:bg-dark-100 hover:text-gray-100
        transition-colors duration-200
        font-medium
      ">
        <span className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5" />
          Settings
        </span>
        <ChevronDownIcon className="w-4 h-4" />
      </button>
      {/* Submenu (hidden by default) */}
    </li>
  </ul>

  {/* User Profile (Footer) */}
  <div className="p-4 border-t border-gray-700">
    <div className="flex items-center gap-3">
      <img
        src="/avatar.png"
        alt="User"
        className="w-10 h-10 rounded-full"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-100 truncate">
          Officer Smith
        </p>
        <p className="text-xs text-gray-500 truncate">
          SASP - Badge #1234
        </p>
      </div>
    </div>
  </div>
</nav>
```

**States:**
- Active: `bg-primary-600 text-white`
- Inactive: `text-gray-400 hover:bg-dark-100 hover:text-gray-100`

**Responsive:** Collapses to icon-only on mobile, full sidebar on desktop.

---

#### Top Navigation Bar
```jsx
<nav className="
  bg-dark-300
  border-b border-gray-700
  px-6 py-4
  flex items-center justify-between
  sticky top-0 z-50
">
  {/* Left: Logo/Title */}
  <div className="flex items-center gap-4">
    <button className="lg:hidden p-2 text-gray-400 hover:text-gray-100">
      <MenuIcon className="w-6 h-6" />
    </button>
    <h1 className="text-xl font-bold text-gray-100">
      MDT Dashboard
    </h1>
  </div>

  {/* Center: Search (optional) */}
  <div className="flex-1 max-w-xl mx-8 hidden md:block">
    <input
      type="search"
      placeholder="Search cases, citizens, vehicles..."
      className="w-full px-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
  </div>

  {/* Right: Actions */}
  <div className="flex items-center gap-4">
    {/* Notifications */}
    <button className="relative p-2 text-gray-400 hover:text-gray-100">
      <BellIcon className="w-6 h-6" />
      <span className="absolute top-1 right-1 w-2 h-2 bg-error-600 rounded-full"></span>
    </button>

    {/* User Menu */}
    <button className="flex items-center gap-2">
      <img src="/avatar.png" alt="User" className="w-8 h-8 rounded-full" />
    </button>
  </div>
</nav>
```

**Sticky:** Fixed to top on scroll with `sticky top-0 z-50`

---

#### Breadcrumbs
```jsx
<nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
  <a href="/dashboard" className="hover:text-gray-100 transition-colors">
    Dashboard
  </a>
  <ChevronRightIcon className="w-4 h-4" />
  <a href="/cases" className="hover:text-gray-100 transition-colors">
    Cases
  </a>
  <ChevronRightIcon className="w-4 h-4" />
  <span className="text-gray-100 font-medium">
    Case #2024-001
  </span>
</nav>
```

---

#### Tabs
```jsx
<div className="border-b border-gray-700">
  <nav className="flex gap-8">
    {/* Active Tab */}
    <button className="
      px-1 py-4
      border-b-2 border-primary-600
      text-primary-600
      font-medium
    ">
      Overview
    </button>

    {/* Inactive Tabs */}
    <button className="
      px-1 py-4
      border-b-2 border-transparent
      text-gray-400
      hover:text-gray-100 hover:border-gray-600
      transition-colors duration-200
      font-medium
    ">
      Evidence
    </button>

    <button className="...">
      Reports
    </button>
  </nav>
</div>
```

---

### Tables

#### Data Table
```jsx
<div className="overflow-x-auto rounded-xl border border-gray-700">
  <table className="w-full">
    {/* Table Header */}
    <thead className="bg-dark-300 border-b border-gray-700">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Case ID
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Description
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Officer
        </th>
        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>

    {/* Table Body */}
    <tbody className="bg-dark-100 divide-y divide-gray-700">
      {/* Row */}
      <tr className="hover:bg-dark-200 transition-colors duration-150">
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm font-medium text-primary-400">
            #2024-001
          </span>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-300">
            Armed robbery at Fleeca Bank
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="px-3 py-1 text-xs font-semibold bg-warning-600 text-white rounded-full">
            Pending
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className="text-sm text-gray-400">
            Officer Smith
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right">
          <button className="text-primary-600 hover:text-primary-400 text-sm font-medium">
            View
          </button>
        </td>
      </tr>

      {/* More rows... */}
    </tbody>
  </table>
</div>
```

**Features:**
- Hover row highlight: `hover:bg-dark-200`
- Sticky header: Add `sticky top-0` to `<thead>`
- Sortable columns: Add arrow icons to headers
- Zebra striping: Optional `even:bg-dark-200` on `<tr>`

---

#### Empty State
```jsx
<div className="text-center py-12">
  <FolderOpenIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
  <h3 className="text-xl font-semibold text-gray-300 mb-2">
    No cases found
  </h3>
  <p className="text-gray-500 mb-6">
    Get started by creating your first case
  </p>
  <button className="btn-primary">
    Create Case
  </button>
</div>
```

---

### Badges & Status Indicators

#### Badge
```jsx
{/* Status Badge */}
<span className="px-3 py-1 text-xs font-semibold bg-success-600 text-white rounded-full">
  Approved
</span>

{/* Outlined Badge */}
<span className="px-3 py-1 text-xs font-semibold border-2 border-primary-600 text-primary-600 rounded-full">
  New
</span>

{/* Count Badge */}
<span className="px-2 py-0.5 text-xs font-bold bg-error-600 text-white rounded-full">
  3
</span>
```

**Color Coding:**
- Success: `bg-success-600` (green)
- Warning: `bg-warning-600` (yellow)
- Error: `bg-error-600` (red)
- Info: `bg-primary-600` (blue)
- Neutral: `bg-gray-600`

---

#### Dot Indicator
```jsx
<div className="flex items-center gap-2">
  <span className="w-2 h-2 bg-success-600 rounded-full"></span>
  <span className="text-sm text-gray-400">Online</span>
</div>

{/* Pulsing Indicator */}
<span className="relative flex h-3 w-3">
  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error-600 opacity-75"></span>
  <span className="relative inline-flex rounded-full h-3 w-3 bg-error-600"></span>
</span>
```

---

### Modals & Dialogs

#### Modal Overlay
```jsx
<div className="
  fixed inset-0
  bg-black/70
  backdrop-blur-sm
  flex items-center justify-center
  z-50
  animate-fade-in
">
  {/* Modal Container */}
  <div className="
    bg-dark-100
    rounded-2xl
    shadow-2xl
    max-w-2xl
    w-full
    mx-4
    border border-gray-700
    animate-slide-up
  ">
    {/* Modal Header */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
      <h2 className="text-2xl font-bold text-gray-100">
        Create New Case
      </h2>
      <button className="p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded-md transition-colors">
        <XIcon className="w-5 h-5" />
      </button>
    </div>

    {/* Modal Body */}
    <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
      {/* Form content here */}
    </div>

    {/* Modal Footer */}
    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-700 bg-dark-200">
      <button className="btn-secondary">
        Cancel
      </button>
      <button className="btn-primary">
        Create Case
      </button>
    </div>
  </div>
</div>
```

**Accessibility:**
- Focus trap (prevent tabbing outside modal)
- ESC key to close
- Click overlay to dismiss (optional)
- `aria-modal="true"` and `role="dialog"`

---

#### Confirmation Dialog
```jsx
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="bg-dark-100 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-700">
    {/* Icon */}
    <div className="px-6 pt-6 pb-4 text-center">
      <div className="w-16 h-16 bg-error-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangleIcon className="w-8 h-8 text-error-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-100 mb-2">
        Delete Case?
      </h3>
      <p className="text-gray-400">
        This action cannot be undone. This will permanently delete case #2024-001.
      </p>
    </div>

    {/* Actions */}
    <div className="flex gap-3 px-6 pb-6">
      <button className="flex-1 btn-secondary">
        Cancel
      </button>
      <button className="flex-1 btn-destructive">
        Delete
      </button>
    </div>
  </div>
</div>
```

---

### Loading States

#### Spinner
```jsx
<div className="flex items-center justify-center py-12">
  <Loader2Icon className="w-8 h-8 text-primary-600 animate-spin" />
</div>
```

---

#### Skeleton Loader
```jsx
<div className="animate-pulse space-y-4">
  {/* Header Skeleton */}
  <div className="h-8 bg-gray-700 rounded-lg w-1/3"></div>

  {/* Card Skeleton */}
  <div className="bg-dark-100 rounded-xl p-6 space-y-3">
    <div className="h-6 bg-gray-700 rounded w-2/3"></div>
    <div className="h-4 bg-gray-700 rounded w-full"></div>
    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
  </div>

  {/* Repeated for multiple items */}
</div>
```

---

#### Progress Bar
```jsx
<div className="w-full bg-gray-700 rounded-full h-2">
  <div
    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
    style={{ width: '65%' }}
  ></div>
</div>

{/* With Label */}
<div className="space-y-2">
  <div className="flex justify-between text-sm text-gray-400">
    <span>Uploading...</span>
    <span>65%</span>
  </div>
  <div className="w-full bg-gray-700 rounded-full h-2">
    <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: '65%' }}></div>
  </div>
</div>
```

---

### Toast Notifications

```jsx
<div className="
  fixed bottom-4 right-4
  bg-dark-100
  border-l-4 border-success-600
  rounded-lg
  shadow-2xl
  p-4
  flex items-start gap-3
  max-w-md
  animate-slide-up
  z-50
">
  <CheckCircleIcon className="w-6 h-6 text-success-600 flex-shrink-0 mt-0.5" />
  <div className="flex-1">
    <h4 className="text-sm font-semibold text-gray-100 mb-1">
      Case created successfully
    </h4>
    <p className="text-xs text-gray-400">
      Case #2024-002 has been added to your active cases.
    </p>
  </div>
  <button className="p-1 text-gray-400 hover:text-gray-100 transition-colors">
    <XIcon className="w-4 h-4" />
  </button>
</div>
```

**Variants:**
- Success: `border-success-600` + `CheckCircleIcon`
- Error: `border-error-600` + `XCircleIcon`
- Warning: `border-warning-600` + `AlertTriangleIcon`
- Info: `border-primary-600` + `InfoIcon`

**Auto-dismiss:** Fade out after 5 seconds

---

### Tooltips

```jsx
{/* Using Tippy.js or similar library */}
<button
  className="p-2 text-gray-400 hover:text-gray-100"
  data-tooltip="Edit case"
>
  <PencilIcon className="w-5 h-5" />
</button>

{/* Rendered Tooltip */}
<div className="
  absolute
  bg-gray-900
  text-white
  text-xs
  px-3 py-2
  rounded-md
  shadow-xl
  z-50
">
  Edit case
  <div className="absolute bottom-full left-1/2 -ml-1 border-4 border-transparent border-b-gray-900"></div>
</div>
```

**Positions:** Top, bottom, left, right
**Delay:** 200ms before showing

---

### Dropdowns & Popovers

```jsx
{/* Dropdown Menu */}
<div className="relative">
  <button className="btn-ghost flex items-center gap-2">
    More Options
    <ChevronDownIcon className="w-4 h-4" />
  </button>

  {/* Dropdown Panel (hidden by default) */}
  <div className="
    absolute right-0 mt-2
    w-56
    bg-dark-100
    border border-gray-700
    rounded-lg
    shadow-2xl
    py-2
    z-50
    animate-fade-in
  ">
    <a href="#" className="
      block px-4 py-2
      text-sm text-gray-300
      hover:bg-dark-200
      transition-colors
    ">
      <div className="flex items-center gap-3">
        <EditIcon className="w-4 h-4" />
        Edit
      </div>
    </a>

    <a href="#" className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-200">
      <div className="flex items-center gap-3">
        <CopyIcon className="w-4 h-4" />
        Duplicate
      </div>
    </a>

    <hr className="my-2 border-gray-700" />

    <a href="#" className="block px-4 py-2 text-sm text-error-600 hover:bg-dark-200">
      <div className="flex items-center gap-3">
        <TrashIcon className="w-4 h-4" />
        Delete
      </div>
    </a>
  </div>
</div>
```

---

### Avatars

```jsx
{/* Standard Avatar */}
<img
  src="/avatar.png"
  alt="Officer Smith"
  className="w-10 h-10 rounded-full border-2 border-gray-700"
/>

{/* Avatar with Status */}
<div className="relative">
  <img src="/avatar.png" alt="Officer Smith" className="w-10 h-10 rounded-full" />
  <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-600 border-2 border-dark-100 rounded-full"></span>
</div>

{/* Initials Avatar */}
<div className="
  w-10 h-10
  bg-primary-600
  rounded-full
  flex items-center justify-center
  text-white text-sm font-semibold
">
  JS
</div>

{/* Avatar Group (Stacked) */}
<div className="flex -space-x-2">
  <img src="/avatar1.png" className="w-8 h-8 rounded-full border-2 border-dark-100" />
  <img src="/avatar2.png" className="w-8 h-8 rounded-full border-2 border-dark-100" />
  <img src="/avatar3.png" className="w-8 h-8 rounded-full border-2 border-dark-100" />
  <div className="w-8 h-8 bg-gray-700 rounded-full border-2 border-dark-100 flex items-center justify-center text-xs text-gray-300">
    +5
  </div>
</div>
```

---

### Pagination

```jsx
<div className="flex items-center justify-between px-6 py-4 border-t border-gray-700">
  {/* Results Info */}
  <p className="text-sm text-gray-400">
    Showing <span className="font-medium text-gray-100">1</span> to <span className="font-medium text-gray-100">10</span> of <span className="font-medium text-gray-100">47</span> results
  </p>

  {/* Page Numbers */}
  <nav className="flex items-center gap-1">
    <button className="px-3 py-2 text-sm text-gray-400 hover:text-gray-100 hover:bg-dark-200 rounded-md transition-colors">
      <ChevronLeftIcon className="w-4 h-4" />
    </button>

    <button className="px-3 py-2 text-sm bg-primary-600 text-white rounded-md">
      1
    </button>
    <button className="px-3 py-2 text-sm text-gray-400 hover:text-gray-100 hover:bg-dark-200 rounded-md transition-colors">
      2
    </button>
    <button className="px-3 py-2 text-sm text-gray-400 hover:text-gray-100 hover:bg-dark-200 rounded-md transition-colors">
      3
    </button>
    <span className="px-3 py-2 text-sm text-gray-500">...</span>
    <button className="px-3 py-2 text-sm text-gray-400 hover:text-gray-100 hover:bg-dark-200 rounded-md transition-colors">
      5
    </button>

    <button className="px-3 py-2 text-sm text-gray-400 hover:text-gray-100 hover:bg-dark-200 rounded-md transition-colors">
      <ChevronRightIcon className="w-4 h-4" />
    </button>
  </nav>
</div>
```

---

## Layout Patterns

### Page Container
```jsx
<div className="min-h-screen bg-dark-200 flex">
  {/* Sidebar (fixed) */}
  <aside className="w-64 bg-dark-300 border-r border-gray-700 fixed h-screen">
    {/* Sidebar content */}
  </aside>

  {/* Main Content (with margin for fixed sidebar) */}
  <main className="flex-1 ml-64">
    {/* Top Bar (sticky) */}
    <header className="sticky top-0 z-40 bg-dark-300 border-b border-gray-700 px-8 py-4">
      <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
    </header>

    {/* Page Content */}
    <div className="px-8 py-6">
      {/* Content here */}
    </div>
  </main>
</div>
```

---

### Dashboard Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Stat Card */}
  <div className="bg-dark-100 rounded-xl p-6">...</div>
  <div className="bg-dark-100 rounded-xl p-6">...</div>
  <div className="bg-dark-100 rounded-xl p-6">...</div>
  <div className="bg-dark-100 rounded-xl p-6">...</div>
</div>

{/* Responsive Columns:
  - Mobile: 1 column
  - Tablet: 2 columns
  - Desktop: 3 columns
  - Large: 4 columns
*/}
```

---

### Split Layout (Master-Detail)
```jsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* List View (2/3 width) */}
  <div className="lg:col-span-2">
    <div className="bg-dark-100 rounded-xl p-6">
      {/* List of items */}
    </div>
  </div>

  {/* Detail Panel (1/3 width) */}
  <div className="lg:col-span-1">
    <div className="bg-dark-100 rounded-xl p-6 sticky top-24">
      {/* Detail view */}
    </div>
  </div>
</div>
```

---

### Card Grid
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {data.map(item => (
    <div key={item.id} className="bg-dark-100 rounded-xl p-6 hover:shadow-xl transition-shadow">
      {/* Card content */}
    </div>
  ))}
</div>
```

---

### Centered Content (Auth Pages)
```jsx
<div className="min-h-screen bg-dark-200 flex items-center justify-center px-4">
  <div className="max-w-md w-full">
    <div className="bg-dark-100 rounded-2xl shadow-2xl p-8 border border-gray-700">
      {/* Login form */}
    </div>
  </div>
</div>
```

---

## Interaction Patterns

### Hover States
**Principle:** Subtle visual feedback on all interactive elements.

```jsx
// Buttons
hover:bg-primary-700          // Darken background
hover:shadow-xl               // Elevate shadow

// Cards
hover:shadow-2xl              // Elevate
hover:border-primary-600      // Highlight border
hover:scale-105               // Slight scale (feature cards)

// Links
hover:text-gray-100           // Brighten text
hover:underline               // Underline

// Icon Buttons
hover:bg-gray-700             // Add background
hover:text-gray-100           // Brighten icon

// Table Rows
hover:bg-dark-200             // Highlight row
```

**Timing:** Use `transition-colors duration-200` for smooth transitions.

---

### Focus States
**Principle:** Clear keyboard navigation indicators (WCAG requirement).

```jsx
focus:outline-none                    // Remove default outline
focus:ring-2                          // Add custom ring
focus:ring-primary-500                // Blue ring color
focus:ring-offset-2                   // Spacing from element
focus:ring-offset-dark-200            // Offset color (matches bg)
```

**Usage:** Apply to all interactive elements (buttons, links, inputs, etc.).

---

### Active/Pressed States
```jsx
active:bg-primary-800         // Darker on click
active:scale-95               // Slight shrink
active:shadow-inner           // Inset shadow
```

---

### Disabled States
```jsx
disabled:opacity-50           // Dim appearance
disabled:cursor-not-allowed   // Change cursor
disabled:hover:bg-primary-600 // Prevent hover effect
```

---

### Loading States
**Principle:** Always show loading feedback for async operations.

```jsx
// Button Loading
<button disabled className="btn-primary flex items-center gap-2">
  <Loader2Icon className="w-5 h-5 animate-spin" />
  Saving...
</button>

// Page Loading
<div className="flex items-center justify-center py-12">
  <Loader2Icon className="w-8 h-8 text-primary-600 animate-spin" />
</div>

// Skeleton Loading (preferred for initial page loads)
<div className="animate-pulse">
  <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
  <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
</div>
```

---

### Error States
**Principle:** Clear, actionable error messages.

```jsx
// Form Input Error
<input
  className="... border-error-600 focus:ring-error-500"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error" className="text-xs text-error-600 mt-1">
  Invalid email address
</p>

// Page Error State
<div className="text-center py-12">
  <XCircleIcon className="w-16 h-16 text-error-600 mx-auto mb-4" />
  <h3 className="text-xl font-semibold text-gray-100 mb-2">
    Failed to load cases
  </h3>
  <p className="text-gray-400 mb-6">
    We couldn't retrieve your cases. Please try again.
  </p>
  <button className="btn-primary">
    Retry
  </button>
</div>
```

---

### Success States
```jsx
// Toast Notification (preferred)
<div className="toast-success">
  Case created successfully
</div>

// Inline Confirmation
<div className="flex items-center gap-2 text-success-600 text-sm">
  <CheckCircleIcon className="w-5 h-5" />
  Changes saved
</div>

// Success Page State
<div className="text-center py-12">
  <div className="w-20 h-20 bg-success-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
    <CheckCircleIcon className="w-10 h-10 text-success-600" />
  </div>
  <h3 className="text-2xl font-bold text-gray-100 mb-2">
    Case Created Successfully
  </h3>
  <p className="text-gray-400 mb-6">
    Case #2024-002 has been added to your active cases.
  </p>
  <button className="btn-primary">
    View Case
  </button>
</div>
```

---

## Responsive Design

### Breakpoints
```javascript
// Tailwind default breakpoints
screens: {
  sm: '640px',   // Mobile landscape, small tablets
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px', // Large desktops
}
```

### Mobile-First Approach
**Principle:** Design for mobile first, then enhance for larger screens.

```jsx
// Base styles = mobile
// Add prefixes for larger screens

<div className="
  px-4          {/* Mobile: 16px padding */}
  md:px-8       {/* Tablet: 32px padding */}
  lg:px-12      {/* Desktop: 48px padding */}

  grid
  grid-cols-1   {/* Mobile: 1 column */}
  md:grid-cols-2 {/* Tablet: 2 columns */}
  lg:grid-cols-3 {/* Desktop: 3 columns */}

  gap-4         {/* Mobile: 16px gap */}
  md:gap-6      {/* Tablet: 24px gap */}
">
```

---

### Responsive Typography
```jsx
<h1 className="
  text-3xl      {/* Mobile: 30px */}
  md:text-4xl   {/* Tablet: 36px */}
  lg:text-5xl   {/* Desktop: 48px */}

  font-bold
">
  Page Title
</h1>
```

---

### Responsive Sidebar
```jsx
// Desktop: Fixed sidebar
// Mobile: Collapsible drawer

<aside className="
  fixed inset-y-0 left-0
  w-64
  bg-dark-300
  transform
  -translate-x-full       {/* Hidden on mobile */}
  lg:translate-x-0        {/* Visible on desktop */}
  transition-transform duration-300
  z-50
">
  {/* Sidebar content */}
</aside>

// Mobile menu button
<button className="lg:hidden p-2" onClick={toggleSidebar}>
  <MenuIcon className="w-6 h-6" />
</button>
```

---

### Responsive Tables
```jsx
// Desktop: Full table
// Mobile: Card stack

<div className="
  hidden lg:block          {/* Hide table on mobile */}
">
  <table>...</table>
</div>

<div className="
  lg:hidden                {/* Show cards on mobile */}
  space-y-4
">
  {data.map(item => (
    <div className="bg-dark-100 rounded-lg p-4">
      {/* Mobile card layout */}
    </div>
  ))}
</div>
```

---

### Touch Optimization
**Principle:** Minimum 44x44px touch targets for mobile.

```jsx
// Good: Large enough touch target
<button className="p-4">
  <Icon className="w-6 h-6" />
</button>

// Bad: Too small
<button className="p-1">
  <Icon className="w-4 h-4" />
</button>

// Mobile-specific padding
<button className="
  p-2           {/* Mobile: 8px = 40px total (icon 24px + padding 16px) */}
  md:p-3        {/* Desktop: Can be smaller */}
">
  <Icon className="w-6 h-6" />
</button>
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### Color Contrast
**Requirement:** 4.5:1 for normal text, 3:1 for large text (18px+ or 14px+ bold).

✅ **Compliant Combinations:**
- `text-gray-100` on `bg-dark-200` (15:1)
- `text-white` on `bg-primary-600` (4.8:1)
- `text-white` on `bg-success-600` (3.2:1 - large text only)

❌ **Non-Compliant:**
- `text-gray-500` on `bg-gray-300` (2.1:1)

**Tool:** Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

#### Keyboard Navigation
**Requirements:**
- All interactive elements must be keyboard accessible
- Tab order must be logical
- Focus states must be visible

```jsx
// ✅ Good: Proper tab order and focus states
<nav>
  <a href="#" className="focus:ring-2 focus:ring-primary-500">Home</a>
  <a href="#" className="focus:ring-2 focus:ring-primary-500">Cases</a>
</nav>

// ❌ Bad: No focus state
<div onClick={handleClick}>Click me</div>

// ✅ Fix: Use button with proper semantics
<button onClick={handleClick} className="focus:ring-2 focus:ring-primary-500">
  Click me
</button>
```

---

#### Screen Reader Support
```jsx
// ✅ Proper labeling
<button aria-label="Close modal">
  <XIcon className="w-5 h-5" />
</button>

// ✅ Image alt text
<img src="/logo.png" alt="MDT Dashboard Logo" />

// ✅ Form labels
<label htmlFor="case-title" className="...">
  Case Title
</label>
<input id="case-title" type="text" />

// ✅ ARIA roles for custom components
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Create New Case</h2>
  {/* Modal content */}
</div>

// ✅ Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

---

#### Semantic HTML
```jsx
// ✅ Good: Semantic structure
<header>
  <nav>
    <ul>
      <li><a href="#">Home</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Page Title</h1>
    <section>
      <h2>Section Title</h2>
      <p>Content...</p>
    </section>
  </article>
</main>

<footer>
  <p>&copy; 2024 MDT Dashboard</p>
</footer>

// ❌ Bad: Div soup
<div>
  <div>
    <div>Home</div>
  </div>
</div>
```

---

#### Focus Management
```jsx
// Modal: Trap focus inside
useEffect(() => {
  if (isOpen) {
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const handleTab = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }
}, [isOpen]);
```

---

## Animation & Transitions

### Timing Functions
```javascript
// Tailwind easing (default: ease-in-out)
transition-timing-function: {
  'linear':    'linear',
  'in':        'cubic-bezier(0.4, 0, 1, 1)',       // Accelerate
  'out':       'cubic-bezier(0, 0, 0.2, 1)',       // Decelerate (preferred)
  'in-out':    'cubic-bezier(0.4, 0, 0.2, 1)',     // Smooth (default)
}
```

**Usage:** Use `ease-out` for entering animations, `ease-in` for exiting.

---

### Durations
```javascript
duration: {
  75:   '75ms',     // Instant feedback (hover states)
  100:  '100ms',    // Quick transitions
  150:  '150ms',    // Micro-interactions
  200:  '200ms',    // Standard transitions (default)
  300:  '300ms',    // Moderate animations
  500:  '500ms',    // Slow animations (modals)
  700:  '700ms',    // Very slow (avoid)
  1000: '1000ms',   // Animations (avoid for UI)
}
```

**Best Practices:**
- **Hover/Focus:** 150-200ms
- **Modals/Drawers:** 300ms
- **Page Transitions:** 500ms (max)

---

### Custom Animations
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
}
```

**Usage:**
```jsx
// Modal entrance
<div className="animate-fade-in">...</div>

// Toast notification
<div className="animate-slide-up">...</div>

// Dropdown menu
<div className="animate-slide-down">...</div>

// Button press feedback
<button className="active:scale-95 transition-transform duration-100">
  Click me
</button>
```

---

### Reduced Motion
**Accessibility:** Respect user's motion preferences.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Tailwind Utility:**
```jsx
<div className="
  transition-all duration-300
  motion-reduce:transition-none
">
```

---

## Page Templates

### Login Page
```jsx
<div className="min-h-screen bg-gradient-to-br from-dark-300 to-dark-200 flex items-center justify-center px-4">
  <div className="max-w-md w-full">
    {/* Logo */}
    <div className="text-center mb-8">
      <img src="/logo.png" alt="MDT" className="h-16 mx-auto mb-4" />
      <h1 className="text-3xl font-bold text-gray-100">
        MDT Dashboard
      </h1>
      <p className="text-gray-400 mt-2">
        Sign in with your Discord account
      </p>
    </div>

    {/* Login Card */}
    <div className="bg-dark-100 rounded-2xl shadow-2xl p-8 border border-gray-700">
      <button className="w-full btn-primary flex items-center justify-center gap-3">
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          {/* Discord icon */}
        </svg>
        Continue with Discord
      </button>
    </div>

    {/* Footer */}
    <p className="text-center text-sm text-gray-500 mt-6">
      By signing in, you agree to our Terms of Service
    </p>
  </div>
</div>
```

---

### Agency Selection
```jsx
<div className="min-h-screen bg-dark-200 px-4 py-12">
  <div className="max-w-5xl mx-auto">
    {/* Header */}
    <div className="text-center mb-12">
      <h1 className="text-4xl font-bold text-gray-100 mb-4">
        Select Your Agency
      </h1>
      <p className="text-gray-400">
        Choose an agency to access the dashboard
      </p>
    </div>

    {/* Agency Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Agency Card */}
      <button className="group bg-dark-100 rounded-xl shadow-lg p-8 hover:shadow-2xl hover:border-primary-600 transition-all duration-300 border-2 border-gray-700 text-left">
        <img
          src="/assets/sasp-logo.png"
          alt="SASP"
          className="w-24 h-24 mx-auto mb-4 group-hover:scale-110 transition-transform"
        />
        <h3 className="text-xl font-bold text-gray-100 text-center mb-2">
          San Andreas State Police
        </h3>
        <p className="text-gray-400 text-sm text-center">
          State law enforcement agency
        </p>
      </button>

      {/* More agency cards... */}
    </div>
  </div>
</div>
```

---

### Dashboard Home
```jsx
<div className="px-8 py-6">
  {/* Page Header */}
  <div className="mb-8">
    <h1 className="text-4xl font-bold text-gray-100 mb-2">
      Dashboard
    </h1>
    <p className="text-gray-400">
      Welcome back, Officer Smith
    </p>
  </div>

  {/* Stats Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {/* Stat Card */}
    <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-primary-100">Active Cases</h4>
        <FolderIcon className="w-5 h-5 text-primary-200" />
      </div>
      <p className="text-4xl font-bold text-white mb-1">27</p>
      <p className="text-xs text-primary-200">+3 from last week</p>
    </div>

    {/* More stat cards... */}
  </div>

  {/* Recent Activity */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Activity Feed (2/3) */}
    <div className="lg:col-span-2">
      <div className="bg-dark-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">
          Recent Activity
        </h2>
        {/* Activity items */}
      </div>
    </div>

    {/* Quick Actions (1/3) */}
    <div>
      <div className="bg-dark-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">
          Quick Actions
        </h2>
        <div className="space-y-3">
          <button className="w-full btn-primary">
            Create Case
          </button>
          <button className="w-full btn-secondary">
            Search Citizen
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

### List Page (Cases, Citizens, etc.)
```jsx
<div className="px-8 py-6">
  {/* Header with Actions */}
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-4xl font-bold text-gray-100">
      Active Cases
    </h1>
    <button className="btn-primary flex items-center gap-2">
      <PlusIcon className="w-5 h-5" />
      New Case
    </button>
  </div>

  {/* Filters */}
  <div className="bg-dark-100 rounded-xl p-4 mb-6 flex flex-wrap gap-4">
    <input
      type="search"
      placeholder="Search cases..."
      className="flex-1 min-w-[200px] px-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
    />
    <select className="px-4 py-2 bg-dark-200 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
      <option>All Status</option>
      <option>Pending</option>
      <option>Active</option>
      <option>Closed</option>
    </select>
    <button className="btn-secondary">
      <FilterIcon className="w-5 h-5" />
    </button>
  </div>

  {/* Table */}
  <div className="overflow-x-auto rounded-xl border border-gray-700">
    <table className="w-full">
      {/* Table content */}
    </table>
  </div>

  {/* Pagination */}
  <div className="flex items-center justify-between mt-6">
    {/* Pagination controls */}
  </div>
</div>
```

---

### Detail Page (Case Detail, Citizen Profile, etc.)
```jsx
<div className="px-8 py-6">
  {/* Breadcrumbs */}
  <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
    <a href="/dashboard">Dashboard</a>
    <ChevronRightIcon className="w-4 h-4" />
    <a href="/cases">Cases</a>
    <ChevronRightIcon className="w-4 h-4" />
    <span className="text-gray-100">Case #2024-001</span>
  </nav>

  {/* Header with Actions */}
  <div className="flex items-start justify-between mb-8">
    <div>
      <h1 className="text-4xl font-bold text-gray-100 mb-2">
        Case #2024-001
      </h1>
      <p className="text-gray-400">
        Created Oct 15, 2024 by Officer Smith
      </p>
    </div>
    <div className="flex gap-3">
      <button className="btn-secondary">
        Edit
      </button>
      <button className="btn-destructive">
        Close Case
      </button>
    </div>
  </div>

  {/* Content Tabs */}
  <div className="border-b border-gray-700 mb-6">
    <nav className="flex gap-8">
      <button className="px-1 py-4 border-b-2 border-primary-600 text-primary-600 font-medium">
        Overview
      </button>
      <button className="px-1 py-4 border-b-2 border-transparent text-gray-400 hover:text-gray-100 font-medium">
        Evidence
      </button>
      <button className="px-1 py-4 border-b-2 border-transparent text-gray-400 hover:text-gray-100 font-medium">
        Reports
      </button>
    </nav>
  </div>

  {/* Content Grid */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Main Content (2/3) */}
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-dark-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Description</h2>
        <p className="text-gray-400">...</p>
      </div>

      <div className="bg-dark-100 rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Timeline</h2>
        {/* Timeline items */}
      </div>
    </div>

    {/* Sidebar (1/3) */}
    <div className="space-y-6">
      <div className="bg-dark-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Details</h3>
        <dl className="space-y-3">
          <div>
            <dt className="text-xs text-gray-500 uppercase">Status</dt>
            <dd className="mt-1">
              <span className="px-3 py-1 bg-warning-600 text-white text-xs font-semibold rounded-full">
                Pending
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 uppercase">Priority</dt>
            <dd className="text-sm text-gray-300 mt-1">High</dd>
          </div>
          <div>
            <dt className="text-xs text-gray-500 uppercase">Assigned To</dt>
            <dd className="text-sm text-gray-300 mt-1">Officer Smith</dd>
          </div>
        </dl>
      </div>

      <div className="bg-dark-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h3>
        <div className="space-y-2">
          <button className="w-full btn-ghost text-left">Add Evidence</button>
          <button className="w-full btn-ghost text-left">Generate Report</button>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## Implementation Guidelines

### Using This Design System

#### For New Projects
1. **Setup Tailwind:** Configure Tailwind with design tokens from this document
2. **Copy Components:** Use component code snippets as-is or adapt
3. **Follow Patterns:** Maintain consistency with layout and interaction patterns
4. **Test with Playwright:** Use automated design review workflow

#### For Existing Projects
1. **Audit Current UI:** Compare against this design system
2. **Identify Gaps:** Note missing components or inconsistencies
3. **Incremental Migration:** Update components one at a time
4. **Document Deviations:** Note where your project differs and why

---

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        dark: {
          100: '#1e293b',
          200: '#0f172a',
          300: '#020617',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fefce8',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
```

---

### CSS Utilities
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold
           hover:bg-primary-700 active:bg-primary-800
           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-200
           transition-colors duration-200 shadow-lg hover:shadow-xl
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-secondary {
    @apply bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold
           border-2 border-primary-600 hover:bg-primary-50 active:bg-primary-100
           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-200
           transition-colors duration-200
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .btn-ghost {
    @apply text-primary-600 px-4 py-2 rounded-md font-medium
           hover:bg-primary-50 active:bg-primary-100
           focus:outline-none focus:ring-2 focus:ring-primary-500
           transition-colors duration-200;
  }

  .btn-destructive {
    @apply bg-error-600 text-white px-6 py-3 rounded-lg font-semibold
           hover:bg-error-700 active:bg-error-800
           focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2 focus:ring-offset-dark-200
           transition-colors duration-200 shadow-lg hover:shadow-xl
           disabled:opacity-50 disabled:cursor-not-allowed;
  }

  .card {
    @apply bg-dark-100 rounded-xl shadow-lg p-6
           hover:shadow-xl transition-shadow duration-300
           border border-gray-700;
  }
}
```

---

### Design Review Workflow

#### Setup (One-Time)
1. Install Playwright MCP server (see claude-code-workflows repo)
2. Copy design-review agent configuration to `.claude/agents/`
3. Add this design-system.md to `/context/` directory
4. Update CLAUDE.md to reference design system

#### Usage
```bash
# On-demand design review
/design-review

# Or tag agent in conversation
@agent-design-review Please review the latest UI changes
```

#### Automated PR Reviews
Create `.github/workflows/design-review.yml`:
```yaml
name: Design Review
on:
  pull_request:
    paths:
      - 'src/**/*.jsx'
      - 'src/**/*.tsx'
      - 'src/**/*.css'

jobs:
  design-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run design review
        # Configure Playwright + Claude Code automation
```

---

### Testing Checklist

Before deploying UI changes, verify:

#### Visual Consistency
- [ ] Colors match design tokens (no magic values)
- [ ] Typography uses defined scale
- [ ] Spacing follows 4px base unit
- [ ] Border radius is consistent
- [ ] Shadows follow defined scale

#### Responsive Design
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1440px)
- [ ] No horizontal scrolling
- [ ] Touch targets ≥ 44x44px (mobile)

#### Interactions
- [ ] Hover states on all interactive elements
- [ ] Focus states visible (keyboard nav)
- [ ] Active/pressed states on buttons
- [ ] Loading states for async operations
- [ ] Error states with clear messages

#### Accessibility
- [ ] Color contrast ≥ 4.5:1 (normal text)
- [ ] All images have alt text
- [ ] Forms have proper labels
- [ ] Keyboard navigation works
- [ ] Screen reader friendly (test with VoiceOver/NVDA)

#### Performance
- [ ] No layout shift (CLS score)
- [ ] Animations ≤ 300ms
- [ ] Images optimized (WebP preferred)
- [ ] No console errors

---

## Appendix

### Icon Library
**Lucide React** is used throughout the MDT Dashboard.

**Installation:**
```bash
npm install lucide-react
```

**Usage:**
```jsx
import { CheckIcon, XIcon, MenuIcon } from 'lucide-react';

<CheckIcon className="w-5 h-5" />
```

**Common Icons:**
- Navigation: `HomeIcon`, `FolderIcon`, `SettingsIcon`
- Actions: `PlusIcon`, `PencilIcon`, `TrashIcon`, `SearchIcon`
- Status: `CheckCircleIcon`, `XCircleIcon`, `AlertTriangleIcon`
- UI: `XIcon` (close), `MenuIcon`, `ChevronDownIcon`, `MoreVerticalIcon`
- Media: `FileIcon`, `ImageIcon`, `DownloadIcon`

**Size Guidelines:**
- Small (buttons, inline): `w-4 h-4` (16px)
- Medium (default): `w-5 h-5` (20px)
- Large (feature sections): `w-6 h-6` (24px)
- XL (hero sections): `w-8 h-8` (32px)

---

### Resources

#### Official Documentation
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev)
- [React Router](https://reactrouter.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

#### Tools
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) - Color contrast validation
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Accessibility audits
- [Playwright](https://playwright.dev) - Automated testing
- [Figma](https://figma.com) - Design collaboration

#### Inspiration
- [Stripe Dashboard](https://dashboard.stripe.com) - Clean, data-dense UI
- [Linear](https://linear.app) - Fast, keyboard-first interface
- [Vercel Dashboard](https://vercel.com/dashboard) - Modern, minimal design
- [GitHub](https://github.com) - Information architecture

---

### Version History

**v1.0.0** (2025-11-01)
- Initial design system documentation
- Based on comprehensive Playwright analysis
- 40+ components documented
- Complete design tokens catalog
- Accessibility guidelines (WCAG 2.1 AA)
- Responsive design patterns
- Animation standards

---

## Quick Reference

### Most Common Patterns

#### Button
```jsx
<button className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl">
  Click Me
</button>
```

#### Card
```jsx
<div className="bg-dark-100 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-700">
  Card Content
</div>
```

#### Input
```jsx
<input
  type="text"
  className="w-full px-4 py-3 bg-dark-200 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
  placeholder="Enter text..."
/>
```

#### Modal
```jsx
<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
  <div className="bg-dark-100 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-gray-700 animate-slide-up">
    {/* Modal content */}
  </div>
</div>
```

#### Toast
```jsx
<div className="fixed bottom-4 right-4 bg-dark-100 border-l-4 border-success-600 rounded-lg shadow-2xl p-4 flex items-start gap-3 max-w-md animate-slide-up z-50">
  <CheckCircleIcon className="w-6 h-6 text-success-600" />
  <div className="flex-1">
    <h4 className="text-sm font-semibold text-gray-100">Success</h4>
    <p className="text-xs text-gray-400">Action completed successfully</p>
  </div>
</div>
```

---

**End of Design System Documentation**

For questions or contributions, refer to the MDT Dashboard repository or contact the design team.
