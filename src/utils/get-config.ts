import * as vscode from "vscode";
import { Config } from "../interfaces/config";

export const getConfig = (): Config => {
  const config = vscode.workspace.getConfiguration("vanta");
  const debounce = config.get<number>("debounce") ?? 300;
  const tsconfigPath = config.get<string | null>("tsconfigPath") ?? null;
  const truncateLength = config.get<number>("truncateLength") ?? 40;
  const decoration = {
    color:
      config.get<string>("decoration.color") ?? "editorCodeLens.foreground",
    opacity: config.get<string>("decoration.opacity") ?? "1",
    fontStyle: config.get<string>("decoration.fontStyle") ?? "italic",
  };

  return {
    debounce,
    tsconfigPath,
    truncateLength,
    decoration,
  };
};
