import { MarkerSeverity, editor } from 'monaco-editor';

export interface GPTResult {
  lineNumber: number;
  rule: string;
  suggestion: string;
}
export default function (input: GPTResult[]) {
  // For each line
  const markers: editor.IMarkerData[] = input.map((line) => {
    // Return the marker data (using whole line for now)
    return {
      startLineNumber: line.lineNumber || -1,
      endLineNumber: line.lineNumber || -1,
      startColumn: 0, // TODO use start of line
      endColumn: Infinity, // Will be trimmed to end of line
      message: line.rule?.trim(),
      severity: MarkerSeverity.Error,
    };
  });
  return markers;
}
