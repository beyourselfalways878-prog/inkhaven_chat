/**
 * Word Filter - Fallback content moderation when OpenAI is unavailable
 * 
 * This provides a deterministic, zero-latency content filter that:
 * - Catches obvious profanity and slurs
 * - Supports configurable severity levels
 * - Can be extended with custom block lists
 */

// Severity levels for filtered content
export type FilterSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface FilterResult {
    allowed: boolean;
    flagged: boolean;
    severity?: FilterSeverity;
    matchedTerms?: string[];
    reason?: string;
}

// Base profanity list (common terms that should always be blocked)
// This is a minimal list - in production, use a comprehensive library
const BLOCKED_TERMS: Record<FilterSeverity, string[]> = {
    critical: [
        // Hate speech, slurs, and extreme content
        // Using patterns instead of actual words for safety
        'n[i1]gg[ae3]r',
        'f[a4]gg[o0]t',
        'k[i1]k[e3]',
        'sp[i1]c',
        'ch[i1]nk',
        '[c¢]h[i1]ld\\s*(p[o0]rn|s[e3]x)',
        'k[i1]ll\\s*(y[o0]u|y[o0]ur|h[i1]m|h[e3]r|th[e3]m)',
    ],
    high: [
        // Severe profanity and targeted harassment
        'f[u∪]ck\\s*(y[o0]u|[o0]ff|[i1]ng)',
        'sh[i1]t',
        'b[i1]tch',
        'c[u∪]nt',
        'wh[o0]r[e3]',
        'd[i1]ck\\s*h[e3]ad',
        'a[s5][s5]h[o0]l[e3]',
    ],
    medium: [
        // Moderate profanity
        'f[u∪]ck',
        'd[a4]mn',
        'h[e3]ll',
        'cr[a4]p',
        'p[i1][s5][s5]',
        'd[i1]ck',
        'a[s5][s5]',
    ],
    low: [
        // Mild terms (warning only, not blocked by default)
        'st[u∪]p[i1]d',
        'd[u∪]mb',
        'l[a4]m[e3]',
        'suck',
    ]
};

// Patterns for behavior detection
const BEHAVIOR_PATTERNS = {
    selfHarm: /\b(k[i1]ll\s*m(y)?s[e3]lf|su[i1]c[i1]d[e3]|cut\s*m(y)?s[e3]lf|end\s*(my|it)\s*all)\b/i,
    spam: /(.)\1{10,}|^\s*$/,  // Repeated characters or empty content
    allCaps: /^[^a-z]*[A-Z]{20,}[^a-z]*$/,  // Excessive caps
    external: /(https?:\/\/|www\.|discord\.gg|t\.me\/)/i,  // External links
};

/**
 * Normalize text for comparison
 * Handles common character substitutions used to bypass filters
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .replace(/0/g, 'o')
        .replace(/1/g, 'i')
        .replace(/3/g, 'e')
        .replace(/4/g, 'a')
        .replace(/5/g, 's')
        .replace(/\$/g, 's')
        .replace(/@/g, 'a')
        .replace(/∪/g, 'u')
        .replace(/¢/g, 'c')
        .replace(/[_\-\.]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Check if text matches any blocked patterns
 */
function matchesBlockedTerms(
    text: string,
    minSeverity: FilterSeverity = 'medium'
): { matched: boolean; terms: string[]; severity: FilterSeverity } {
    const normalized = normalizeText(text);
    const matchedTerms: string[] = [];
    let highestSeverity: FilterSeverity = 'low';

    const severityOrder: FilterSeverity[] = ['low', 'medium', 'high', 'critical'];
    const minSeverityIndex = severityOrder.indexOf(minSeverity);

    for (const severity of severityOrder) {
        if (severityOrder.indexOf(severity) < minSeverityIndex) continue;

        for (const pattern of BLOCKED_TERMS[severity]) {
            try {
                const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
                if (regex.test(normalized)) {
                    matchedTerms.push(pattern);
                    if (severityOrder.indexOf(severity) > severityOrder.indexOf(highestSeverity)) {
                        highestSeverity = severity;
                    }
                }
            } catch (e) {
                // Skip invalid regex patterns
            }
        }
    }

    return {
        matched: matchedTerms.length > 0,
        terms: matchedTerms,
        severity: highestSeverity
    };
}

/**
 * Check for harmful behavior patterns
 */
function checkBehaviorPatterns(text: string): {
    detected: boolean;
    patterns: string[];
    allowContent: boolean;
} {
    const detectedPatterns: string[] = [];
    let allowContent = true;

    if (BEHAVIOR_PATTERNS.selfHarm.test(text)) {
        detectedPatterns.push('self_harm');
        // Don't block self-harm content, but flag for review
        // User might need support
    }

    if (BEHAVIOR_PATTERNS.spam.test(text)) {
        detectedPatterns.push('spam');
        allowContent = false;
    }

    if (BEHAVIOR_PATTERNS.allCaps.test(text)) {
        detectedPatterns.push('excessive_caps');
        // Warning only, don't block
    }

    if (BEHAVIOR_PATTERNS.external.test(text)) {
        detectedPatterns.push('external_links');
        allowContent = false;  // Block external links by default
    }

    return {
        detected: detectedPatterns.length > 0,
        patterns: detectedPatterns,
        allowContent
    };
}

/**
 * Main word filter function
 * Returns whether content should be allowed and any flags
 */
export function filterContent(
    text: string,
    options: {
        minSeverity?: FilterSeverity;
        allowExternalLinks?: boolean;
        customBlockList?: string[];
    } = {}
): FilterResult {
    const {
        minSeverity = 'medium',
        allowExternalLinks = false
    } = options;

    // Empty or very short content is allowed
    if (!text || text.trim().length < 2) {
        return { allowed: true, flagged: false };
    }

    // Check blocked terms
    const termCheck = matchesBlockedTerms(text, minSeverity);

    // Check behavior patterns
    const behaviorCheck = checkBehaviorPatterns(text);

    // Adjust for external links setting
    const externalLinkBlocked = behaviorCheck.patterns.includes('external_links') && !allowExternalLinks;

    // Determine if content should be blocked
    const blocked = termCheck.matched || !behaviorCheck.allowContent;
    const flagged = termCheck.matched || behaviorCheck.detected;

    // Build reason string
    let reason: string | undefined;
    if (blocked) {
        if (termCheck.matched) {
            reason = `Content blocked: ${termCheck.severity} severity profanity detected`;
        } else if (externalLinkBlocked) {
            reason = 'External links are not allowed';
        } else if (behaviorCheck.patterns.includes('spam')) {
            reason = 'Content appears to be spam';
        }
    }

    return {
        allowed: !blocked,
        flagged,
        severity: termCheck.severity,
        matchedTerms: termCheck.terms,
        reason
    };
}

/**
 * Quick check for critical content only (faster)
 */
export function containsCriticalContent(text: string): boolean {
    const normalized = normalizeText(text);

    for (const pattern of BLOCKED_TERMS.critical) {
        try {
            const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
            if (regex.test(normalized)) {
                return true;
            }
        } catch (e) {
            // Skip invalid regex
        }
    }

    return false;
}

/**
 * Check if content contains self-harm references (for support routing)
 */
export function containsSelfHarmContent(text: string): boolean {
    return BEHAVIOR_PATTERNS.selfHarm.test(text);
}

export default filterContent;
