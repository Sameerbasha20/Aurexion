import React from "react";
import { Route, Switch, Redirect } from "wouter";
import AdminLayout from "../layouts/AdminLayout";
import CmsDashboard from "../features/cms/pages/CmsDashboard";
import Services from "../features/cms/pages/Services";
import CaseStudies from "../features/cms/pages/CaseStudies";
import Industries from "../features/cms/pages/Industries";
import Blog from "../features/cms/pages/Blog";
import Categories from "../features/cms/pages/Categories";

export const CmsConsoleRoutes: React.FC = () => {
  return (
    <AdminLayout>
      <Switch>
        {/* Core CMS Routes */}
        <Route path="/cms/dashboard" component={CmsDashboard} />
        <Route path="/cms/services" component={Services} />
        <Route path="/cms/case-studies" component={CaseStudies} />
        <Route path="/cms/industries" component={Industries} />
        <Route path="/cms/blog" component={Blog} />
        <Route path="/cms/categories" component={Categories} />

        {/* /admin/cms & /admin/content Aliases */}
        <Route path="/admin/cms" component={CmsDashboard} />
        <Route path="/admin/content" component={CmsDashboard} />
        <Route path="/admin/content/services" component={Services} />
        <Route path="/admin/content/case-studies" component={CaseStudies} />
        <Route path="/admin/content/industries" component={Industries} />
        <Route path="/admin/content/blog" component={Blog} />
        <Route path="/admin/content/categories" component={Categories} />

        {/* Fallbacks */}
        <Route path="/cms">
          <Redirect to="/cms/dashboard" />
        </Route>
        <Route component={CmsDashboard} />
      </Switch>
    </AdminLayout>
  );
};

export default CmsConsoleRoutes;
