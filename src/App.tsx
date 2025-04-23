
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HabitProvider } from "./contexts/HabitContext";
import Layout from "./components/Layout";
import Today from "./pages/Today";
import AllHabits from "./pages/AllHabits";
import PartnerHabits from "./pages/PartnerHabits";
import CalendarView from "./pages/CalendarView";
import HabitForm from "./pages/HabitForm";
import HabitDetail from "./pages/HabitDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HabitProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Today />} />
              <Route path="/all-habits" element={<AllHabits />} />
              <Route path="/partner-habits" element={<PartnerHabits />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/add-habit" element={<HabitForm />} />
              <Route path="/edit-habit/:habitId" element={<HabitForm />} />
              <Route path="/habit/:habitId" element={<HabitDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </HabitProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
