export type Paper = {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  venue: string;
  doi: string;
  url: string;
  abstract: string;
  tags: string[];
  bibKey: string;
  addedAt: number;
};

const KEY = "refdesk.papers.v1";

export function loadPapers(): Paper[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Paper[];
  } catch {
    return [];
  }
}

export function savePapers(papers: Paper[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(papers));
}

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function makeBibKey(authors: string[], year: number | null, title: string): string {
  const last = (authors[0] || "anon").split(/\s+/).pop() || "anon";
  const y = year ?? "nd";
  const word =
    title
      .toLowerCase()
      .split(/\s+/)
      .find((w) => w.length > 3 && !/^(the|with|from|using|toward|towards|into|over|under|about)$/.test(w)) || "ref";
  return `${slug(last)}${y}${slug(word)}`;
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function toBibTeX(p: Paper): string {
  const isConf = /proc|conference|workshop|symposium|ICML|NeurIPS|CVPR|ACL|EMNLP|ICLR|SIGGRAPH|KDD/i.test(p.venue);
  const type = isConf ? "inproceedings" : p.venue ? "article" : "misc";
  const fields: [string, string][] = [];
  if (p.title) fields.push(["title", `{${p.title}}`]);
  if (p.authors.length) fields.push(["author", p.authors.join(" and ")]);
  if (p.year) fields.push(["year", String(p.year)]);
  if (p.venue) fields.push([isConf ? "booktitle" : "journal", p.venue]);
  if (p.doi) fields.push(["doi", p.doi]);
  if (p.url) fields.push(["url", p.url]);
  const body = fields.map(([k, v]) => `  ${k} = {${v}}`).join(",\n");
  return `@${type}{${p.bibKey},\n${body}\n}`;
}

export function exportAllBib(papers: Paper[]): string {
  return papers.map(toBibTeX).join("\n\n") + "\n";
}
