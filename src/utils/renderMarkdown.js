import { marked } from './marked.esm.js';

/*
  renderMarkdown(md, options?): String

  Thin wrapper around the vendored marked parser. marked is a full
  CommonMark + GFM parser (~30KB minified, MIT-licensed) which gives us
  tables, task lists, autolinks, inline HTML, fenced code with language
  tags, etc. out of the box — no preprocessor hacks required.

  marked emits raw user-typed inline HTML straight through; we rely on
  sanitizeHtml downstream to enforce the allowed-tags policy. That means
  every consumer should run the output through `sanitizeHtml` before
  putting it into the DOM (MarkdownEditor's preview and Chat's bubble both
  do this).

  Options forwarded to marked:
    breaks  (default false) — true converts single newlines to <br>
            (Slack/iMessage convention; useful for chat).
    gfm     (default true)  — GitHub-flavoured features (tables, etc.).
*/

export default function renderMarkdown(md, options = {}) {
  return marked.parse(md || '', {
    gfm: true,
    breaks: false,
    ...options
  });
}
