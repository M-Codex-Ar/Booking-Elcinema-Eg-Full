import { describe, expect, it } from "vitest";
import { TestDriver } from "testdriverai/vitest/hooks";

const APP_URL = process.env.APP_URL || "https://elcinema.com";

describe("elCinema Platform", () => {
  it("browses catalogue, switches language to Arabic, and searches for movies", async (context) => {
    const testdriver = TestDriver(context);

    await testdriver.provision.chrome({ url: `${APP_URL}/en` });

    // Verify catalogue home page is loaded
    const homeAssert = await testdriver.assert(
      "the elCinema logo and movie catalogue or cinema section are visible"
    );
    expect(homeAssert).toBeTruthy();

    // Switch language to Arabic (RTL)
    await testdriver.find("عربي language switch button in the header").click();
    const arAssert = await testdriver.assert(
      "the Arabic page content is visible"
    );
    expect(arAssert).toBeTruthy();

    // Switch back to English (LTR)
    await testdriver.find("English language switch button in the header").click();

    // Search for a movie
    await testdriver.find("Search input field in the header").click();
    await testdriver.type("Wildwood");
    await testdriver.pressKeys(["enter"]);

    const searchAssert = await testdriver.assert(
      "search results or search page is visible"
    );
    expect(searchAssert).toBeTruthy();
  });

  it("opens login modal and allows entering admin credentials", async (context) => {
    const testdriver = TestDriver(context);

    await testdriver.provision.chrome({ url: `${APP_URL}/en` });

    // Open login modal
    await testdriver.find("Login button in the header").click();

    const modalAssert = await testdriver.assert(
      "the login modal or sign-in form is visible"
    );
    expect(modalAssert).toBeTruthy();

    // Fill in example credentials (seeded in scripts/seed-admin.mjs)
    await testdriver.find("Email input field in the login modal").click();
    await testdriver.type("admin@elcinema.com");

    await testdriver.find("Password input field in the login modal").click();
    await testdriver.type(process.env.TD_PASSWORD || "Admin123456!", { secret: true });

    const credsAssert = await testdriver.assert(
      "the email field contains admin@elcinema.com and password field is filled"
    );
    expect(credsAssert).toBeTruthy();

    // Close modal
    await testdriver.find("close button in the login modal").click();
  });
});
