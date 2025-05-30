import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaPlus, FaBook, FaUsers, FaChartLine } from "react-icons/fa";

export function QuickActions() {
  const actions = [
    {
      icon: FaPlus,
      label: "Start New Interview",
      color: "text-green-500",
      href: "/interview"
    },
    {
      icon: FaBook,
      label: "Open TechBook",
      color: "text-blue-500",
      href: "/techbook"
    },
    {
      icon: FaUsers,
      label: "Join Interview Room",
      color: "text-purple-500",
      href: "#"
    },
    {
      icon: FaChartLine,
      label: "View Analytics",
      color: "text-orange-500",
      href: "#"
    }
  ];

  return (
    <Card className="transition-colors">
      <CardHeader>
        <h3 className="font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="ghost"
                className="w-full justify-start p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                asChild
              >
                <a href={action.href}>
                  <Icon className={`${action.color} mr-3`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {action.label}
                  </span>
                </a>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
