import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import InvestorDashboard from "@/pages/investor-dashboard";
import EntrepreneurDashboard from "@/pages/entrepreneur-dashboard";
import Profile from "@/pages/profile";
import Chat from "@/pages/chat";

function AuthenticatedRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/">
          <Redirect to="/login" />
        </Route>
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/dashboard/investor">
        {user.role === 'investor' ? <InvestorDashboard /> : <Redirect to={`/dashboard/${user.role}`} />}
      </Route>
      <Route path="/dashboard/entrepreneur">
        {user.role === 'entrepreneur' ? <EntrepreneurDashboard /> : <Redirect to={`/dashboard/${user.role}`} />}
      </Route>
      <Route path="/profile/:id" component={Profile} />
      <Route path="/chat/:userId" component={Chat} />
      <Route path="/discover">
        {user.role === 'investor' ? <InvestorDashboard /> : <EntrepreneurDashboard />}
      </Route>
      <Route path="/messages">
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Messages</h2>
            <p className="text-slate-600">Message functionality coming soon!</p>
          </div>
        </div>
      </Route>
      <Route path="/">
        <Redirect to={`/dashboard/${user.role}`} />
      </Route>
      <Route path="/login">
        <Redirect to={`/dashboard/${user.role}`} />
      </Route>
      <Route path="/register">
        <Redirect to={`/dashboard/${user.role}`} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function Router() {
  return <AuthenticatedRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
