import { visit } from 'unist-util-visit';
import type { Plugin, } from 'unified';
import type { Element, Parent } from 'hast';

const customCodeBlocks: Plugin = function () {
    const transformer = (tree: any) => {
        visit(tree, 'element', (node: Element, index, parent: Parent) => {
            if (node.tagName !== 'pre') {
                return;
            }
            let language = ''
            try {
                // @ts-ignore
                language = node.children[0].properties.className.find((className: string) =>
                    className.startsWith('language-')
                );
                language = language.substring(9);
            } catch (error) {
                language = 'plaintext';
            }

            const wrapperDiv = {
                type: 'element',
                tagName: 'div',
                properties: {
                    class: 'rounded-md bg-blue-500 prose-pre:m-0 prose-a:no-underline lg:prose-pre:w-full prose-pre:rounded-none prose-pre:bg-neutral-900/70',
                },
                children: [
                    {
                        type: 'element',
                        tagName: 'header',
                        properties: {
                            class: 'text-sm flex justify-between items-center my-auto px-4 text-slate-100',
                        },
                        children: [
                            {
                                type: 'element',
                                tagName: 'span',
                                properties: {
                                    class: 'codeblock-language font-monospace',
                                },
                                children: [
                                    {
                                        type: 'text',
                                        value: capitalize(language),
                                    },
                                ],
                            },
                            {
                                type: 'element',
                                tagName: 'button',
                                properties: {
                                    class: 'btn btn-sm variant-soft-surface my-1',
                                    onclick: 'copyCode(this)',
                                },
                                children: [
                                    {
                                        type: 'text',
                                        value: 'Copy',
                                    },
                                ],
                            },
                        ],
                    },
                    node,
                ],
            };
            // @ts-ignore
            parent.children[index] = wrapperDiv;
        });

        return tree;
    };

    return transformer;
};
export default customCodeBlocks;

function capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}