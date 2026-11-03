import { describe, expect, it } from "vitest";
import { bookingLink, cardLink } from "@/lib/links";

/**
 * The user's routing rule: no elcinema.com click may ever leave the app.
 * Every scraped path shape must resolve to an internal href (external:false);
 * only non-elcinema hosts stay external.
 */
describe("cardLink keeps every elcinema path inside the app", () => {
  it("keeps ticket buttons in app even when the provider URL is external", () => {
    expect(
      bookingLink("ar", "https://tickets.example/show/1", "/en/work/2099119/", "Unknown film"),
    ).toBe("/ar/booking/2099119");
  });

  it("falls back to the in-app booking index if no movie id is available", () => {
    expect(bookingLink("en", "https://tickets.example/show/1", null)).toBe("/en/booking");
  });

  it("maps work cards to internal work pages", () => {
    const link = cardLink("en", "/en/work/2099119/", "Sense and Sensibility");
    expect(link.external).toBe(false);
    expect(link.href).toBe("/en/work/2099119");
  });

  it("maps person cards to internal person pages", () => {
    const link = cardLink("ar", "/en/person/2336158/", "Bodhi Rae Breathnach");
    expect(link.external).toBe(false);
    expect(link.href).toBe("/ar/person/2336158");
  });

  it("maps booking links to the internal booking page", () => {
    const index = cardLink("en", "/en/booking/");
    expect(index).toEqual({ href: "/en/booking", external: false });
    const movie = cardLink("en", "/en/booking/2099119/");
    expect(movie).toEqual({ href: "/en/booking/2099119", external: false });
  });

  it("maps the Videos section and video cards internally", () => {
    expect(cardLink("en", "/en/video/")).toEqual({ href: "/en/video", external: false });
    expect(cardLink("en", "/en/video/1029683/")).toEqual({
      href: "/en/video/1029683",
      external: false,
    });
  });

  it("maps the Watch Online section internally", () => {
    expect(cardLink("en", "/en/vod/")).toEqual({ href: "/en/vod", external: false });
    expect(cardLink("en", "/en/vod/58268988/works/?vcategory=19")).toEqual({
      href: "/en/vod",
      external: false,
    });
  });

  it("maps Lists (lineup) links internally", () => {
    expect(cardLink("en", "/en/lineup/")).toEqual({ href: "/en/lineup", external: false });
    expect(cardLink("en", "/en/lineup/12312453/")).toEqual({
      href: "/en/lineup/12312453",
      external: false,
    });
  });

  it("keeps the existing sections and unknown paths internal", () => {
    expect(cardLink("en", "/en/now/").external).toBe(false);
    expect(cardLink("ar", "/en/soon/").href).toBe("/ar/soon");
    expect(cardLink("en", "/en/seasonals/ramadan/")).toEqual({ href: "/en", external: false });
    expect(cardLink("en", "/en/tvguide/2/").external).toBe(false);
  });

  it("matches sample movies by title and keeps their internal detail page", () => {
    const link = cardLink("en", "/en/work/9999999/", "The Giza Job");
    expect(link.external).toBe(false);
    expect(link.href).toMatch(/^\/en\/work\/\d+$/);
  });

  it("only links to other hosts stay external (and in a new tab)", () => {
    const link = cardLink("en", "https://www.youtube.com/watch?v=abc", "Trailer");
    expect(link.external).toBe(true);
  });
});
