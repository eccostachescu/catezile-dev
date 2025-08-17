import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import { ErrorBoundary } from "./layout/ErrorBoundary";
import Home from "./pages/Home";
import Event from "./pages/Event";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import CreateCountdown from "./pages/CreateCountdown";
import Category from "./pages/Category";
import Countdown from "./pages/Countdown";
import Embed from "./pages/Embed";
import BlackFriday from "./pages/BlackFriday";
import BFSlug from "./pages/BFSlug";
import Sport from "./pages/Sport";
import Match from "./pages/Match";
import Movies from "./pages/Movies";
import MoviesHome from "../pages/movies/Home";
import MovieMonth from "../pages/movies/Month";
import MovieDetail from "../pages/movies/Movie";
import MoviesPlatform from "./pages/MoviesPlatform";
import About from "./pages/About";
import Contact from "./pages/Contact";
import OutRedirect from "./pages/OutRedirect";
import AdminDashboard from "./pages/AdminDashboard";
import AdminModeration from "./pages/AdminModeration";
import AdminAppearance from "./pages/AdminAppearance";
import AdminMetrics from "./pages/AdminMetrics";
import AdminDeploy from "./pages/AdminDeploy";
import AdminEmails from "./pages/AdminEmails";
import AdminEvents from "./pages/AdminEvents";
import AdminImageSuggestions from "./pages/AdminImageSuggestions";
import NotFound from "./pages/NotFound";
import ServerError from "./pages/ServerError";
import SearchPage from "./pages/Search";
import TagPage from "./pages/Tag";
import TeamPage from "./pages/Team";
import TVGuide from "./pages/TVGuide";
import TVChannelPage from "./pages/TVChannel";
import AdminSearch from "./pages/AdminSearch";
import { TVInternational } from "./pages/TVInternational";
import { EmisiuniRomanesti } from "./pages/EmisiuniRomanesti";
import { TVShow } from "./pages/TVShow";
import { AdminTVShows } from "./pages/AdminTVShows";
import AdminTMDB from "./pages/AdminTMDB";
import { SEOProvider } from "@/seo/SEOProvider";
import { AuthProvider } from "@/lib/auth";
import { I18nProvider } from "@/lib/i18n";
import ProtectedRoute from "@/components/ProtectedRoute";
import "@/styles/tailwind.css";
import AuthLogin from "./pages/AuthLogin";
import AuthCallback from "./pages/AuthCallback";
import Account from "./pages/Account";
import RequireAuth from "@/components/common/RequireAuth";
import LegalTerms from "./pages/LegalTerms";
import LegalPrivacy from "./pages/LegalPrivacy";
import LegalCookies from "./pages/LegalCookies";
import Liga1Overview from "./pages/liga1/Overview";
import Liga1TeamsPage from "./pages/liga1/Teams";
import Liga1TeamDetailPage from "./pages/liga1/TeamDetail";
import Liga1RoundPage from "./pages/liga1/Round";
import { HolidaysHome, HolidayDetail, SchoolCalendar, Exams, ExamDetail } from "../pages/holidays";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import News from "./pages/News";
import Blog from "./pages/Blog";
import Guide from "./pages/Guide";
import API from "./pages/API";
import Careers from "./pages/Careers";
import DataImport from "../pages/DataImport";
import PopulateData from "../pages/PopulateData";
import PopulateRealData from "../pages/PopulateRealData";
import QuickSampleData from "../pages/QuickSampleData";
import Popular from "./pages/Popular";

const AppShell = () => {
  return (
    <SEOProvider>
      <I18nProvider>
        <AuthProvider>
          <ErrorBoundary fallback={<ServerError />}>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/populare" element={<Popular />} />
                <Route path="/evenimente" element={<Events />} />
                <Route path="/evenimente/:slug" element={<Event />} />
                <Route path="/adauga-eveniment" element={<CreateEvent />} />
                <Route path="/creeaza" element={<CreateCountdown />} />
                <Route path="/categorii/:slug" element={<Category />} />
                <Route path="/categorii/:slug/:year" element={<Category />} />
                <Route path="/c/:id" element={<Countdown />} />
                <Route path="/embed/:id" element={<Embed />} />
                <Route path="/black-friday" element={<BlackFriday />} />
                <Route path="/black-friday/:slug" element={<BFSlug />} />
                <Route path="/sport" element={<Sport />} />
                <Route path="/sport/:matchId" element={<Match />} />
                <Route path="/liga-1" element={<Liga1Overview />} />
                <Route path="/liga-1/echipe" element={<Liga1TeamsPage />} />
                <Route path="/liga-1/echipe/:slug" element={<Liga1TeamDetailPage />} />
                <Route path="/superliga" element={<Navigate to="/liga-1" replace />} />
                <Route path="/filme" element={<MoviesHome />} />
                <Route path="/filme/:year-:month" element={<MovieMonth />} />
                <Route path="/filme/netflix" element={<MoviesPlatform />} />
                <Route path="/filme/prime" element={<MoviesPlatform />} />
                <Route path="/filme/prime-video" element={<MoviesPlatform />} />
                <Route path="/filme/max" element={<MoviesPlatform />} />
                <Route path="/filme/hbo-max" element={<MoviesPlatform />} />
                <Route path="/filme/disney" element={<MoviesPlatform />} />
                <Route path="/filme/disney-plus" element={<MoviesPlatform />} />
                <Route path="/filme/apple-tv" element={<MoviesPlatform />} />
                <Route path="/filme/:slug" element={<MovieDetail />} />
                
                {/* Holidays & School */}
                <Route path="/sarbatori" element={<HolidaysHome />} />
                <Route path="/sarbatori/:slug" element={<HolidayDetail />} />
                <Route path="/calendar-scolar" element={<SchoolCalendar />} />
                <Route path="/examene" element={<Exams />} />
                <Route path="/examene/:slug" element={<ExamDetail />} />
                
                <Route path="/out/:id" element={<OutRedirect />} />
                
                {/* Company pages */}
                <Route path="/cum-functioneaza" element={<HowItWorks />} />
                <Route path="/preturi" element={<Pricing />} />
                <Route path="/noutati" element={<News />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/ghid-utilizare" element={<Guide />} />
                <Route path="/api" element={<API />} />
                <Route path="/cariere" element={<Careers />} />
                <Route path="/despre" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Search & discovery */}
                <Route path="/cauta" element={<SearchPage />} />
                <Route path="/tag/:slug" element={<TagPage />} />
                <Route path="/echipa/:teamSlug" element={<TeamPage />} />
                <Route path="/tv" element={<TVInternational />} />
                <Route path="/tv/program" element={<TVGuide />} />
                <Route path="/tv/emisiuni" element={<EmisiuniRomanesti />} />
                <Route path="/tv/emisiuni/:slug" element={<TVShow />} />
                <Route path="/countdown/tv/:slug" element={<TVShow />} />
                <Route path="/tv/:channelSlug" element={<TVChannelPage />} />

                {/* Data Import */}
                <Route path="/import" element={<DataImport />} />
                <Route path="/populate" element={<PopulateData />} />
                <Route path="/populate-real-data" element={<PopulateRealData />} />
                <Route path="/sample" element={<QuickSampleData />} />

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
                <Route
                  path="/admin/deploy"
                  element={
                    <ProtectedRoute>
                      <AdminDeploy />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/emails"
                  element={
                    <ProtectedRoute>
                      <AdminEmails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/search"
                  element={
                    <ProtectedRoute>
                      <AdminSearch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events"
                  element={
                    <ProtectedRoute>
                      <AdminEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/image-suggestions"
                  element={
                    <ProtectedRoute>
                      <AdminImageSuggestions />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tv"
                  element={
                    <ProtectedRoute>
                      <AdminTVShows />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/tmdb"
                  element={
                    <ProtectedRoute>
                      <AdminTMDB />
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
      </I18nProvider>
    </SEOProvider>
  );
};

export default AppShell;
