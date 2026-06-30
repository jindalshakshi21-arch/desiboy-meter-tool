import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ReadingsProvider } from "@/context/ReadingsContext";
import VendorSelection from "@/pages/VendorSelection";
import MeterReading from "@/pages/MeterReading";
import Login from "@/pages/Login";
import ReadingHistory from "@/pages/ReadingHistory";
import AdminPanel from "@/pages/AdminPanel";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="app-container flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-container flex items-center justify-center min-h-dvh">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {user ? <Redirect to="/" /> : <Login />}
      </Route>
      <Route path="/admin">
        <AdminPanel />
      </Route>
      <Route path="/">
        <ProtectedRoute component={VendorSelection} />
      </Route>
      <Route path="/meter/:vendor">
        <ProtectedRoute component={MeterReading} />
      </Route>
      <Route path="/history">
        <ProtectedRoute component={ReadingHistory} />
      </Route>
      <Route>
        <div className="app-container flex items-center justify-center min-h-dvh">
          <p className="text-muted-foreground">Page not found</p>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <ReadingsProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </ReadingsProvider>
    </AuthProvider>
  );
}

export default App;
