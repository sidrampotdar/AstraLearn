import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { FaTachometerAlt, FaBrain, FaCode, FaFileAlt, FaBook, FaSpa, FaUsers, FaCrown } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: FaTachometerAlt, color: "text-blue-500" },
  { name: "AI Interview Coach", href: "/interview", icon: FaBrain, color: "text-purple-500" },
  { name: "Smart Code Editor", href: "/code", icon: FaCode, color: "text-green-500" },
  { name: "Resume Feedback", href: "#", icon: FaFileAlt, color: "text-orange-500" },
  { name: "Real-Time TechBook", href: "/techbook", icon: FaBook, color: "text-blue-500" },
  { name: "Stress-Free Mode", href: "#", icon: FaSpa, color: "text-emerald-500" },
  { name: "Interview Room", href: "#", icon: FaUsers, color: "text-indigo-500" },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                    isActive
                      ? "text-gray-700 dark:text-gray-200 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className={cn("text-lg", item.color)} />
                  <span className={isActive ? "font-medium" : ""}>{item.name}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Pro Features</span>
            <FaCrown className="text-yellow-300" />
          </div>
          <p className="text-xs opacity-90 mb-3">
            Upgrade to unlock advanced AI insights and unlimited mock interviews.
          </p>
          <Button 
            className="w-full bg-white text-blue-600 text-xs font-medium py-2 px-3 rounded-md hover:bg-gray-100 transition-colors"
            size="sm"
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </aside>
  );
}
