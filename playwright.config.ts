import { defineConfig, devices } from "@playwright/test";

const PORT = 5174;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
    testDir: "./e2e",
    testMatch: "**/*.spec.ts",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? "github" : "list",
    use: {
        baseURL: BASE_URL,
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "vite -c e2e/vite.config.ts",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
