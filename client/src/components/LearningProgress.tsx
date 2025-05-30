import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { LearningTopic } from "@shared/schema";

interface LearningProgressProps {
  topics: LearningTopic[];
}

export function LearningProgress({ topics }: LearningProgressProps) {
  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-blue-500";
    if (progress >= 60) return "bg-green-500";
    return "bg-orange-500";
  };

  return (
    <Card className="transition-colors">
      <CardHeader>
        <h3 className="font-semibold text-gray-900 dark:text-white">Learning Progress</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topics.map((topic) => (
            <div key={topic.id}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {topic.topicName}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {topic.progress}%
                </span>
              </div>
              <Progress value={topic.progress} className="w-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
