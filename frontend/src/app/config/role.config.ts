export type UserRole = "ADMIN" | "BDM" | "CLIENT" | "USER";

export interface RoleDefinition {
  name: UserRole;
  description: string;
  permissions: string[];
}

export const ROLE_CONFIGS: Record<UserRole, RoleDefinition> = {
  ADMIN: {
    name: "ADMIN",
    description: "Full administrative control of the system",
    permissions: ["*"],
  },
  BDM: {
    name: "BDM",
    description: "Business Development Manager accessing leads and RFP pipeline",
    permissions: [
      "read:dashboard",
      "read:leads", "write:leads",
      "read:opportunities", "write:opportunities",
      "read:rfp", "write:rfp",
      "read:estimator", "write:estimator"
    ],
  },
  CLIENT: {
    name: "CLIENT",
    description: "Client portal users reviewing their projects and documents",
    permissions: [
      "read:dashboard",
      "read:projects",
      "read:requests", "write:requests",
      "read:documents"
    ],
  },
  USER: {
    name: "USER",
    description: "Basic users with public-level information",
    permissions: [
      "read:profile"
    ],
  },
};

export default ROLE_CONFIGS;
