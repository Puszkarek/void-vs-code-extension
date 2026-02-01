import * as vscode from 'vscode';
import { runInCurrent } from './commands/run-in-current';
import { createNew } from './commands/create-new';
import { disposePlayground } from './utils/playground-manager';

export const activate = (context: vscode.ExtensionContext) => {
    console.info('Void extension is now active');

    const runInCurrentCommand = vscode.commands.registerCommand('void.runInCurrent', () => runInCurrent(context));
    const createNewCommand = vscode.commands.registerCommand('void.createNew', () => createNew(context));

    context.subscriptions.push(runInCurrentCommand);
    context.subscriptions.push(createNewCommand);
}

export const deactivate = () => {
    disposePlayground();
}
