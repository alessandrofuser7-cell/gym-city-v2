import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/lib/store";
import { Layout } from "@/components/layout";
import { motion, AnimatePresence } from "framer-motion";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CalendarPage from "@/pages/calendar";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin";
import LoginPage from "@/pages/login";
import ChangePasswordPage from "@/pages/change-password";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

function Router() {
  const [location] = useLocation();
  
  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Switch location={location} key={location}>
          <Route path="/">
            <AnimatedPage><Home /></AnimatedPage>
          </Route>
          <Route path="/calendar">
            <AnimatedPage><CalendarPage /></AnimatedPage>
          </Route>
          <Route path="/profile">
            <AnimatedPage><ProfilePage /></AnimatedPage>
          </Route>
          <Route path="/admin">
            <AnimatedPage><AdminPage /></AnimatedPage>
          </Route>
          <Route path="/login">
            <AnimatedPage><LoginPage /></AnimatedPage>
          </Route>
          <Route path="/change-password">
            <ChangePasswordPage />
          </Route>
          <Route>
            <AnimatedPage><NotFound /></AnimatedPage>
          </Route>
        </Switch>
      </AnimatePresence>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <Router />
        <Toaster />
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
