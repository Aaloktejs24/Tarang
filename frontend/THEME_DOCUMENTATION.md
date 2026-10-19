# Tarang Frontend Theme & Architecture Documentation

This document provides an extremely detailed breakdown of the visual theme, design system, and styling architecture used throughout the Tarang frontend application. It serves as a central reference for maintaining UI consistency.

## 1. Core Visual Language (Glassmorphism & Depth)
The application heavily relies on a **Glassmorphism** design language. Instead of solid, flat backgrounds, the UI utilizes translucent layers over dynamic or blurred background images (`GlobalBackground.jsx`, `BackdropBlur.jsx`). 
- **Backdrop Blur:** A standard `blur(30px)` is applied to major UI containers to create a frosted glass effect.
- **Translucency:** Backgrounds are typically set to `rgba(255, 255, 255, 0.3)` or `rgba(255, 255, 255, 0.8)` depending on the required contrast.

## 2. Typography
Typography is primarily managed through `src/styles/globals.css` and dynamically customized via `AccessibilityContext.jsx`.
- **Primary Fonts:** 
  - `Rozha One` (Serif): Used for grand, elegant headings and the base HTML body.
  - `Poppins` (Sans-serif): Used for modern, clean UI elements, buttons, and inputs.
- **Dynamic Font Loading:** `AccessibilityContext.jsx` injects a `<link>` tag into the document head to load fonts dynamically from Google Fonts based on user preferences.
- **Button Typography:** `text-transform: none` is strictly enforced globally to maintain conversational and accessible button labels. Font weight is typically `700` (Bold) with a size of `16px`.
- **Placeholders:** Placeholder text is specifically styled (`#94a3b8`, `500` weight) to ensure readability without overpowering user input.

## 3. Color Palette
While the application uses a dynamic theme context, a consistent set of core colors dictates the UI:
- **Primary Brand (Blue):** `#0056b3` 
  - Used for primary buttons, active/focused input borders, primary icons, and highlighted text.
  - Hover states often darken to `#004494` or `#004b9c`.
- **Text (Slate/Gray):**
  - **Primary Headings:** `#0f172a` (Slate 900) - Very dark, high contrast.
  - **Subtitles/Body:** `#475569` (Slate 600) - Softer for readability.
  - **Muted/Borders:** `#cbd5e1` (Slate 300) and `#94a3b8` (Slate 400).
- **Accents:** 
  - **Warning/Yellow:** `#ffc107` (Amber) or `#f59e0b`.
  - **Success/Green:** `#10b981` (Emerald).
  - **Error/Red:** `#ef4444` (Red 500).

## 4. Material-UI Component Overrides
The `AccessibilityContext.jsx` and other isolated theme providers (like in `admin/page.jsx`) override default Material-UI components to enforce the Glassmorphic theme globally.

### `MuiCard`
- **Border Radius:** `12px`
- **Background:** `rgba(255, 255, 255, 0.3)`
- **Backdrop Filter:** `blur(30px)`
- **Border:** `1px solid rgba(30, 79, 163, 0.2)` (Faint blue tint to structure the glass)
- **Box Shadow:** `none` (Relies on borders and blur for depth, not shadows)

### `MuiOutlinedInput` (Text Fields & Selects)
- **Border Radius:** `8px`
- **Background:** `rgba(255, 255, 255, 0.3)`
- **Hover State:** Border color shifts to `#94a3b8`.
- **Focus State:** 
  - Border color becomes the primary `#0056b3`.
  - Border width increases to `1.5px`.
  - Background becomes slightly more opaque (`rgba(255, 255, 255, 0.4)`).
- **Disabled State:** Uses a light slate tint `rgba(241, 245, 249, 0.5)`.
- **Input Padding:** Overridden to `12px 14px` for a spacious feel.

### `MuiButton`
- **Border Radius:** `8px`
- **Elevation:** Flat (`disableElevation` is widely used). Buttons rely on solid primary colors rather than drop shadows.

### `MuiDialog` & `MuiPickersPopper`
- **Border Radius:** `12px`
- **Shadows:** Removed (`boxShadow: none`) to keep the floating UI flat and modern.

## 5. Global CSS Hacks & Resets (`globals.css`)
- **Scrollbars Hidden:** The application globally hides scrollbars (`::-webkit-scrollbar { display: none !important; }` and `scrollbar-width: none`) to achieve a seamless, app-like visual experience while retaining scrolling functionality.
- **Form Autofill Fixes:** Webkit autofill backgrounds are overridden with `transition: background-color 5000s ease-in-out 0s;` to prevent browsers from turning inputs ugly yellow/blue upon auto-completion.
- **CSS Reset:** A standard `box-sizing: border-box` and margin/padding reset is applied to all pseudo-elements and tags.

## 6. Layout & Composition
- **Navigation Progress:** Custom `nprogress` styling uses `#0056b3` for the loading bar fixed at the top (`NavigationProgress.jsx`).
- **Empty States:** The app uses custom SVG illustrations (e.g., `EmptyState.jsx`) featuring floating animations (`@keyframes float` and `floatSlow`) and a cohesive color palette matching the brand (Blues, Ambers, Emeralds).
- **Hero Sections:** Components like `UniversalHero.jsx` use large imagery, linear gradients, and `Avatar` components positioned specifically to bridge the hero image and the content below it.

---
**Summary:** The Tarang theme is a modern, airy, glassmorphism-inspired design system. It prioritizes soft translucent layers over solid colors, completely removes harsh shadows in favor of subtle borders, and utilizes a very strict blue-and-slate color hierarchy.

## 7. Comprehensive Hex Color Inventory

The following is an exhaustive list of every single hexadecimal color code found across the entire frontend project (including components, styles, SVGs, and imported elements), sorted by frequency of use.

```text
#0056b3 (used 600 times)
#0f172a (used 261 times)
#ffffff (used 243 times)
#28a745 (used 223 times)
#64748b (used 186 times)
#fff (used 186 times)
#94a3b8 (used 138 times)
#e2e8f0 (used 109 times)
#cbd5e1 (used 77 times)
#334155 (used 74 times)
#ef4444 (used 68 times)
#475569 (used 65 times)
#ffc107 (used 51 times)
#eeeeee (used 46 times)
#004494 (used 45 times)
#1e293b (used 44 times)
#f8fafc (used 43 times)
#6c757d (used 42 times)
#218838 (used 41 times)
#f1f5f9 (used 39 times)
#007bff (used 35 times)
#dc3545 (used 32 times)
#212529 (used 32 times)
#1e4fa3 (used 29 times)
#374151 (used 28 times)
#dee2e6 (used 28 times)
#d32f2f (used 27 times)
#111827 (used 22 times)
#17a2b8 (used 21 times)
#343a40 (used 20 times)
#f8f9fa (used 20 times)
#000 (used 16 times)
#e9ecef (used 15 times)
#495057 (used 14 times)
#f6f6f6 (used 14 times)
#666 (used 12 times)
#10b981 (used 11 times)
#f3f4f6 (used 11 times)
#e0e0e0 (used 11 times)
#aaa (used 11 times)
#f39c12 (used 10 times)
#9ca3af (used 10 times)
#f4f4f5 (used 10 times)
#004085 (used 9 times)
#eef2f6 (used 8 times)
#e74c3c (used 8 times)
#16a34a (used 7 times)
#004aad (used 7 times)
#fad6ca (used 7 times)
#adb5bd (used 7 times)
#999 (used 7 times)
#666666 (used 7 times)
#888 (used 6 times)
#1e7e34 (used 6 times)
#d1d5db (used 6 times)
#5897fb (used 6 times)
#ffd700 (used 5 times)
#3b82f6 (used 5 times)
#004b9c (used 5 times)
#1a73e8 (used 5 times)
#6b7280 (used 5 times)
#5dde85 (used 5 times)
#0062cc (used 5 times)
#545b62 (used 5 times)
#117a8b (used 5 times)
#d39e00 (used 5 times)
#bd2130 (used 5 times)
#dae0e5 (used 5 times)
#1d2124 (used 5 times)
#b3d7ff (used 5 times)
#383d41 (used 5 times)
#155724 (used 5 times)
#0c5460 (used 5 times)
#856404 (used 5 times)
#721c24 (used 5 times)
#818182 (used 5 times)
#1b1e21 (used 5 times)
#020617 (used 5 times)
#b7b7b7 (used 5 times)
#000000 (used 4 times)
#eff6ff (used 4 times)
#8e44ad (used 4 times)
#e5e7eb (used 4 times)
#f9fafb (used 4 times)
#f8faff (used 4 times)
#f0f0f0 (used 4 times)
#f0f5fa (used 4 times)
#ccc (used 4 times)
#9fcdff (used 4 times)
#c8cbcf (used 4 times)
#b1dfbb (used 4 times)
#abdde5 (used 4 times)
#ffe8a1 (used 4 times)
#f1b0b7 (used 4 times)
#ececf6 (used 4 times)
#b9bbbe (used 4 times)
#ced4da (used 4 times)
#80bdff (used 4 times)
#ffeeeeee (used 4 times)
#c1c1c1 (used 4 times)
#161427 (used 4 times)
#6610f2 (used 3 times)
#dc2626 (used 3 times)
#e0a800 (used 3 times)
#059669 (used 3 times)
#4ade80 (used 3 times)
#001b3a (used 3 times)
#c82333 (used 3 times)
#ff6347 (used 3 times)
#dcfce7 (used 3 times)
#333 (used 3 times)
#b8daff (used 3 times)
#d6d8db (used 3 times)
#c3e6cb (used 3 times)
#bee5eb (used 3 times)
#ffeeba (used 3 times)
#f5c6cb (used 3 times)
#fdfdfe (used 3 times)
#c6c8ca (used 3 times)
#f7f7f7 (used 3 times)
#444 (used 3 times)
#eee (used 3 times)
#ffffffff (used 3 times)
#cccccc (used 3 times)
#ecfdf5 (used 2 times)
#047857 (used 2 times)
#e0e7ff (used 2 times)
#b45309 (used 2 times)
#153a7a (used 2 times)
#4caf50 (used 2 times)
#f0f9ff (used 2 times)
#ff8c00 (used 2 times)
#eaf0f7 (used 2 times)
#bbf7d0 (used 2 times)
#f39c1220 (used 2 times)
#f0f6ff (used 2 times)
#e6f0fa (used 2 times)
#555 (used 2 times)
#f59e0b (used 2 times)
#1f2937 (used 2 times)
#e83e8c (used 2 times)
#454d55 (used 2 times)
#34ce57 (used 2 times)
#e4606d (used 2 times)
#0069d9 (used 2 times)
#5a6268 (used 2 times)
#138496 (used 2 times)
#e2e6ea (used 2 times)
#23272b (used 2 times)
#e4e4e4 (used 2 times)
#ddd (used 2 times)
#3f3f3f (used 2 times)
#007aff (used 2 times)
#213356 (used 2 times)
#592036 (used 2 times)
#cdcdcd (used 2 times)
#db2777 (used 1 times)
#d97706 (used 1 times)
#064e3b (used 1 times)
#153b7a (used 1 times)
#07038d (used 1 times)
#ff6820 (used 1 times)
#046a38 (used 1 times)
#ff0000 (used 1 times)
#2563eb (used 1 times)
#9333ea (used 1 times)
#ffffff30 (used 1 times)
#00000090 (used 1 times)
#0056b380 (used 1 times)
#fafafa (used 1 times)
#22c55e (used 1 times)
#fee2e2 (used 1 times)
#fef3c7 (used 1 times)
#166534 (used 1 times)
#991b1b (used 1 times)
#92400e (used 1 times)
#fca5a5 (used 1 times)
#1565c0 (used 1 times)
#212121 (used 1 times)
#d0d0d0 (used 1 times)
#001a35 (used 1 times)
#c0c0c0 (used 1 times)
#cd7f32 (used 1 times)
#1f8f52 (used 1 times)
#0ea5e9 (used 1 times)
#0077b5 (used 1 times)
#1da1f2 (used 1 times)
#e4405f (used 1 times)
#28a74520 (used 1 times)
#ff634720 (used 1 times)
#6f42c1 (used 1 times)
#fd7e14 (used 1 times)
#20c997 (used 1 times)
#fcf8e3 (used 1 times)
#7abaff (used 1 times)
#b3b7bb (used 1 times)
#8fd19e (used 1 times)
#86cfda (used 1 times)
#ffdf7e (used 1 times)
#ed969e (used 1 times)
#fbfcfc (used 1 times)
#95999c (used 1 times)
#005cbf (used 1 times)
#4e555b (used 1 times)
#1c7430 (used 1 times)
#10707f (used 1 times)
#c69500 (used 1 times)
#b21f2d (used 1 times)
#d3d9df (used 1 times)
#171a1d (used 1 times)
#16181b (used 1 times)
#cce5ff (used 1 times)
#002752 (used 1 times)
#e2e3e5 (used 1 times)
#202326 (used 1 times)
#d4edda (used 1 times)
#0b2e13 (used 1 times)
#d1ecf1 (used 1 times)
#062c33 (used 1 times)
#fff3cd (used 1 times)
#533f03 (used 1 times)
#f8d7da (used 1 times)
#491217 (used 1 times)
#fefefe (used 1 times)
#686868 (used 1 times)
#d6d8d9 (used 1 times)
#040505 (used 1 times)
#ebebeb (used 1 times)
#494f54 (used 1 times)
#19692c (used 1 times)
#0f6674 (used 1 times)
#ba8b00 (used 1 times)
#a71d2a (used 1 times)
#cbd3da (used 1 times)
#121416 (used 1 times)
#ffcccccc (used 1 times)
#3875d7 (used 1 times)
#0b0b0b (used 1 times)
#bdbdbd (used 1 times)
#f3f3f3 (used 1 times)
#445c8e (used 1 times)
#43afe9 (used 1 times)
#dc0510 (used 1 times)
#dd2a7b (used 1 times)
#007eb3 (used 1 times)
#f9f9f9 (used 1 times)
#ffffff52 (used 1 times)
#86ffa2 (used 1 times)
```
