(() => {
  const genreSelect = document.getElementById('band-genre-filter');
  const bandContainer = document.getElementById('band-container');
  const emptyState = document.getElementById('band-filter-empty');
  if (!genreSelect || !bandContainer) return;

  const DEFAULT_CONFIG = {
    aliases: [
      { matcher: /^post[- ]?hardcore$/, canonical: 'post-hardcore' },
      { matcher: /^post[- ]?punk$/, canonical: 'post-punk' },
      { matcher: /^indie[- ]?rock$/, canonical: 'indie-rock' },
      { matcher: /^dream[- ]?pop$/, canonical: 'dream-pop' },
      { matcher: /^noise[- ]?rock$/, canonical: 'noise-rock' },
      { matcher: /^power[- ]?pop$/, canonical: 'power-pop' },
      { matcher: /^lo[- ]?fi$/, canonical: 'lo-fi' },
      { matcher: /^psych$/, canonical: 'psychedelic' },
    ],
    labelOverrides: {
      'post-hardcore': 'Post-hardcore',
      'post-punk': 'Post-punk',
      'indie-rock': 'Indie rock',
      'dream-pop': 'Dream pop',
      'noise-rock': 'Noise rock',
      'power-pop': 'Power pop',
      'lo-fi': 'Lo-fi',
      psychedelic: 'Psychedelic',
    },
    manualGroups: {
      // Example:
      // 'post-hardcore': ['post hardcore', 'posthardcore'],
    },
    fuzzy: {
      enabled: true,
      threshold: 0.72,
      minLength: 6,
    },
    seedCanonicals: [
      'post-hardcore',
      'post-punk',
      'indie-rock',
      'dream-pop',
      'noise-rock',
      'power-pop',
      'lo-fi',
      'psychedelic',
    ],
  };

  const deepMerge = (base, override) => {
    if (!override || typeof override !== 'object') return base;
    const out = Array.isArray(base) ? [...base] : { ...base };
    for (const [key, value] of Object.entries(override)) {
      if (Array.isArray(value)) out[key] = value;
      else if (value && typeof value === 'object' && !Array.isArray(value)) {
        out[key] = deepMerge(base[key] && typeof base[key] === 'object' ? base[key] : {}, value);
      } else {
        out[key] = value;
      }
    }
    return out;
  };

  // Optional override hook (no-op unless you define it on the Bands page):
  // window.UNREAL_CITY_BANDS_GENRE_FILTER_CONFIG = { fuzzy: { threshold: 0.9 } }
  const CONFIG = deepMerge(
    DEFAULT_CONFIG,
    window.UNREAL_CITY_BANDS_GENRE_FILTER_CONFIG || null,
  );

  const CANONICAL_LABEL = new Map(Object.entries(CONFIG.labelOverrides || {}));

  const normalizeRawKey = (raw) => {
    if (!raw) return '';
    const simplified = String(raw)
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '');

    const cleaned = simplified
      .replace(/[’'"]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return cleaned;
  };

  const keyToLabel = (key) => {
    if (!key) return '';
    const fromMap = CANONICAL_LABEL.get(key);
    if (fromMap) return fromMap;
    return key
      .split('-')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const diceCoefficient = (a, b) => {
    const left = String(a);
    const right = String(b);
    if (!left || !right) return 0;
    if (left === right) return 1;
    if (left.length < 2 || right.length < 2) return 0;

    const bigrams = new Map();
    for (let i = 0; i < left.length - 1; i += 1) {
      const bg = left.slice(i, i + 2);
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }

    let matches = 0;
    for (let i = 0; i < right.length - 1; i += 1) {
      const bg = right.slice(i, i + 2);
      const count = bigrams.get(bg) || 0;
      if (count > 0) {
        bigrams.set(bg, count - 1);
        matches += 1;
      }
    }

    return (2 * matches) / (left.length + right.length - 2);
  };

  const similarity = (a, b) => {
    const left = String(a).replace(/-/g, '');
    const right = String(b).replace(/-/g, '');
    if (!left || !right) return 0;
    const base = diceCoefficient(left, right);
    if (left.includes(right) || right.includes(left)) return Math.min(1, base + 0.08);
    return base;
  };

  const manualGroupIndex = (() => {
    const out = new Map();
    const groups = CONFIG.manualGroups || {};
    for (const [canonical, variants] of Object.entries(groups)) {
      for (const variant of variants || []) out.set(normalizeRawKey(variant), canonical);
    }
    return out;
  })();

  const toCanonicalKey = (raw, knownCanonicals) => {
    const normalized = normalizeRawKey(raw);
    if (!normalized) return '';

    const manual = manualGroupIndex.get(normalized);
    if (manual) return manual;

    for (const { matcher, canonical } of CONFIG.aliases || []) {
      if (matcher && matcher.test(normalized)) return canonical;
    }

    if (!CONFIG.fuzzy?.enabled) return normalized;
    if (normalized.length < (CONFIG.fuzzy?.minLength ?? 0)) return normalized;

    const threshold = CONFIG.fuzzy?.threshold ?? 1;
    let best = '';
    let bestScore = threshold;

    for (const candidate of knownCanonicals) {
      const score = similarity(normalized, candidate);
      if (score > bestScore) {
        best = candidate;
        bestScore = score;
      }
    }

    return best || normalized;
  };

  const parseGenres = (raw) => {
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
      if (typeof parsed === 'string') return [parsed];
      return [];
    } catch {
      return String(raw)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  };

  const cards = Array.from(bandContainer.querySelectorAll('.band-card'));
  const cardGenreKeys = new WeakMap();
  const optionKeys = new Map(); // key -> label

  const knownCanonicals = new Set(CONFIG.seedCanonicals || []);
  for (const card of cards) {
    const rawList = parseGenres(card.getAttribute('data-genres'));
    const keys = Array.from(
      new Set(rawList.map((g) => toCanonicalKey(g, knownCanonicals)).filter(Boolean)),
    );
    cardGenreKeys.set(card, keys);
    for (const key of keys) {
      knownCanonicals.add(key);
      optionKeys.set(key, keyToLabel(key));
    }
  }

  const sortedOptions = Array.from(optionKeys.entries()).sort((a, b) =>
    a[1].localeCompare(b[1], undefined, { sensitivity: 'base' }),
  );

  for (const [key, label] of sortedOptions) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = label;
    genreSelect.appendChild(option);
  }

  const applyFilter = () => {
    const selected = genreSelect.value;
    let visibleCount = 0;

    for (const card of cards) {
      const keys = cardGenreKeys.get(card) || [];
      const isVisible = !selected || keys.includes(selected);
      card.hidden = !isVisible;
      if (isVisible) visibleCount += 1;
    }

    if (emptyState) emptyState.hidden = visibleCount !== 0;

    const url = new URL(window.location.href);
    if (selected) url.searchParams.set('genre', selected);
    else url.searchParams.delete('genre');
    window.history.replaceState({}, '', url);
  };

  const initialGenre = new URL(window.location.href).searchParams.get('genre');
  if (initialGenre && optionKeys.has(initialGenre)) genreSelect.value = initialGenre;
  genreSelect.addEventListener('change', applyFilter);
  applyFilter();
})();
