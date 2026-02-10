import * as vscode from "vscode";
import { runInCurrent } from "./commands/run-in-current";
import { createNew } from "./commands/create-new";
import { disposePlayground } from "./utils/playground-manager";

export const activate = (context: vscode.ExtensionContext) => {
  console.info("Vanta: extension is now active");

  const runInCurrentCommand = vscode.commands.registerCommand(
    "vanta.runInCurrent",
    () => runInCurrent(context),
  );
  const createNewCommand = vscode.commands.registerCommand(
    "vanta.createNew",
    () => createNew(context),
  );

  context.subscriptions.push(runInCurrentCommand);
  context.subscriptions.push(createNewCommand);
};

export const deactivate = () => {
  console.info("Vanta: Disposing playground...");
  disposePlayground();
  console.info("Vanta: Disposed playground");
};
