# Editing Documentation

Your Vexel docs are now powered by Markdown! 📝

## Quick Start

1. Navigate to the `/docs` folder in your project
2. Edit any `.md` file to update that article
3. Save the file
4. Restart your dev server (`npm run dev`) or rebuild

## Example Edit

Open `docs/quick-start-guide.md`:

```markdown
---
title: Quick Start Guide
section: Getting Started
---

Welcome to Vexel! This guide walks you through getting your store live in under 15 minutes...

**Step 1 — Download your theme:** ...
```

## Adding a New Article

1. Create a new file in `/docs` with a slugified name:
   - "My New Guide" → `my-new-guide.md`
   
2. Add frontmatter at the top:
   ```markdown
   ---
   title: My New Guide
   section: Getting Started
   ---
   
   Your content here...
   ```

3. Add the article title to the sidebar navigation in `/src/lib/docs-data.ts`:
   ```typescript
   {
     id: "getting-started",
     section: "Getting Started",
     items: [
       "Quick Start Guide",
       "My New Guide", // ← Add here
       ...
     ],
   }
   ```

4. Restart your dev server

## Markdown Features Supported

- **Bold** and *italic* text
- Lists (ordered and unordered)
- [Links](https://example.com)
- `Code blocks`
- Headings (H1-H6)
- Images
- And more!

## File Structure

```
docs/
├── README.md (this file)
├── quick-start-guide.md
├── downloading-your-theme.md
├── installing-in-shopify.md
├── understanding-your-license.md
├── colors-branding-setup.md
└── ... (all other articles)
```

## Technical Details

- **Parser**: `marked` + `gray-matter`
- **Location**: All docs in `/docs/*.md`
- **Loader**: `/src/lib/docs-loader.ts`
- **Page**: `/src/app/theme/docs/page.tsx`

Need help? Check the README in `/docs` or contact support!
