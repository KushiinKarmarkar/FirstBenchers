import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  subject: string;
  created_at: string;
  updated_at: string;
  likes: number;
  is_answered: boolean;
}

interface ForumAnswer {
  id: string;
  post_id: string;
  content: string;
  author_id: string;
  author_name: string;
  created_at: string;
  updated_at: string;
  is_helpful: boolean;
}

export const useForum = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [answers, setAnswers] = useState<{ [postId: string]: ForumAnswer[] }>({});
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<ForumPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('forum_answers')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setAnswers(prev => ({ ...prev, [postId]: data || [] }));
      return data || [];
    } catch (error: any) {
      console.error('Error fetching answers:', error);
      toast({
        title: "Error loading answers",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const createPost = async (title: string, content: string, subject: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a post.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert([
          {
            title,
            content,
            subject,
            author_id: user.id,
            author_name: user.email?.split('@')[0] || 'Anonymous',
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setPosts(prev => [data, ...prev]);
      toast({
        title: "Question posted!",
        description: "Your question has been posted to the forum.",
      });
      return true;
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const createAnswer = async (postId: string, content: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to answer.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('forum_answers')
        .insert([
          {
            post_id: postId,
            content,
            author_id: user.id,
            author_name: user.email?.split('@')[0] || 'Anonymous',
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setAnswers(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data]
      }));

      // Update post answered status
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, is_answered: true } : post
      ));

      toast({
        title: "Answer posted! +30 points",
        description: "Thank you for helping a fellow student!",
      });
      return true;
    } catch (error: any) {
      console.error('Error creating answer:', error);
      toast({
        title: "Error posting answer",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const markAsHelpful = async (answerId: string, postId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('forum_answers')
        .update({ is_helpful: true })
        .eq('id', answerId);

      if (error) throw error;

      setAnswers(prev => ({
        ...prev,
        [postId]: prev[postId]?.map(answer =>
          answer.id === answerId ? { ...answer, is_helpful: true } : answer
        ) || []
      }));

      toast({
        title: "Marked as helpful! +60 points awarded",
        description: "The answer author has been awarded 60 additional points.",
      });
      return true;
    } catch (error: any) {
      console.error('Error marking as helpful:', error);
      toast({
        title: "Error updating answer",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const searchPosts = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.rpc('search_forum_posts', {
        search_query: query
      });

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error: any) {
      console.error('Error searching posts:', error);
      toast({
        title: "Search error",
        description: error.message,
        variant: "destructive",
      });
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setIsSearching(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    answers,
    loading,
    searchResults,
    isSearching,
    fetchAnswers,
    createPost,
    createAnswer,
    markAsHelpful,
    searchPosts,
    clearSearch,
  };
};
