import React, { lazy, Suspense } from "react";
import { Route, Switch, Redirect } from "wouter";
import AdminLayout from "../layouts/AdminLayout";
import LoadingState from "../components/feedback/LoadingState";
import { RFP } from "../features/bdm/pages/RFP";

const Dashboard = lazy(() => import("../features/crm/pages/Dashboard"));
const Leads = lazy(() => import("../features/crm/pages/Leads"));
const LeadDetail = lazy(() => import("../features/crm/pages/Leads/LeadDetail"));
const Opportunities = lazy(() => import("../features/crm/pages/Opportunities"));
const FollowUps = lazy(() => import("../features/crm/pages/FollowUps"));
const Activities = lazy(() => import("../features/crm/pages/Activities"));
const Contacts = lazy(() => import("../features/crm/pages/Contacts"));
const Companies = lazy(() => import("../features/crm/pages/Companies"));
const Quotations = lazy(() => import("../features/crm/pages/Quotations"));
const ContactForms = lazy(() => import("../features/crm/pages/ContactForms"));

export const CrmRoutes: React.FC = () => {
  return (
    <AdminLayout>
      <Suspense fallback={<LoadingState message="Loading CRM module..." />}>
        <Switch>
          {/* Core CRM / Sales Executive Routes */}
          <Route path="/crm/dashboard" component={Dashboard} />
          <Route path="/crm/contact-forms" component={ContactForms} />
          <Route path="/crm/leads" component={Leads} />
          <Route path="/crm/leads/" component={Leads} />
          <Route path="/crm/leads/:id" component={LeadDetail} />
          <Route path="/crm/leads/:id/" component={LeadDetail} />
          <Route path="/crm/opportunities" component={Opportunities} />
          <Route path="/crm/rfp" component={RFP} />
          <Route path="/crm/follow-ups" component={FollowUps} />
          <Route path="/crm/activities" component={Activities} />
          <Route path="/crm/contacts" component={Contacts} />
          <Route path="/crm/companies" component={Companies} />
          <Route path="/crm/quotations" component={Quotations} />

          {/* /sales Aliases */}
          <Route path="/sales/dashboard" component={Dashboard} />
          <Route path="/sales/leads" component={Leads} />
          <Route path="/sales/leads/" component={Leads} />
          <Route path="/sales/leads/:id" component={LeadDetail} />
          <Route path="/sales/leads/:id/" component={LeadDetail} />
          <Route path="/sales/opportunities" component={Opportunities} />
          <Route path="/sales/rfp" component={RFP} />
          <Route path="/sales/follow-ups" component={FollowUps} />
          <Route path="/sales/activities" component={Activities} />
          <Route path="/sales/contacts" component={Contacts} />
          <Route path="/sales/companies" component={Companies} />
          <Route path="/sales/quotations" component={Quotations} />
          <Route path="/sales">
            <Redirect to="/crm/dashboard" />
          </Route>

          {/* Default fallback within CRM scope */}
          <Route path="/crm">
            <Redirect to="/crm/dashboard" />
          </Route>
          <Route component={Dashboard} />
        </Switch>
      </Suspense>
    </AdminLayout>
  );
};

export default CrmRoutes;