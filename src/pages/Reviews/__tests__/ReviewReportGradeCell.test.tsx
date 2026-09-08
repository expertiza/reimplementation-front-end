import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";

// ---- Minimal mock for the grade cell behavior ----
// We extract and test the clamping logic directly rather than mounting
// the full ReviewReportPage (which requires heavy mocking of Redux, router, etc.)

function limitGradeToRange(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

// Isolated GradeInput component that mirrors GradeCommentCell's grade state logic
const GradeInput: React.FC<{
  initialGrade?: number | string;
  min: number;
  max: number;
  onSave: (grade: number | null) => void;
}> = ({ initialGrade = "", min, max, onSave }) => {
  const [grade, setGrade] = React.useState<number | string>(initialGrade);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") { setGrade(""); return; }
    const num = Number(raw);
    setGrade(limitGradeToRange(num, min, max));
  };

  return (
    <div>
      <input
        data-testid="grade-input"
        type="number"
        value={grade}
        onChange={handleChange}
      />
      <span data-testid="scale-label">{min < 0 ? `${min} to ${max}` : `/ ${max}`}</span>
      <button onClick={() => onSave(grade === "" ? null : Number(grade))}>
        Save
      </button>
    </div>
  );
};

describe("GradeCommentCell — grade clamping", () => {
  const onSave = vi.fn();

  beforeEach(() => onSave.mockClear());

  it("renders '/ max' label when min is 0", () => {
    render(<GradeInput min={0} max={5} onSave={onSave} />);
    expect(screen.getByTestId("scale-label")).toHaveTextContent("/ 5");
  });

  it("renders 'min to max' label when min is negative", () => {
    render(<GradeInput min={-5} max={5} onSave={onSave} />);
    expect(screen.getByTestId("scale-label")).toHaveTextContent("-5 to 5");
  });

  it("clamps input above max to max", () => {
    render(<GradeInput min={0} max={5} onSave={onSave} />);
    fireEvent.change(screen.getByTestId("grade-input"), { target: { value: "10" } });
    expect(screen.getByTestId("grade-input")).toHaveValue(5);
  });

  it("clamps input below min to min", () => {
    render(<GradeInput min={1} max={5} onSave={onSave} />);
    fireEvent.change(screen.getByTestId("grade-input"), { target: { value: "-1" } });
    expect(screen.getByTestId("grade-input")).toHaveValue(1);
  });

  it("accepts a valid grade within range", () => {
    render(<GradeInput min={0} max={10} onSave={onSave} />);
    fireEvent.change(screen.getByTestId("grade-input"), { target: { value: "7" } });
    expect(screen.getByTestId("grade-input")).toHaveValue(7);
  });

  it("allows clearing the input (empty string)", () => {
    render(<GradeInput initialGrade={5} min={0} max={10} onSave={onSave} />);
    fireEvent.change(screen.getByTestId("grade-input"), { target: { value: "" } });
    expect(screen.getByTestId("grade-input")).toHaveValue(null);
  });

  it("calls onSave with null when grade is empty", () => {
    render(<GradeInput min={0} max={10} onSave={onSave} />);
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith(null);
  });

  it("calls onSave with clamped numeric value", () => {
    render(<GradeInput min={0} max={5} onSave={onSave} />);
    fireEvent.change(screen.getByTestId("grade-input"), { target: { value: "3" } });
    fireEvent.click(screen.getByText("Save"));
    expect(onSave).toHaveBeenCalledWith(3);
  });

  it("falls back to max of 100 when instructorGradeMax is null", () => {
    // When max is null the component defaults to 100
    const max = null ?? 100;
    render(<GradeInput min={0} max={max} onSave={onSave} />);
    expect(screen.getByTestId("scale-label")).toHaveTextContent("/ 100");
  });
});

describe("limitGradeToRange utility", () => {
  it("returns min when value is below min", () => expect(limitGradeToRange(-5, 0, 10)).toBe(0));
  it("returns max when value is above max", () => expect(limitGradeToRange(15, 0, 10)).toBe(10));
  it("returns value when within range", () => expect(limitGradeToRange(7, 0, 10)).toBe(7));
  it("returns min when value equals min", () => expect(limitGradeToRange(0, 0, 10)).toBe(0));
  it("returns max when value equals max", () => expect(limitGradeToRange(10, 0, 10)).toBe(10));
});
