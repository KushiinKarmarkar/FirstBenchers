
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { NotesSection } from "@/components/NotesSection";
import { QASection } from "@/components/QASection";
import { Forum } from "@/components/Forum";
import { Leaderboard } from "@/components/Leaderboard";
import { ReportIssue } from "@/components/ReportIssue";
import { AIChatBubble } from "@/components/AIChatBubble";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthModal />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "notes":
        return <NotesSection onNavigate={setCurrentPage} />;
      case "qa":
        return <QASection onNavigate={setCurrentPage} />;
      case "forum":
        return <Forum />;
      case "leaderboard":
        return <Leaderboard />;
      case "report":
        return <ReportIssue />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex w-full">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {renderCurrentPage()}
      </main>
      <AIChatBubble />
    </div>
  );
};

export default Index;
