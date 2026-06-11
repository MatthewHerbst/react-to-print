import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Ensure React Testing Library unmounts components and clears the DOM between tests
afterEach(() => {
    cleanup();
});
