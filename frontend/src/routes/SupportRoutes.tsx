import React from "react";
import { Redirect, Route, Switch } from "wouter";
import AdminLayout from "../layouts/AdminLayout";
import SupportDashboard from "../features/support/pages/SupportDashboard";
import TicketList from "../features/support/pages/Tickets/TicketList";
import CreateTicket from "../features/support/pages/Tickets/CreateTicket";
import TicketDetails from "../features/support/pages/Tickets/TicketDetails";

export const SupportRoutes: React.FC = () => {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/support">
          <Redirect to="/support/dashboard" />
        </Route>
        <Route path="/support/dashboard" component={SupportDashboard} />
        <Route path="/support/tickets/create" component={CreateTicket} />
        <Route path="/support/tickets/new" component={CreateTicket} />
        <Route path="/support/tickets/:id" component={TicketDetails} />
        <Route path="/support/tickets" component={TicketList} />
      </Switch>
    </AdminLayout>
  );
};

export default SupportRoutes;
