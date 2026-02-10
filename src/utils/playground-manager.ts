import * as vscode from "vscode";
import { Playground } from "../playground";

let playground: Playground | undefined;

export const getPlayground = (context: vscode.ExtensionContext): Playground => {
  if (!playground) {
    playground = new Playground();
    context.subscriptions.push(playground);
  }
  return playground;
};

export const disposePlayground = () => {
  if (playground) {
    playground.dispose();
    playground = undefined;
  }
};
