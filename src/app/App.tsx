import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import { ErrorBoundary } from "./layout/ErrorBoundary";
import Home from "./pages/Home";
import Event from "./pages/Event";
import CreateCountdown from "./pages/CreateCountdown";
import Category from "./pages/Category";
import Countdown from "./pages/Countdown";
import Embed from "./pages/Embed";
import BlackFriday from "./pages/BlackFriday";
import Sport from "./pages/Sport";
import Match from "./pages/Match";
import Movies from "./pages/Movies";
import Movie from "./pages/Movie";
import About from "./pages/About";
import Contact from "./pages/Contact";
import OutRedirect from "./pages/OutRedirect";
import AdminDashboard from "./pages/AdminDashboard";
import AdminModeration from "./pages/AdminModeration";
import AdminAppearance from "./pages/AdminAppearance";
import AdminMetrics from "./pages/AdminMetrics";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";
import { SEOProvider } from "@/seo/SEOProvider";
import { AuthProvider } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import "@/styles/tailwind.css";
import AuthLogin from "./pages/AuthLogin";
import AuthCallback from "./pages/AuthCallback";
import Account from "./pages/Account";
import RequireAuth from "@/components/common/RequireAuth";
import LegalTerms from "./pages/LegalTerms";
import LegalPrivacy from "./pages/LegalPrivacy";
import LegalCookies from "./pages/LegalCookies";

const AppShell = () => {
  return (
    <SEOProvider>
      <AuthProvider>
        <ErrorBoundary fallback={<ServerError />}> 
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/evenimente/:slug" element={<Event />} />
                <Route path="/creeaza" element={<CreateCountdown />} />
                <Route path="/categorii/:slug" element={<Category />} />
                <Route path="/categorii/:slug/:year" element={<Category />} />
                <Route path="/c/:id" element={<Countdown />} />
                <Route path="/embed/:id" element={<Embed />} />
                <Route path="/black-friday" element={<BlackFriday />} />
                <Route path="/sport" element={<Sport />} />
                <Route path="/sport/:matchId" element={<Match />} />
                <Route path="/filme" element={<Movies />} />
                <Route path="/filme/:id" element={<Movie />} />
                <Route path="/out/:id" element={<OutRedirect />} />
                <Route path="/despre" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Auth */}
                <Route path="/auth/login" element={<AuthLogin />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                {/* Account */}
                <Route path="/account" element={<Account />} />

                {/* Admin */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/moderation"
                  element={
                    <ProtectedRoute>
                      <AdminModeration />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/appearance"
                  element={
                    <ProtectedRoute>
                      <AdminAppearance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/metrics"
                  element={
                    <ProtectedRoute>
                      <AdminMetrics />
                    </ProtectedRoute>
                  }
                />

                {/* Legal */}
                <Route path="/legal/terms" element={<LegalTerms />} />
                <Route path="/legal/privacy" element={<LegalPrivacy />} />
                <Route path="/legal/cookies" element={<LegalCookies />} />

                <Route path="/500" element={<ServerError />} />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </ErrorBoundary>
      </AuthProvider>
    </SEOProvider>
  );
};

export default AppShell;
