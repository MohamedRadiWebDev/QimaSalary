import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/header";
import { HistoryPanel } from "@/components/history-panel";
import EmployeesPage from "@/pages/employees";
import DashboardPage from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import type { HistoryEntry } from "@shared/schema";

function AppContent() {
  const [showHistory, setShowHistory] = useState(false);

  const { data: historyData, isLoading: isLoadingHistory } = useQuery<HistoryEntry[]>({
    queryKey: ["/api/history"],
    enabled: showHistory,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header onOpenHistory={() => setShowHistory(true)} />
      
      <main>
        <Switch>
          <Route path="/" component={EmployeesPage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route component={NotFound} />
        </Switch>
      </main>

      <HistoryPanel
        open={showHistory}
        onOpenChange={setShowHistory}
        history={historyData ?? []}
        isLoading={isLoadingHistory}
      />

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
