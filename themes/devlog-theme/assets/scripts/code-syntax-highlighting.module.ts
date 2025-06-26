// Required to force TypeScript to recognize "hljs" as namespace.
declare global {
    namespace hljs {
    }
}

// Enhances all code blocks with optional syntax highlighting, line numbers, and/or line highlights.
export function enhanceAllCodeBlocks(): void {
    document.querySelectorAll('pre > code').forEach((element) => {
        enhanceCodeBlock(element);
    });
}

// Enhances the code block with optional syntax highlighting, line numbers, and/or line highlights.
function enhanceCodeBlock(codeElement: Element): void {
    trimLineBreaks(codeElement);

    const languageName = getHighlightingLanguageName(codeElement);
    const highlightedLines = getHighlightedLines(codeElement);
    const enableLineNumbers = codeElement.classList.contains('with-line-numbers');

    if (languageName || highlightedLines || enableLineNumbers) {
        let enhancedHtml = highlightCodeBlock(codeElement, languageName);

        if (highlightedLines || enableLineNumbers) {
            enhancedHtml = enableLineNumbersAndLineHighlights(enhancedHtml, highlightedLines);
            codeElement.classList.add('with-lines');
        }

        codeElement.innerHTML = enhancedHtml;
    }
}

// Removes leading and trailing line breaks from the element's text representation.
function trimLineBreaks(element: Element): void {
    const text = element.textContent;
    if (text) {
        element.textContent = text.replaceAll('\r', '').replace(/^\n+|\n+$/g, '');
    }
}

// See "hljs.highlightElement()" for a "template" of this method.
function highlightCodeBlock(element: Element, languageName: string|null): string {
    if (languageName) {
        const text = element.textContent;
        if (!text) {
            return '';
        }

        const result = hljs.highlight(
            text,
            // @ts-ignore
            { language: languageName, ignoreIllegals: true }
        );

        return result.value;
    }

    // IMPORTANT: If this element isn't highlighted via "hljs", we need to return "innerHTML" instead
    //   of "innerText" so that angular brackets remain correctly escaped.
    return element.innerHTML;
}

// Returns the name of the language with which to highlight the code block. Returns
// "null" if no language has been specified or if the language isn't supported (in which
// case a note is logged to the browser's dev console).
function getHighlightingLanguageName(element: Element): string|null {
    const languageName = element.getAttribute('data-lang');
    if (languageName) {
        if (hljs.getLanguage(languageName)) {
            // Language is supported.
            return languageName;
        }
        else {
            console.info(`language not supported: ${languageName}`);
        }
    }

    return null;
}

function enableLineNumbersAndLineHighlights(html: string, highlightedLines: number[]|null): string {
    const lines = html.replaceAll('\r', '').split('\n');

    html = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        let lineClass = 'line';

        if (highlightedLines && highlightedLines.includes(i + 1)) {
            // Highlight this line
            lineClass = `${lineClass} hl`;
        }

        // Don't add \n for the last line. This is primarily a problem for code blocks created via indentation (instead of fencing).
        const endOfLine = i < lines.length - 1 ? '\n' : '';

        //
        // Wrap lines in <span>s to enable line highlighting and line numbers.
        //
        // IMPORTANT:
        //  * We need both(!) spans otherwise the flexbox of ".line" will kill the whitespace.
        //  * "\n" must be inside of the space - not between spans - or we'll get "double height" lines.
        //
        html += `<span class="${lineClass}"><span>${line}${endOfLine}</span></span>`;
    }

    return html;
}

function getHighlightedLines(element: Element): number[]|null {
    const lineHighlightAsString = element.getAttribute('data-line-highlights');
    if (!lineHighlightAsString) {
        return null;
    }

    const highlightedLines = [];

    // Split line highlights list on space, comma, and semicolon.
    for (const lineHighlightElement of lineHighlightAsString.split(/[ ,;]/)) {
        if (!lineHighlightElement) {
            continue;
        }

        if (lineHighlightElement.includes('-')) {
            //
            // Line ranges
            //
            const rangeParts = lineHighlightElement.split('-', 2);
            const rangeStart = parseLineNumber(rangeParts[0]);
            const rangeEnd = parseLineNumber(rangeParts[1]);

            if (rangeStart && rangeEnd) {
                if (rangeEnd > rangeStart) {
                    for (let lineNum = rangeStart; lineNum <= rangeEnd; lineNum++) {
                        highlightedLines.push(lineNum);
                    }
                }
                else if (rangeEnd === rangeStart) {
                    highlightedLines.push(rangeStart);
                }
                else {
                    for (let lineNum = rangeEnd; lineNum <= rangeStart; lineNum++) {
                        highlightedLines.push(lineNum);
                    }
                }
            }
        }
        else {
            const lineNumber = parseLineNumber(lineHighlightElement);
            if (lineNumber) {
                highlightedLines.push(lineNumber);
            }
        }
    }

    return highlightedLines;
}

function parseLineNumber(stringValue: string): number|null {
    // NOTE: parseInt() returns NaN if the value is not a number.
    const lineNumber = parseInt(stringValue);
    if (lineNumber >= 1) {
        return lineNumber;
    }
    else {
        return null;
    }
}
