import { describe, it, expect } from 'vitest';
import { fileDisplayName } from '../fileDisplayName';

describe('fileDisplayName', () => {
  it('returns basename for unix paths', () => {
    expect(fileDisplayName('/app/data/team/0/design_patterns_v3.pdf')).toBe('design_patterns_v3.pdf');
  });

  it('returns basename for windows-style paths', () => {
    expect(fileDisplayName('C:\\Users\\x\\notes.txt')).toBe('notes.txt');
  });

  it('returns the string when there is no directory', () => {
    expect(fileDisplayName('readme.md')).toBe('readme.md');
  });
});
