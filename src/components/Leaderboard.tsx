import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Home, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserStats } from "@/hooks/useUserStats";

interface LeaderboardUser {
  user_id: string;
  total_points: number;
  current_rank: number;
  quizzes_completed: number;
  forum_answers: number;
  display_name: string | null;
}

export const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { userStats } = useUserStats();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      // Get user stats with display_name - no need for separate profiles query
      const { data: statsData, error: statsError } = await supabase
        .from('user_stats')
        .select('user_id, total_points, current_rank, quizzes_completed, forum_answers, display_name')
        .order('total_points', { ascending: false })
        .limit(10);

      if (statsError) throw statsError;

      setLeaderboardData(statsData || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getBadgeText = (user: LeaderboardUser) => {
    if (user.total_points >= 2000) return "🥇 Quiz Master";
    if (user.total_points >= 1500) return "🥈 Study Star";
    if (user.total_points >= 1000) return "🥉 Knowledge Seeker";
    if (user.forum_answers >= 10) return "🤝 Helper";
    if (user.quizzes_completed >= 5) return "📚 Consistent Learner";
    return "⭐ Rising Star";
  };

  const getUserDisplayName = (user: LeaderboardUser) => {
    return user.display_name || 'Anonymous User';
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🏆 Leaderboard</h1>
        <Button onClick={() => window.location.reload()} variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
      </div>

      {/* User's Current Position */}
      {userStats && (
        <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Your Position</h2>
                <p className="text-blue-100">Keep studying to climb higher!</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">#{userStats.current_rank || '--'}</div>
                <div className="text-blue-100">{userStats.total_points} points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Users Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span>Top Students This Month</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboardData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No users on the leaderboard yet.</p>
              <p className="text-sm">Complete quizzes and help others to appear here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboardData.map((user, index) => {
                const rank = index + 1;
                const isCurrentUser = userStats?.user_id === user.user_id;
                
                return (
                  <div
                    key={user.user_id}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' : 'bg-gray-50 hover:bg-gray-100'
                    } ${isCurrentUser ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10">
                        {getRankIcon(rank)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {getUserDisplayName(user)}
                          {isCurrentUser && <span className="text-blue-600 ml-2">(You)</span>}
                        </h3>
                        <p className="text-sm text-gray-600">{getBadgeText(user)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-800">{user.total_points}</div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Available Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="text-2xl">🎯</div>
              <div>
                <h4 className="font-semibold">Daily Streaker</h4>
                <p className="text-sm text-gray-600">Complete 7 daily quizzes in a row</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl">🤝</div>
              <div>
                <h4 className="font-semibold">Helper</h4>
                <p className="text-sm text-gray-600">Answer 10 forum questions</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl">📚</div>
              <div>
                <h4 className="font-semibold">Bookworm</h4>
                <p className="text-sm text-gray-600">Read notes from all subjects</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl">⚡</div>
              <div>
                <h4 className="font-semibold">Speed Demon</h4>
                <p className="text-sm text-gray-600">Complete quiz in under 3 minutes</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};