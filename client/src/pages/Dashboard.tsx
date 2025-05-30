import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { StatsCards } from "@/components/StatsCards";
import { AIInterviewCoach } from "@/components/AIInterviewCoach";
import { SmartCodeEditor } from "@/components/SmartCodeEditor";
import { ResumeFeedback } from "@/components/ResumeFeedback";
import { LearningProgress } from "@/components/LearningProgress";
import { StressFreeMode } from "@/components/StressFreeMode";
import { QuickActions } from "@/components/QuickActions";
import { RecentActivity } from "@/components/RecentActivity";
import { useLocation } from "wouter";
import { useEffect, createContext, useContext } from "react";

// Create context for dashboard data
const DashboardContext = createContext<any>(null);

export function useDashboardData() {
  return useContext(DashboardContext);
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [user, isLoading, setLocation]);

  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["dashboard", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 60000, // 1 minute
    refetchInterval: false,
  });

  if (isLoading || isDashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <DashboardContext.Provider value={dashboardData}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <Header />
        
        <div className="flex">
          <Sidebar />
          
          <main className="flex-1 p-6 overflow-y-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user.firstName}! 👋
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Ready to continue your learning journey?
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>📅</span>
                    <span>Today, {currentDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={dashboardData?.stats || null} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Primary Features */}
              <div className="lg:col-span-2 space-y-6">
                <AIInterviewCoach userId={user.id} />
                <SmartCodeEditor userId={user.id} />
                <ResumeFeedback userId={user.id} />
              </div>

              {/* Right Column - Secondary Features */}
              <div className="space-y-6">
                <LearningProgress topics={dashboardData?.learningTopics || []} />
                <StressFreeMode />
                <QuickActions />
                <RecentActivity activities={dashboardData?.recentActivities || []} />
              </div>
            </div>
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}
