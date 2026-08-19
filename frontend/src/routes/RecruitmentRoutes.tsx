import React from "react";
import { Route, Switch, Redirect } from "wouter";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../features/recruitment/pages/Dashboard";
import Jobs from "../features/recruitment/pages/Jobs";
import Candidates from "../features/recruitment/pages/Candidates";
import Applications from "../features/recruitment/pages/Applications";

export const RecruitmentRoutes: React.FC = () => {
  return (
    <AdminLayout>
      <Switch>
        {/* Core Recruitment / HR Routes */}
        <Route path="/recruitment/dashboard" component={Dashboard} />
        <Route path="/recruitment/jobs" component={Jobs} />
        <Route path="/recruitment/candidates" component={Candidates} />
        <Route path="/recruitment/applications" component={Applications} />

        {/* /hr Aliases */}
        <Route path="/hr/dashboard" component={Dashboard} />
        <Route path="/hr/jobs" component={Jobs} />
        <Route path="/hr/candidates" component={Candidates} />
        <Route path="/hr/applications" component={Applications} />
        <Route path="/hr">
          <Redirect to="/recruitment/dashboard" />
        </Route>

        {/* Fallbacks */}
        <Route path="/recruitment">
          <Redirect to="/recruitment/dashboard" />
        </Route>
        <Route component={Dashboard} />
      </Switch>
    </AdminLayout>
  );
};

export default RecruitmentRoutes;
