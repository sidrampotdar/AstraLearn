import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaSpa, FaPlay, FaPause, FaStop, FaCog, FaMusic } from "react-icons/fa";
import { GiMeditation } from "react-icons/gi";

export function StressFreeMode() {
  const [timeLeft, setTimeLeft] = useState(1112); // 18:32 in seconds
  const [isRunning, setIsRunning] = useState(true);
  const [mode, setMode] = useState("Focus");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setTimeLeft(1500); // Reset to 25 minutes
  };

  const totalTime = 25 * 60; // 25 minutes
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 56;
  const strokeDashoffset = circumference * (1 - (progress / 100));

  return (
    <Card className="transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
              <FaSpa className="text-emerald-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Stress-Free Mode</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Focus & wellness tools</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Pomodoro Timer */}
        <div className="text-center mb-6">
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 128 128">
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="none" 
                className="text-gray-200 dark:text-gray-700" 
              />
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                stroke="currentColor" 
                strokeWidth="8" 
                fill="none" 
                strokeLinecap="round" 
                className="text-emerald-500" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {mode}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-2 mb-4">
          <Button
            onClick={toggleTimer}
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 p-3"
          >
            {isRunning ? <FaPause /> : <FaPlay />}
          </Button>
          <Button
            onClick={stopTimer}
            size="sm"
            variant="outline"
            className="p-3"
          >
            <FaStop />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="p-3"
          >
            <FaCog />
          </Button>
        </div>
        
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FaMusic className="text-blue-500 mr-3" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Ambient Sounds</span>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <GiMeditation className="text-purple-500 mr-3" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Guided Meditation</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
