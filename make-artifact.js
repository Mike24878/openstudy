/* Generates artifact.html from index.html.
   The Artifact host supplies its own <!doctype>/<head>/<body> skeleton, so the
   published page must be the inner content only. Keeping this as a script means
   index.html stays the single source of truth. Run: node make-artifact.js */
const fs = require('fs');
const src = fs.readFileSync('index.html', 'utf8');
const pick = (re, what) => {
  const m = src.match(re);
  if (!m) throw new Error(`index.html has no ${what}`);
  return m[0];
};
const body = src.slice(src.indexOf('<body>') + 6, src.lastIndexOf('</body>')).trim();
if (!body) throw new Error('index.html has no <body> content');

// Font stylesheets have to travel with the page. The manifest and icon links do
// not: the artifact host supplies its own head and there is no service-worker
// scope inside it, so those would only 404.
const head = src.slice(0, src.indexOf('</head>'));
const links = (head.match(/<link\b[^>]*>/g) || [])
  .filter(tag => !/rel=["'](manifest|icon|apple-touch-icon)["']/.test(tag))
  .join('\n');

const out = `${pick(/<title>[\s\S]*?<\/title>/, '<title>')}\n${links}\n${pick(/<style>[\s\S]*?<\/style>/, '<style>')}\n${body}\n`;
for (const tag of ['<!DOCTYPE', '<html', '</html>', '<head>', '</head>', '<body>', '</body>']) {
  if (out.includes(tag)) throw new Error(`wrapper ${tag} survived the strip`);
}
fs.writeFileSync('artifact.html', out);
console.log(`artifact.html written (${out.length} bytes)`);
