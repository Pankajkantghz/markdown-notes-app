import assert from "node:assert/strict";
import test from "node:test";
import { marked } from "marked";
import { safeHref, safeMarkdownRenderer } from "./markdown.js";

test("only allows safe link protocols", () => {
  assert.equal(safeHref("https://example.com"), true);
  assert.equal(safeHref("mailto:notes@example.com"), true);
  assert.equal(safeHref("javascript:alert(1)"), false);
  assert.equal(safeHref("data:text/html,hello"), false);
});

test("renders safe links and escapes unsafe HTML", async () => {
  const html = await marked.parse(
    '<script>alert("x")</script>\n\n[ok](https://example.com) [bad](javascript:alert(1))',
    { renderer: safeMarkdownRenderer() },
  );

  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /href="https:\/\/example\.com" rel="noopener noreferrer"/);
  assert.doesNotMatch(html, /href="javascript:/);
});

test("renders only HTTPS images", async () => {
  const html = await marked.parse(
    "![safe](https://example.com/image.png) ![unsafe](http://example.com/image.png)",
    { renderer: safeMarkdownRenderer() },
  );

  assert.match(html, /<img src="https:\/\/example\.com\/image\.png"/);
  assert.match(html, /unsafe/);
  assert.doesNotMatch(html, /src="http:\/\//);
});
