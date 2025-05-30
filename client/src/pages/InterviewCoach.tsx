import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FaBrain, FaMicrophone, FaKeyboard, FaPlay } from "react-icons/fa";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function InterviewCoach() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [answer, setAnswer] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const { data: interviews } = useQuery({
    queryKey: ["/api/interviews", user?.id],
    enabled: !!user?.id,
  });

  const startInterviewMutation = useMutation({
    mutationFn: async (topic: string) => {
      const response = await apiRequest("POST", "/api/interview/start", {
        userId: user?.id,
        topic
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews", user?.id] });
      setSelectedTopic("");
    }
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async ({ interviewId, answer }: { interviewId: number; answer: string }) => {
      const response = await apiRequest("POST", "/api/interview/submit", {
        interviewId,
        answer
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews", user?.id] });
      setAnswer("");
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const topics = [
    "Behavioral Questions",
    "Technical Programming",
    "System Design",
    "Data Structures & Algorithms",
    "React & Frontend",
    "Backend Development",
    "Database Design"
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                AI Interview Coach
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Practice mock interviews with AI-powered feedback and improve your interview skills
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Start New Interview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                      <FaBrain className="text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Start New Interview</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Choose a topic and begin</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Select Interview Topic
                    </label>
                    <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a topic..." />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic} value={topic}>
                            {topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => selectedTopic && startInterviewMutation.mutate(selectedTopic)}
                    disabled={!selectedTopic || startInterviewMutation.isPending}
                    className="w-full bg-purple-500 hover:bg-purple-600"
                  >
                    <FaPlay className="mr-2" />
                    {startInterviewMutation.isPending ? "Starting..." : "Start Interview"}
                  </Button>
                </CardContent>
              </Card>

              {/* Interview History */}
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Interviews</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {interviews?.slice(0, 5).map((interview: any) => (
                      <div key={interview.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Interview #{interview.id}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {interview.isCompleted ? `Score: ${interview.score}/10` : "In Progress"}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          interview.isCompleted 
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                        }`}>
                          {interview.isCompleted ? "Complete" : "Active"}
                        </span>
                      </div>
                    )) || (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No interviews yet. Start your first interview above!
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Interview Section */}
            {interviews?.find((i: any) => !i.isCompleted) && (
              <Card className="mt-6">
                <CardHeader>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Active Interview</h3>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const activeInterview = interviews.find((i: any) => !i.isCompleted);
                    return (
                      <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Question:
                          </p>
                          <p className="text-blue-800 dark:text-blue-200">
                            {activeInterview.question}
                          </p>
                        </div>
                        
                        <Textarea
                          placeholder="Type your answer here..."
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          rows={6}
                        />
                        
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => submitAnswerMutation.mutate({
                              interviewId: activeInterview.id,
                              answer
                            })}
                            disabled={!answer.trim() || submitAnswerMutation.isPending}
                            className="flex-1 bg-purple-500 hover:bg-purple-600"
                          >
                            <FaKeyboard className="mr-2" />
                            {submitAnswerMutation.isPending ? "Analyzing..." : "Submit Answer"}
                          </Button>
                          <Button variant="outline">
                            <FaMicrophone className="mr-2" />
                            Record Answer
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
