
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserStats {
  id: string;
  user_id: string;
  total_points: number;
  current_rank: number;
  quizzes_completed: number;
  forum_answers: number;
  created_at: string;
  updated_at: string;
}

export const useUserStats = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserStats();
    } else {
      setUserStats(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      let { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // User stats don't exist, create them
        const { data: newStats, error: insertError } = await supabase
          .from('user_stats')
          .insert([
            {
              user_id: user.id,
              total_points: 0,
              current_rank: 0,
              quizzes_completed: 0,
              forum_answers: 0
            }
          ])
          .select()
          .maybeSingle();

        if (insertError && insertError.code !== '23505') {
          // Ignore duplicate key errors, try to fetch again
          throw insertError;
        }

        if (insertError && insertError.code === '23505') {
          // Duplicate key error, fetch the existing record
          const { data: existingStats, error: fetchError } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (fetchError) throw fetchError;
          data = existingStats;
        } else {
          data = newStats;
        }
      }

      setUserStats(data);
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      toast({
        title: "Error loading stats",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserStats = async (updates: Partial<UserStats>) => {
    if (!user || !userStats) return;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setUserStats(data);

      // Update ranks for all users
      await supabase.rpc('update_user_ranks');

      return data;
    } catch (error: any) {
      console.error('Error updating user stats:', error);
      toast({
        title: "Error updating stats",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const addQuizPoints = async (points: number) => {
    if (!userStats) return;

    // Check if quiz was already completed today
    const { data: existingCompletion } = await supabase
      .from('daily_quiz_completions')
      .select('*')
      .eq('user_id', user?.id)
      .eq('quiz_date', new Date().toISOString().split('T')[0])
      .maybeSingle();

    if (existingCompletion) {
      toast({
        title: "Quiz already completed",
        description: "You have already completed today's quiz!",
        variant: "destructive",
      });
      return false;
    }

    // Record quiz completion
    const { error: completionError } = await supabase
      .from('daily_quiz_completions')
      .insert([
        {
          user_id: user?.id,
          points_earned: points,
          quiz_date: new Date().toISOString().split('T')[0]
        }
      ]);

    if (completionError) {
      console.error('Error recording quiz completion:', completionError);
      return false;
    }

    // Update user stats
    await updateUserStats({
      total_points: userStats.total_points + points,
      quizzes_completed: userStats.quizzes_completed + 1
    });

    return true;
  };

  const addForumPoints = async (points: number) => {
    if (!userStats) return;

    await updateUserStats({
      total_points: userStats.total_points + points,
      forum_answers: userStats.forum_answers + 1
    });
  };

  return {
    userStats,
    loading,
    updateUserStats,
    addQuizPoints,
    addForumPoints,
    refetch: fetchUserStats
  };
};
