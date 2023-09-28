import { MarkerSeverity, editor } from 'monaco-editor';

export interface GPTResult {
  startLineNumber: number;
  endLineNumber: number;
  rule: string;
  suggestion: string;
}
export default function (input: GPTResult[]) {
  console.log(input);
  // For each line
  const markers: editor.IMarkerData[] = input.map((line) => {
    // Return the marker data (using whole line for now)
    return {
      startLineNumber: line.startLineNumber || -1,
      endLineNumber: line.endLineNumber || -1,
      startColumn: 0, // TODO use start of line
      endColumn: Infinity, // Will be trimmed to end of line
      message: line.suggestion?.trim(),
      severity: MarkerSeverity.Error,
    };
  });
  return markers;
}
