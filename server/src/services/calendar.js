const ELECTION_EVENTS = [
  { title: 'Delhi Assembly Election', date: '2025-02-05', type: 'voting' },
  { title: 'Delhi Assembly Election - Results', date: '2025-02-08', type: 'results' },
  { title: 'Bihar Assembly Election - Phase 1', date: '2025-10-18', type: 'voting' },
  { title: 'Bihar Assembly Election - Phase 2', date: '2025-11-05', type: 'voting' },
  { title: 'Bihar Assembly Election - Results', date: '2025-11-08', type: 'results' },
  { title: 'Model Code of Conduct - Bihar', date: '2025-10-01', type: 'mcc' },
  { title: 'Jharkhand Assembly Election', date: '2024-11-13', type: 'voting' },
  { title: 'Maharashtra Assembly Election', date: '2024-11-20', type: 'voting' },
  { title: 'Maharashtra Assembly Election - Results', date: '2024-11-23', type: 'results' },
  { title: 'Haryana Assembly Election', date: '2024-10-05', type: 'voting' },
  { title: 'Haryana Assembly Election - Results', date: '2024-10-08', type: 'results' },
  { title: 'Jammu & Kashmir Assembly Election - Phase 1', date: '2024-09-18', type: 'voting' },
  { title: 'Jammu & Kashmir Assembly Election - Phase 2', date: '2024-09-25', type: 'voting' },
  { title: 'Jammu & Kashmir Assembly Election - Phase 3', date: '2024-10-01', type: 'voting' },
  { title: 'Voter Registration Deadline - General', date: '2026-03-15', type: 'registration' },
  { title: 'Delhi Municipal Elections', date: '2026-02-15', type: 'voting' },
  { title: 'Tamil Nadu Local Body Elections', date: '2026-05-20', type: 'voting' },
  { title: 'West Bengal Local Body Elections', date: '2026-06-01', type: 'voting' },
  { title: 'Uttar Pradesh Local Body Elections', date: '2026-07-10', type: 'voting' },
  { title: 'Maharashtra Council Elections', date: '2026-06-15', type: 'voting' },
  { title: 'Kerala Local Body Elections', date: '2026-04-10', type: 'voting' },
  { title: 'Karnataka Local Body Elections', date: '2026-08-20', type: 'voting' },
];

/**
 * Returns election events filtered to the last 12 months and future, optionally scoped by state.
 * @param {string} state - Optional state name to filter results
 * @returns {Promise<Array<{title: string, date: string, type: string, isPast: boolean}>>}
 */
async function getElectionCalendar(state = '') {
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  let events = ELECTION_EVENTS.filter((e) => {
    const d = new Date(e.date);
    return d >= oneYearAgo;
  });

  if (state) {
    const stateLower = state.toLowerCase();
    const stateSpecific = ['delhi', 'bihar', 'jharkhand', 'maharashtra', 'haryana',
      'jammu', 'kashmir', 'tamil nadu', 'west bengal', 'uttar pradesh',
      'kerala', 'karnataka'];
    events = events.filter(
      (e) =>
        e.title.toLowerCase().includes(stateLower) ||
        !stateSpecific.some((s) => e.title.toLowerCase().includes(s))
    );
  }

  return events
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((e) => ({ ...e, isPast: new Date(e.date) < now }));
}

module.exports = { getElectionCalendar };
