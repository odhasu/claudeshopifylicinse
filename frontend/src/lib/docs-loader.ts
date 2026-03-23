import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const docsDirectory = path.join(process.cwd(), 'docs');

export interface DocArticle {
  title: string;
  section: string;
  content: string;
  htmlContent: string;
  slug: string;
}

/**
 * Get all markdown docs from the /docs folder
 */
export function getAllDocs(): DocArticle[] {
  const fileNames = fs.readdirSync(docsDirectory);
  const allDocs = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(docsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      
      // Parse frontmatter
      const { data, content } = matter(fileContents);
      
      // Convert markdown to HTML
      const htmlContent = marked(content);
      
      return {
        title: data.title || slug,
        section: data.section || 'Uncategorized',
        content,
        htmlContent: typeof htmlContent === 'string' ? htmlContent : '',
        slug,
      };
    });
  
  return allDocs;
}

/**
 * Get a single doc by title (matching the original ARTICLE_CONTENT keys)
 */
export function getDocByTitle(title: string): DocArticle | null {
  const slug = titleToSlug(title);
  const fullPath = path.join(docsDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const htmlContent = marked(content);
  
  return {
    title: data.title || title,
    section: data.section || 'Uncategorized',
    content,
    htmlContent: typeof htmlContent === 'string' ? htmlContent : '',
    slug,
  };
}

/**
 * Convert title to slug (e.g., "Quick Start Guide" -> "quick-start-guide")
 */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Get doc content formatted as paragraphs (for backwards compatibility)
 */
export function getDocParagraphs(title: string): string[] {
  const doc = getDocByTitle(title);
  if (!doc) return [];
  
  // Split content by double newlines to create paragraphs
  return doc.content
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}
