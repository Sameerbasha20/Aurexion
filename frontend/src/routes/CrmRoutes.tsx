import React from "react";
import { Route, Switch, Redirect } from "wouter";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../features/crm/pages/Dashboard";
import Leads from "../features/crm/pages/Leads";
import LeadDetail from "../features/crm/pages/Leads/LeadDetail";
import Opportunities from "../features/crm/pages/Opportunities";
import FollowUps from "../features/crm/pages/FollowUps";
import Activities from "../features/crm/pages/Activities";
import Contacts from "../features/crm/pages/Contacts";
import Companies from "../features/crm/pages/Companies";
import Quotations from "../features/crm/pages/Quotations";

export const CrmRoutes: React.FC = () => {
  return (
    <AdminLayout>
      <Switch>
        {/* Core CRM / Sales Executive Routes */}
        <Route path="/crm/dashboard" component={Dashboard} />
        <Route path="/crm/leads" component={Leads} />
        <Route path="/crm/leads/" component={Leads} />
        <Route path="/crm/leads/:id" component={LeadDetail} />
        <Route path="/crm/leads/:id/" component={LeadDetail} />
        <Route path="/crm/opportunities" component={Opportunities} />
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
    </AdminLayout>
  );
};

export default CrmRoutes;
