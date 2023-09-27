import { describe, expect, it } from 'vitest';
import parseGPTResponse from './parseGPTResponse';

describe('parseGPTResponse', () => {
  it('should return an array of marker data for each failure', () => {
    const input = [
      {
        lineNumber: 2,
        suggestion: 'This line fails',
        rule: '',
      },
      {
        lineNumber: 6,
        suggestion: 'This line also fails',
        rule: '',
      },
    ];
    const expected = [
      {
        startLineNumber: 2,
        endLineNumber: 2,
        startColumn: 0,
        endColumn: Infinity,
        message: 'This line fails',
        severity: 8, // MarkerSeverity.Error
      },
      {
        startLineNumber: 6,
        endLineNumber: 6,
        startColumn: 0,
        endColumn: Infinity,
        message: 'This line also fails',
        severity: 8, // MarkerSeverity.Error,
      },
    ];
    expect(parseGPTResponse(input)).toEqual(expected);
  });
});
