/**
 * Builds the /manhaj curriculum pages from data/curriculum.json.
 *
 * Run it by hand after replacing the snapshot, then commit what it writes:
 *
 *   node tools-build-curriculum.mjs
 *
 * There is deliberately no build step on deploy. Vercel serves this repo as
 * static files; keeping the generated HTML in git means what ships is exactly
 * what was reviewed, and a broken generator cannot take the site down.
 *
 * ## Where the data comes from
 *
 * data/curriculum.json is a snapshot exported from the Iqraa repo's
 * lib/curriculum catalog — it is NOT authored here. Regenerate it there when
 * the curriculum changes. The export drops any grade/subject whose lessons
 * carry no objectives and no key terms, because a page listing nothing but
 * lesson titles is exactly the thin page Google's scaled-content policy is
 * aimed at. Nine combinations were excluded on those grounds, and that is the
 * point: a page we cannot make genuinely useful should not exist. Raising that
 * threshold to include them would be the easiest way to undo this work.
 *
 * ## Why unit descriptions are not rendered
 *
 * The catalog's unit descriptionAr is, for 339 of 379 units, that unit's own
 * lesson titles joined with a middot. Printing it above the lesson list would
 * show a reader the same words twice and hand a search engine a page padded
 * with its own content. The unit contributes its name; the lessons carry the
 * rest.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SITE = 'https://www.iqrra.com';
const all = JSON.parse(readFileSync(new URL('./data/curriculum.json', import.meta.url), 'utf8'));

/**
 * A page earns its URL by carrying the learning outcomes, not by existing.
 *
 * The snapshot holds every grade/subject the catalog can describe. Eleven of
 * them — social studies, geography, history, civics, PE — print no نتاجات
 * التعلُّم in their NCCD books at all, so their lessons arrive with key terms
 * and nothing else. Rendered, that is a table of contents with vocabulary
 * tags: little for a teacher to read and nothing a search engine has not seen
 * on the ministry's own site. Google's quality assessment is site-wide, so
 * eleven weak pages are not a neutral addition to thirty-eight strong ones.
 *
 * The gate lives here rather than in the export so it is visible in review and
 * so a later snapshot — the same subjects with outcomes extracted — starts
 * publishing them by simply being regenerated. Lower this number and you are
 * choosing page count over the thing that makes the pages worth having.
 */
const MIN_OBJECTIVE_COVERAGE = 0.5;

const coverage = (p) => {
  const ls = p.books.flatMap((b) => b.units.flatMap((u) => u.lessons));
  return ls.length ? ls.filter((l) => l.objectivesAr.length).length / ls.length : 0;
};

const data = all.filter((p) => coverage(p) >= MIN_OBJECTIVE_COVERAGE);
const dropped = all.filter((p) => coverage(p) < MIN_OBJECTIVE_COVERAGE);

/** HTML-escape. Arabic needs no transliteration; quotes and angle brackets do. */
const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * grade-10 + chemistry -> grade-10-chemistry. Latin slugs on purpose: an
 * Arabic path percent-encodes into an unreadable URL the moment anyone copies
 * it into a message, which is how teachers actually pass links around.
 */
const slug = (p) => p.gradeId + '-' + p.subjectId;

const head = (title, desc, path, ld) => `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="canonical" href="${SITE}${path}">
<meta property="og:type" content="article">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:locale" content="ar_JO">
<meta property="og:site_name" content="اقرأ">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${SITE}/img/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#00A99D">
<script type="application/ld+json">
${JSON.stringify(ld, null, 1)}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/manhaj.css">
</head>
<body>
<header>
  <div class="wrap">
    <a class="brand" href="/">
      <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true" style="background:var(--teal);border-radius:9px;padding:4px">
        <path d="M4.6 20.2c-.6-6.6 2.2-12.2 8.4-15.6 2.1-1.2 4.3-1.9 6.4-2.1.5 6.9-2.2 12.4-8 16.1-2.1 1.3-4.4 2-6.8 1.6z" fill="#fff"/>
        <circle cx="17.8" cy="20.4" r="2.05" fill="#34D6C6"/>
      </svg>
      اقرأ
    </a>
    <div class="head-cta">
      <a class="btn-sm btn-sm-primary" href="https://app.iqrra.com">افتح في المتصفح</a>
      <a class="btn-sm" href="/download">تحميل أندرويد</a>
    </div>
  </div>
</header>
`;

const foot = `
<footer>
  اقرأ · نسخة تجريبية · مساعد المعلّم العربي · الأردن ٢٠٢٦
  <br>للتواصل: <a class="mail" href="mailto:info@iqrra.com">info@iqrra.com</a>
  <br><a href="/privacy">سياسة الخصوصية</a>
</footer>
</body>
</html>
`;

/** BreadcrumbList is the one type here Google still renders as a rich result. */
const crumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: it.name,
    item: SITE + it.path,
  })),
});

/**
 * Counts are labelled rather than agreed: "الوحدات: 8", never "8 وحدات".
 * Arabic counted nouns take four forms depending on the number, so any
 * template interpolating the noun gets most of them wrong. A label carries no
 * number agreement at all, so nothing here can drift out of grammar.
 */
const countPair = (units, lessons) => `الوحدات: ${units} · الدروس: ${lessons}`;

function subjectPage(p) {
  // "لكل درس" only when it is true. Coverage runs from 66% to 100%, and a lede
  // promising outcomes on every lesson of a 66% page is a claim the reader can
  // disprove by scrolling — the fastest way to lose someone who came from search.
  const everyLesson = coverage(p) > 0.95;
  const outcomesPhrase = everyLesson ? 'نتاجات التعلّم لكل درس' : 'نتاجات التعلّم';

  const title = `منهاج ${p.subjectAr} ${p.gradeAr} — الوحدات والدروس ونتاجات التعلّم`;
  const desc = `وحدات ودروس منهاج ${p.subjectAr} ${p.gradeAr} في الأردن (${countPair(p.counts.units, p.counts.lessons)}) `
    + `مع ${outcomesPhrase}، وفق مناهج وزارة التربية والتعليم.`;
  const path = `/manhaj/${slug(p)}`;

  const ld = crumbs([
    { name: 'اقرأ', path: '/' },
    { name: 'المناهج', path: '/manhaj' },
    { name: `${p.subjectAr} ${p.gradeAr}`, path },
  ]);

  let b = `<main class="wrap">
<nav class="crumbs" aria-label="مسار التنقل">
  <a href="/">الرئيسية</a> <span aria-hidden="true">←</span> <a href="/manhaj">المناهج</a> <span aria-hidden="true">←</span> <span class="here">${esc(p.subjectAr)} ${esc(p.gradeAr)}</span>
</nav>
<h1>منهاج ${esc(p.subjectAr)} ${esc(p.gradeAr)}</h1>
<p class="lede">
  شجرة منهاج ${esc(p.subjectAr)} ${esc(p.gradeAr)} كما يصدرها المركز الوطني لتطوير المناهج:
  ${countPair(p.counts.units, p.counts.lessons)}، مع ${outcomesPhrase} والمفاهيم الأساسية.
  يبني اقرأ من هذه النتاجات نفسها خطة الدرس وورقة العمل والاختبار القصير.
</p>
<p class="cta-inline"><a class="btn btn-primary" href="https://app.iqrra.com">حضّر درسًا من هذا المنهاج</a></p>
`;

  for (const bk of p.books) {
    b += `\n<section class="sem">\n<h2>${esc(bk.semester)}</h2>\n`;
    for (const u of bk.units) {
      b += `<article class="unit">\n<h3>${esc(u.nameAr)}</h3>\n`;
      if (u.lessons.length) {
        b += `<ol class="lessons">\n`;
        for (const l of u.lessons) {
          b += `<li>\n<span class="ltitle">${esc(l.titleAr)}</span>\n`;
          if (l.objectivesAr.length) {
            b += `<div class="obj"><span class="lbl">نتاجات التعلّم</span>\n<ul>\n`;
            for (const o of l.objectivesAr) b += `<li>${esc(o)}</li>\n`;
            b += `</ul>\n</div>\n`;
          }
          if (l.keywordsAr.length) {
            b += `<div class="terms"><span class="lbl">المفاهيم والمصطلحات</span> `
              + l.keywordsAr.map((k) => `<span class="term">${esc(k)}</span>`).join(' ')
              + `</div>\n`;
          }
          b += `</li>\n`;
        }
        b += `</ol>\n`;
      }
      b += `</article>\n`;
    }
    b += `</section>\n`;
  }

  // Sideways links. Without these every page is a dead end reachable only from
  // /manhaj, and a crawler has to return to the index between each one.
  const sibs = data.filter((o) => o.gradeId === p.gradeId && o.subjectId !== p.subjectId);
  if (sibs.length) {
    b += `\n<section class="siblings">\n<h2>مواد أخرى في ${esc(p.gradeAr)}</h2>\n<ul class="pills">\n`;
    for (const s of sibs) b += `<li><a href="/manhaj/${slug(s)}">${esc(s.subjectAr)}</a></li>\n`;
    b += `</ul>\n</section>\n`;
  }

  b += `\n<section class="closing">
<h2>حضّر حصّة من منهاج ${esc(p.subjectAr)}</h2>
<p>اختر الدرس من شجرة المنهاج، واطلب خطة درس أو ورقة عمل أو اختبارًا قصيرًا — بالعربية، جاهزًا للطباعة.</p>
<p><a class="btn btn-primary" href="https://app.iqrra.com">ابدأ من المتصفح</a>
   <a class="btn" href="/download">تحميل تطبيق أندرويد</a></p>
</section>
</main>`;

  return head(title, desc, path, ld) + b + foot;
}

function indexPage() {
  const title = 'المناهج الأردنية: الصفوف والمواد والوحدات | اقرأ';
  const desc = 'تصفّح الصفوف والمواد والوحدات والدروس ونتاجات التعلّم المتاحة في المنهاج الأردني، '
    + 'وابدأ تحضير مواد حصّتك باستخدام اقرأ.';
  const ld = crumbs([{ name: 'اقرأ', path: '/' }, { name: 'المناهج', path: '/manhaj' }]);

  const grades = [...new Set(data.map((p) => p.gradeId))]
    .sort((a, x) => Number(x.split('-')[1]) - Number(a.split('-')[1]));

  let b = `<main class="wrap">
<nav class="crumbs" aria-label="مسار التنقل">
  <a href="/">الرئيسية</a> <span aria-hidden="true">←</span> <span class="here">المناهج</span>
</nav>
<h1>تصفّح المناهج الأردنية</h1>
<p class="lede">
  اختر الصف، ثم المادة، لتصل إلى الوحدات والدروس ونتاجات التعلّم في المنهاج الأردني.
  المواد المتاحة حاليًا تغطي عددًا من مواد الصفوف من السادس إلى العاشر، ونعمل على إضافة المزيد باستمرار.
</p>
`;
  for (const g of grades) {
    const subs = data.filter((p) => p.gradeId === g);
    const units = subs.reduce((n, p) => n + p.counts.units, 0);
    const lessons = subs.reduce((n, p) => n + p.counts.lessons, 0);
    b += `\n<section class="grade">
<h2>${esc(subs[0].gradeAr)}</h2>
<p class="gmeta">المواد: ${subs.length} · ${countPair(units, lessons)}</p>
<ul class="cards">\n`;
    for (const p of subs) {
      b += `<li><a href="/manhaj/${slug(p)}">
  <span class="cname">${esc(p.subjectAr)}</span>
  <span class="cmeta">${countPair(p.counts.units, p.counts.lessons)}</span>
</a></li>\n`;
    }
    b += `</ul>\n</section>\n`;
  }
  // Eleven grade/subject pairs are withheld as too thin to publish, so a
  // reader whose subject is missing needs somewhere to go other than away.
  b += `\n<p class="missing">لم تجد صفّك أو مادتك؟ <a href="/#feedback">أخبرنا بما تحتاجه</a> وسنضعه ضمن أولويات الإضافة.</p>\n`;
  b += `</main>`;
  return head(title, desc, '/manhaj', ld) + b + foot;
}

const root = new URL('./', import.meta.url);
mkdirSync(new URL('./manhaj/', root), { recursive: true });

writeFileSync(new URL('./manhaj.html', root), indexPage(), 'utf8');
for (const p of data) {
  writeFileSync(new URL(`./manhaj/${slug(p)}.html`, root), subjectPage(p), 'utf8');
}

// The sitemap is generated here so it cannot drift from what was written.
// /download and /editorial stay out: both are noindex, and listing a noindex
// URL in a sitemap is a contradiction Search Console reports as an error.
// /privacy is hand-written rather than generated, but it belongs in the
// sitemap: Google Play requires a reachable privacy URL, and a page nothing
// links to from a crawlable path is a page Google may never confirm exists.
const urls = ['/', '/manhaj', '/privacy', ...data.map((p) => `/manhaj/${slug(p)}`)];
writeFileSync(new URL('./sitemap.xml', root),
  `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Generated by tools-build-curriculum.mjs — edit that, not this file.
  No <priority> or <changefreq>: Google ignores both and they only rot.
-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n')}
</urlset>
`, 'utf8');

console.log(`wrote manhaj.html + ${data.length} subject pages + sitemap.xml (${urls.length} urls)`);
if (dropped.length) {
  console.log(`\nheld back ${dropped.length} with objective coverage under ${MIN_OBJECTIVE_COVERAGE * 100}%:`);
  for (const p of dropped) {
    console.log(`  ${p.gradeId}/${p.subjectId} — ${Math.round(coverage(p) * 100)}% of ${p.counts.lessons} lessons`);
  }
  console.log('These publish themselves once their books\' outcomes reach the snapshot.');
}
