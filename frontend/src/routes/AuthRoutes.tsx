import React from "react";
import { Route, Switch } from "wouter";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../features/authentication/pages/Login";
import ForgotPassword from "../features/authentication/pages/ForgotPassword";
import ResetPassword from "../features/authentication/pages/ResetPassword";
import VerifyEmail from "../features/authentication/pages/VerifyEmail";

export const AuthRoutes: React.FC = () => {
  return (
    <AuthLayout>
      <Switch>
        <Route path="/login*" component={Login} />
        <Route path="/login" component={Login} />
        <Route path="/forgot-password*" component={ForgotPassword} />
        <Route path="/reset-password*" component={ResetPassword} />
        <Route path="/verify-email*" component={VerifyEmail} />
      </Switch>
    </AuthLayout>
  );
};

export default AuthRoutes;
