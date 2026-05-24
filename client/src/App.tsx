import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from '@/pages/Home';
import Destinations from '@/pages/Destinations';
import DestinationsMap from '@/pages/DestinationsMap';
import Sichuan from '@/pages/Sichuan';
import Experiences from "./pages/Experiences";
import Inspiration from "./pages/Inspiration";
import About from "./pages/About";
import SichuanDetail from "./pages/SichuanDetail";
import Contact from "./pages/Contact";
import PlanYourTrip from './pages/PlanYourTrip';
import ExperienceDetail from './pages/ExperienceDetail';
import YunnanDetail from './pages/YunnanDetail';
import FontShowcase from "./pages/FontShowcase";
import TeaMountains from "./pages/TeaMountains";
import WhyUs from "./pages/WhyUs";
import OurTeam from "./pages/OurTeam";
import AdminEnquiries from "./pages/AdminEnquiries";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCities from "./pages/AdminCities";
import AdminExperiences from "./pages/AdminExperiences";
import AdminItineraries from "./pages/AdminItineraries";
import AdminStories from "./pages/AdminStories";
import AdminVideos from "./pages/AdminVideos";
import AdminTags from "./pages/AdminTags";
import AdminMediaLibrary from "./pages/AdminMediaLibrary";
import AdminTeamMembers from "./pages/AdminTeamMembers";
import AdminExperiencesByType from "./pages/AdminExperiencesByType";
import AdminExperiencesByCity from "./pages/AdminExperiencesByCity";
import AdminExperienceEdit from "./pages/AdminExperienceEdit";
import AdminCityEdit from "./pages/AdminCityEdit";

import ExperienceCategoryPage from "./pages/ExperienceCategoryPage";
import CityPage from "./pages/CityPage";
import CMSAdmin from "./pages/CMSAdmin";
import ItineraryDetail from "./pages/ItineraryDetail";

/**
 * App Router & Layout
 * Design: Light theme with elegant luxury travel aesthetic
 * Color scheme: Warm golds, deep charcoal, cream whites
 */
function Router() {
  const [location] = useLocation();
  
  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/destinations" component={Destinations} />
      <Route path="/destinations/sichuan" component={Sichuan} />
      <Route path="/destinations/:slug" component={CityPage} />
      <Route path="/experiences" component={Experiences} />
      <Route path="/inspiration" component={Inspiration} />
      <Route path="/about" component={About} />
      <Route path="/make-an-enquiry" component={Contact} />
      <Route path="/plan-your-trip" component={PlanYourTrip} />
      <Route path="/experiences/2" component={YunnanDetail} />
      <Route path="/experiences/tea-mountains-yaan" component={TeaMountains} />
      <Route path="/template/experience" component={TeaMountains} />
      <Route path="/template/city" component={Sichuan} />
      <Route path="/template/itinerary" component={YunnanDetail} />
      <Route path="/itinerary/:slug" component={ItineraryDetail} />
      <Route path="/about/why-us" component={WhyUs} />
      <Route path="/about/our-team" component={OurTeam} />
      <Route path="/experiences/:categorySlug/:id" component={ExperienceDetail} />
      <Route path="/experiences/:categorySlug" component={ExperienceCategoryPage} />
      <Route path="/experience-preview/:slug" component={ExperienceDetail} />
      <Route path="/font-showcase" component={FontShowcase} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/cms" component={CMSAdmin} />
      <Route path="/admin/enquiries" component={AdminEnquiries} />
      <Route path="/admin/cities" component={AdminCities} />
      <Route path="/admin/cities/:id/edit" component={AdminCityEdit} />
      <Route path="/admin/cities/:cityId/experiences" component={AdminExperiencesByCity} />
      <Route path="/admin/experiences" component={AdminExperiences} />
      <Route path="/admin/experiences/type/:typeId" component={AdminExperiencesByType} />
      <Route path="/admin/experiences/edit/:id" component={AdminExperienceEdit} />
      <Route path="/admin/itineraries" component={AdminItineraries} />
      <Route path="/admin/stories" component={AdminStories} />
      <Route path="/admin/videos" component={AdminVideos} />
      <Route path="/admin/tags" component={AdminTags} />
      <Route path="/admin/media" component={AdminMediaLibrary} />
      <Route path="/admin/team-members" component={AdminTeamMembers} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
          </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
