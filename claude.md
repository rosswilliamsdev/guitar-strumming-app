# Guitar Strumming Pattern Generator - Development Guidelines

## Project Overview

This is a React/TypeScript web application for guitarists to practice strumming patterns with visual guidance. The app features pattern presets, tempo control, visual metronome, pattern editor, and local storage for custom patterns. It's designed to be responsive and work on both desktop and mobile devices.

## Core Principles

### 1. Musical Accuracy

- All strumming patterns must follow proper musical notation principles
- Use correct subdivision terminology: quarter notes, eighth notes, sixteenth notes
- Respect time signatures (4/4, 3/4, etc.) with accurate beat counts
- Beat labeling should use standard musical notation:
  - Quarter notes: 1, 2, 3, 4
  - Eighth notes: 1, &, 2, &, 3, &, 4, &
  - Sixteenth notes: 1, e, &, a, 2, e, &, a, etc.

### 2. Strumming Pattern Types

- **down**: Downward strum (↓)
- **up**: Upward strum (↑)
- **muted**: Muted strum with palm or finger muting (X)
- **rest**: Silent beat/pause (-)

### 3. Alternating Motion Principle

**CRITICAL**: Strumming is always an alternating motion. The hand moves in a continuous down-up pattern, and strums occur on specific beats within this motion:

#### Eighth Note Patterns (1 & 2 & 3 & 4 &):

- **Downstrokes**: Always on beats 1, 2, 3, 4 (the numbered beats)
- **Upstrokes**: Always on & subdivisions (the "and" counts)
- Example: D-U-D-U-D-U-D-U where D=1,2,3,4 and U=&,&,&,&

#### Sixteenth Note Patterns (1 e & a 2 e & a 3 e & a 4 e & a):

- **Downstrokes**: Always on beats 1, 2, 3, 4 AND & subdivisions
- **Upstrokes**: Always on "e" and "a" subdivisions
- Example: D-U-D-U-D-U-D-U... where:
  - D = 1, &, 2, &, 3, &, 4, &
  - U = e, a, e, a, e, a, e, a

#### Quarter Note Patterns (1 2 3 4):

- **Downstrokes**: Typically on all beats 1, 2, 3, 4
- Hand continues alternating motion even if not all strums are played

**Important**: Patterns that violate this alternating motion (like consecutive downs or ups in the wrong positions) are not musically accurate and should be avoided.

### 4. Data Structure Requirements

All `StrummingPattern` objects must include:

```typescript
interface StrummingPattern {
  id: string;
  name: string;
  description: string;
  pattern: ("down" | "up" | "muted" | "rest")[];
  subdivision: "quarter" | "eighth" | "sixteenth";
  beatsPerMeasure: number; // Usually 4, sometimes 3
  genre?: string;
}
```

## Code Architecture Guidelines

### 1. Component Organization

- Keep components focused and single-responsibility
- Main components should be in `/components/` directory
- Use shadcn/ui components from `/components/ui/` - never recreate them
- Custom components should export both the component and any related types

### 2. State Management

- Use React hooks for local state management
- Persist custom patterns to localStorage
- Separate concerns: pattern data, playback state, UI state
- Reset playback state when changing patterns

### 3. Timing and Audio

- Calculate intervals based on BPM and subdivision type
- Use `setInterval` for metronome timing
- Clean up intervals properly in useEffect cleanup
- Handle play/pause/reset states consistently

### 4. Performance Considerations

- Use `useRef` for interval management to avoid memory leaks
- Implement proper cleanup in useEffect dependencies
- Avoid unnecessary re-renders during playback

## Styling and Design Guidelines

### 1. Typography

- **Never use Tailwind font size, weight, or line-height classes** unless explicitly requested
- The project uses a custom typography system in `styles/globals.css`
- Default typography is applied automatically to h1-h4, p, label, button, input elements

### 2. Color Scheme

- Use semantic color tokens from the design system (primary, secondary, muted, etc.)
- Support both light and dark themes automatically
- Use accent colors for interactive elements and highlights

### 3. Layout Principles

- Responsive design: mobile-first approach
- Use CSS Grid and Flexbox for layouts
- Maintain consistent spacing using Tailwind spacing tokens
- Cards and panels should use consistent border radius and shadows

### 4. Visual Hierarchy

- Clear distinction between active/inactive pattern beats
- Visual feedback for current beat position during playback
- Consistent iconography using Lucide React icons
- Proper contrast ratios for accessibility

## User Experience Guidelines

### 1. Pattern Display

- Visual strumming patterns should be easy to read and follow
- Current beat should be clearly highlighted during playback
- Beat labels should be clearly visible below pattern symbols
- Pattern should wrap appropriately on smaller screens

### 2. Controls and Interaction

- Play/pause/reset controls should be intuitive and responsive
- Tempo control should provide immediate feedback
- Pattern selection should stop current playback
- Form validation should provide clear error messages

### 3. Pattern Library Organization

- Group patterns by genre for easy discovery
- Show pattern metadata (subdivision type, time signature)
- Preview patterns before selection
- Clear distinction between preset and custom patterns

### 4. Pattern Editor

- Intuitive interface for creating custom patterns
- Real-time preview of patterns being created
- Validation to ensure patterns follow musical rules
- Clear feedback when patterns are saved

## Technical Requirements

### 1. Dependencies

- React 18+ with TypeScript
- Tailwind CSS v4 (custom CSS variables system)
- shadcn/ui components (never recreate these)
- Lucide React for icons
- Sonner for toast notifications
- Local storage for persistence

### 2. Browser Compatibility

- Modern browsers with ES6+ support
- Responsive design for mobile devices
- Touch-friendly interface elements
- Accessible keyboard navigation

### 3. Data Persistence

- Save custom patterns to localStorage
- Preserve user preferences (tempo, last selected pattern)
- Handle localStorage errors gracefully
- Merge default patterns with custom patterns on load

## Common Patterns and Anti-Patterns

### ✅ Do This

- Use the existing `StrummingPattern` interface consistently
- Calculate timing intervals based on musical subdivisions
- Provide visual feedback during playback
- Clean up intervals and event listeners
- Use semantic HTML and proper ARIA labels
- Test patterns with different time signatures

### ❌ Avoid This

- Don't hardcode BPM intervals without considering subdivisions
- Don't create patterns that don't match their stated time signature
- Don't use font sizing classes (text-lg, text-xl, etc.) unless requested
- Don't recreate shadcn/ui components
- Don't ignore accessibility considerations
- Don't create patterns with incorrect beat counts for the time signature

## Genre-Specific Considerations

### Beginner Patterns

- Simple, predictable patterns
- Focus on basic down and up strums
- Clear, slow tempos recommended

### Folk Patterns

- Traditional folk rhythms
- Often in 3/4 or 4/4 time
- Mix of down and up strums

### Rock/Pop Patterns

- More complex rhythms
- Include muted strums for percussive effects
- Emphasize groove and feel

### Reggae Patterns

- Heavy emphasis on upstrokes
- Syncopated rhythms
- Often include rests on strong beats

## Error Handling and Edge Cases

- Handle empty or invalid patterns gracefully
- Validate BPM ranges (60-200 BPM)
- Check for valid subdivision types
- Ensure pattern arrays match expected beat counts
- Provide fallbacks for localStorage failures
- Handle rapid play/pause state changes

## Accessibility Requirements

- Keyboard navigation for all controls
- Screen reader compatible labels
- High contrast mode support
- Focus indicators on interactive elements
- Alternative text for visual pattern symbols
- Consider users with motor difficulties for timing-sensitive features
