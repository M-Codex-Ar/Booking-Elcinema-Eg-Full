import { describe, expect, it } from "vitest";
import {
  parsePersonPage,
  parseStaticPage,
  parseVideoGallery,
  parseVideoPage,
  parseWorkPage,
} from "@/features/live/live.server";

/**
 * Fixture shaped like a real elcinema.com work page (Foundation-grid markup):
 * hidden title inputs, rating widget, intro meta lists, synopsis with a
 * read-more expander, director/writer/cast lists, 5-day showtime tabs,
 * a cast card grid and a video wrapper.
 */
const WORK_FIXTURE = `
<html><head><meta property="og:image" content="https://media0106.elcinema.com/uploads/poster.jpg"></head><body>
<h1>
  <input type="hidden" id="title-ar" value="Arabic Title">
  <span class="left" dir="ltr">Sense and Sensibility</span>
  <span class="left">(2026)</span>
  <span class="right" dir="rtl">العقل والعاطفة</span>
</h1>
<div class="intro-box">
  <ul class="button-group-vertical">
    <li><a href="/en/work/2099119/gallery/1/"><img src="https://media0106.elcinema.com/uploads/_315x420_poster.jpg"></a></li>
  </ul>
  <div class="columns small-9 large-10">
    <a title="التقييم : 5.7 - عدد 4 صوت" href="/en/work/2099119/stats"><div class="stars-orange-60"><i></i><div>5.7</div></div></a>
    <ul class="list-separator">
      <li><a href="/en/index/work/category/1">Movie</a></li>
      <li><a href="/en/index/work/country/gb">UK</a></li>
      <li>131 minutes</li>
      <li>Released</li>
    </ul>
    <ul class="list-separator">
      <li>Release Date:
        <a href="/en/index/work/release_day/10-29/">29 October</a> <a href="/en/index/work/release_year/2026/">2026</a> (Egypt)
      </li>
      <li>Genre:
        <a href="/en/index/work/genre/8">Drama</a> <a href="/en/index/work/genre/10">Romance</a>
      </li>
    </ul>
    <p>The two sisters leave their home<a href='#' id='read-more'>...Read more</a><span class='hide'> and face hardship.</span></p>
    <ul class="list-separator list-title">
      <li>Director:</li>
      <li><a href="/en/person/2256358/">Georgia Oakley</a></li>
    </ul>
    <ul class="list-separator list-title">
      <li>Writer:</li>
      <li><a href="/en/person/2002832/">Jane Austen</a></li>
    </ul>
    <ul class="list-separator list-title">
      <li>Cast:</li>
      <li><a href="/en/person/2158745/">Daisy Edgar-Jones</a></li>
      <li><a href="/en/person/2071390/">Caitríona Balfe</a></li>
    </ul>
  </div>
</div>
<div class="row">
  <div class="columns large-2"><h3 class="section-title"><a href="/en/work/2099119/theater">Playing in Egypt Cinemas</a></h3></div>
  <div class="columns large-10">
    <ul class="tabs" data-tab>
      <li class="tab-title active"><a href="#w1">Monday 02</a></li>
      <li class="tab-title"><a href="#w2">Tuesday 03</a></li>
    </ul>
    <div class="tabs-content no-margin">
      <div class="content active" id="w1">
        <div class="row">
          <div class="columns medium-5 large-5"><a href="/en/theater/3101133/">Premiere Americana Cinema</a></div>
          <div class="columns medium-5 large-5">
            <ul class="list-separator">
              <li>11:00 am</li><li class="hide">06:45 pm</li><li><a href='#' id='read-more'>...More</a></li>
            </ul>
          </div>
          <div class="columns medium-2 large-2"><a class="button orange small" href="/en/booking/2099119/3101133/"><i></i><span>tickets</span></a></div>
        </div>
        <hr />
      </div>
      <div class="content" id="w2">
        <div class="row">
          <div class="columns medium-5 large-5"><a href="/en/theater/3101219/">Premiere Point 90 Cinema</a></div>
          <div class="columns medium-5 large-5"><ul class="list-separator"><li>09:30 pm</li></ul></div>
          <div class="columns medium-2 large-2"><a class="button orange small" href="/en/booking/2099119/3101219/"><i></i><span>tickets</span></a></div>
        </div>
      </div>
    </div>
  </div>
</div>
<div class="row">
  <div class="columns large-2"><h3 class="section-title"><a href="/en/work/2099119/cast">Cast</a></h3></div>
  <div class="columns large-10">
    <ul class="small-block-grid-3">
      <li>
        <div class="thumbnail-wrapper">
          <a href="/en/person/2336158/"><img class="lazy-loaded th" data-src="https://media0106.elcinema.com/uploads/_150x200_a.jpg" src=""></a>
          <ul class="description"><li><a href="/en/person/2336158/">Bodhi Rae Breathnach</a></li></ul>
        </div>
      </li>
    </ul>
  </div>
</div>
<a href="/en/video/1029172/" class="video-wrapper" title="Trailer">
  <img class="lazy-loaded" data-src="https://media0106.elcinema.com/uploads/_640x480_v.jpg" src="">
  <span class="title">(Sense and Sensibility): Official Trailer</span>
  <span class="duration"><i></i> 02:40</span>
</a>
</body></html>
`;

const PERSON_FIXTURE = `
<html><body>
  <h1><span class="left">Bodhi Rae Breathnach</span><span class="right">بودي راي براثنخ</span></h1>
  <div class="row">
    <div class="columns large-10">
      <ul class="accordion" data-accordion>
        <li class="accordion-navigation">
          <a href="#actor"><i></i> Actor (4)</a>
          <div id="actor" class="content active">
            <ul class="small-block-grid-1 medium-block-grid-2 large-block-grid-3">
              <li>
                <ul class="small-block-grid-2">
                  <li><div class="thumbnail-wrapper"><a href="/en/work/2099107/"><img src="https://media0106.elcinema.com/uploads/_150x200_w.jpg"></a></div></li>
                  <li><ul class="unstyled"><li><a href="/en/work/2099107/">Werwulf</a></li><li>2026 - Movie</li></ul></li>
                </ul>
              </li>
              <li>
                <ul class="small-block-grid-2">
                  <li><div class="thumbnail-wrapper"><a href="/en/work/2099119/"><img src="https://media0106.elcinema.com/uploads/_150x200_s.jpg"></a></div></li>
                  <li><ul class="unstyled"><li><a href="/en/work/2099119/">Sense and Sensibility</a></li><li>2026 - Movie</li></ul></li>
                </ul>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  </div>
</body></html>
`;

describe("parseWorkPage reads the live work-page markup", () => {
  const work = parseWorkPage(WORK_FIXTURE, "en", "2099119");

  it("extracts the edition title, other-edition title and year", () => {
    expect(work.title).toBe("Sense and Sensibility");
    expect(work.altTitle).toBe("العقل والعاطفة");
    expect(work.year).toBe("2026");
  });

  it("extracts the Arabic edition title on /ar/", () => {
    const ar = parseWorkPage(WORK_FIXTURE, "ar", "2099119");
    expect(ar.title).toBe("العقل والعاطفة");
    expect(ar.altTitle).toBe("Sense and Sensibility");
  });

  it("extracts poster, rating, votes and meta", () => {
    expect(work.poster).toBe("https://media0106.elcinema.com/uploads/_315x420_poster.jpg");
    expect(work.rating).toBe(5.7);
    expect(work.votes).toBe(4);
    expect(work.category).toBe("Movie");
    expect(work.country).toBe("UK");
    expect(work.runtimeMinutes).toBe(131);
    expect(work.genres).toEqual(["Drama", "Romance"]);
    expect(work.releaseDate).toContain("29 October");
  });

  it("reads the full synopsis including the hidden continuation", () => {
    expect(work.synopsis).toContain("The two sisters leave their home");
    expect(work.synopsis).toContain("face hardship");
    expect(work.synopsis).not.toContain("Read more");
  });

  it("extracts director, writer and cast as person references", () => {
    expect(work.director.map((p) => p.id)).toEqual(["2256358"]);
    expect(work.writers.map((p) => p.title)).toEqual(["Jane Austen"]);
    expect(work.cast.map((p) => p.id)).toContain("2158745");
  });

  it("parses both showtime days with hidden times and booking links", () => {
    expect(work.showtimes).toHaveLength(2);
    expect(work.showtimes[0]!.day).toBe("Monday 02");
    expect(work.showtimes[0]!.cinemas[0]!.name).toBe("Premiere Americana Cinema");
    expect(work.showtimes[0]!.cinemas[0]!.times).toEqual(["11:00 am", "06:45 pm"]);
    expect(work.showtimes[0]!.cinemas[0]!.bookingHref).toBe(
      "https://elcinema.com/en/booking/2099119/3101133/",
    );
    expect(work.showtimes[1]!.day).toBe("Tuesday 03");
    expect(work.showtimes[1]!.cinemas[0]!.times).toEqual(["09:30 pm"]);
  });

  it("parses cast cards and elCinema TV videos", () => {
    expect(work.cast.some((p) => p.id === "2336158" && p.img !== null)).toBe(true);
    expect(work.videos).toHaveLength(1);
    expect(work.videos[0]!.id).toBe("1029172");
    expect(work.videos[0]!.title).toContain("Official Trailer");
  });

  it("parses the filmography accordion once per credit (no duplicates)", () => {
    const person = parsePersonPage(PERSON_FIXTURE, "en", "2336158");
    expect(person.name).toBe("Bodhi Rae Breathnach");
    expect(person.filmography[0]!.section).toBe("Actor (4)");
    const ids = person.filmography[0]!.items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("2099119");
  });
});

const VIDEO_FIXTURE = `
<html><body>
  <h1>(Belkis): Official Trailer <h6 class="inline subheader">stuff</h6></h1>
  <iframe src="https://www.youtube.com/embed/YUxCBcx5c8E" frameborder="0" allowfullscreen></iframe>
  <h3 class="section-title">Other Playing Now Trailers</h3>
  <div class="columns large-10">
    <a href="/en/video/1029125/" class="video-wrapper" title="Related">
      <img class="lazy-loaded" data-src="https://media0106.elcinema.com/uploads/_640x480_r.jpg" src="">
      <span class="title">Other Trailer</span>
      <span class="duration"><i></i> 01:30</span>
    </a>
  </div>
</body></html>
`;

const STATIC_FIXTURE = `
<html><body>
  <div class="row">
    <div class="columns small-12 min-body">
      <div class="row collapse">
        <ul class="breadcrumbs"><li><a href="/en/">Main</a></li><li>About elCinema.com</li></ul>
        <h1 class="section-title">About elCinema.com</h1>
        <div class="boxed-3">
          <h2>Who We Are</h2>
          <p><a href='/'>Elcinema.com</a> is the largest Arabic-language database for film, theater, and television.</p>
        </div>
        <div class="boxed-3">
          <h2>What We Offer</h2>
          <p>Elcinema.com offers an exclusive online ticket booking service.</p>
          <ul>
            <li><p>The website includes up-to-date entries of works produced in all media.</p></li>
            <li><p>The website offers an online ticket booking service.</p></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</body></html>
`;

describe("parseStaticPage reads the live static-page markup", () => {
  const page = parseStaticPage(STATIC_FIXTURE, "en");

  it("extracts the edition title from the h1", () => {
    expect(page.title).toBe("About elCinema.com");
  });

  it("groups the content into titled sections after the h1", () => {
    expect(page.sections.map((s) => s.heading)).toEqual(["Who We Are", "What We Offer"]);
  });

  it("reads prose paragraphs and list items per section", () => {
    expect(page.sections[0]!.blocks).toEqual([
      {
        type: "p",
        text: "Elcinema.com is the largest Arabic-language database for film, theater, and television.",
      },
    ]);
    expect(page.sections[1]!.blocks).toEqual([
      { type: "p", text: "Elcinema.com offers an exclusive online ticket booking service." },
      {
        type: "list",
        items: [
          "The website includes up-to-date entries of works produced in all media.",
          "The website offers an online ticket booking service.",
        ],
      },
    ]);
  });
});

describe("video scrapers", () => {
  it("extracts the YouTube embed and related videos from a video page", () => {
    const video = parseVideoPage(VIDEO_FIXTURE, "1029683");
    expect(video.embedUrl).toBe("https://www.youtube.com/embed/YUxCBcx5c8E");
    expect(video.title).toContain("Belkis");
    expect(video.related.map((v) => v.id)).toEqual(["1029125"]);
  });

  it("groups the gallery into titled sections of video cards", () => {
    const gallery = parseVideoGallery(`
      <html><body><h1>Video Gallery</h1>
      <div class="columns large-2"><h3 class="section-title inline">Series Episodes <h6 class="inline subheader">[2,262 Videos]</h6></h3></div>
      <div class="columns large-10">
        <a href="/en/video/1026495/" class="video-wrapper"><img class="lazy-loaded" data-src="https://media0106.elcinema.com/uploads/_640x480_1.jpg" src=""><span class="title">(Games 80): Full First Episode</span><span class="duration"><i></i> 52:39</span></a>
      </div>
      </body></html>`);
    expect(gallery.sections).toHaveLength(1);
    expect(gallery.sections[0]!.title).toBe("Series Episodes");
    expect(gallery.sections[0]!.count).toBe("2,262");
    expect(gallery.sections[0]!.videos[0]!.id).toBe("1026495");
    expect(gallery.sections[0]!.videos[0]!.duration).toBe("52:39");
  });
});
