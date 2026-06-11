import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// Serves the e2e fixture app (which imports react-to-print from source) for Playwright.
export default defineConfig({
    plugins: [react()],
    root: resolve(__dirname, "fixture"),
    server: {
        port: 5174,
    },
});
