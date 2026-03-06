# Chat UI Quick Reference Guide 📱

## Visual Layout Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DESKTOP VIEW (1024px+)                    │
├──────────────────────┬──────────────────────────────────────┤
│                      │                                        │
│   CHAT LIST          │         CHAT WINDOW                   │
│   (w-80 / 320px)     │                                        │
│                      │  ┌────────────────────────────────┐   │
│  ┌────────────────┐  │  │  Dr. Name    [📞][📹][ℹ️]     │   │
│  │ Logo + Search  │  │  └────────────────────────────────┘   │
│  └────────────────┘  │                                        │
│                      │  ┌────────────────────────────────┐   │
│  Doctors:           │  │                                 │   │
│  ┌────────────────┐  │  │    Messages Display Area       │   │
│  │ Doctor 1   ✓✓✓ │  │  │                                │   │
│  │ Last Message   │  │  │   👤 Doctor message           │   │
│  │ 2:30 PM        │  │  │                                │   │
│  └────────────────┘  │  │   Patient message      👤      │   │
│  ┌────────────────┐  │  │                                │   │
│  │ Doctor 2       │  │  │                                │   │
│  │ No messages yet│  │  └────────────────────────────────┘   │
│  │ 5:45 PM        │  │                                        │
│  └────────────────┘  │  ┌────────────────────────────────┐   │
│  ...                 │  │  [📎] [input field...  ] [😊] [→]  │   │
│                      │  └────────────────────────────────┘   │
└──────────────────────┴──────────────────────────────────────┘

┌─────────────────┐
│   MOBILE VIEW   │
├─────────────────┤
│   CHAT WINDOW   │
│ (Full Screen)   │
│                 │
│ [Open Menu FAB] │
└─────────────────┘
      │
      │ (Menu Open)
      ▼
┌─────────────────┐
│   CHAT LIST     │
│  (Overlay)      │
│  w-80 full-h    │
│  Shadow overlay │
└─────────────────┘
```

---

## Component Hierarchy

```
ChatWithDoctor (Main Container)
├── PatientChatList (Sidebar)
│   ├── Header
│   │   ├── Logo
│   │   └── Brand Name
│   ├── Search Bar
│   └── Doctor List
│       └── Doctor Item (repeated)
│           ├── Profile Image + Status
│           ├── Doctor Name
│           ├── Last Message
│           ├── Time
│           └── Unread Badge
│
└── PatientChatWindow (Main Content)
    ├── Chat Header
    │   ├── Profile & Status
    │   └── Action Buttons [📞][📹][ℹ️]
    ├── Messages Container
    │   ├── Message Item (repeated)
    │   │   ├── Avatar (if doctor)
    │   │   ├── Message Bubble
    │   │   ├── Timestamp
    │   │   └── Status Icon
    │   ├── Typing Indicator (when typing)
    │   └── Auto Scroll Reference
    ├── Emoji Picker (conditional)
    └── Input Area
        ├── File Button [📎]
        ├── Text Input
        ├── Emoji Button [😊]
        └── Send Button [→]
```

---

## Color Palette Details

### Primary Colors
| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Primary Action | Green-500 | #22c55e | Send button, active states |
| Online Status | Green-500 | #22c55e | Online indicator |
| Primary Text | Gray-800 | #1f2937 | Doctor/Patient names |
| Primary Background | White | #ffffff | Main background |

### Secondary Colors
| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Patient Message | Green-500 | #22c55e | Message bubble |
| Doctor Message | Gray-200 | #e5e7eb | Message bubble |
| Sidebar Background | White | #ffffff | List background |
| Page Background | Gray-50 | #f9fafb | Overall background |

### Text Colors
| Level | Color | Hex | Usage |
|-------|-------|-----|-------|
| Primary | Gray-800 | #1f2937 | Main text |
| Secondary | Gray-600 | #4b5563 | Subtext, descriptions |
| Tertiary | Gray-400 | #9ca3af | Timestamps, hints |
| Disabled | Gray-400 | #9ca3af | Disabled text |

### Interactive Colors
| State | Color | Hex | Usage |
|-------|-------|-----|-------|
| Hover | Gray-50 | #f9fafb | List item hover |
| Active | Green-50 | #f0fdf4 | Selected item |
| Focus | Green-400 | #4ade80 | Focus ring |
| Border | Gray-200 | #e5e7eb | Dividers |

---

## Spacing System

```
xs: 0.25rem (4px)   - Tiny gaps
sm: 0.5rem (8px)    - Small gaps
md: 1rem (16px)     - Medium gaps
lg: 1.5rem (24px)   - Large gaps
xl: 2rem (32px)     - Extra large gaps

Sidebar: w-80 (320px)
Message Max Width: max-w-md (448px)
Input Height: py-2 (8px vertically)
```

---

## Animation Speeds

| Animation | Duration | Effect |
|-----------|----------|--------|
| Fade In | 0.3s | New messages fade in |
| Transitions | 0.2s | Color changes, hovers |
| Pulse | Infinite | Online indicator |
| Bounce | Infinite | Typing dots |
| Scroll | Smooth | Auto-scroll to bottom |

---

## Interactive Elements Reference

### Buttons

#### Send Button
```
Normal State:
┌─────────┐
│   →     │  Green-500, clickable
└─────────┘

Disabled State:
┌─────────┐
│   →     │  Gray-200, not clickable
└─────────┘

Hover State:
┌─────────┐
│   →     │  Green-600, shadow-md
└─────────┘
```

#### Action Buttons (Header)
```
[📞]  [📹]  [ℹ️]

Each button:
- p-2 (8px padding)
- rounded-full
- hover:bg-gray-100
- text-gray-600 when inactive
- text-gray-800 when hover
```

### Input Fields

#### Message Input
```
┌──────────────────────────────────┐
│ Type your message...              │
└──────────────────────────────────┘

States:
- Normal: border-gray-300
- Focus: ring-2 ring-green-400
- Placeholder: text-gray-400
- Max Height: max-h-32 (multi-line)
```

#### Search Input
```
┌─────────────────────────────────┐
│ 🔍 Search doctors...            │
└─────────────────────────────────┘

Style: rounded-full, bg-gray-100
Focus: ring-2 ring-green-400
```

---

## Message Bubble Variants

### Patient Message (Right-aligned)
```
                    ┌──────────────┐
                    │ Your message │
                    │ 2:30pm  ✓    │
                    └──────────────┘
                    (Green-500 bg)
                    (White text)
                    (Rounded except br)
```

### Doctor Message (Left-aligned)
```
    👤
    ┌──────────────┐
    │ Doctor msg   │
    │ 2:31pm       │
    └──────────────┘
    (Gray-200 bg)
    (Gray-800 text)
    (Rounded except bl)
```

### Typing Indicator
```
    👤
    ┌─────────────┐
    │ ⚫ ⚫ ⚫      │
    │ (bouncing)  │
    └─────────────┘
    (Gray-200 bg)
```

---

## Loading States

### Initial Load
```
        ⟳
    (Spinning)
    
   8x8px, Green-500
   60px diameter
```

### Error State
```
┌─────────────────────────┐
│ ❌ Failed to load chats │
│                         │
│ [Retry]                 │
└─────────────────────────┘

Centered, text-center
bg-white with border-radius
```

### Empty State
```
         🔍
    
   No doctors found
   
   (search text)
```

---

## Notification Elements

### Unread Badge
```
    ┌─────┐
    │  5  │  (Green-500, white text)
    └─────┘  (Bold, xs font size)
             (w-5 h-5, rounded-full)

For > 9: Shows "9+"
```

### Online Status Indicator
```
    ┌─────┐
    │ • • │  (Animated pulse)
    │ • 👤 │  (Green-500 dot)
    │     │  (Positioned bottom-right)
    └─────┘  (w-4 h-4, border-2 white)
```

---

## Responsive Breakpoints

### Mobile (< 640px)
- Sidebar: Fixed, full-width with overlay
- FAB menu button: Visible
- Messages: Full width - padding
- Font sizes: Reduced (text-sm, text-xs)
- Sidebar width: w-80 (fixed)

### Tablet (640px - 1024px)
- Sidebar: Visible if screen space
- FAB menu: Visible
- Messages: Adjusted width
- Standard padding

### Desktop (> 1024px)
- Sidebar: Always visible, relative positioned
- FAB menu: Hidden
- Messages: Full available width
- Full padding and spacing

---

## Hover & Active States

### Chat List Item
```
Normal:
┌─────────────────────┐
│ 👤 Doctor 1         │
│    Last message...  │
│    2:30 PM          │
└─────────────────────┘

Hover:
┌─────────────────────┐
│ 👤 Doctor 1         │  ← Light gray bg
│    Last message...  │
│    2:30 PM          │
└─────────────────────┘

Selected:
┌─────────────────────┐
│ 👤 Doctor 1         │  ← Green-50 bg
│    Last message...  │  ← Green text
│    2:30 PM          │  ← Left border-l-4
└─────────────────────┘
```

### Profile Image Ring
```
Normal:  ring-gray-200  (Light gray)
Hover:   ring-green-300 (Light green)
Selected: ring-green-400 (Bright green)
```

---

## Accessibility Features

| Feature | Implementation |
|---------|----------------|
| Focus Indicators | ring-2 ring-green-400 |
| ARIA Labels | title attributes on buttons |
| Semantic HTML | proper button, input, div elements |
| Keyboard Navigation | Tab key works, Enter to send |
| Color Contrast | WCAG AA compliant |
| Font Size | Minimum 14px for body text |
| Touch Targets | Minimum 44x44px for buttons |

---

## Performance Tips

✅ Messages use key prop with unique IDs  
✅ Memoized emoji picker  
✅ Scroll reference prevents layout shift  
✅ CSS class usage optimized  
✅ No inline styles (Tailwind only)  

---

**Design Framework**: Tailwind CSS v3+  
**Color Mode**: Light (no dark mode yet)  
**Typography**: System fonts with fallback  
**Icons**: React Icons library  
**Animation Library**: CSS only (no JS libraries)
