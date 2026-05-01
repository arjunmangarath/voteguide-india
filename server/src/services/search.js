const axios = require('axios');

const FALLBACK_NEWS = [
  {
    title: 'Bihar Assembly Elections 2025: ECI Announces Phase-wise Schedule',
    snippet: 'The Election Commission of India has announced the schedule for Bihar Assembly Elections with two phases of voting in October and November 2025.',
    link: 'https://eci.gov.in',
    source: 'eci.gov.in',
    image: null,
  },
  {
    title: 'How to Register as a Voter in India: Complete Guide 2025',
    snippet: 'Step-by-step guide to voter registration using the Voter Helpline App, Voter Portal, or by visiting your local ERO office with Form 6.',
    link: 'https://voters.eci.gov.in',
    source: 'voters.eci.gov.in',
    image: null,
  },
  {
    title: 'ECI Launches Digital Voter Card (e-EPIC) for All Registered Voters',
    snippet: 'The Election Commission has launched the e-EPIC (Electronic Electoral Photo Identity Card) which can be downloaded digitally by all registered voters.',
    link: 'https://eci.gov.in',
    source: 'eci.gov.in',
    image: null,
  },
  {
    title: 'Upcoming State Elections 2026: Karnataka, Tamil Nadu Local Body Polls',
    snippet: 'Several states are gearing up for local body elections in 2026. Karnataka, Tamil Nadu, West Bengal, and Uttar Pradesh are expected to hold polls.',
    link: 'https://eci.gov.in',
    source: 'eci.gov.in',
    image: null,
  },
  {
    title: 'Model Code of Conduct: What Every Voter Needs to Know',
    snippet: 'The Model Code of Conduct (MCC) comes into effect as soon as election dates are announced. Here is what it means for voters and candidates.',
    link: 'https://eci.gov.in',
    source: 'eci.gov.in',
    image: null,
  },
  {
    title: 'Voter Turnout in India: Trends and What They Mean for Democracy',
    snippet: 'India saw record voter turnout in recent elections. The ECI has been running the SVEEP programme to boost participation across all demographics.',
    link: 'https://eci.gov.in',
    source: 'eci.gov.in',
    image: null,
  },
];

const STATE_NEWS = {
  bihar: [
    {
      title: 'Bihar Assembly Elections 2025: All You Need to Know',
      snippet: 'Bihar is set for assembly elections in October-November 2025. The election will be held in two phases with results on November 8.',
      link: 'https://eci.gov.in',
      source: 'eci.gov.in',
      image: null,
    },
    {
      title: 'How to Find Your Polling Booth in Bihar',
      snippet: 'Bihar voters can find their polling booth using the Voter Helpline App or by calling 1950 or visiting the ECI voter portal.',
      link: 'https://voters.eci.gov.in',
      source: 'voters.eci.gov.in',
      image: null,
    },
  ],
  delhi: [
    {
      title: 'Delhi Municipal Elections 2026: Key Dates and Wards',
      snippet: 'Delhi Municipal Corporation elections are scheduled for February 2026. Voters can check their ward and booth details on the ECI portal.',
      link: 'https://eci.gov.in',
      source: 'eci.gov.in',
      image: null,
    },
  ],
};

/**
 * Fetches live Indian election news via Google Custom Search API.
 * Falls back to curated ECI content if the API errors or returns no results.
 * @param {string} state - Optional state name to focus the search query
 * @returns {Promise<Array<{title: string, snippet: string, link: string, source: string, image: string|null}>>}
 */
async function fetchElectionNews(state = '') {
  try {
    const query = state ? `${state} election 2026 India` : 'India upcoming elections 2026 ECI';
    const url = 'https://www.googleapis.com/customsearch/v1';
    const { data } = await axios.get(url, {
      params: {
        key: process.env.CUSTOM_SEARCH_API_KEY,
        cx: process.env.CUSTOM_SEARCH_ENGINE_ID,
        q: query,
        num: 6,
        sort: 'date',
      },
    });
    const results = (data.items || []).map((item) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
      source: item.displayLink,
      image: item.pagemap?.cse_image?.[0]?.src || null,
    }));
    if (results.length > 0) return results;
  } catch {
    // fall through to curated fallback
  }

  const stateLower = state.toLowerCase();
  const stateSpecific = STATE_NEWS[stateLower];
  if (stateSpecific) return [...stateSpecific, ...FALLBACK_NEWS].slice(0, 6);
  return FALLBACK_NEWS;
}

module.exports = { fetchElectionNews };
