export const rfpService = {
  getRfps: async () => {
    return [
      { id: "rfp_101", title: "Government Security Core proposal", dueDate: "Sep 01" },
    ];
  },
  submitRfp: async (rfpId: string, data: any) => {
    return { success: true, rfpId, submittedAt: new Date().toISOString() };
  },
};

export default rfpService;
