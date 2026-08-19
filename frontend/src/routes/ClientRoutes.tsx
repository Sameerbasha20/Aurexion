import React from "react";
import { Redirect, Route, Switch } from "wouter";
import ClientLayout from "../layouts/ClientLayout";
import Dashboard from "../features/portal/pages/Dashboard";
import Projects from "../features/portal/pages/Projects";
import Requests from "../features/portal/pages/Requests";
import Documents from "../features/portal/pages/Documents";
import Profile from "../features/portal/pages/Profile";
import SupportHome from "../features/portal/pages/Support";
import TicketList from "../features/portal/pages/Support/TicketList";
import TicketDetails from "../features/portal/pages/Support/TicketDetails";
import CreateTicket from "../features/portal/pages/Support/CreateTicket";

export const ClientRoutes: React.FC = () => {
  return (
    <ClientLayout>
      <Switch>
        <Route path="/portal">
          <Redirect to="/portal/dashboard" />
        </Route>
        <Route path="/portal/dashboard" component={Dashboard} />
        <Route path="/portal/projects" component={Projects} />
        <Route path="/portal/requests" component={Requests} />
        <Route path="/portal/documents" component={Documents} />
        <Route path="/portal/profile" component={Profile} />
        <Route path="/portal/support" component={SupportHome} />
        <Route path="/portal/support/tickets/create" component={CreateTicket} />
        <Route path="/portal/support/tickets/new" component={CreateTicket} />
        <Route path="/portal/support/create" component={CreateTicket} />
        <Route path="/portal/support/new" component={CreateTicket} />
        <Route path="/portal/support/tickets/:id" component={TicketDetails} />
        <Route path="/portal/support/tickets" component={TicketList} />
      </Switch>
    </ClientLayout>
  );
};

export default ClientRoutes;