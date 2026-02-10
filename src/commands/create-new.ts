import * as vscode from "vscode";
import * as path from "path";
import { getPlayground } from "../utils/playground-manager";

export const createNew = async (context: vscode.ExtensionContext) => {
  const playground = getPlayground(context);

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders) {
    const rootPath = workspaceFolders[0].uri.fsPath;
    const filePath = vscode.Uri.file(path.join(rootPath, "playground.ts"));

    try {
      await vscode.workspace.fs.stat(filePath);
    } catch {
      const edit = new vscode.WorkspaceEdit();
      edit.createFile(filePath, { ignoreIfExists: true });
      edit.insert(
        filePath,
        new vscode.Position(0, 0),
        "// Vanta Playground\n\nconst x = 10;\nconsole.log(x);\n",
      );
      await vscode.workspace.applyEdit(edit);
      const doc = await vscode.workspace.openTextDocument(filePath);
      await doc.save();
    }

    const doc = await vscode.workspace.openTextDocument(filePath);
    await vscode.window.showTextDocument(doc);
    playground.attach(doc);
  } else {
    vscode.window.showErrorMessage("Open a workspace to create a Singularity.");
  }
};
