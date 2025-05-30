import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FaFileAlt, FaCloudUploadAlt, FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from "react-icons/fa";

interface ResumeFeedbackProps {
  userId: number;
}

export function ResumeFeedback({ userId }: ResumeFeedbackProps) {
  const [feedback, setFeedback] = useState<any>(null);

  const analyzeResumeMutation = useMutation({
    mutationFn: async (resumeContent: string) => {
      const response = await apiRequest("POST", "/api/resume/analyze", {
        userId,
        resumeContent
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFeedback(data.analysis);
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        analyzeResumeMutation.mutate(content);
      };
      reader.readAsText(file);
    }
  };

  const mockAnalyze = () => {
    const mockFeedback = {
      overallScore: "8.2/10",
      feedback: {
        strengths: ["Strong technical skills section", "Clear project descriptions"],
        weaknesses: ["Missing quantified achievements", "Outdated contact information"],
        suggestions: ["Add more quantified achievements", "Remove outdated technologies", "Include leadership examples"]
      }
    };
    setFeedback(mockFeedback);
  };

  return (
    <Card className="transition-colors">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
            <FaFileAlt className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Resume AI Feedback</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get instant AI-powered resume analysis</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        {!feedback ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors cursor-pointer">
            <FaCloudUploadAlt className="text-4xl text-gray-400 dark:text-gray-500 mb-4 mx-auto" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">Drop your resume here or click to browse</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">Supports PDF, DOC, DOCX formats</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload">
              <Button 
                className="bg-orange-500 hover:bg-orange-600"
                disabled={analyzeResumeMutation.isPending}
                asChild
              >
                <span>
                  {analyzeResumeMutation.isPending ? "Analyzing..." : "Upload Resume"}
                </span>
              </Button>
            </label>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={mockAnalyze}
                className="text-sm"
              >
                Try Sample Analysis
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900 dark:text-white">AI Analysis Complete</span>
              <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full">
                {feedback.overallScore}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              {feedback.feedback.strengths.map((strength: string, index: number) => (
                <div key={`strength-${index}`} className="flex items-start space-x-2">
                  <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                </div>
              ))}
              {feedback.feedback.weaknesses.map((weakness: string, index: number) => (
                <div key={`weakness-${index}`} className="flex items-start space-x-2">
                  <FaExclamationTriangle className="text-amber-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                </div>
              ))}
              {feedback.feedback.suggestions.map((suggestion: string, index: number) => (
                <div key={`suggestion-${index}`} className="flex items-start space-x-2">
                  <FaTimesCircle className="text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
