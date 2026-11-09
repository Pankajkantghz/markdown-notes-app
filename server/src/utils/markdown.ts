import { Renderer } from "marked";

const htmlEntities: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => htmlEntities[character] ?? character);

export const safeHref = (href: string): boolean => {
  if (href.startsWith("#")) return true;
  try {
    const protocol = new URL(href, "https://markdown-notes.invalid").protocol;
    return protocol === "http:" || protocol === "https:" || protocol === "mailto:";
  } catch {
    return false;
  }
};

export const safeMarkdownRenderer = (): Renderer => {
  const renderer = new Renderer();

  renderer.html = ({ text }) => escapeHtml(text);
  renderer.link = function ({ href, title, tokens }) {
    const label = this.parser.parseInline(tokens);
    if (!safeHref(href)) return label;

    const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
    return `<a href="${escapeHtml(href)}"${titleAttribute} rel="noopener noreferrer">${label}</a>`;
  };
  renderer.image = ({ href, title, text }) => {
    if (!href.startsWith("https://")) return escapeHtml(text);

    const titleAttribute = title ? ` title="${escapeHtml(title)}"` : "";
    return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${titleAttribute} loading="lazy" referrerpolicy="no-referrer">`;
  };

  return renderer;
};
