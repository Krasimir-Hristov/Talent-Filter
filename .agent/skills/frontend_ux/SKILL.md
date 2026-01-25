---
name: Premium UI/UX & Animations
description: Guidelines for creating a sophisticated, professional, and highly interactive user experience for TalentFilter using Framer Motion and Shadcn/UI.
---

# Premium UI/UX & Animations Skill

This skill ensures that TalentFilter looks and feels like a top-tier SaaS product.

## 1. Visual Language

- **Color Palette**: Use a sophisticated, "Enterprise-Glass" aesthetic. Combine deep neutrals (slate/zinc) with vibrant accent colors (indigo/violet).
- **Typography**: Prefer modern sans-serif fonts like **Inter** or **Outfit**. Use clear font weights to establish hierarchy.
- **Shadcn/UI Customization**: Don't use defaults blindly. Customize shadows, border-radii (prefer `rounded-xl`), and spacing to create a unique look.

## 2. Interactive Animations (Framer Motion)

- **Interview Transitions**: Use `AnimatePresence` for smooth layout transitions between questions. Avoid jarring jumps.
- **Micro-interactions**:
  - Subtle scale-ups on button hover.
  - Progress bars that "fill" with a smooth spring physics curve.
  - Success checkmarks that "pop" when a question is submitted.
- **Initial Load**: Implement staggered "entrance" animations for dashboard cards and list items.

## 3. Candidate Experience (Interview Room)

- **Focus Mode**: Ensure the interview interface is clean and distraction-free. Maximize the space for text inputs.
- **Real-time Feedback**:
  - Visual indicators for timers (e.g., a shrinking progress ring).
  - Toast notifications for anti-cheating warnings (tab switches) that aren't overly aggressive but are clearly visible.

## 4. Responsive & Accessible Design

- **Mobile First**: The candidate room must be 100% usable on mobile devices, as many job seekers use phones.
- **Aria Labels**: All interactive elements must have proper ARIA attributes for screen readers.
- **Loading States**: Every async action (like "Generating Questions") must have a high-quality skeleton or a branded loading animation.

## 5. Implementation Standard

- **Utility First**: Use Tailwind CSS for the majority of styling.
- **CSS Variables**: Define brand colors in `globals.css` using CSS variables to allow for easy theme switching (Light/Dark mode) in the future.
