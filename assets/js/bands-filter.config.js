// Bands genre filter configuration.
// This file is loaded only on `/bands/` and is safe to edit without touching the filter logic.
//
// Notes:
// - `manualGroups` is the most reliable way to merge genres.
// - `fuzzy.threshold` controls how aggressive typo/near-match grouping is (0..1). Lower = more grouping.
// - `aliases` is for exact regex-based canonicalization.
//
// Example:
// window.UNREAL_CITY_BANDS_GENRE_FILTER_CONFIG = {
//   fuzzy: { threshold: 0.78 },
//   manualGroups: {
//     'indie-rock': ['indie', 'indie rock'],
//     'power-pop': ['powerpop', 'power pop'],
//   },
// };

window.UNREAL_CITY_BANDS_GENRE_FILTER_CONFIG = window.UNREAL_CITY_BANDS_GENRE_FILTER_CONFIG || {};

