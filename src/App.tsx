
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HabitProvider } from "./contexts/HabitContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Today from "./pages/Today";
import AllHabits from "./pages/AllHabits";
import PartnerHabits from "./pages/PartnerHabits";
import HabitForm from "./pages/HabitForm";
import HabitDetail from "./pages/HabitDetail";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

// Create a client
const queryClient = new QueryClient();

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <HabitProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Today />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/all-habits"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <AllHabits />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/partner-habits"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <PartnerHabits />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/add-habit"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <HabitForm />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/edit-habit/:habitId"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <HabitForm />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/habit/:habitId"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <HabitDetail />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </HabitProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
