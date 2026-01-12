export class ContentAnalyzer {
    /**
     * Calculates the information density (length) of the content.
     * Stripts HTML/Markdown tags to count actual text characters.
     */
    static calculateLength(content: string): number {
        if (!content) return 0;
        // Remove markdown headers, links, images for pure text count
        const stripped = content
            .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
            .replace(/\[.*?\]\(.*?\)/g, '$1') // Remove links kbut keep text
            .replace(/#{1,6}\s/g, '') // Remove headers
            .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
            .replace(/(\*|_)(.*?)\1/g, '$2') // Remove italic
            .replace(/`{1,3}.*?`{1,3}/gs, '') // Remove code blocks (optional: keep code?)
            .trim();
        return stripped.length;
    }

    /**
     * Calculates a heuristic readability score (0-100).
     * Based on structure (headers, lists) and spacing.
     */
    static calculateReadability(content: string): number {
        if (!content) return 0;
        let score = 0;

        // 1. Structure Bonus (Max 40)
        if (/#{1,6}\s/.test(content)) score += 10; // Has Headers?
        if (/(\n- |\n\* |\n\d+\. )/.test(content)) score += 10; // Has Lists?
        if (/```/.test(content)) score += 20; // Has Code Blocks?

        // 2. Paragraph Spacing (Max 30)
        // Check if there are no "walls of text" > 500 chars without newline
        const paragraphs = content.split(/\n\s*\n/);
        const hasWallOfText = paragraphs.some(p => p.length > 500);
        if (!hasWallOfText && paragraphs.length > 1) {
            score += 30;
        }

        // 3. Media Richness (Max 30)
        if (/!\[.*?\]\(.*?\)/.test(content)) score += 15; // Has Image?
        if (/youtu\.?be/.test(content)) score += 15; // Has Video Link?

        return Math.min(score, 100);
    }
}
