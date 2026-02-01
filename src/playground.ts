import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getConfig } from './utils/get-config';
import { bundleFile, runFile } from './utils/playground';
import { truncateText } from './utils/truncate-text';
import { LOG_WRAPPER_CODE, LOG_WRAPPER_LINES } from './constants/playground';

const DECORATION_STYLES = {
    color: '#888888',
    fontStyle: 'italic'
};

export class Playground {
    private _debounceTimer: NodeJS.Timeout | undefined;
    private _outputChannel: vscode.OutputChannel;
    private _decorationType: vscode.TextEditorDecorationType;

    constructor() {
        this._outputChannel = vscode.window.createOutputChannel("Void");
        this._decorationType = vscode.window.createTextEditorDecorationType({
            after: {
                margin: '0 0 0 1em',
                ...DECORATION_STYLES
            }
        });
    }

    private _triggerRun = (doc: vscode.TextDocument) => {
        const { debounce } = getConfig();

        if (this._debounceTimer) {
            clearTimeout(this._debounceTimer);
        }

        this._debounceTimer = setTimeout(() => {
            this._run(doc);
        }, debounce);
    }

    private _run = async (doc: vscode.TextDocument) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== doc) return;

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;
        const rootPath = workspaceFolders[0].uri.fsPath;

        const { tsconfigPath } = getConfig();
        
        const tempTsFile = path.join(rootPath, '.void.ts');
        const tempJsFile = path.join(rootPath, '.void.js');
        const originalCode = doc.getText();

        const codeToRun = LOG_WRAPPER_CODE + originalCode;

        fs.writeFileSync(tempTsFile, codeToRun);

        try {
            await bundleFile(tempTsFile, tempJsFile, tsconfigPath ?? undefined);

            const output = await runFile(tempJsFile, rootPath);
            
            this._parseOutput(output, editor, LOG_WRAPPER_LINES);

        } catch (err: any) {
            this._outputChannel.appendLine(`Error: ${err.message}`);
        }
    }

    private _parseOutput = (output: string, editor: vscode.TextEditor, lineOffset: number) => {
        const lines = output.split('\n');
        const decorations: vscode.DecorationOptions[] = [];
        const lineMap = new Map<number, string[]>();

        for (const line of lines) {
            // Check for prefix
            if (line.startsWith('__VOID__|')) {
                const secondPipeIndex = line.indexOf('|', 9);
                if (secondPipeIndex === -1) continue;

                const stackTracePart = line.substring(9, secondPipeIndex);
                // The rest is the logged content, might be separated by space from the pipe? 
                // console.log("a", "b") -> "a b"
                // _originalLog("prefix", "a", "b") -> "prefix a b"
                // So there is a space after the second pipe usually.
                let argsPart = line.substring(secondPipeIndex + 1);
                if (argsPart.startsWith(' ')) argsPart = argsPart.substring(1);

                const match = /\.void\.ts:(\d+)/.exec(stackTracePart);
                if (match) {
                    let lineNo = parseInt(match[1], 10);
                    lineNo = lineNo - lineOffset;
                    const editorLine = lineNo - 1;

                    if (editorLine >= 0) {
                        if (!lineMap.has(editorLine)) {
                            lineMap.set(editorLine, []);
                        }
                        lineMap.get(editorLine)?.push(argsPart);
                    }
                }
            } else {
                 // Maybe show runtime errors in output channel?
                 // But logs also go to stdout which we capture.
                 // We could show clean logs (without valid prefix) in output channel.
            }
        }

        const { truncateLength } = getConfig();

        lineMap.forEach((texts, line) => {
             const fullText = texts.join(', ');
             const truncatedText = truncateText(fullText, truncateLength);
             const hoverMessage = new vscode.MarkdownString();
             hoverMessage.appendCodeblock(fullText, 'typescript');

             decorations.push({
                 range: new vscode.Range(line, 0, line, 1000),
                 hoverMessage: hoverMessage,
                 renderOptions: {
                     after: {
                         contentText: `  => ${truncatedText}`,
                         margin: '0 0 0 2em',
                         ...DECORATION_STYLES
                     }
                 }
             });
        });

        editor.setDecorations(this._decorationType, decorations);
    }

        public attach = async (doc: vscode.TextDocument) => {
        this._triggerRun(doc);

        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document === doc) {
                this._triggerRun(doc);
            }
        });
    }
    
    public dispose = () => {
        this._decorationType.dispose();
        this._outputChannel.dispose();
        if (this._debounceTimer) clearTimeout(this._debounceTimer);
    }
}
