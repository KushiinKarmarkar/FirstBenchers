import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsUp, Award, Plus, Home, Check, Search, X } from "lucide-react";
import { useUserStats } from "@/hooks/useUserStats";
import { useAuth } from "@/hooks/useAuth";
import { useForum } from "@/hooks/useForum";

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

export const Forum = () => {
  const [showNewPost, setShowNewPost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostSubject, setNewPostSubject] = useState("Science");
  const [answerText, setAnswerText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { userStats, addForumPoints } = useUserStats();
  const { user } = useAuth();
  const {
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
  } = useForum();

  const handleNewPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      return;
    }

    const success = await createPost(newPostTitle, newPostContent, newPostSubject);
    if (success) {
      setShowNewPost(false);
      setNewPostTitle("");
      setNewPostContent("");
    }
  };

  const handleAnswer = async (postId: string) => {
    if (!answerText.trim()) {
      return;
    }

    const success = await createAnswer(postId, answerText);
    if (success) {
      await addForumPoints(30);
      setAnswerText("");
      
      // Refresh answers for the current post
      if (selectedPost) {
        await fetchAnswers(selectedPost.id);
      }
    }
  };

  const handleMarkHelpful = async (answerId: string, answerAuthorId: string) => {
    if (!user || !selectedPost) return;

    if (selectedPost.author_id !== user.id) {
      return;
    }

    const success = await markAsHelpful(answerId, selectedPost.id);
    if (success) {
      // In a real app, you'd award points to the specific user
      // For now, we'll just show the success message
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchPosts(query);
    } else {
      clearSearch();
    }
  };

  const handlePostClick = async (post: ForumPost) => {
    setSelectedPost(post);
    await fetchAnswers(post.id);
  };

  const displayPosts = isSearching ? searchResults : posts;

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="text-center">
          <p>Loading forum...</p>
        </div>
      </div>
    );
  }

  if (selectedPost) {
    const postAnswers = answers[selectedPost.id] || [];
    
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => setSelectedPost(null)} variant="outline">
            ← Back to Forum
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">{selectedPost.title}</CardTitle>
              <Badge>{selectedPost.subject}</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Asked by {selectedPost.author_name} on {new Date(selectedPost.created_at).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{selectedPost.content}</p>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <ThumbsUp className="h-4 w-4 mr-2" />
                {selectedPost.likes}
              </Button>
              <span className="text-sm text-gray-600">{postAnswers.length} replies</span>
            </div>
          </CardContent>
        </Card>

        {postAnswers.length > 0 && (
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-semibold">Answers</h3>
            {postAnswers.map((answer) => (
              <Card key={answer.id} className={`${answer.is_helpful ? 'border-green-500 bg-green-50' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      {answer.author_name} • {new Date(answer.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      {answer.is_helpful && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Helpful
                        </Badge>
                      )}
                      {selectedPost.author_id === user?.id && !answer.is_helpful && answer.author_id !== user?.id && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkHelpful(answer.id, answer.author_id)}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Mark Helpful (+60 pts)
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700">{answer.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Answer</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Write your answer here..." 
              className="mb-4"
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
            />
            <Button onClick={() => handleAnswer(selectedPost.id)}>
              Post Answer (+30 points)
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showNewPost) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => setShowNewPost(false)} variant="outline">
            ← Back to Forum
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <select 
                value={newPostSubject} 
                onChange={(e) => setNewPostSubject(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="Science">Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Social Science">Social Science</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Question Title</label>
              <Input 
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                placeholder="Enter your question title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Question Details</label>
              <Textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Describe your question in detail..."
                rows={5}
              />
            </div>
            
            <Button onClick={handleNewPost} className="w-full">
              Post Question
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Study Forum</h1>
        <div className="flex space-x-4">
          <Button onClick={() => setShowNewPost(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ask Question
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search for similar problems that have been answered..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  clearSearch();
                }}
                className="absolute right-1 top-1 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {isSearching && searchResults.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Found {searchResults.length} similar questions
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {displayPosts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">
                  {isSearching ? "No posts found matching your search." : "No posts yet. Be the first to ask a question!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            displayPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handlePostClick(post)}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg hover:text-blue-600">{post.title}</CardTitle>
                    <Badge variant={post.is_answered ? "default" : "secondary"}>
                      {post.is_answered ? "Answered" : "Open"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{post.author_name}</span>
                    <Badge variant="outline">{post.subject}</Badge>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4 line-clamp-3">{post.content}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-sm">{answers[post.id]?.length || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{post.likes}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-6">
          {/* User Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span>Your Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Points</span>
                <Badge variant="secondary">{userStats?.total_points || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Forum Answers</span>
                <Badge variant="secondary">{userStats?.forum_answers || 0}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Rank</span>
                <Badge variant="secondary">#{userStats?.current_rank || '--'}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-500" />
                <span>Earn Points</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Answer Question</span>
                <Badge variant="secondary">30 pts</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Helpful Answer</span>
                <Badge variant="secondary">+60 pts</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Best Answer Total</span>
                <Badge variant="secondary">90 pts</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Forum Rules</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Be respectful and helpful</p>
              <p>• Post in relevant subjects</p>
              <p>• Give detailed explanations</p>
              <p>• Mark helpful answers to reward contributors</p>
              <p>• Search for similar questions before posting</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};