import { Card, CardContent } from "@/components/ui/card";
import { FaFire, FaMicrophone, FaCode, FaRobot } from "react-icons/fa";
import type { UserStats } from "@shared/schema";

interface StatsCardsProps {
  stats: UserStats | null;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statsData = [
    {
      title: "Learning Streak",
      value: stats ? `${stats.learningStreak} days` : "0 days",
      icon: FaFire,
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      iconColor: "text-orange-500"
    },
    {
      title: "Mock Interviews",
      value: stats ? `${stats.mockInterviews} completed` : "0 completed",
      icon: FaMicrophone,
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-500"
    },
    {
      title: "Code Challenges",
      value: stats ? `${stats.codeChallenges} solved` : "0 solved",
      icon: FaCode,
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-500"
    },
    {
      title: "AI Score",
      value: stats ? `${stats.aiScore}/10` : "0.0/10",
      icon: FaRobot,
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      iconColor: "text-blue-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`${stat.iconColor} text-xl`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
