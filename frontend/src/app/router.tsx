import React, { lazy, Suspense } from "react";
import { Route, Switch } from "wouter";
import ProtectedRoute from "../routes/ProtectedRoute";
import RoleRoute from "../routes/RoleRoute";
import { Spinner } from "../components/ui/spinner";

// Dynamic lazy imports for main route scope bundles
const PublicRoutes = lazy(() => import("../routes/PublicRoutes"));
const AuthRoutes = lazy(() => import("../routes/AuthRoutes"));
const AdminRoutes = lazy(() => import("../routes/AdminRoutes"));
const BdmRoutes = lazy(() => import("../routes/BdmRoutes"));
const ClientRoutes = lazy(() => import("../routes/ClientRoutes"));
const CrmRoutes = lazy(() => import("../routes/CrmRoutes"));
const RecruitmentRoutes = lazy(() => import("../routes/RecruitmentRoutes"));
const SupportRoutes = lazy(() => import("../routes/SupportRoutes"));
const CmsConsoleRoutes = lazy(() => import("../routes/CmsConsoleRoutes"));

const PageFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner className="w-8 h-8 text-cyan-400" />
  </div>
);

export const AppRouter: React.FC = () => {
  return (
    <Suspense fallback={<PageFallback />}>
      <Switch>
        {/* Auth routes */}
        <Route path="/login*" component={AuthRoutes} />
        <Route path="/login" component={AuthRoutes} />
        <Route path="/forgot-password*" component={AuthRoutes} />
        <Route path="/reset-password*" component={AuthRoutes} />
        <Route path="/verify-email*" component={AuthRoutes} />

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
    </Suspense>
  );
};

export default AppRouter;

