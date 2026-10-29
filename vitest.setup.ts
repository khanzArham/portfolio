// Adds DOM matchers such as toBeInTheDocument() and toHaveAccessibleName().
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest globals are off, so Testing Library cannot register its own
// automatic cleanup. Unmount rendered trees after every test.
afterEach(() => {
  cleanup();
});
