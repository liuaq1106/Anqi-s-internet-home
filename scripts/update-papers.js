import { readdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const papersDir = join(__dirname, '..', 'public', 'papers');
const outputFile = join(__dirname, '..', 'src', 'data', 'papers.json');
const API_BASE = 'https://api.semanticscholar.org/graph/v1/paper';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchPaper(query) {
  const url = `${API_BASE}/search?query=${encodeURIComponent(query)}&limit=3&fields=paperId,title`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  const data = await res.json();
  return data.data || [];
}

async function getPaperDetails(paperId) {
  const fields = 'title,authors,year,venue,abstract,citationCount,externalIds';
  const url = `${API_BASE}/${paperId}?fields=${encodeURIComponent(fields)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Details failed: ${res.status}`);
  return res.json();
}

function formatAuthors(authors) {
  if (!authors || !authors.length) return '';
  return authors.map((a) => a.name).join(', ');
}

function getVenue(paper) {
  if (paper.venue) return paper.venue;
  if (paper.journal) return paper.journal.name || paper.journal;
  return '';
}

async function processPaper(filename) {
  const name = filename.replace(/\.pdf$/i, '');
  // Convert filename to search query: replace underscores/hyphens with spaces
  const query = name.replace(/[_\-]+/g, ' ').trim();
  console.log(`  Searching: "${query}"`);

  let best = null;
  let details = null;

  try {
    const results = await searchPaper(query);
    if (!results.length) {
      console.log(`    -> No results found`);
      return makeEmptyPaper(name, filename);
    }

    best = results[0];
    console.log(`    -> Found: ${best.title}`);

    // Get full details (with 3s delay to avoid 429 rate limit)
    await sleep(3000);
    details = await getPaperDetails(best.paperId);
  } catch (err) {
    console.log(`    -> API error: ${err.message}`);
  }

  const venue = getVenue(details || best || {});
  const authors = formatAuthors((details || best)?.authors || []);
  const year = (details || best)?.year || 0;
  const abstract = details?.abstract || '';
  const citationCount = details?.citationCount || 0;
  const doi = details?.externalIds?.DOI || '';

  if (authors) console.log(`    -> Authors: ${authors}`);
  if (venue) console.log(`    -> Venue: ${venue} (${year})`);
  if (citationCount) console.log(`    -> Citations: ${citationCount}`);

  return {
    title: { en: best?.title || name.replace(/_/g, ' '), zh: '' },
    authors: { en: authors, zh: '' },
    venue: { en: venue, zh: venue },
    year,
    image: '',
    semanticScholarId: best?.paperId || '',
    links: {
      pdf: `/papers/${filename}`,
      doi: doi ? `https://doi.org/${doi}` : '',
      code: '',
    },
    abstract: { en: abstract, zh: '' },
  };
}

function makeEmptyPaper(name, filename) {
  return {
    title: { en: name.replace(/_/g, ' '), zh: '' },
    authors: { en: '', zh: '' },
    venue: { en: '', zh: '' },
    year: 0,
    image: '',
    semanticScholarId: '',
    links: { pdf: `/papers/${filename}`, doi: '', code: '' },
    abstract: { en: '', zh: '' },
  };
}

async function main() {
  console.log('Scanning papers in public/papers/...\n');

  if (!existsSync(papersDir)) {
    console.error('public/papers/ directory not found!');
    process.exit(1);
  }

  const files = readdirSync(papersDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
  console.log(`Found ${files.length} PDF file(s)\n`);

  const papers = [];
  for (const file of files) {
    console.log(`[${papers.length + 1}/${files.length}] ${file}`);
    const paper = await processPaper(file);
    papers.push(paper);
    if (files.indexOf(file) < files.length - 1) {
      await sleep(800); // Rate limit between papers
    }
    console.log('');
  }

  writeFileSync(outputFile, JSON.stringify(papers, null, 2), 'utf-8');
  console.log(`Done! Generated ${outputFile} with ${papers.length} papers.`);
  console.log('');
  console.log('Next steps:');
  console.log('  1. Edit src/data/papers.json to add Chinese translations (zh fields)');
  console.log('  2. Add paper images to public/papers/ and update "image" field');
  console.log('  3. Run "npm run build" to rebuild the site');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
