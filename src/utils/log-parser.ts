export const parseLogOutput = (
  output: string,
  lineOffset: number,
): Map<number, string[]> => {
  const lines = output.split("\n");
  const lineMap = new Map<number, string[]>();

  let currentLine: number | null = null;
  let currentOutput: string[] = [];

  for (const line of lines) {
    // Check for prefix
    if (line.startsWith("__VANTA__|")) {
      // If we have accumulated output for a previous line, save it
      if (currentLine !== null && currentOutput.length > 0) {
        if (!lineMap.has(currentLine)) {
          lineMap.set(currentLine, []);
        }
        lineMap.get(currentLine)?.push(currentOutput.join("\n"));
      }

      // Start a new entry
      currentOutput = [];
      currentLine = null;

      const secondPipeIndex = line.indexOf("|", 9);
      if (secondPipeIndex === -1) {
        continue;
      }

      const stackTracePart = line.substring(9, secondPipeIndex);
      let argsPart = line.substring(secondPipeIndex + 1);
      if (argsPart.startsWith(" ")) {
        argsPart = argsPart.substring(1);
      }

      const match = /\.vanta\.ts:(\d+)/.exec(stackTracePart);
      if (match) {
        let lineNo = parseInt(match[1], 10);
        lineNo = lineNo - lineOffset;
        const editorLine = lineNo - 1;

        if (editorLine >= 0) {
          currentLine = editorLine;
          currentOutput.push(argsPart);
        }
      }
    } else if (currentLine !== null) {
      // Continuation of the previous log
      currentOutput.push(line);
    }
  }

  // Push successfully processed last iteration
  if (currentLine !== null && currentOutput.length > 0) {
    if (!lineMap.has(currentLine)) {
      lineMap.set(currentLine, []);
    }
    lineMap.get(currentLine)?.push(currentOutput.join("\n"));
  }

  return lineMap;
};

export const formatForInline = (texts: string[]): string => {
  // For inline representation: replace newlines with spaces and condense spaces
  const inlineTexts = texts.map((text) =>
    text
      .replace(/[\r\n]+/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
  return inlineTexts.join(", ");
};
