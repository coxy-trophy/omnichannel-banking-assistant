export function generateFakeReports() {
  return {
    totalServicesUsed: Math.floor(Math.random() * 10000),
    atmVsBranchUsage: {
      atm: Math.floor(Math.random() * 80) + 10,
      branch: Math.floor(Math.random() * 40) + 10,
      app: Math.floor(Math.random() * 60) + 10,
    },
    dailyBookings: Array.from({ length: 7 }).map((_, i) => ({
      day: `Day ${i + 1}`,
      count: Math.floor(Math.random() * 50),
    })),
  };
}
