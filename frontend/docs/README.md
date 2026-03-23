# Vexel Documentation (Markdown)

This directory contains all documentation articles in Markdown format. Each file represents a single article that appears in the docs section of the website.

## File Structure

Each markdown file should follow this format:

```markdown
---
title: Article Title
section: Section Name
---

Your content here in **markdown** format.

You can use all standard markdown features:
- Lists
- **Bold** and *italic*
- [Links](https://example.com)
- Code blocks
- And more!
```

## Frontmatter Fields

- `title`: The article title (displayed in navigation and as heading)
- `section`: The section this article belongs to (e.g., "Getting Started", "License & Domain", etc.)

## File Naming

File names should be lowercase, hyphenated versions of the title:
- "Quick Start Guide" → `quick-start-guide.md`
- "Understanding Your License" → `understanding-your-license.md`

## Adding New Articles

1. Create a new `.md` file in this directory
2. Add the frontmatter with title and section
3. Write your content in markdown
4. The article will automatically appear in the docs (after restart/rebuild)

## Editing Existing Articles

Simply edit the markdown file and save. The changes will be reflected on the website after the next build.

## Current Sections

- Getting Started
- License & Domain
- Theme Customization
- Feature Guides
- Troubleshooting
- Plans & Policies
