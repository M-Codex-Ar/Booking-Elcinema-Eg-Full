/** Serializable view models for locally sourced public content pages. */

export interface ContentLink {
  id: string;
  title: string;
  img: string | null;
  href: string;
}

export interface ContentVideoCard {
  id: string;
  title: string;
  duration: string | null;
  img: string | null;
}

export interface ContentVideoSection {
  title: string;
  count: string | null;
  videos: ContentVideoCard[];
}

export interface ContentVideoGallery {
  title: string;
  sections: ContentVideoSection[];
}

export interface ContentVideoDetail {
  id: string;
  title: string;
  embedUrl: string | null;
  img: string | null;
  related: ContentVideoCard[];
}

export interface VodPlatform {
  id: string;
  name: string;
  img: string | null;
  cats: { label: string; vcategory: string | null }[];
}

export interface VodGuide {
  title: string;
  platforms: VodPlatform[];
}

export interface VodWorks {
  platformId: string;
  vcategory: string | null;
  works: ContentLink[];
}

export interface FeaturedList {
  id: string;
  title: string;
  cover: string | null;
}

export interface FeaturedListIndex {
  title: string;
  lists: FeaturedList[];
}

export interface FeaturedListItem {
  id: string;
  title: string;
  img: string | null;
  meta: string;
  cast: ContentLink[];
}

export interface FeaturedListDetail {
  id: string;
  title: string;
  items: FeaturedListItem[];
}

export interface StaticParagraphBlock {
  type: "p";
  text: string;
}

export interface StaticListBlock {
  type: "list";
  items: string[];
}

export type StaticContentBlock = StaticParagraphBlock | StaticListBlock;

export interface StaticContentSection {
  heading: string;
  blocks: StaticContentBlock[];
}

export interface StaticContentPage {
  title: string;
  sections: StaticContentSection[];
  image?: string | null;
}
