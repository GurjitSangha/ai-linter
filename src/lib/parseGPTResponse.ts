import { MarkerSeverity, editor } from 'monaco-editor';

export default function (input: string) {
  const lines = input.split('\n');
  // For each line
  const markers: editor.IMarkerData[] = lines.map((line) => {
    // Split by : to get line number and message
    const [number, message] = line.split(':');
    const parsedNumber = parseInt(number, 10);
    // Return the marker data (using whole line for now)
    return {
      startLineNumber: parsedNumber || -1,
      endLineNumber: parsedNumber || -1,
      startColumn: 0, // TODO use start of line
      endColumn: Infinity, // Will be trimmed to end of line
      message: message?.trim(),
      severity: MarkerSeverity.Error,
    };
  });
  return markers;
}
