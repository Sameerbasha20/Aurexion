import React from "react";
import DashboardLayout from "../../components/common/DashboardLayout";

interface BdmLayoutProps {
  children: React.ReactNode;
}

export const BdmLayout: React.FC<BdmLayoutProps> = ({ children }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default BdmLayout;
