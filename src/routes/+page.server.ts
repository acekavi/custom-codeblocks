import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import type { PageServerLoad } from "./$types";
import rehypeStringify from "rehype-stringify";
import customCodeBlocks from "$lib/customCodeblocks";
import rehypeHighlight from "rehype-highlight";

export const load: PageServerLoad = async () => {
    const md = `# My Blog Post\n\nHere's an example code block:\n\n\`\`\`javascript\nconst greeting = 'Hello, World!';\nconsole.log(greeting);\n\`\`\``;

    const html = unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(customCodeBlocks)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .processSync(md)
        .toString();

    return {
        props: {
            html,
        },
    };
};