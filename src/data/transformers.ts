export const generateMockTransformer = (id: number) => {
  const now = Date.now();
  const history = Array.from({ length: 10 }).map((_, i) => ({
    timestamp: new Date(now - (9 - i) * 60000).toISOString(),
    tempC: Math.round(60 + Math.random() * 60), // 60–120°C
  }));

  return {
    id: `XFMR-${id.toString().padStart(4, "0")}`,
    type: ["1-ph pole", "3-ph pole", "1-ph pad", "3-ph pad"][id % 4],
    kVA: [25, 50, 75, 100, 167, 250][id % 6],
    mfgDate: `20${10 + (id % 15)}-01-01`,
    temperatureHistory: history,
  };
};

export const generateMockTransformers = (count: number) =>
  Array.from({ length: count }, (_, i) => generateMockTransformer(i + 1));
