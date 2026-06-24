import type { Paper } from "./citations";
import { makeBibKey, makeId } from "./citations";

type CrossrefAuthor = { given?: string; family?: string; name?: string };
type CrossrefWork = {
  title?: string[];
  author?: CrossrefAuthor[];
  issued?: { "date-parts"?: number[][] };
  "container-title"?: string[];
  DOI?: string;
  URL?: string;
  abstract?: string;
  subject?: string[];
};

function cleanDoi(input: string): string {
  return input
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:/i, "");
}

export async function fetchByDoi(rawDoi: string): Promise<Paper> {
  const doi = cleanDoi(rawDoi);
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
  if (!res.ok) throw new Error(`Crossref returned ${res.status}`);
  const json = (await res.json()) as { message: CrossrefWork };
  const w = json.message;
  const authors = (w.author || []).map((a) =>
    a.name ? a.name : [a.given, a.family].filter(Boolean).join(" "),
  );
  const year = w.issued?.["date-parts"]?.[0]?.[0] ?? null;
  const title = (w.title?.[0] || "").replace(/\s+/g, " ").trim();
  const venue = w["container-title"]?.[0] || "";
  const abstract = (w.abstract || "").replace(/<[^>]+>/g, "").trim();
  return {
    id: makeId(),
    title,
    authors,
    year,
    venue,
    doi,
    url: w.URL || `https://doi.org/${doi}`,
    abstract,
    tags: w.subject?.slice(0, 4) || [],
    bibKey: makeBibKey(authors, year, title),
    addedAt: Date.now(),
  };
}
