const axios = require('axios');

async function fetchElectionNews(state = '') {
  const query = state
    ? `${state} election 2026 India`
    : 'India upcoming elections 2026 ECI';

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

  return (data.items || []).map((item) => ({
    title: item.title,
    snippet: item.snippet,
    link: item.link,
    source: item.displayLink,
    image: item.pagemap?.cse_image?.[0]?.src || null,
  }));
}

module.exports = { fetchElectionNews };
