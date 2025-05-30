import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { FaCode, FaPlay, FaLightbulb } from "react-icons/fa";

interface SmartCodeEditorProps {
  userId: number;
}

export function SmartCodeEditor({ userId }: SmartCodeEditorProps) {
  const [code, setCode] = useState(`def two_sum(nums, target):
    # TODO: Implement two sum algorithm
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]`);
  
  const [language] = useState("Python");
  const [problemTitle] = useState("Two Sum");
  const [analysis, setAnalysis] = useState<any>(null);

  const submitCodeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/code/submit", {
        userId,
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

  const handleRunCode = () => {
    submitCodeMutation.mutate();
  };

  const efficiencyScore = analysis?.efficiencyScore || 6;

  return (
    <Card className="transition-colors">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
              <FaCode className="text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Smart Code Editor</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered coding practice</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="text-green-500 hover:text-green-600">
            Open Editor <span className="ml-1">↗</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-green-400 text-sm font-mono">{language}</span>
              <span className="text-gray-500 text-sm">{problemTitle.toLowerCase().replace(' ', '_')}.py</span>
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
            className="bg-transparent border-none text-gray-300 font-mono text-sm resize-none"
            rows={8}
          />
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Efficiency Score:</span>
            <div className="flex items-center space-x-2">
              <Progress value={efficiencyScore * 10} className="w-20" />
              <span className={`text-sm font-medium ${
                efficiencyScore >= 8 ? 'text-green-500' : 
                efficiencyScore >= 6 ? 'text-orange-500' : 'text-red-500'
              }`}>
                {efficiencyScore}/10
              </span>
            </div>
          </div>
          <Button 
            onClick={handleRunCode}
            disabled={submitCodeMutation.isPending}
            className="bg-green-500 hover:bg-green-600"
          >
            <FaPlay className="mr-2" />
            {submitCodeMutation.isPending ? "Running..." : "Run Code"}
          </Button>
        </div>

        {analysis && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <FaLightbulb className="text-amber-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">AI Suggestion</p>
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
        )}
      </CardContent>
    </Card>
  );
}
