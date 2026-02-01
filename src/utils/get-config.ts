import * as vscode from "vscode";
import { Config } from "../interfaces/config";

export const getConfig = (): Config => {
  const config = vscode.workspace.getConfiguration("void");
  return {
    debounce: config.get<number>("debounce") ?? 300,
    tsconfigPath: config.get<string>("tsconfigPath") ?? null,
    truncateLength: config.get<number>("truncateLength") ?? 40,
  };
};
