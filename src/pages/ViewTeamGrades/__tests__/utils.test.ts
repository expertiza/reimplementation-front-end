import { convertBackendRoundArray } from '../utils';

describe('convertBackendRoundArray', () => {
  it('parses multiple item types correctly', () => {
    const backendRounds = [
      [
        [
          { reviewer_name: 'Alice', answer: 4, txt: 'Item 1 text', item_type: 'Criterion' },
          { reviewer_name: 'Bob', answer: 3, txt: 'Item 1 text', item_type: 'Criterion' }
        ],
        [
          { reviewer_name: 'Alice', answer: ['A', 'B'], txt: 'Item 2 text', item_type: 'Checkbox' },
          { reviewer_name: 'Bob', answer: ['B'], txt: 'Item 2 text', item_type: 'Checkbox' }
        ],
        [
          { reviewer_name: 'Alice', answer: 'Some long text response here', txt: 'Item 3 text', item_type: 'TextArea' }
        ],
        [
          { reviewer_name: 'Alice', answer: 'Option 1', txt: 'Item 4 text', item_type: 'Dropdown' }
        ],
        [
          { reviewer_name: 'Alice', fileName: 'file.pdf', fileUrl: 'http://example.com/file.pdf', txt: 'Item 5 text', item_type: 'File' }
        ]
      ]
    ];

    const converted = convertBackendRoundArray(backendRounds);
    expect(Array.isArray(converted)).toBe(true);
    const round = converted[0];
    // item counts
    expect(round.length).toBe(5);
    // Criterion -> scores
    expect(round[0].reviews[0].score).toBe(4);
    // Checkbox -> selections
    expect(round[1].reviews[0].selections).toEqual(['A', 'B']);
    // Text area -> textResponse
    expect(round[2].reviews[0].textResponse).toContain('long text');
    // Dropdown -> selectedOption
    expect(round[3].reviews[0].selectedOption).toBe('Option 1');
    // File -> fileName and fileUrl
    expect(round[4].reviews[0].fileName).toBe('file.pdf');
    expect(round[4].reviews[0].fileUrl).toBe('http://example.com/file.pdf');
  });
});
