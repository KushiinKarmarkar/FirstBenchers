import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, BookOpen, FileText, Calendar } from "lucide-react";
import { DailyQuiz } from "@/components/DailyQuiz";
import { useUserStats } from "@/hooks/useUserStats";
import { supabase } from "@/integrations/supabase/client";

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { userStats, addQuizPoints } = useUserStats();

  useEffect(() => {
    checkQuizCompletion();
  }, []);

  const checkQuizCompletion = async () => {
    const { data } = await supabase
      .from('daily_quiz_completions')
      .select('*')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('quiz_date', new Date().toISOString().split('T')[0])
      .single();

    setQuizCompleted(!!data);
  };

  const handleQuizComplete = async (points: number) => {
    const success = await addQuizPoints(points);
    if (success) {
      setQuizCompleted(true);
      setShowQuiz(false);
    }
  };

  if (showQuiz) {
    return <DailyQuiz onComplete={handleQuizComplete} onClose={() => setShowQuiz(false)} />;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header with Rank */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back, Student! 🎓</h1>
          <p className="text-gray-600">Ready to learn something new today?</p>
        </div>
        <Button
          onClick={() => onNavigate("leaderboard")}
          variant="outline"
          className="flex items-center space-x-2 border-2 border-yellow-400 hover:bg-yellow-50"
        >
          <Trophy className="h-5 w-5 text-yellow-600" />
          <span className="font-semibold">Rank #{userStats?.current_rank || '--'}</span>
          <Badge variant="secondary">{userStats?.total_points || 0} pts</Badge>
        </Button>
      </div>

      {/* Daily Quiz Section */}
      <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-6 w-6" />
            <span>Daily Challenge</span>
          </CardTitle>
          <CardDescription className="text-purple-100">
            Complete today's quiz to earn points and climb the leaderboard!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setShowQuiz(true)}
            disabled={quizCompleted}
            className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
          >
            {quizCompleted ? "Quiz Completed Today! ✅" : "Start Daily Quiz"}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("notes")}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-blue-700">
              <BookOpen className="h-6 w-6" />
              <span>Study Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Access comprehensive notes for all subjects</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Science</Badge>
              <Badge variant="secondary">Math</Badge>
              <Badge variant="secondary">English</Badge>
              <Badge variant="secondary">+3 more</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("qa")}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-green-700">
              <FileText className="h-6 w-6" />
              <span>Practice Q&A</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Solve previous year questions and practice problems</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Short Answers</Badge>
              <Badge variant="secondary">Long Answers</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate("forum")}>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-2 text-purple-700">
              <Star className="h-6 w-6" />
              <span>Study Forum</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Ask doubts, help others, earn badges and points</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Community Help</Badge>
              <Badge variant="secondary">Earn Badges</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-green-800">Quizzes Completed: {userStats?.quizzes_completed || 0}</span>
              <Badge className="bg-green-600">Progress</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-800">Forum Answers: {userStats?.forum_answers || 0}</span>
              <Badge variant="outline">Community</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-yellow-800">Total Points: {userStats?.total_points || 0}</span>
              <Badge variant="secondary">Achievement</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};