/**
 * Loads and validates the site content in src/data/. A typo in one of the
 * YAML files fails the build with a readable message instead of producing a
 * broken page.
 */
import { parse } from "yaml";
import { z } from "astro/zod";
import profileSrc from "../data/profile.yaml?raw";
import newsSrc from "../data/news.yaml?raw";
import publicationsSrc from "../data/publications.yaml?raw";
import teachingSrc from "../data/teaching.yaml?raw";
import talksSrc from "../data/talks.yaml?raw";

/** YAML leaves empty keys as `null`; treat them as "not set". */
function dropNulls(value: unknown): unknown {
  if (Array.isArray(value)) return value.filter((v) => v !== null).map(dropNulls);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, v]) => v !== null && v !== "")
        .map(([k, v]) => [k, dropNulls(v)]),
    );
  }
  return value;
}

function load<T extends z.ZodType>(file: string, source: string, schema: T): z.output<T> {
  const result = schema.safeParse(dropNulls(parse(source) ?? undefined));
  if (!result.success) {
    throw new Error(`Invalid content in src/data/${file}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

/** Accepts `2026-09-01`, `2026-09` or `2026`. */
const MonthDate = z
  .union([z.string(), z.number(), z.date()])
  .transform((value, ctx) => {
    if (value instanceof Date) return value;
    const m = String(value).trim().match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?$/);
    if (!m) {
      ctx.addIssue({ code: "custom", message: `Expected a date like 2026-09-01 or 2026-09, got "${value}"` });
      return z.NEVER;
    }
    return new Date(Date.UTC(Number(m[1]), Number(m[2] ?? 1) - 1, Number(m[3] ?? 1)));
  });

const Link = z.object({ label: z.string(), url: z.string() });
const Person = z.object({ name: z.string(), url: z.string().optional() });
const Org = z.object({ name: z.string(), url: z.string().optional() });

const Profile = z.object({
  name: z.string(),
  author_names: z.array(z.string()).default([]),
  position: z.string(),
  field: z.string().optional(),
  department: Org.optional(),
  institution: Org.optional(),
  location: z.string().optional(),
  photo: z.string().optional(),
  advisors: z.array(Person).default([]),
  email: z.string().optional(),
  cv: z.string().optional(),
  interests: z.array(z.string()).default([]),
  address: z.array(z.string()).default([]),
  links: z
    .object({
      google_scholar: z.string(),
      dblp: z.string(),
      arxiv: z.string(),
      orcid: z.string(),
      github: z.string(),
      linkedin: z.string(),
      bluesky: z.string(),
      mastodon: z.string(),
      twitter: z.string(),
    })
    .partial()
    .default({}),
  news_limit: z.number().int().positive().default(5),
});

const NewsItem = z.object({ date: MonthDate, text: z.string() });

const Publication = z.object({
  title: z.string(),
  authors: z.array(z.string()).min(1),
  year: z.coerce.number().int(),
  venue: z.string().optional(),
  venue_full: z.string().optional(),
  type: z.enum(["conference", "journal", "preprint", "thesis", "manuscript", "workshop"]).default("conference"),
  note: z.string().optional(),
  award: z.string().optional(),
  links: z.array(Link).default([]),
  abstract: z.string().optional(),
  bibtex: z.string().optional(),
});

const TeachingItem = z.object({
  course: z.string(),
  role: z.string().optional(),
  institution: z.string().optional(),
  term: z.string().optional(),
  instructor: z.string().optional(),
  url: z.string().optional(),
});

const Talk = z.object({
  title: z.string(),
  event: z.string().optional(),
  location: z.string().optional(),
  date: MonthDate,
  links: z.array(Link).default([]),
});

export type Profile = z.output<typeof Profile>;
export type Publication = z.output<typeof Publication>;
export type NewsItem = z.output<typeof NewsItem>;
export type TeachingItem = z.output<typeof TeachingItem>;
export type Talk = z.output<typeof Talk>;

export const profile = load("profile.yaml", profileSrc, Profile);

const byDateDesc = <T extends { date: Date }>(a: T, b: T) => b.date.getTime() - a.date.getTime();

export const news = load("news.yaml", newsSrc, z.array(NewsItem).default([])).sort(byDateDesc);
export const publications = load("publications.yaml", publicationsSrc, z.array(Publication).default([]));
export const teaching = load("teaching.yaml", teachingSrc, z.array(TeachingItem).default([]));
export const talks = load("talks.yaml", talksSrc, z.array(Talk).default([])).sort(byDateDesc);

/** Publications grouped by year, newest year first; order within a year is kept. */
export const publicationsByYear: Array<[number, Publication[]]> = [
  ...publications.reduce((groups, pub) => {
    groups.set(pub.year, [...(groups.get(pub.year) ?? []), pub]);
    return groups;
  }, new Map<number, Publication[]>()),
].sort(([a], [b]) => b - a);

const myNames = new Set([profile.name, ...profile.author_names].map((n) => n.trim().toLowerCase()));
export const isMe = (author: string) => myNames.has(author.trim().toLowerCase());

export const formatMonth = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
