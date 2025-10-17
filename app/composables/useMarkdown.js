import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

/**
 * Composable for rendering markdown content
 * Provides safe markdown-to-HTML conversion with XSS protection
 */
export function useMarkdown() {
  /**
   * Convert markdown text to sanitized HTML
   * @param {string} markdown - Markdown text to convert
   * @returns {string} - Sanitized HTML string
   */
  const renderMarkdown = (markdown) => {
    if (!markdown) return ''

    try {
      // Configure marked options
      marked.setOptions({
        breaks: true, // Convert \n to <br>
        gfm: true, // GitHub Flavored Markdown
        headerIds: false, // Don't add IDs to headers
        mangle: false // Don't escape autolinked email addresses
      })

      // Convert markdown to HTML
      const html = marked.parse(markdown)

      // Sanitize HTML to prevent XSS attacks
      const sanitized = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'del',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'ul', 'ol', 'li',
          'blockquote', 'pre', 'code',
          'a', 'img',
          'table', 'thead', 'tbody', 'tr', 'th', 'td'
        ],
        ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt']
      })

      return sanitized
    } catch (error) {
      console.error('Error rendering markdown:', error)
      return markdown // Return original text on error
    }
  }

  /**
   * Check if text contains markdown formatting
   * @param {string} text - Text to check
   * @returns {boolean} - True if likely contains markdown
   */
  const hasMarkdown = (text) => {
    if (!text) return false

    // Check for common markdown patterns
    const markdownPatterns = [
      /^#{1,6}\s/m, // Headers
      /\*\*.*\*\*/, // Bold
      /\*.*\*/, // Italic
      /\[.*\]\(.*\)/, // Links
      /^[*\-+]\s/m, // Unordered lists
      /^\d+\.\s/m, // Ordered lists
      /^>\s/m, // Blockquotes
      /`.*`/ // Code
    ]

    return markdownPatterns.some(pattern => pattern.test(text))
  }

  return {
    renderMarkdown,
    hasMarkdown
  }
}
