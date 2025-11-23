# 🎨 Zoomer/Modern Design Refresh Plan

## 1. Philosophy
- **Vibe:** Friendly, approachable, energetic but not chaotic. "Matte" finish over "Glossy".
- **Shapes:** Large border radiuses (Rounded XL/2XL). Bubbly but professional.
- **Depth:** Soft, colored shadows (glows) instead of hard black shadows.
- **Spacing:** Airy, generous whitespace (Comfortable).

## 2. Color Palette (Matte & Bright)

We will move away from the standard "Slate" grays to "Zinc" or "Mauve" tinted neutrals, and use vibrant matte colors for actions.

### Base Colors
- **Background:** `#FAFAFA` (zinc-50) - Warm, clean canvas.
- **Foreground:** `#18181B` (zinc-950) - Soft black text.
- **Card:** `#FFFFFF` (white) - Crisp white for content.

### Brand Colors (The "Zoomer" Pop)
- **Primary:** `Violet-500` (#8B5CF6) -> `Violet-600` (#7C3AED)
    - *Why:* Creative, modern, gender-neutral, distinct from corporate "Blue".
- **Secondary:** `Fuchsia-100` (#FAE8FF) with `Fuchsia-600` text.
    - *Why:* Playful accent for active states.

### Functional Colors (Matte)
- **Success:** `Emerald-400` (#34D399) - Minty green.
- **Warning:** `Amber-400` (#FBBF24) - Mac 'n' Cheese yellow.
- **Error:** `Rose-400` (#FB7185) - Soft red/pink.
- **Info:** `Sky-400` (#38BDF8) - Clear sky blue.

## 3. UI Components Update

### Cards (`VacancyCard`)
- **Border:** Removed or very subtle (zinc-100).
- **Shadow:** `shadow-lg` but with a tint of the primary color (`shadow-violet-100`).
- **Hover:** Lift up (`-translate-y-1`) + intensified shadow.
- **Badges:** Pill-shaped (`rounded-full`), pastel backgrounds with dark text (e.g., `bg-emerald-100 text-emerald-700`).

### Dialogs (`CreateVacancyDialog`)
- **Backdrop:** Blur (`backdrop-blur-sm`) with a light violet tint.
- **Animation:** Spring-based open/close (using Framer Motion).
- **Stepper:** Colorful progress bar (Violet gradient).

### Typography
- **Headings:** Bold, tight tracking (`tracking-tight`).
- **Body:** Relaxed line-height for readability.

## 4. Implementation Steps
1.  **`src/index.css`**: Update `:root` variables with new HSL values for the palette.
2.  **`tailwind.config.js`**: Ensure `borderRadius` and `colors` map correctly.
3.  **`VacancyList.tsx`**: Update card structure, remove "slate" specific classes, apply new "group" hover effects.
4.  **`CreateVacancyDialog.tsx`**: Update the stepper visual, make inputs larger (`h-12`), rounded-xl.
