import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Subject, Observable, timer } from 'rxjs';
import {  takeUntil, switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfigService } from './utils/config-service';
import { bundleFile, runFile } from './utils/playground';
import { truncateText } from './utils/truncate-text';
import { LOG_WRAPPER_CODE, LOG_WRAPPER_LINES } from './constants/playground';
import { Config } from './interfaces/config';
import { parseLogOutput, formatForInline } from './utils/log-parser';

export class Playground {
    private readonly _outputChannel = vscode.window.createOutputChannel("Void");
    private _decorationType!: vscode.TextEditorDecorationType;
    private readonly _configService = new ConfigService();
    private readonly _textDocument$ = new Subject<vscode.TextDocument>();
    private readonly _destroy$ = new Subject<void>();
    constructor() {
        this._updateDecorationType(this._configService.currentConfig);

        this._configService.config$
            .pipe(
                distinctUntilChanged(),
                takeUntil(this._destroy$))
            .subscribe(config => this._updateDecorationType(config));

        this._textDocument$.pipe(
            switchMap(doc => new Observable<vscode.TextDocument>(observer => {
                // Emit initial value
                observer.next(doc);
                
                const changeListener = vscode.workspace.onDidChangeTextDocument(e => {
                    if (e.document === doc) {
                        observer.next(doc);
                    }
                });

                return () => {
                    changeListener.dispose();
                };
            })),
            debounceTime(this._configService.currentConfig.debounce),
            takeUntil(this._destroy$)
        ).subscribe(doc => this._run(doc));
    }

    private _updateDecorationType(config: Config) {
        if (this._decorationType) {
            this._decorationType.dispose();
        }

        const { color, opacity, fontStyle } = config.decoration;

        const decorationColor = color.startsWith('#') || color.startsWith('rgb')
            ? color
            : new vscode.ThemeColor(color);

        this._decorationType = vscode.window.createTextEditorDecorationType({
            opacity,
            after: {
                color: decorationColor,
                fontStyle
            }
        });
    }

    private _run = async (textDocument: vscode.TextDocument) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== textDocument) {return;}

        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {return;}
        const rootPath = workspaceFolders[0].uri.fsPath;

        const { tsconfigPath } = this._configService.currentConfig;
        
        const tempTsFile = path.join(rootPath, '.void.ts');
        const tempJsFile = path.join(rootPath, '.void.js');
        const originalCode = textDocument.getText();

        const codeToRun = LOG_WRAPPER_CODE + originalCode;

        fs.writeFileSync(tempTsFile, codeToRun);

        try {
            await bundleFile(tempTsFile, tempJsFile, tsconfigPath ?? undefined);

            const output = await runFile(tempJsFile, rootPath);
            
            this._parseOutput(output, editor, LOG_WRAPPER_LINES);

        } catch (err: any) {
            this._outputChannel.appendLine(`Error: ${err.message}`);
        }
    };
    private _parseOutput = (output: string, editor: vscode.TextEditor, lineOffset: number) => {
        const decorations: vscode.DecorationOptions[] = [];
        const lineMap = parseLogOutput(output, lineOffset);
        const { truncateLength } = this._configService.currentConfig;

        lineMap.forEach((texts, line) => {
            const fullText = texts.join('\n');
            const inlineText = formatForInline(texts);
            const truncatedText = truncateText(inlineText, truncateLength);

            const hoverMessage = new vscode.MarkdownString();
            hoverMessage.appendCodeblock(fullText, 'typescript');

            decorations.push({
                range: new vscode.Range(line, 0, line, 1000),
                hoverMessage: hoverMessage,
                renderOptions: {
                    after: {
                        contentText: `  => ${truncatedText}`,
                    }
                }
            });
        });

        editor.setDecorations(this._decorationType, decorations);
    };

    public attach = async (textDocument: vscode.TextDocument) => {
        this._textDocument$.next(textDocument);
    };
    
    public dispose = () => {
        if (this._decorationType) {
            this._decorationType.dispose();
        }
        this._outputChannel.dispose();
        this._configService.dispose();
        
        this._destroy$.next();
        this._destroy$.complete();
    };
}
