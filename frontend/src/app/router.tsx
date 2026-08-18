import React from "react";
import { Route, Switch } from "wouter";
import PublicRoutes from "../routes/PublicRoutes";
import AuthRoutes from "../routes/AuthRoutes";
import AdminRoutes from "../routes/AdminRoutes";
import BdmRoutes from "../routes/BdmRoutes";
import ClientRoutes from "../routes/ClientRoutes";
import CrmRoutes from "../routes/CrmRoutes";
import RecruitmentRoutes from "../routes/RecruitmentRoutes";
import SupportRoutes from "../routes/SupportRoutes";
import CmsConsoleRoutes from "../routes/CmsConsoleRoutes";
import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";

export const AppRouter: React.FC = () => {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/login" component={AuthRoutes} />
      <Route path="/forgot-password" component={AuthRoutes} />
      <Route path="/reset-password" component={AuthRoutes} />
      <Route path="/verify-email" component={AuthRoutes} />

      {/* Admin Protected scopes */}
      <Route path="/admin/*">
        <ProtectedRoute>
          <RoleRoute allowedRoles={["ADMIN"]}>
            <AdminRoutes />
          </RoleRoute>
        </ProtectedRoute>
      </Route>

      {/* BDM Protected scopes */}
      <Route path="/bdm/*">
        <ProtectedRoute>
          <RoleRoute allowedRoles={["BDM"]}>
            <BdmRoutes />
          </RoleRoute>
        </ProtectedRoute>
      </Route>

      {/* Client Protected scopes */}
      <Route path="/portal/*">
        <ProtectedRoute>
          <RoleRoute allowedRoles={["CLIENT"]}>
            <ClientRoutes />
          </RoleRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/client/*">
        <ProtectedRoute>
          <RoleRoute allowedRoles={["CLIENT"]}>
            <ClientRoutes />
          </RoleRoute>
        </ProtectedRoute>
      </Route>

      {/* CRM Sales Executive Protected scopes */}
      <Route path="/crm/*">
        <ProtectedRoute>
          <RoleRoute allowedRoles={["SALES_EXECUTIVE", "ADMIN"]}>
            <CrmRoutes />
          </RoleRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/sales/*">
        <ProtectedRoute>
          <RoleRoute allowedRoles={["SALES_EXECUTIVE", "ADMIN"]}>
            <CrmRoutes />
          </RoleRoute>
        </ProtectedRoute>
      </Route>

      {/* Recruitment HR Manager Protected scopes */}
      <Route path="/recruitment/*">
        <ProtectedRoute>
          <RoleRoute allowedRoles={["HR_MANAGER", "ADMIN"]}>
            <RecruitmentRoutes />
          </RoleRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/hr/*">
        <ProtectedRoute>
          <RoleRoute allowedRoles={["HR_MANAGER", "ADMIN"]}>
            <RecruitmentRoutes />
          </RoleRoute>
        </ProtectedRoute>
      </Route>

      {/* Support Executive Protected scopes */}
      <Route path="/support/*">
        <ProtectedRoute>
          <RoleRoute allowedRoles={["SUPPORT_EXECUTIVE", "ADMIN"]}>
            <SupportRoutes />
          </RoleRoute>
        </ProtectedRoute>
      </Route>

      {/* CMS Content Manager Protected scopes */}
      <Route path="/cms/*">
        <ProtectedRoute>
          <RoleRoute allowedRoles={["CONTENT_MANAGER", "ADMIN"]}>
            <CmsConsoleRoutes />
          </RoleRoute>
        </ProtectedRoute>
      </Route>
      <Route path="/content/*">
        <ProtectedRoute>
          <RoleRoute allowedRoles={["CONTENT_MANAGER", "ADMIN"]}>
            <CmsConsoleRoutes />
          </RoleRoute>
        </ProtectedRoute>
      </Route>

      {/* Public routes and fallback */}
      <Route component={PublicRoutes} />
    </Switch>
  );
};

export default AppRouter;
