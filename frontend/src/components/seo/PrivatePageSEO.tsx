import React from "react";
import { SEO } from "./SEO";

export interface PrivatePageSEOProps {
  title?: string;
  description?: string;
}

/**
 * Dedicated SEO wrapper for authenticated/private routes (Admin, CRM, BDM, Recruitment, Client Portal, Auth).
 * Automatically sets noindex and nofollow to ensure private content is never indexed by search engines.
 */
export const PrivatePageSEO: React.FC<PrivatePageSEOProps> = ({
  title = "Internal Workspace",
  description = "Aurexion Technologies internal secure portal.",
}) => {
  return (
    <SEO
      title={`${title} | Aurexion Secure Portal`}
      description={description}
      noindex={true}
      nofollow={true}
    />
  );
};

export default PrivatePageSEO;
