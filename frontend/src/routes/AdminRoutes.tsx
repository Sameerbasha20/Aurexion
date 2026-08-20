import React from "react";
import { Route, Switch } from "wouter";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../features/administration/pages/Dashboard";
import Users from "../features/administration/pages/Users";
import Roles from "../features/administration/pages/Roles";
import Permissions from "../features/administration/pages/Permissions";
import Support from "../features/administration/pages/Support";
import Reports from "../features/administration/pages/Reports";
import AuditLogs from "../features/administration/pages/AuditLogs";
import Settings from "../features/administration/pages/Settings";
import Modules from "../features/administration/pages/Modules";
import CrmOverview from "../features/administration/pages/CrmOverview";
import BdmSalesOverview from "../features/administration/pages/BdmSalesOverview";
import RfpOverview from "../features/administration/pages/RfpOverview";
import EstimatorOverview from "../features/administration/pages/EstimatorOverview";
import ClientOverview from "../features/administration/pages/ClientOverview";
import RecruitmentOverview from "../features/administration/pages/RecruitmentOverview";
import CmsOverview from "../features/administration/pages/CmsOverview";

export const AdminRoutes: React.FC = () => {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin/dashboard" component={Dashboard} />
        <Route path="/admin/users" component={Users} />
        <Route path="/admin/roles" component={Roles} />
        <Route path="/admin/permissions" component={Permissions} />
        <Route path="/admin/modules" component={Modules} />
        <Route path="/admin/crm" component={CrmOverview} />
        <Route path="/admin/leads" component={CrmOverview} />
        <Route path="/admin/bdm-sales" component={BdmSalesOverview} />
        <Route path="/admin/rfp" component={RfpOverview} />
        <Route path="/admin/estimator" component={EstimatorOverview} />
        <Route path="/admin/clients" component={ClientOverview} />
        <Route path="/admin/support" component={Support} />
        <Route path="/admin/recruitment" component={RecruitmentOverview} />
        <Route path="/admin/cms" component={CmsOverview} />
        <Route path="/admin/reports" component={Reports} />
        <Route path="/admin/audit-logs" component={AuditLogs} />
        <Route path="/admin/settings" component={Settings} />
      </Switch>
    </AdminLayout>
  );
};

export default AdminRoutes;
