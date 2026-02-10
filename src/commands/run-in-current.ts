import * as vscode from "vscode";
import { getPlayground } from "../utils/playground-manager";

export const runInCurrent = (context: vscode.ExtensionContext) => {
  const playground = getPlayground(context);

  const editor = vscode.window.activeTextEditor;
  if (
    editor &&
    (editor.document.languageId === "typescript" ||
      editor.document.languageId === "javascript")
  ) {
    playground.attach(editor.document);
  } else {
    vscode.window.showErrorMessage(
      'No active TypeScript/JavaScript file. Use "Vanta: Singularity" to create one.',
    );
  }
};
