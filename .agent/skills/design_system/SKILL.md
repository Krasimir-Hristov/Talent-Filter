---
name: TalentFilter Design System & Tokens
description: Specifications for the static design language, atomic tokens, and visual consistency targets for TalentFilter.
---

# TalentFilter Design System & Tokens

This skill defines the visual "soul" of the TalentFilter platform. It ensures that every component across the Monorepo feels like part of a cohesive, high-end "Enterprise SaaS" brand.

## 1. Atomic Design Tokens

### Color Palette (The "Midnight & Indigo" Theme)

- **Primary (Indigo/Violet)**:
  - `brand-accent`: #6366f1 (Indigo 500)
  - `brand-glow`: #a855f7 (Purple 500)
- **Neutral (Slate/Zinc)**:
  - `bg-main`: #0f172a (Slate 950)
  - `bg-card`: #1e293b (Slate 900)
  - `text-main`: #f8fafc (Slate 50)
  - `text-muted`: #94a3b8 (Slate 400)
- **Glassmorphism**:
  - `glass-bg`: `rgba(30, 41, 59, 0.7)`
  - `glass-border`: `rgba(255, 255, 255, 0.1)`

### Typography (Modern & Clean)

- **Headings**: **Outfit** or **Plus Jakarta Sans**. Let's use **Plus Jakarta Sans** for a professional feel.
  - Weight: SemiBold (600) for hierarchy.
- **Body**: **Inter**.
  - Secondary choice for maximum readability at small sizes.

### Spacing & Borders

- **Border Radius**: `rounded-xl` (12px) for cards and inputs to feel modern and "soft."
- **Border Depth**: Use subtle single-pixel borders with low opacity for separation, avoiding heavy dividers.

## 2. Layout Frameworks

### Recruiter Dashboard (The "Command Center")

- **Sidebar**: Narrow, icon-focused with text on hover/expand.
- **Main Area**: Clean grid cards showing high-level stats (Candidates Screend, Jobs Open, Average Score).
- **Empty States**: Custom illustrated or AI-generated visual to avoid "stark" empty lists.

### Job Builder (The "Creation Flow")

- **Multi-step Process**: Progress indicator at the top.
- **Form Design**: Large text areas for job descriptions. Floating labels or subtle input focus glows using `brand-accent`.

### Candidate Room (The "Deep Focus")

- **Layout**: Center-aligned, maximum 800px width.
- **Distraction-Free**: Minimal headers/footers. Focus solely on the current question.
- **Visual Cues**: A prominent but non-stressful timer (radial progress bar).

## 3. Component Overrides (Shadcn/UI Skinning)

- **Buttons**:
  - Gradient backgrounds for primary actions (Indigo -> Purple).
  - Subtle drop-shadow for depth.
- **Inputs**:
  - Dark background with a slight glow on focus.
  - Consistent padding of at least `p-3` for inputs.
- **Cards**:
  - Hover effect: Scale 101% with a slightly increased shadow.

## 4. Visual Assets

- **Icons**: Always use `lucide-react` with a stroke width of `1.5` for a refined look.
- **Images**: Use the `generate_image` tool for brand assets like "Welcome Backgrounds" or "Success Illustrations."

## 5. Design Principles

- **Hierarchy**: Use color (Indigo/White vs Slate-400) to guide the user's eye. The most important action (e.g., "Submit Answer" or "Create Job") must be clearly colored.
- **Contrast**: Maintain AA/AAA accessibility standards despite the dark-mode focus.
- **Negative Space**: Embrace whitespace. Don't crowd the interface.
