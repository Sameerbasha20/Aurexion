export interface RfpProposalItem {
  id: string;
  title: string;
  dueDate: string;
}

export interface RfpSubmissionPayload {
  name?: string;
  email?: string;
  company?: string;
  requirements?: string;
  [key: string]: unknown;
}

export interface RfpSubmissionResponse {
  success: boolean;
  rfpId: string;
  submittedAt: string;
}

export const rfpService = {
  getRfps: async (): Promise<RfpProposalItem[]> => {
    return [
      { id: "rfp_101", title: "Government Security Core proposal", dueDate: "Sep 01" },
    ];
  },
  submitRfp: async (rfpId: string, data: RfpSubmissionPayload): Promise<RfpSubmissionResponse> => {
    return { success: true, rfpId, submittedAt: new Date().toISOString() };
  },
};

export default rfpService;
