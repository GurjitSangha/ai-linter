import { describe, expect, it } from 'vitest';
import parseGPTResponse from './parseGPTResponse';

describe('parseGPTResponse', () => {
  it('should return an array of marker data for each failure', () => {
    const input = '2: This line fails \n 6: This line also fails';
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
