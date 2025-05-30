import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FaCode, FaPlay, FaLightbulb } from "react-icons/fa";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function CodeEditor() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [problemTitle, setProblemTitle] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const { data: submissions } = useQuery({
    queryKey: ["/api/code/submissions", user?.id],
    enabled: !!user?.id,
  });

  const submitCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/code/submit", {
        userId: user?.id,
        problemTitle,
        code,
        language
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
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

  const languages = [
    { value: "python", label: "Python" },
    { value: "javascript", label: "JavaScript" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" }
  ];

  const sampleProblems = [
    "Two Sum",
    "Reverse Linked List",
    "Valid Parentheses",
    "Maximum Subarray",
    "Binary Tree Inorder Traversal",
    "Merge Sorted Arrays"
  ];

  const loadSampleCode = (problem: string) => {
    setProblemTitle(problem);
    if (problem === "Two Sum") {
      setCode(`def two_sum(nums, target):
    # TODO: Implement two sum algorithm
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Smart Code Editor
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Practice coding with AI-powered suggestions and real-time feedback
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Code Editor */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                          <FaCode className="text-green-500" />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Code Editor</h3>
                      </div>
                      <div className="flex space-x-2">
                        <Select value={language} onValueChange={setLanguage}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Problem title (e.g., Two Sum)"
                      value={problemTitle}
                      onChange={(e) => setProblemTitle(e.target.value)}
                    />
                    
                    <div className="bg-gray-900 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400 text-sm font-mono">
                            {languages.find(l => l.value === language)?.label}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {problemTitle ? `${problemTitle.toLowerCase().replace(/\s+/g, '_')}.${language === 'python' ? 'py' : language}` : 'untitled'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-yellow-500 w-3 h-3 rounded-full"></span>
                          <span className="bg-green-500 w-3 h-3 rounded-full"></span>
                          <span className="bg-red-500 w-3 h-3 rounded-full"></span>
                        </div>
                      </div>
                      <Textarea
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Write your code here..."
                        className="bg-transparent border-none text-gray-300 font-mono text-sm resize-none min-h-[300px]"
                        rows={15}
                      />
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => submitCodeMutation.mutate()}
                        disabled={!code.trim() || !problemTitle.trim() || submitCodeMutation.isPending}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <FaPlay className="mr-2" />
                        {submitCodeMutation.isPending ? "Running..." : "Run & Analyze"}
                      </Button>
                      <Button variant="outline" onClick={() => setCode("")}>
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Analysis */}
                {analysis && (
                  <Card>
                    <CardHeader>
                      <h3 className="font-semibold text-gray-900 dark:text-white">AI Analysis</h3>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Correctness
                        </span>
                        <span className={`text-sm font-medium ${
                          analysis.isCorrect ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {analysis.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Efficiency Score
                        </span>
                        <span className="text-sm font-medium text-blue-500">
                          {analysis.efficiencyScore}/10
                        </span>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <FaLightbulb className="text-amber-500 mt-1" />
                          <div>
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                              AI Suggestions
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                              {analysis.suggestions}
                            </p>
                            {analysis.improvements && analysis.improvements.length > 0 && (
                              <ul className="text-sm text-amber-700 dark:text-amber-200 mt-2 list-disc list-inside">
                                {analysis.improvements.map((improvement: string, index: number) => (
                                  <li key={index}>{improvement}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Sample Problems */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Sample Problems</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {sampleProblems.map((problem) => (
                        <Button
                          key={problem}
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          onClick={() => loadSampleCode(problem)}
                        >
                          {problem}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Submissions */}
                <Card>
                  <CardHeader>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Recent Submissions</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {submissions?.slice(0, 5).map((submission: any) => (
                        <div key={submission.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {submission.problemTitle}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {submission.language}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              submission.isCorrect 
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                            }`}>
                              {submission.efficiencyScore}/10
                            </span>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                          No submissions yet
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
