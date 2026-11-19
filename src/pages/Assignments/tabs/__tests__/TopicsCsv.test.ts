import { looksLikeHeaderRow, parseCsvLine } from "../TopicsTab";

describe("looksLikeHeaderRow", () => {
  it("recognises a header row", () => {
    expect(
      looksLikeHeaderRow(
        parseCsvLine("topic_name,topic_identifier,category,max_choosers,description,link")
      )
    ).toBe(true);
    expect(looksLikeHeaderRow(parseCsvLine("Topic Name, Topic Identifier, Category"))).toBe(true);
  });

  // Regression: matching on the first field alone silently discarded this row.
  it("keeps a real topic whose name happens to be 'Topic Name'", () => {
    expect(looksLikeHeaderRow(parseCsvLine('"Topic Name",TN001,Technical,2,desc,'))).toBe(false);
  });

  it("is not fooled by a one-field row", () => {
    expect(looksLikeHeaderRow(parseCsvLine("topic_name"))).toBe(false);
  });
});

describe("parseCsvLine", () => {
  it("splits a plain row on commas and trims each field", () => {
    expect(parseCsvLine("Database Design, DB001, Technical, 2, schema, http://x")).toEqual([
      "Database Design",
      "DB001",
      "Technical",
      "2",
      "schema",
      "http://x",
    ]);
  });

  it("keeps a comma that sits inside a quoted field, and drops the quotes", () => {
    expect(parseCsvLine('"Design, build and test",DB2,cat,1,d,')).toEqual([
      "Design, build and test",
      "DB2",
      "cat",
      "1",
      "d",
      "",
    ]);
  });

  it("treats a doubled quote as an escaped quote", () => {
    expect(parseCsvLine('"He said ""hi""",ID1')).toEqual(['He said "hi"', "ID1"]);
  });

  it("returns empty strings for missing trailing fields", () => {
    expect(parseCsvLine("Only a name,,,")).toEqual(["Only a name", "", "", ""]);
  });
});
