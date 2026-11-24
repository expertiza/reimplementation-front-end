import { fireEvent, render, screen } from "@testing-library/react";
import DebouncedInput from "./DebouncedInput";

// Regression: Table's filter inputs are sometimes rendered inside a
// page-level <form> (e.g. the Formik form wrapping the whole assignment
// editor, including its Topics tab). Without this guard, pressing Enter
// while searching bubbles up as that form's implicit submit — on the
// assignment editor this saves the assignment and navigates away (e.g.
// back to /courses) just because the user was typing into a search box.
//
// jsdom does not implement the browser's native "Enter implicitly submits
// the enclosing form" behavior, so a real <form> here would never actually
// submit either way. What we can assert directly, and what the real
// browser behavior is conditioned on, is whether the keydown's default
// action (which triggers that implicit submit) was prevented.
describe("DebouncedInput Enter-key handling", () => {
  it("prevents Enter from triggering a surrounding form's implicit submit", () => {
    render(
      <form>
        <DebouncedInput value="" onChange={() => {}} placeholder="Search" />
      </form>
    );

    const input = screen.getByPlaceholderText("Search");
    // fireEvent.* returns false when the event was cancelable and
    // preventDefault() was called on it.
    const notCancelled = fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    expect(notCancelled).toBe(false);
  });

  it("leaves other keys alone", () => {
    render(
      <form>
        <DebouncedInput value="" onChange={() => {}} placeholder="Search" />
      </form>
    );

    const input = screen.getByPlaceholderText("Search");
    const notCancelled = fireEvent.keyDown(input, { key: "a", code: "KeyA" });
    expect(notCancelled).toBe(true);
  });
});
