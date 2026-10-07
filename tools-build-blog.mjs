/**
 * Builds /blog and its posts from data/blog-*.json.
 *
 * Run it by hand after editing the data, then commit what it writes:
 *
 *   node tools-build-blog.mjs
 *
 * Same contract as tools-build-curriculum.mjs: no build step on deploy, the
 * generated HTML is committed, and a broken generator cannot take the site
 * down. The sitemap is NOT written here — tools-build-curriculum.mjs owns that
 * one file and reads data/blog-posts.json for the blog URLs, so there is only
 * ever one writer.
 *
 * ## Why the cards are rendered here and not by the page's JS
 *
 * A blog post is a page we want indexed. Rendering a hundred cards client-side
 * would leave the crawler an empty shell and the filter chips would be the only
 * content in the HTML. So the cards ship as markup; the JS on the page only
 * filters, searches and copies what is already there.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const root = new URL('./', import.meta.url);
const SITE = 'https://www.iqrra.com';
const read = (f) => JSON.parse(readFileSync(new URL(`./data/${f}`, root), 'utf8'));

const { posts } = read('blog-posts.json');
const general = read('blog-prompts-general.json').items;
const iqraa = read('blog-prompts-iqraa.json').items;

/** HTML-escape text destined for markup or an attribute value. */
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // Prompts are multi-line. A literal newline inside an attribute is legal
    // but survives minifiers and editors badly; the entity always round-trips.
    .replace(/\n/g, '&#10;');

/** Arabic-indic numerals — the site already numbers feature cards this way. */
const arabicNum = (n) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

const uniqueCats = (items) => [...new Set(items.map((i) => i.cat))];

function card(item, i, kind) {
  const copy = kind === 'iqraa' ? item.ask : item.prompt;
  // data-find is what the search box matches against: code + description +
  // the payload itself, so a teacher can search by a word they remember from
  // the prompt rather than only by its title.
  const find = `${item.code} ${item.desc} ${copy}`;
  return `        <li class="pc" data-cat="${esc(item.cat)}" data-find="${esc(find)}">
          <span class="pc-n" aria-hidden="true">${arabicNum(i + 1)}</span>
          <div class="pc-body">
            <code class="pc-code">${esc(item.code)}</code>
            <p class="pc-desc">${esc(item.desc)}</p>
          </div>
          <div class="pc-actions">
            <button type="button" class="pc-copy" data-copy="${esc(copy)}">${
              kind === 'iqraa' ? 'نسخ الأمر' : 'نسخ البرومبت'
            }</button>${
              kind === 'iqraa'
                ? `\n            <a class="pc-open" href="https://app.iqrra.com" target="_blank" rel="noopener">جرّبه في إقرأ</a>`
                : ''
            }
          </div>
        </li>`;
}

function section(id, kind, items, intro) {
  const cats = uniqueCats(items);
  return `<section class="pset" id="${id}" ${id === 'set-general' ? '' : 'hidden'}>
  <p class="pset-intro">${intro}</p>
  <div class="filters">
    <div class="chips" role="group" aria-label="تصفية حسب النوع">
      <button type="button" class="chip is-on" data-cat="">الكل</button>
      ${cats.map((c) => `<button type="button" class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join('\n      ')}
    </div>
    <label class="search">
      <span class="sr-only">ابحث في الأوامر</span>
      <input type="search" placeholder="ابحث بكلمة من الأمر…" autocomplete="off">
    </label>
  </div>
  <p class="count" aria-live="polite">عرض <b>${items.length}</b> من ${items.length} أمر</p>
  <ol class="pcards">
${items.map((it, i) => card(it, i, kind)).join('\n')}
  </ol>
  <p class="empty" hidden>لا يوجد أمر يطابق بحثك. جرّب كلمة أقصر.</p>
</section>`;
}

/**
 * A post's share card (see tools-make-og-posts.py). Falls back to the shared
 * homepage card, loudly, so a missing image is a warning in the build output
 * rather than a post that silently shares the wrong headline.
 */
const CARD = { w: 1200, h: 630 };
function cardFor(p) {
  const rel = `/img/og/${p.slug}.jpg`;
  if (existsSync(new URL(`.${rel}`, root))) return rel;
  console.warn(`! no share card for ${p.slug} — run: python tools-make-og-posts.py`);
  return '/img/og.jpg';
}
const imageLd = (rel) => ({ '@type': 'ImageObject', url: SITE + rel, width: CARD.w, height: CARD.h });

/**
 * opts: { type, image (site-relative), alt, published, modified } — a post
 * passes all of them; the index passes only `type: 'website'`.
 */
const head = (title, description, path, jsonld = '', opts = {}) => `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="canonical" href="${SITE}${path}">
<meta property="og:type" content="${opts.type || 'article'}">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:locale" content="ar_JO">
<meta property="og:site_name" content="إقرأ">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${SITE}${opts.image || '/img/og.jpg'}">
<meta property="og:image:width" content="${CARD.w}">
<meta property="og:image:height" content="${CARD.h}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:alt" content="${esc(opts.alt || title)}">${
  opts.published
    ? `\n<meta property="article:published_time" content="${opts.published}">\n<meta property="article:modified_time" content="${opts.modified || opts.published}">`
    : ''
}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${SITE}${opts.image || '/img/og.jpg'}">
<meta name="theme-color" content="#00A99D">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/manhaj.css">
<link rel="stylesheet" href="/blog.css">
<script src="/ph.js" defer></script>${jsonld}
</head>
<body>

<header>
  <div class="wrap">
    <a class="brand" href="/">
      <img src="/logo-lockup.svg" width="90" height="40" alt="إقرأ">
    </a>
    <div class="head-cta">
      <a class="btn-sm btn-sm-primary" href="https://app.iqrra.com">ابدأ من المتصفح</a>
      <a class="btn-sm" href="/manhaj">المناهج</a>
    </div>
  </div>
</header>
`;

const footer = (script = false) => `
<footer>
  <div class="wrap">
    <p><a href="/">إقرأ</a> · مساعد المعلم العربي · الأردن ٢٠٢٦</p>
    <p><a href="/blog">المدونة</a> · <a href="/manhaj">المناهج</a> · <a href="/privacy">سياسة الخصوصية</a></p>
  </div>
</footer>
${script ? '\n<script src="/blog.js" defer></script>\n' : ''}
</body>
</html>
`;

/**
 * Structured data.
 *
 * The homepage already declares the Organization / SoftwareApplication /
 * WebSite entity; these pages only say what THEY are and point back at that
 * publisher, rather than redeclaring the entity five different ways.
 *
 * `dateModified` earns its place: answer engines weight recency, and an
 * undated page loses to a dated one carrying the same facts. It comes from
 * data/blog-posts.json, not the file mtime — mtime changes on every unrelated
 * regeneration and would claim a freshness the content did not earn.
 */
const PUBLISHER = {
  '@type': 'Organization',
  name: 'إقرأ',
  url: SITE + '/',
  logo: { '@type': 'ImageObject', url: SITE + '/icon-192.png' },
};

const ld = (obj) =>
  `\n<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;

const crumbs = (trail) => ({
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.name,
    item: SITE + t.path,
  })),
});

// ~125 characters: long enough to use the snippet, short enough not to be cut.
const INDEX_DESC =
  'مقالات عملية لمعلمي الأردن: طرق تدريس تطبّقها غدًا، وأفكار لبدء الحصة وإغلاقها، وأوامر جاهزة للتحضير والتقويم — من فريق إقرأ.';

const blogIndexLd = () =>
  ld({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': SITE + '/blog',
        name: 'مدونة إقرأ',
        description: INDEX_DESC,
        inLanguage: 'ar',
        publisher: PUBLISHER,
        blogPost: posts.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.title,
          description: p.description,
          datePublished: p.date,
          dateModified: p.updated || p.date,
          image: imageLd(cardFor(p)),
          url: `${SITE}/blog/${p.slug}`,
        })),
      },
      crumbs([{ name: 'إقرأ', path: '/' }, { name: 'المدونة', path: '/blog' }]),
    ],
  });

const promptsPostLd = (p) =>
  ld({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${SITE}/blog/${p.slug}`,
        headline: p.title,
        description: p.description,
        datePublished: p.date,
        dateModified: p.updated || p.date,
        inLanguage: 'ar',
        isAccessibleForFree: true,
        author: PUBLISHER,
        publisher: PUBLISHER,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${p.slug}` },
        image: imageLd(cardFor(p)),
        about: [
          { '@type': 'Thing', name: 'تحضير الدروس' },
          { '@type': 'Thing', name: 'الذكاء الاصطناعي في التعليم' },
          { '@type': 'Thing', name: 'المنهاج الأردني' },
        ],
        audience: { '@type': 'EducationalAudience', educationalRole: 'teacher' },
      },
      // The page IS a list, so it says so. Each entry carries the label and the
      // one-line description, never the prompt body — the schema describes the
      // page, it does not duplicate it.
      {
        '@type': 'ItemList',
        name: p.title,
        numberOfItems: general.length + iqraa.length,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: [...general, ...iqraa].map((it, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: it.code,
          description: it.desc,
        })),
      },
      crumbs([
        { name: 'إقرأ', path: '/' },
        { name: 'المدونة', path: '/blog' },
        { name: p.title, path: `/blog/${p.slug}` },
      ]),
    ],
  });

/**
 * A prose article. The body is hand-written markup in data/posts/<slug>.html;
 * everything that must stay in step with it elsewhere comes from
 * data/blog-posts.json — the title, the dates, the FAQ and the closing panel.
 *
 * The FAQ is rendered from the same list that feeds the FAQPage structured
 * data, so the visible questions and the schema cannot drift apart (schema that
 * describes content the page does not show is a manual-action risk). FAQ
 * answers are therefore plain text; only `closing.text` may carry markup.
 */
const articleLd = (p) =>
  ld({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${SITE}/blog/${p.slug}`,
        headline: p.title,
        description: p.description,
        datePublished: p.date,
        dateModified: p.updated || p.date,
        inLanguage: 'ar',
        isAccessibleForFree: true,
        author: PUBLISHER,
        publisher: PUBLISHER,
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}/blog/${p.slug}` },
        image: imageLd(cardFor(p)),
        about: (p.about || []).map((name) => ({ '@type': 'Thing', name })),
        audience: { '@type': 'EducationalAudience', educationalRole: 'teacher' },
      },
      ...(p.faq
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: p.faq.map((f) => ({
                '@type': 'Question',
                name: f.q,
                acceptedAnswer: { '@type': 'Answer', text: f.a },
              })),
            },
          ]
        : []),
      crumbs([
        { name: 'إقرأ', path: '/' },
        { name: 'المدونة', path: '/blog' },
        { name: p.title, path: `/blog/${p.slug}` },
      ]),
    ],
  });

/**
 * The «الخلاصة» box. Search snippets and AI answers lift the first
 * self-contained passage they find, so each post leads with a 3-sentence
 * answer instead of making a reader (or a crawler) read down to it.
 */
const summaryBox = (p) =>
  p.summary
    ? `
    <aside class="tldr" aria-label="الخلاصة">
      <p class="tldr-title">الخلاصة</p>
      <p>${esc(p.summary)}</p>
    </aside>
`
    : '';

/** Every post passes the same page-level tags to head(). */
const postOpts = (p) => ({
  image: cardFor(p),
  alt: p.title,
  published: p.date,
  modified: p.updated || p.date,
});

/**
 * Gives every <h2> of an article body an id and returns the headings, for the
 * contents list. A heading added later is picked up automatically; ids are
 * positional (sec-1…) because Arabic slugs make ugly, fragile URLs.
 */
function withContents(body, extra = []) {
  const items = [];
  let n = 0;
  const out = body.replace(/<h2>(.*?)<\/h2>/g, (_m, inner) => {
    n += 1;
    items.push({ id: `sec-${n}`, text: inner.replace(/<[^>]+>/g, '') });
    return `<h2 id="sec-${n}">${inner}</h2>`;
  });
  return { body: out, items: [...items, ...extra] };
}

const tocBox = (items) =>
  items.length < 3
    ? ''
    : `
    <nav class="toc" aria-label="محتويات المقال">
      <p class="toc-title">محتويات المقال</p>
      <ol>
${items.map((i) => `        <li><a href="#${i.id}">${esc(i.text)}</a></li>`).join('\n')}
      </ol>
    </nav>
`;

const articlePost = (p) => {
  const { body, items } = withContents(
    readFileSync(new URL(`./data/posts/${p.slug}.html`, root), 'utf8').trimEnd(),
    p.faq ? [{ id: 'faq', text: 'أسئلة شائعة' }] : [],
  );
  const faq = p.faq
    ? `
    <section class="faq-block">
      <h2 id="faq">أسئلة شائعة</h2>
${p.faq.map((f) => `      <h3>${esc(f.q)}</h3>\n      <p>${esc(f.a)}</p>`).join('\n')}
    </section>
`
    : '';
  const closing = p.closing
    ? `
    <section class="closing">
      <h2>${esc(p.closing.title)}</h2>
      <p>${p.closing.text}</p>
      <p class="cta-row">
        <a class="btn btn-primary" href="https://app.iqrra.com">جرّب إقرأ من المتصفح</a>
        <a class="btn" href="/manhaj">تصفّح المناهج</a>
      </p>
    </section>
`
    : '';
  return `${head(p.title, p.description, `/blog/${p.slug}`, articleLd(p), postOpts(p))}
<main class="wrap post">
  <article>
    <span class="post-kicker">${esc(p.kicker)}</span>
    <h1>${esc(p.title)}</h1>
    <p class="post-meta"><time datetime="${p.date}">${esc(p.dateLabel)}</time> · ${arabicNum(p.minutes)} دقائق قراءة</p>

    <p class="lede">${esc(p.description)}</p>
${summaryBox(p)}${tocBox(items)}
${body}
${faq}${closing}  </article>
</main>
${footer()}`;
};

// ── /blog ───────────────────────────────────────────────────────────────────
const indexPage = () => `${head(
  'مدونة إقرأ — أدوات وأفكار للمعلم',
  INDEX_DESC,
  '/blog',
  blogIndexLd(),
  { type: 'website' },
)}
<main class="wrap blog-index">
  <h1>مدونة إقرأ</h1>
  <p class="lede">أدوات وأفكار عملية للمعلم — مكتوبة للصف الأردني، لا مترجمة عنه.</p>

  <ul class="posts">
${posts
  .map(
    (p) => `    <li class="post-card">
      <a href="/blog/${p.slug}">
        <span class="post-kicker">${esc(p.kicker)}</span>
        <h2>${esc(p.title)}</h2>
        <p>${esc(p.description)}</p>
        <span class="post-meta"><time datetime="${p.date}">${esc(p.dateLabel)}</time> · ${arabicNum(p.minutes)} دقائق قراءة</span>
      </a>
    </li>`,
  )
  .join('\n')}
  </ul>
</main>
${footer()}`;

// ── /blog/100-prompts-for-teachers ──────────────────────────────────────────
const promptsPost = (p) => `${head(p.title, p.description, `/blog/${p.slug}`, promptsPostLd(p), postOpts(p))}
<main class="wrap post">
  <article>
    <span class="post-kicker">${esc(p.kicker)}</span>
    <h1>${esc(p.title)}</h1>
    <p class="post-meta"><time datetime="${p.date}">${esc(p.dateLabel)}</time> · ${arabicNum(p.minutes)} دقائق قراءة</p>

    <p class="lede">${esc(p.description)}</p>
${summaryBox(p)}
    <p>أكثر ما يضيّع وقت المعلم ليس الشرح، بل ما قبله وما بعده: ورقة عمل تُكتب من الصفر، اختبار قصير يُصاغ بعد منتصف الليل، ونشاط يُرتجل في آخر خمس دقائق. الأوامر في هذه الصفحة تختصر تلك المسافة. اضغط «نسخ» على أي أمر، والصقه حيث تعمل.</p>

    <p>القائمة قسمان. القسم الأول <b>أوامر عامة</b> تعمل مع أي مساعد ذكي — استبدل ما بين القوسين المعقوفين <code>{ }</code> بصفّك ودرسك قبل الإرسال. القسم الثاني <b>أوامر مساعد إقرأ</b>، وهي أقصر لأن المساعد يعرف الصف والمادة والدرس الذي اخترته أصلًا، ويبني عليها من نتاجات المنهاج الأردني — فلا حاجة لأن تشرح له السياق في كل مرة.</p>

    <div class="tabs" role="tablist" aria-label="نوع الأوامر">
      <button type="button" role="tab" class="tab is-on" aria-selected="true" aria-controls="set-general" id="tab-general">أوامر عامة (${general.length})</button>
      <button type="button" role="tab" class="tab" aria-selected="false" aria-controls="set-iqraa" id="tab-iqraa">أوامر مساعد إقرأ (${iqraa.length})</button>
    </div>

${section(
  'set-general',
  'general',
  general,
  'تعمل مع ChatGPT أو Gemini أو Copilot. استبدل ما بين <code>{ }</code> بصفّك ودرسك — كلما كان السياق أدق، كانت النتيجة أقرب لما تريد.',
)}

${section(
  'set-iqraa',
  'iqraa',
  iqraa,
  'اكتبها في <a href="https://app.iqrra.com">مساعد إقرأ</a> بعد اختيار الدرس. لا تحتاج إلى ذكر الصف أو المادة: المساعد يبني على نتاجات الدرس المختار من المنهاج الأردني.',
)}

    <section class="closing">
      <h2>لماذا الأوامر القصيرة في إقرأ أطول أثرًا</h2>
      <p>الأمر العام يطلب من المساعد أن يتخيّل درسك. أمر إقرأ يشير إلى درس حقيقي في المنهاج الأردني، بنتاجاته ووحدته وكتابه — فيأتي الناتج مرتبطًا بما سيدرسه طلبتك فعلًا، وقابلًا للتعديل والطباعة والعرض على شاشة الصف.</p>
      <p class="cta-row">
        <a class="btn btn-primary" href="https://app.iqrra.com">جرّب إقرأ من المتصفح</a>
        <a class="btn" href="/manhaj">تصفّح المناهج</a>
      </p>
    </section>
  </article>
</main>
${footer(true)}`;

/**
 * The homepage's «من المدونة» strip: the newest three posts, written between
 * two markers in index.html so a new post reaches the homepage (and gives
 * crawlers a one-click path to it) without a hand edit. Everything outside
 * the markers is left alone; a missing marker is an error, not a silent skip.
 */
/**
 * The homepage card's picture: the first number in the title and the word
 * after it («٨ طرق», «١٠٠ أمر»), drawn as text. Every post so far is a numbered
 * list; a title without a number gets a plain card rather than a made-up one.
 */
function thumb(title) {
  const m = title.match(/([٠-٩0-9]+)\s+([؀-ۿ]+)/);
  return m
    ? `
          <span class="bs-thumb" aria-hidden="true"><span class="bs-num">${m[1]}</span><span class="bs-unit">${esc(m[2])}</span></span>`
    : '';
}

function injectLatest() {
  const START = '<!-- blog:latest:start';
  const END = '<!-- blog:latest:end -->';
  const url = new URL('./index.html', root);
  const html = readFileSync(url, 'utf8');
  const a = html.indexOf(START);
  const b = html.indexOf(END);
  if (a < 0 || b < a) throw new Error('index.html is missing the blog:latest start/end markers');
  const strip = `<!-- blog:latest:start — generated by tools-build-blog.mjs from data/blog-posts.json; edit those, not this block -->
<section id="blog">
  <div class="wrap">
    <h2>من المدونة</h2>
    <p class="sub">أفكار عملية للمعلم، مكتوبة للصف الأردني.</p>
    <ul class="blog-strip">
${posts
  .slice(0, 3)
  .map(
    (p) => `      <li>
        <a href="/blog/${p.slug}">${thumb(p.title)}
          <span class="bs-kicker">${esc(p.kicker)}</span>
          <b>${esc(p.title)}</b>
          <span class="bs-desc">${esc(p.description)}</span>
        </a>
      </li>`,
  )
  .join('\n')}
    </ul>
    <p class="blog-all"><a href="/blog">كل المقالات</a></p>
  </div>
</section>
`;
  writeFileSync(url, html.slice(0, a) + strip + html.slice(b), 'utf8');
}

mkdirSync(new URL('./blog/', root), { recursive: true });
writeFileSync(new URL('./blog.html', root), indexPage(), 'utf8');
injectLatest();

// The prompt library has its own bespoke template; every other post is an
// article rendered from data/posts/<slug>.html.
for (const p of posts) {
  const html = p.slug === '100-prompts-for-teachers' ? promptsPost(p) : articlePost(p);
  writeFileSync(new URL(`./blog/${p.slug}.html`, root), html, 'utf8');
}

console.log(
  `wrote blog.html + ${posts.length} post page(s) (prompt library: ${general.length} general + ${iqraa.length} iqraa)`,
);
