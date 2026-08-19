export const estimatorService = {
  calculateProjectCost: async (devsCount: number, monthsCount: number) => {
    // Basic calculation model
    const totalCost = devsCount * monthsCount * 10000;
    return {
      devsCount,
      monthsCount,
      totalCost,
      currency: "USD",
    };
  },
};

export default estimatorService;
