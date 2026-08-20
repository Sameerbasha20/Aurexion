import React from "react";
import { Route, Switch } from "wouter";
import BdmLayout from "../layouts/BdmLayout";
import Dashboard from "../features/bdm/pages/Dashboard";
import ContactForms from "../features/bdm/pages/ContactForms";
import Leads from "../features/bdm/pages/Leads";
import Opportunities from "../features/bdm/pages/Opportunities";
import Clients from "../features/bdm/pages/Clients";
import RFP from "../features/bdm/pages/RFP";
import Estimator from "../features/bdm/pages/Estimator";

export const BdmRoutes: React.FC = () => {
  return (
    <BdmLayout>
      <Switch>
        <Route path="/bdm/dashboard" component={Dashboard} />
        <Route path="/bdm/contact-forms" component={ContactForms} />
        <Route path="/bdm/leads" component={Leads} />
        <Route path="/bdm/opportunities" component={Opportunities} />
        <Route path="/bdm/clients" component={Clients} />
        <Route path="/bdm/rfp" component={RFP} />
        <Route path="/bdm/estimator" component={Estimator} />
      </Switch>
    </BdmLayout>
  );
};

export default BdmRoutes;

