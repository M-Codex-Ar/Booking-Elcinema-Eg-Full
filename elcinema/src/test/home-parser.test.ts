import { describe, expect, it } from "vitest";
import { parseHomePage } from "@/home.server";

// Minimal fixture shaped like the live elcinema.com/en/ homepage, exercising
// the selectors the replica depends on: promo carousel, cinema movies panel,
// boxoffice table and lists table.
const FIXTURE = `
<html><body>
  <div class="swiper-default">
    <div class="swiper-slide">
      <div class="slick-caption-wrapper"><a href="/en/work/foo/"><img data-src="https://cdn.elcinema.com/promo.jpg"></a></div>
      <h5 class="section-title">Big Season Promo</h5>
      <a class="button">Book now</a>
    </div>
  </div>
  <div class="row boxed-purple">
    <h2 class="section-title">Cinema Movies In Egypt</h2>
    <div class="swiper-slide">
      <div class="thumbnail-wrapper"><img data-src="https://cdn.elcinema.com/poster-foo.jpg"></div>
      <ul><li class="title-height"><a href="/en/work/foo/">Foo Movie</a></li></ul>
      <a class="button orange minimize" href="/en/booking/foo/">Book</a>
    </div>
  </div>
  <div class="row"><div class="columns">
    <h2 class="section-title"><a href="/en/boxoffice/">Boxoffice</a></h2>
    <h6><a href="/en/boxoffice/2026/45/">Week 45 2026</a></h6>
    <table><tbody>
      <tr>
        <td><a href="/en/work/foo/">Foo Movie</a><img data-src="https://cdn.elcinema.com/box-foo.jpg"></td>
        <td>EGP 1,234,567</td>
      </tr>
    </tbody></table>
  </div></div>
  <div class="row"><div class="columns">
    <h2 class="section-title"><a href="/en/lists/">Lists</a></h2>
    <table><tbody><tr><td><a href="/en/lists/best-2026/">Best of 2026</a></td></tr></tbody></table>
  </div></div>
</body></html>
`;

describe("elcinema homepage parser", () => {
  const data = parseHomePage(FIXTURE);

  it("parses the promo carousel with image, title and button", () => {
    expect(data.promos).toHaveLength(1);
    expect(data.promos[0]!.title).toBe("Big Season Promo");
    expect(data.promos[0]!.img).toBe("https://cdn.elcinema.com/promo.jpg");
    expect(data.promos[0]!.button).toBe("Book now");
  });

  it("parses cinema movies with poster and booking link", () => {
    expect(data.movies).toHaveLength(1);
    expect(data.movies[0]!.title).toBe("Foo Movie");
    expect(data.movies[0]!.img).toBe("https://cdn.elcinema.com/poster-foo.jpg");
    expect(data.movies[0]!.bookingHref).toBe("/en/booking/foo/");
  });

  it("parses the boxoffice table with date and revenue", () => {
    expect(data.boxofficeDate).toBe("Week 45 2026");
    expect(data.boxoffice).toHaveLength(1);
    expect(data.boxoffice[0]!.title).toBe("Foo Movie");
    expect(data.boxoffice[0]!.revenue).toBe("EGP 1,234,567");
    expect(data.boxoffice[0]!.img).toBe("https://cdn.elcinema.com/box-foo.jpg");
  });

  it("parses the lists table", () => {
    expect(data.lists).toHaveLength(1);
    expect(data.lists[0]!.title).toBe("Best of 2026");
  });
});
