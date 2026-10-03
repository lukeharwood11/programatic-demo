import { defineFlow } from "../scripts/lib/flow";

/**
 * Teacher signs in and creates their first course on local CourseWright.
 * Start URL: DEMO_URL_FIRST_COURSE (http://127.0.0.1:5173/login).
 * Password: DEMO_QA_PASSWORD (not hardcoded).
 */
const EMAIL = "quinn@coursewright.com";
const PASSWORD = process.env.DEMO_QA_PASSWORD;
const COURSE = "Algebra I";
const ORG = "Home Grove Academy";

if (!PASSWORD) {
  throw new Error("Set DEMO_QA_PASSWORD in .env before shooting first-course.");
}

export default defineFlow({
  name: "first-course",
  viewport: { width: 1920, height: 1080 },
  startUrl: process.env.DEMO_URL_FIRST_COURSE,
  ready: async (page) => page.getByLabel("Email").isVisible().catch(() => false),
  steps: [
    { pause: 700 },
    { type: "Email", text: EMAIL, cluster: "signin", after: 450 },
    { type: "Password", text: PASSWORD, cluster: "signin", after: 400 },
    { click: "Sign in", cluster: "signin", after: 200 },
    {
      do: async (ctx) => {
        await ctx.page.waitForURL(/\/my(\/|$|\?)/, { timeout: 25000 });
        await ctx.page
          .getByRole("link", { name: ORG, exact: true })
          .first()
          .waitFor({ state: "visible", timeout: 20000 });
      },
    },
    { click: ORG, cluster: "org", after: 1100 },
    {
      do: async (ctx) => {
        await ctx.page
          .getByRole("heading", { name: "Overview" })
          .waitFor({ timeout: 20000 });
        await ctx.page
          .getByRole("link", { name: "Create course", exact: true })
          .first()
          .waitFor({ state: "visible" });
      },
    },
    { click: "Create course", cluster: "open", after: 300 },
    {
      do: async (ctx) => {
        await ctx.page
          .getByRole("heading", { name: "Create course" })
          .waitFor({ timeout: 20000 });
        await ctx.page.getByLabel("Title").waitFor({ state: "visible" });
      },
    },
    { hoist: "Create course" },
    { type: "Title", text: COURSE, cluster: "form", after: 700 },
    { click: "Create course", cluster: "create", after: 250 },
    {
      do: async (ctx) => {
        const heading = ctx.page.getByRole("heading", { name: COURSE });
        const text = ctx.page.getByText(COURSE, { exact: true }).first();
        await heading
          .waitFor({ state: "visible", timeout: 20000 })
          .catch(() => text.waitFor({ state: "visible", timeout: 10000 }));
      },
    },
    { focus: COURSE, cluster: "result", after: 1600 },
  ],
});
