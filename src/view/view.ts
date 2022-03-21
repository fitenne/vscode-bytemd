import { Editor, Viewer } from 'bytemd';
import gfm from '@bytemd/plugin-gfm';
import mermaid from '@bytemd/plugin-mermaid';
import math from '@bytemd/plugin-math';
import highlight from '@bytemd/plugin-highlight';
import frontmatter from '@bytemd/plugin-frontmatter';
import footnotes from '@bytemd/plugin-footnotes';


// @ts-ignore
const vscode = acquireVsCodeApi();

const plugins = [
    gfm(),
    math(),
    highlight(),
    frontmatter(),
    footnotes(),
    mermaid(),
];

function main() {
    const editor = new Editor({
        target: document.getElementById('app'),
        props: {
            value: '',
            plugins,
        }
    });
    
    editor.$on('change', (e: any)=> {
        vscode.postMessage({
            type: 'client-update',
            content: e.detail.value,
        });
    });

    window.addEventListener('message', (event) => {
        const message = event.data;
        switch (message.type) {
            case 'update': {
                const text = message.text;
                editor.$set({ value: text });
                return;
            }
        }
    });

    // full screen, any cleaner workaround?
    (document.querySelector('.bytemd-toolbar-right [bytemd-tippy-path="4"]') as HTMLElement).click();
}

main();