import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppProvider, useApp } from "@/contexts/AppContext";
import MobileLayout from "@/components/layout/MobileLayout";
import LoginPage from "@/pages/LoginPage";
import ClientDashboard from "@/pages/ClientDashboard";
import CourierDashboard from "@/pages/CourierDashboard";
import CreateOrder from "@/pages/CreateOrder";
import OrderDetails from "@/pages/OrderDetails";
import ChatsList from "@/pages/ChatsList";
import ChatView from "@/pages/ChatView";
import ProfilePage from "@/pages/ProfilePage";
import AdminPanel from "@/pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return <MobileLayout>{children}</MobileLayout>;
};

const DashboardRouter: React.FC = () => {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'courier') return <CourierDashboard />;
  if (user.role === 'admin') return <AdminPanel />;
  return <ClientDashboard />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
    <Route path="/create-order" element={<ProtectedRoute><CreateOrder /></ProtectedRoute>} />
    <Route path="/order/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
    <Route path="/chats" element={<ProtectedRoute><ChatsList /></ProtectedRoute>} />
    <Route path="/chat/:orderId" element={<ProtectedRoute><ChatView /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
