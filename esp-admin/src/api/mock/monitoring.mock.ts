// Monitoring mock data - to be populated in monitoring implementation
export async function mockGetSensorData(_equipmentId: string) {
  return null;
}

export async function mockGetSensorHistory(_equipmentId: string, _from: number, _to: number) {
  return [];
}
