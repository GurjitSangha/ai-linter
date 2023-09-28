import { describe, expect, it } from 'vitest';
import parseGPTResponse from './parseGPTResponse';

describe('parseGPTResponse', () => {
  it('should return an array of marker data for each failure', () => {
    const input = [
      {
        startLineNumber: 2,
        endLineNumber: 2,
        suggestion: 'This line fails',
        rule: '',
      },
      {
        startLineNumber: 6,
        endLineNumber: 10,
        suggestion: 'This block also fails',
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
        endLineNumber: 10,
        startColumn: 0,
        endColumn: Infinity,
        message: 'This block also fails',
        severity: 8, // MarkerSeverity.Error,
      },
    ];
    expect(parseGPTResponse(input)).toEqual(expected);
  });
});
