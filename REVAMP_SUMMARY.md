# UI Revamp: Surreal Midnight Theme

## 🎨 Design Philosophy
Inspired by **Dali's Surrealism** and **Picasso's Boldness**, this new theme moves away from the standard "Developer Purple" to a unique, artistic palette.

**Theme Name:** **"Surreal Midnight"**

### 🌌 Color Palette
- **Deep Ocean (Background):** A rich, dark teal-navy (`#0f172a`) that feels like a night sky or deep ocean.
- **Neon Teal (Primary):** High-energy cyan/teal (`#14b8a6`) representing clarity and code.
- **Electric Amber (Secondary):** A melting gold (`#f59e0b`) for highlights, streaks, and time elements (Spaced Repetition).
- **Surreal Rose (Accent):** A bold magenta/rose (`#f43f5e`) for AI features and "magic" moments.

### 🚫 No More Purple
As requested, all traces of purple/violet have been removed and replaced with:
- **Teal/Cyan** for cool, technical elements.
- **Rose** for intelligent/AI elements.
- **Amber** for warmth and urgency.

### 🎭 Artistic Touches
- **Dual Gradients:** The background features a "Sun and Sea" diagonal gradient (Gold from top-right, Teal from bottom-left).
- **Glassmorphism:** Cards retain a glassy, translucent feel but with teal/gold tints.
- **Fluid Animations:** Subtle floating and glowing effects to mimic a dreamlike state.

## 🛠 Technical Changes
1.  **Global CSS Variables:** Completely redefined in `src/app/globals.css`.
2.  **Tailwind Config:** Updated to use new variable references.
3.  **Component Styling:**
    - **Dashboard:** Updated gradients to Cyan -> Rose.
    - **Contest Tracker:** Updated badge colors (AtCoder -> Cyan, TopCoder -> Rose).
    - **AI Features:** Brain/Lightbulb icons now use Rose for a distinct look.
4.  **Layout:** Added a complex, multi-layered background to `src/app/layout.tsx`.

## ✅ Status
- **APIs:** Fully functional (Health, Contests, Problems).
- **Project Structure:** Intact.
- **User Experience:** Enhanced with a unique, premium feel.

