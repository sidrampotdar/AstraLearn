import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FaBrain, FaMicrophone, FaKeyboard, FaLightbulb, FaRobot } from "react-icons/fa";
import type { Interview } from "@shared/schema";

interface AIInterviewCoachProps {
  userId: number;
}

export function AIInterviewCoach({ userId }: AIInterviewCoachProps) {
  const [answer, setAnswer] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: activeInterview } = useQuery({
    queryKey: ["/api/dashboard", userId],
    select: (data: any) => data.activeInterview as Interview | undefined,
  });

  const startInterviewMutation = useMutation({
    mutationFn: async (topic: string) => {
      const response = await apiRequest("POST", "/api/interview/start", {
        userId,
        topic
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", userId] });
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
    onSuccess: (data) => {
      setCurrentFeedback(data.analysis);
      setShowFeedback(true);
      setAnswer("");
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard", userId] });
    }
  });

  const handleStartInterview = () => {
    startInterviewMutation.mutate("Behavioral and Technical Questions");
  };

  const handleSubmitAnswer = () => {
    if (activeInterview && answer.trim()) {
      submitAnswerMutation.mutate({
        interviewId: activeInterview.id,
        answer: answer.trim()
      });
    }
  };

  const progress = activeInterview ? 85 : 0;

  return (
    <Card className="transition-colors">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
              <FaBrain className="text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Interview Coach</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Practice with AI-powered feedback</p>
            </div>
          </div>
          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full">
            {activeInterview ? "Active" : "Ready"}
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {!activeInterview ? (
          <div className="text-center py-8">
            <FaBrain className="text-4xl text-purple-500 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Start Your Mock Interview
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Practice with AI-powered questions and get real-time feedback
            </p>
            <Button 
              onClick={handleStartInterview}
              disabled={startInterviewMutation.isPending}
              className="bg-purple-500 hover:bg-purple-600"
            >
              {startInterviewMutation.isPending ? "Starting..." : "Start Interview"}
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Interview Session
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{progress}% complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="bg-purple-500 p-2 rounded-lg text-white">
                  <FaRobot className="text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">AI Interviewer</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    "{activeInterview.question}"
                  </p>
                </div>
              </div>
            </div>

            {!activeInterview.isCompleted && (
              <>
                <Textarea
                  placeholder="Type your answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="mb-4"
                  rows={4}
                />

                <div className="flex space-x-3 mb-4">
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={!answer.trim() || submitAnswerMutation.isPending}
                    className="flex-1 bg-purple-500 hover:bg-purple-600"
                  >
                    <FaKeyboard className="mr-2" />
                    {submitAnswerMutation.isPending ? "Analyzing..." : "Submit Answer"}
                  </Button>
                  <Button variant="outline" className="bg-gray-200 dark:bg-gray-700">
                    <FaMicrophone className="mr-2" />
                    Record Answer
                  </Button>
                </div>
              </>
            )}

            {((showFeedback && currentFeedback) || activeInterview.aiFeedback) && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-2">
                  <FaLightbulb className="text-blue-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">AI Feedback</p>
                    <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                      {currentFeedback?.feedback || activeInterview.aiFeedback}
                    </p>
                    {(currentFeedback?.score || activeInterview.score) && (
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mt-2">
                        Score: {currentFeedback?.score || activeInterview.score}/10
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
