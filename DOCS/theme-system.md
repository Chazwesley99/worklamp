# Worklamp Theme System

## Overview

The Worklamp theme system implements a comprehensive design philosophy focused on:

- **Minimal spacing** for space efficiency (Requirement 18.4)
- **Mobile-responsive** layouts optimized for touch interaction (Requirement 18.5)
- **Minimal clicks** to complete tasks (Requirement 18.6)
- **Dark mode by default** with light mode support (Requirements 18.1, 18.2, 18.3)

## Theme Variables

### CSS Custom Properties

All theme colors are defined using HSL color space for easy manipulation:

```css
/* Light Mode */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 222.2 47.4% 11.2%;
--secondary: 210 40% 96.1%;
--muted: 210 40% 96.1%;
--accent: 210 40% 96.1%;
--destructive: 0 84.2% 60.2%;
--border: 214.3 31.8% 91.4%;
--input: 214.3 31.8% 91.4%;
--ring: 222.2 84% 4.9%;

/* Dark Mode */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--primary: 210 40% 98%;
--secondary: 217.2 32.6% 17.5%;
--muted: 217.2 32.6% 17.5%;
--accent: 217.2 32.6% 17.5%;
--destructive: 0 62.8% 30.6%;
--border: 217.2 32.6% 17.5%;
--input: 217.2 32.6% 17.5%;
--ring: 212.7 26.8% 83.9%;
```

## Spacing System

### Minimal Spacing Scale

The theme uses a minimal spacing scale for space efficiency:

- `tight`: 0.25rem (4px) - Minimal spacing
- `compact`: 0.5rem (8px) - Compact spacing (default)
- `cozy`: 0.75rem (12px) - Comfortable spacing

### Usage

```tsx
// Using spacing utilities
<div className="p-compact gap-compact">
  <div className="space-y-tight">
    {/* Content with minimal vertical spacing */}
  </div>
</div>

// Using spacing components
<ResponsiveContainer spacing="compact">
  {/* Content */}
</ResponsiveContainer>
```

## Responsive Design

### Breakpoints

- `xs`: 475px - Extra small devices
- `sm`: 640px - Small devices
- `md`: 768px - Medium devices (tablets)
- `lg`: 1024px - Large devices (desktops)
- `xl`: 1280px - Extra large devices
- `2xl`: 1536px - 2X large devices

### Touch-Optimized Design

The theme includes special handling for touch devices:

```css
/* Touch-friendly minimum sizes */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Automatic touch optimization */
@media (hover: none) and (pointer: coarse) {
  button,
  a,
  [role='button'] {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### Mobile-First Approach

All components are designed mobile-first with progressive enhancement:

```tsx
// Responsive padding
<div className="p-compact md:p-6">
  {/* Compact on mobile, larger on desktop */}
</div>

// Responsive text
<h1 className="text-lg md:text-xl">
  {/* Smaller on mobile, larger on desktop */}
</h1>
```

## Component Guidelines

### Buttons

Buttons automatically scale for touch devices and include active states:

```tsx
<Button size="default">
  {/* Automatically min-h-touch on touch devices */}
  Click Me
</Button>
```

### Forms

Form inputs use minimal spacing and are touch-optimized:

```tsx
<Input label="Email" />;
{
  /* Label has mb-tight, input has touch:min-h-touch */
}
```

### Cards

Cards use minimal padding by default:

```tsx
<Card padding="compact">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
</Card>
```

### Modals

Modals are responsive with minimal padding on mobile:

```tsx
<Modal title="Edit Task">{/* p-4 on mobile, p-6 on desktop */}</Modal>
```

## Theme Persistence

The theme system persists user preferences across sessions:

1. **Default**: Dark mode (Requirement 18.1)
2. **Toggle**: Users can switch between light/dark (Requirement 18.2)
3. **Persistence**: Choice saved to localStorage (Requirement 18.3)

### Implementation

```tsx
// ThemeToggle component handles persistence
<ThemeToggle />

// Theme initialized before render to prevent FOUC
<ThemeInitializer />
```

## Utility Classes

### Space Efficiency

```css
.space-efficient {
  padding: 0.5rem;
  gap: 0.5rem;
}

.space-minimal {
  padding: 0.25rem;
  gap: 0.25rem;
}
```

### Quick Actions

For minimal-click interactions:

```css
.quick-action {
  cursor: pointer;
  transition: colors 150ms;
  &:hover {
    background: accent;
  }
  &:active {
    scale: 0.95;
  }
}
```

## Best Practices

### 1. Use Theme Variables

Always use theme variables instead of hardcoded colors:

```tsx
// ✅ Good
<div className="bg-background text-foreground">

// ❌ Bad
<div className="bg-white text-black dark:bg-gray-900 dark:text-white">
```

### 2. Minimal Spacing

Default to compact spacing, only increase when necessary:

```tsx
// ✅ Good - Compact by default
<div className="p-compact gap-compact">

// ❌ Bad - Excessive spacing
<div className="p-8 gap-8">
```

### 3. Touch-Friendly Targets

Ensure interactive elements are touch-friendly:

```tsx
// ✅ Good - Touch-optimized
<button className="min-h-touch min-w-touch">

// ❌ Bad - Too small for touch
<button className="h-6 w-6">
```

### 4. Mobile-First

Design for mobile first, enhance for desktop:

```tsx
// ✅ Good - Mobile-first
<div className="text-sm md:text-base p-compact md:p-6">

// ❌ Bad - Desktop-first
<div className="text-base sm:text-sm p-6 sm:p-compact">
```

### 5. Minimal Clicks

Reduce the number of interactions needed:

```tsx
// ✅ Good - Direct action
<Card interactive onClick={handleEdit}>
  {/* Click anywhere on card to edit */}
</Card>

// ❌ Bad - Requires precise click
<Card>
  <button onClick={handleEdit}>Edit</button>
</Card>
```

## Testing Theme

### Visual Testing

1. Test both light and dark modes
2. Verify spacing is consistent and minimal
3. Check touch targets on mobile devices
4. Ensure responsive breakpoints work correctly

### Accessibility

1. Verify color contrast ratios (WCAG AA minimum)
2. Test keyboard navigation
3. Verify focus indicators are visible
4. Test with screen readers

## Migration Guide

To update existing components to use the new theme system:

1. Replace hardcoded colors with theme variables
2. Update spacing to use minimal scale (tight/compact/cozy)
3. Add touch-friendly sizing for interactive elements
4. Ensure mobile-responsive layouts
5. Test in both light and dark modes
