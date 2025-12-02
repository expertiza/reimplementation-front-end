// src/setupTests.ts
import { vi } from "vitest";
import "@testing-library/jest-dom";

// Make Vitest's `vi` available as global `jest` so existing Jest-style tests work
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi;
