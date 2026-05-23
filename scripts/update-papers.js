import { readdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const papersDir = join(__dirname, '..', 'public', 'papers');
const outputFile = join(__dirname, '..', 'src', 'data', 'papers.json');

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (res.status === 429) {
      const wait = (i + 1) * 5000; // 5s, 10s, 15s
      console.log(`    -> Rate limited, waiting ${wait / 1000}s...`);
      await sleep(wait);
      continue;
    }
    throw new Error(`HTTP ${res.status}`);
  }
  throw new Error('Rate limited after retries');
}

// --- Semantic Scholar ---
async function searchSemanticScholar(query) {
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=3&fields=paperId,title`;
  try {
    const data = await fetchWithRetry(url);
    return (data.data || []).map((p) => ({ paperId: p.paperId, title: p.title, source: 's2' }));
  } catch {
    return [];
  }
}

async function getS2Details(paperId) {
  const fields = 'title,authors,year,venue,abstract,citationCount,externalIds';
  const url = `https://api.semanticscholar.org/graph/v1/paper/${paperId}?fields=${encodeURIComponent(fields)}`;
  const data = await fetchWithRetry(url);
  return {
    title: data.title,
    authors: (data.authors || []).map((a) => a.name).join(', '),
    year: data.year || 0,
    venue: data.venue || data.journal?.name || '',
    abstract: data.abstract || '',
    citationCount: data.citationCount || 0,
    doi: data.externalIds?.DOI || '',
    paperId: data.paperId,
  };
}

// --- Crossref fallback ---
async function searchCrossref(query) {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&rows=3`;
  try {
    const data = await fetch(url).then((r) => r.json());
    const items = data.message?.items || [];
    return items.map((item) => ({
      title: item.title?.[0] || '',
      authors: (item.author || []).map((a) => `${a.given || ''} ${a.family || ''}`.trim()).join(', '),
      year: item['created']?.['date-parts']?.[0]?.[0] || item['published-print']?.['date-parts']?.[0]?.[0] || 0,
      venue: item['container-title']?.[0] || '',
      abstract: item.abstract || '',
      doi: item.DOI || '',
      crossrefOnly: true,
    }));
  } catch {
    return [];
  }
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

async function processPaper(filename) {
  const name = filename.replace(/\.pdf$/i, '');
  const query = name.replace(/[_\-]+/g, ' ').trim();
  console.log(`  Query: "${query}"`);

  // Try Semantic Scholar first
  console.log(`  -> Trying Semantic Scholar...`);
  const s2Results = await searchSemanticScholar(query);

  if (s2Results.length) {
    const best = s2Results[0];
    console.log(`  -> Found: ${best.title}`);

    // Get details
    console.log(`  -> Fetching details...`);
    await sleep(2000);
    try {
      const details = await getS2Details(best.paperId);
      console.log(`  -> Authors: ${details.authors}`);
      console.log(`  -> Venue: ${details.venue} (${details.year})`);
      console.log(`  -> Citations: ${details.citationCount}`);
      return {
        title: { en: details.title, zh: '' },
        authors: { en: details.authors, zh: '' },
        venue: { en: details.venue, zh: details.venue },
        year: details.year,
        image: '',
        semanticScholarId: details.paperId,
        links: {
          pdf: `/papers/${filename}`,
          doi: details.doi ? `https://doi.org/${details.doi}` : '',
          code: '',
        },
        abstract: { en: details.abstract, zh: '' },
      };
    } catch (err) {
      console.log(`  -> Detail error: ${err.message}, using search result only`);
      return {
        title: { en: best.title, zh: '' },
        authors: { en: '', zh: '' },
        venue: { en: '', zh: '' },
        year: 0,
        image: '',
        semanticScholarId: best.paperId,
        links: { pdf: `/papers/${filename}`, doi: '', code: '' },
        abstract: { en: '', zh: '' },
      };
    }
  }

  // Fallback to Crossref
  console.log(`  -> Trying Crossref...`);
  const crResults = await searchCrossref(query);
  if (crResults.length) {
    const best = crResults[0];
    console.log(`  -> Crossref found: ${best.title}`);
    console.log(`  -> Authors: ${best.authors}`);
    console.log(`  -> Venue: ${best.venue} (${best.year})`);
    return {
      title: { en: best.title, zh: '' },
      authors: { en: best.authors, zh: '' },
      venue: { en: best.venue, zh: best.venue },
      year: best.year,
      image: '',
      semanticScholarId: '',
      links: {
        pdf: `/papers/${filename}`,
        doi: best.doi ? `https://doi.org/${best.doi}` : '',
        code: '',
      },
      abstract: { en: best.abstract || '', zh: '' },
    };
  }

  console.log(`  -> No results found`);
  return makeEmptyPaper(name, filename);
}

async function main() {
  console.log('Paper Metadata Fetcher');
  console.log('======================\n');

  if (!existsSync(papersDir)) {
    console.error('public/papers/ directory not found!');
    process.exit(1);
  }

  const files = readdirSync(papersDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
  console.log(`Found ${files.length} PDF file(s)\n`);

  const papers = [];
  for (let i = 0; i < files.length; i++) {
    console.log(`[${i + 1}/${files.length}] ${files[i]}`);
    const paper = await processPaper(files[i]);
    papers.push(paper);
    if (i < files.length - 1) await sleep(2000);
    console.log('');
  }

  writeFileSync(outputFile, JSON.stringify(papers, null, 2), 'utf-8');
  console.log(`Done! ${papers.length} papers written to src/data/papers.json`);
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
