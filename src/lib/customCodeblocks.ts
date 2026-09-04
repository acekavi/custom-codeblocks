import { visit, SKIP } from 'unist-util-visit';
import { h } from 'hastscript';
import type { Plugin } from 'unified';
import type { Element, Root } from 'hast';

/**
 * Wrap every fenced code block in a header carrying its language and a copy
 * button.
 *
 * This runs on HAST — after markdown has become HTML structure, but before it
 * is serialised — so it manipulates real nodes with real properties rather than
 * pattern-matching against a string of output.
 */

/** Language ids as people write them, spelled as people read them. */
const DISPLAY_NAMES: Record<string, string> = {
    js: 'JavaScript',
    javascript: 'JavaScript',
    ts: 'TypeScript',
    typescript: 'TypeScript',
    jsx: 'JSX',
    tsx: 'TSX',
    css: 'CSS',
    scss: 'SCSS',
    html: 'HTML',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    sql: 'SQL',
    sh: 'Shell',
    bash: 'Shell',
    go: 'Go',
    py: 'Python',
    python: 'Python',
    plaintext: 'Text'
};

const displayName = (language: string) =>
    DISPLAY_NAMES[language] ?? language.charAt(0).toUpperCase() + language.slice(1);

const LANGUAGE_PREFIX = 'language-';

/**
 * The language lives in a class on the `<code>` child, not on the `<pre>`.
 *
 * Found by tag name rather than taken as `children[0]`, and read from
 * `properties.className` — which HAST models as an array of tokens. A fence
 * with no language, an empty block, or a whitespace text node ahead of the
 * element all defeat positional access, and every one of those is a legitimate
 * document rather than an error.
 */
function languageOf(node: Element): string {
    const code = node.children.find(
        (child): child is Element => child.type === 'element' && child.tagName === 'code'
    );

    const classes = code?.properties?.className;
    if (!Array.isArray(classes)) return 'plaintext';

    const match = classes.find(
        (name): name is string => typeof name === 'string' && name.startsWith(LANGUAGE_PREFIX)
    );

    return match ? match.slice(LANGUAGE_PREFIX.length) : 'plaintext';
}

const customCodeBlocks: Plugin<[], Root> = function () {
    return (tree: Root) => {
        visit(tree, 'element', (node, index, parent) => {
            if (node.tagName !== 'pre' || parent === undefined || index === undefined) return;

            const language = languageOf(node);

            parent.children[index] = h('div.code-block', { 'data-language': language }, [
                h('header.code-block__bar', [
                    h('span.code-block__lang', displayName(language)),
                    // A data attribute rather than an inline `onclick`. An inline
                    // handler counts as inline script under a Content-Security-Policy,
                    // so it needs 'unsafe-inline' or a hash of the exact attribute
                    // text — and a nonce cannot help, because there is no <script>
                    // element to put one on. One delegated listener costs the consumer
                    // a few lines and no CSP concession.
                    h('button.code-block__copy', { type: 'button', 'data-copy-code': '' }, 'Copy')
                ]),
                node
            ]);

            // Without SKIP the visitor walks into the wrapper it just built and meets
            // the same <pre> again. Resuming past the replacement is what stops this
            // wrapping its own output.
            return [SKIP, index + 1];
        });
    };
};

export default customCodeBlocks;
