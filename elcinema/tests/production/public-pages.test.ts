import { expect, it } from "vitest";
import { TestDriver } from "testdriverai/vitest/hooks";

const productionOrigin = "https://elcinema-eg.vercel.app";

it("loads the public English homepage", async (context) => {
  const testdriver = TestDriver(context, { newSandbox: true });
  await testdriver.provision.chrome({ url: `${productionOrigin}/en` });

  const homepageIsReady = await testdriver.assert(
    "The elCinema homepage is loaded in English, with the elCinema brand and movie content visible.",
  );
  expect(homepageIsReady).toBeTruthy();
});

it("loads the public Arabic About page", async (context) => {
  const testdriver = TestDriver(context, { newSandbox: true });
  await testdriver.provision.chrome({ url: `${productionOrigin}/ar/about` });

  const aboutPageIsReady = await testdriver.assert(
    "The elCinema About page is loaded in Arabic, with its information visible and readable right-to-left.",
  );
  expect(aboutPageIsReady).toBeTruthy();
});
