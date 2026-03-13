# Component Specification: Read Receipts

**Feature:** Chat Read Receipts  
**Owner:** UI Designer Agent  
**Date:** 2026-03-14  

---

## Design System Integration

This specification defines UI components for the read receipts feature following the existing ChatHub design system.

---

## Components

### 1. Message Status Indicator

**Location:** Bottom-right of outgoing messages

#### States

| State | Icon | Color | Description |
|-------|------|-------|-------------|
| Sending | Pulsing dot | `gray-400` | Message being sent |
| Sent | Single check | `gray-400` | Server received message |
| Delivered | Double check | `gray-400` | Recipient received message |
| Read | Double check | `blue-500` | Recipient viewed message |

#### Specifications

```
Size: 16x16px (w-4 h-4)
Stroke Width: 2.5px
Position: 4px right of timestamp
Animation: Sending state has 1s pulse
```

#### Accessibility

- Icon has `aria-label` with status text
- Title tooltip shows status on hover
- Not color-only: shape changes between states
- High contrast mode uses outline vs filled

---

### 2. Group Read Count Badge

**Location:** Below message bubble in group chats

#### Layout

```
┌───────────────────────────────┐
│  Message content here...      │
│                        ✓✓ 2:30│
└───────────────────────────────┘
  Read by 3 of 5
```

#### Specifications

```
Font: text-xs (12px)
Color: gray-500, hover: gray-700
Spacing: 4px below message
Interactive: Clickable to show list
Underline: On hover
```

---

### 3. Read Receipts Modal

**Purpose:** Show list of users who read a message

#### Layout

```
┌────────────────────────────────┐
│  Read by                    ✕  │
├────────────────────────────────┤
│  ┌──┐                          │
│  │AV│  John Doe                │
│  └──┘  2 minutes ago           │
│                                │
│  ┌──┐                          │
│  │AV│  Jane Smith              │
│  └──┘  5 minutes ago           │
│                                │
│  ┌──┐                          │
│  │AV│  Bob Wilson              │
│  └──┘  10 minutes ago          │
└────────────────────────────────┘
```

#### Specifications

```
Width: max-w-md (448px)
Max Height: 80vh
Header: px-6 py-4, border-bottom
Content: px-6 py-4, scrollable
Avatar: 40x40px rounded-full
Name: font-medium text-gray-900
Time: text-sm text-gray-500 with clock icon
Row Gap: 12px (space-y-3)
```

---

### 4. Privacy Toggle

**Location:** Settings > Privacy

#### Layout

```
┌───────────────────────────────────────┐
│  👁  Read Receipts           [════○]  │
│      Others can see when you've       │
│      read their messages              │
│                                       │
│      Note: When disabled, you also    │
│      won't see others' read receipts  │
└───────────────────────────────────────┘
```

#### Specifications

```
Toggle Size: w-11 h-6
Knob Size: w-4 h-4
On Color: blue-500
Off Color: gray-300
Transition: transform 150ms
Label: font-medium text-gray-900
Description: text-sm text-gray-500
Note: text-xs text-gray-400
```

---

## Design Tokens

### Colors

```css
/* Status colors */
--receipt-pending: theme(colors.gray.400);
--receipt-sent: theme(colors.gray.400);
--receipt-delivered: theme(colors.gray.400);
--receipt-read: theme(colors.blue.500);

/* Toggle colors */
--toggle-on: theme(colors.blue.500);
--toggle-off: theme(colors.gray.300);
--toggle-knob: theme(colors.white);
```

### Spacing

```css
/* Component spacing */
--status-icon-gap: 4px;
--read-count-margin-top: 4px;
--modal-padding: 24px;
--list-item-gap: 12px;
```

### Animations

```css
/* Sending pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.sending-indicator {
  animation: pulse 1s ease-in-out infinite;
}

/* Toggle transition */
.toggle-knob {
  transition: transform 150ms ease-in-out;
}
```

---

## Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Mobile (<640px) | Modal is full-width with 16px margin |
| Tablet (640-1024px) | Modal centered, max-w-md |
| Desktop (>1024px) | Modal centered, max-w-md |

---

## Dark Mode

```css
/* Dark mode overrides */
.dark {
  --receipt-pending: theme(colors.gray.500);
  --receipt-sent: theme(colors.gray.500);
  --receipt-delivered: theme(colors.gray.500);
  --receipt-read: theme(colors.blue.400);
  
  --modal-bg: theme(colors.gray.800);
  --modal-border: theme(colors.gray.700);
  --text-primary: theme(colors.gray.100);
  --text-secondary: theme(colors.gray.400);
}
```

---

## Interaction States

### Status Indicator

| State | Behavior |
|-------|----------|
| Default | Show current status |
| Hover | Show tooltip with status text |
| Focus | 2px blue ring (keyboard nav) |

### Read Count Badge

| State | Behavior |
|-------|----------|
| Default | Gray text |
| Hover | Darker text, underline |
| Click | Open receipts modal |
| Focus | 2px blue ring |

### Privacy Toggle

| State | Behavior |
|-------|----------|
| Default | Show current state |
| Hover | Subtle background change |
| Click | Toggle with animation |
| Loading | 50% opacity, no pointer |
| Focus | 2px blue ring offset |
