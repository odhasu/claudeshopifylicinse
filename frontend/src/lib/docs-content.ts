import { getAllDocs, getDocParagraphs } from './docs-loader';

/**
 * Gets article content from markdown files
 * Falls back to checking if markdown file exists, otherwise returns empty array
 */
export function getArticleContent(): Record<string, { section: string; paragraphs: string[] }> {
  try {
    const docs = getAllDocs();
    const content: Record<string, { section: string; paragraphs: string[] }> = {};
    
    docs.forEach(doc => {
      content[doc.title] = {
        section: doc.section,
        paragraphs: getDocParagraphs(doc.title),
      };
    });
    
    return content;
  } catch (error) {
    console.error('Error loading markdown docs:', error);
    return {};
  }
}

/**
 * Export function that can be called at build time or runtime
 * This allows the docs page to work with markdown files
 */
export const ARTICLE_CONTENT_FROM_MD = getArticleContent();
