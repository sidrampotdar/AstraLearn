import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FaCheckCircle, FaMicrophone, FaCode } from "react-icons/fa";
import type { Activity } from "@shared/schema";

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "interview_completed":
        return <FaMicrophone className="text-purple-500 text-xs" />;
      case "code_submitted":
        return <FaCode className="text-blue-500 text-xs" />;
      default:
        return <FaCheckCircle className="text-green-500 text-xs" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case "interview_completed":
        return "bg-purple-100 dark:bg-purple-900/30";
      case "code_submitted":
        return "bg-blue-100 dark:bg-blue-900/30";
      default:
        return "bg-green-100 dark:bg-green-900/30";
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    const now = new Date();
    const activityDate = typeof date === 'string' ? new Date(date) : date;
    const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  // Mock activities if none provided
  const mockActivities = activities.length > 0 ? activities : [
    {
      id: 1,
      userId: 1,
      activityType: "progress_updated",
      description: 'Completed "Binary Trees" module',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: 2,
      userId: 1,
      activityType: "interview_completed",
      description: "Mock interview scored 8.5/10",
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      id: 3,
      userId: 1,
      activityType: "code_submitted",
      description: 'Solved "Two Pointers" challenge',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    }
  ];

  return (
    <Card className="transition-colors">
      <CardHeader>
        <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`${getActivityBgColor(activity.activityType)} p-1.5 rounded-full`}>
                {getActivityIcon(activity.activityType)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTimeAgo(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
