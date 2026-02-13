// Dashboard mock data - to be populated in Phase 1 dashboard implementation
export async function mockGetDashboardSummary() {
  return {
    totalStores: 200,
    activeStores: 185,
    totalEquipment: 450,
    issueCount: { yellow: 12, red: 3 },
  };
}

export async function mockGetDashboardIssues() {
  return [];
}

export async function mockGetEmergencyAlarms() {
  return [];
}
