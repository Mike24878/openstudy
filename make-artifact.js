/* Build step. Two jobs:

   1. Generate artifact.html from index.html. The Artifact host supplies its own
      <!doctype>/<head>/<body> skeleton, so the published page must be the inner
      content only.
   2. Stamp the service worker's cache name with a hash of index.html. Without
      this the cache name never changes, the shell cached on a first visit is
      never replaced, and deploys silently fail to reach anyone who has already
      opened the site. That happened for fourteen releases.

   Run: node make-artifact.js */
const fs = require('fs');
const crypto = require('crypto');

const src = fs.readFileSync('index.html', 'utf8');

/* ---------- artifact build ---------- */
const pick = (re, what) => {
  const m = src.match(re);
  if (!m) throw new Error(`index.html has no ${what}`);
  return m[0];
};
const body = src.slice(src.indexOf('<body>') + 6, src.lastIndexOf('</body>')).trim();
if (!body) throw new Error('index.html has no <body> content');

// Font stylesheets travel with the page; the manifest and icon links do not,
// since the artifact host supplies its own head and has no service-worker scope.
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

/* ---------- service worker stamp ---------- */
const stamp = crypto.createHash('sha1').update(src).digest('hex').slice(0, 12);
const swPath = 'sw.js';
if (fs.existsSync(swPath)) {
  const sw = fs.readFileSync(swPath, 'utf8');
  const next = sw.replace(/const VERSION = '[^']*';/, `const VERSION = '${stamp}';`);
  if (next === sw && !sw.includes(`const VERSION = '${stamp}';`)) {
    throw new Error('sw.js has no VERSION line to stamp');
  }
  if (next !== sw) {
    fs.writeFileSync(swPath, next);
    console.log(`sw.js cache stamped ${stamp}`);
  } else {
    console.log(`sw.js already at ${stamp}`);
  }
}
