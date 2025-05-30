import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertInterviewSchema, insertCodeSubmissionSchema, 
  insertResumeFeedbackSchema, insertTechNoteSchema, insertActivitySchema 
} from "@shared/schema";
import { 
  analyzeInterview, analyzeCode, analyzeResume, 
  generateInterviewQuestion, summarizeNotes 
} from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser(userData);
      
      // Create welcome activity
      await storage.createActivity({
        userId: user.id,
        activityType: "registration",
        description: "Welcome to AstraLearn! Account created successfully"
      });

      res.json({ user: { id: user.id, username: user.username, firstName: user.firstName } });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ user: { id: user.id, username: user.username, firstName: user.firstName } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const user = await storage.getUser(userId);
      const stats = await storage.getUserStats(userId);
      const topics = await storage.getLearningTopics(userId);
      const activities = await storage.getRecentActivities(userId, 5);
      const activeInterview = await storage.getActiveInterview(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        user,
        stats,
        learningTopics: topics,
        recentActivities: activities,
        activeInterview
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Interview Coach routes
  app.post("/api/interview/start", async (req, res) => {
    try {
      const { userId, topic } = req.body;
      
      const question = await generateInterviewQuestion(topic);
      
      const interview = await storage.createInterview({
        userId,
        question,
        userAnswer: null,
        aiFeedback: null,
        score: null,
        isCompleted: false
      });

      await storage.createActivity({
        userId,
        activityType: "interview_started",
        description: `Started mock interview on ${topic}`
      });

      res.json(interview);
    } catch (error) {
      res.status(500).json({ message: "Failed to start interview" });
    }
  });

  app.post("/api/interview/submit", async (req, res) => {
    try {
      const { interviewId, answer } = req.body;
      
      // Get the interview
      const allInterviews = await Promise.all(
        Array.from({ length: 100 }, (_, i) => storage.getInterviews(i + 1))
      );
      
      let interview: any = null;
      let userId: number = 0;
      
      for (let i = 0; i < allInterviews.length; i++) {
        const userInterviews = allInterviews[i];
        const found = userInterviews.find(iv => iv.id === interviewId);
        if (found) {
          interview = found;
          userId = i + 1;
          break;
        }
      }

      if (!interview) {
        return res.status(404).json({ message: "Interview not found" });
      }

      const analysis = await analyzeInterview(interview.question, answer);
      
      const updatedInterview = await storage.updateInterview(interviewId, {
        userAnswer: answer,
        aiFeedback: analysis.feedback,
        score: analysis.score,
        isCompleted: true
      });

      // Update user stats
      const currentStats = await storage.getUserStats(userId);
      if (currentStats) {
        await storage.updateUserStats(userId, {
          mockInterviews: currentStats.mockInterviews + 1,
          aiScore: analysis.score.toString()
        });
      }

      await storage.createActivity({
        userId,
        activityType: "interview_completed",
        description: `Mock interview completed with score ${analysis.score}/10`
      });

      res.json({ interview: updatedInterview, analysis });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit interview answer" });
    }
  });

  // Code Editor routes
  app.post("/api/code/submit", async (req, res) => {
    try {
      const submissionData = insertCodeSubmissionSchema.parse(req.body);
      
      const analysis = await analyzeCode(
        submissionData.code,
        submissionData.language,
        submissionData.problemTitle
      );

      const submission = await storage.createCodeSubmission({
        ...submissionData,
        aiSuggestions: analysis.suggestions,
        efficiencyScore: analysis.efficiencyScore,
        isCorrect: analysis.isCorrect
      });

      // Update user stats
      const currentStats = await storage.getUserStats(submissionData.userId);
      if (currentStats && analysis.isCorrect) {
        await storage.updateUserStats(submissionData.userId, {
          codeChallenges: currentStats.codeChallenges + 1
        });
      }

      await storage.createActivity({
        userId: submissionData.userId,
        activityType: "code_submitted",
        description: `Solved "${submissionData.problemTitle}" challenge`
      });

      res.json({ submission, analysis });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit code" });
    }
  });

  app.get("/api/code/submissions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const submissions = await storage.getCodeSubmissions(userId);
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch code submissions" });
    }
  });

  // Resume feedback routes
  app.post("/api/resume/analyze", async (req, res) => {
    try {
      const { userId, resumeContent } = req.body;
      
      const analysis = await analyzeResume(resumeContent);
      
      const feedback = await storage.createResumeFeedback({
        userId,
        resumeContent,
        aiFeedback: analysis.feedback,
        overallScore: analysis.overallScore
      });

      await storage.createActivity({
        userId,
        activityType: "resume_analyzed",
        description: `Resume analyzed with score ${analysis.overallScore}`
      });

      res.json({ feedback, analysis });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze resume" });
    }
  });

  app.get("/api/resume/feedback/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const feedback = await storage.getResumeFeedback(userId);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resume feedback" });
    }
  });

  // TechBook routes
  app.post("/api/notes", async (req, res) => {
    try {
      const noteData = insertTechNoteSchema.parse(req.body);
      
      const aiSummary = await summarizeNotes(noteData.content, noteData.topic);
      
      const note = await storage.createTechNote({
        ...noteData,
        aiSummary
      });

      await storage.createActivity({
        userId: noteData.userId,
        activityType: "note_created",
        description: `Created note: "${noteData.title}"`
      });

      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.get("/api/notes/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notes = await storage.getTechNotes(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.put("/api/notes/:noteId", async (req, res) => {
    try {
      const noteId = parseInt(req.params.noteId);
      const { content, title } = req.body;
      
      const aiSummary = await summarizeNotes(content, title);
      
      const note = await storage.updateTechNote(noteId, {
        content,
        title,
        aiSummary
      });

      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  // Learning progress routes
  app.put("/api/learning/progress", async (req, res) => {
    try {
      const { topicId, progress, userId } = req.body;
      
      const topic = await storage.updateLearningTopic(topicId, progress);
      
      await storage.createActivity({
        userId,
        activityType: "progress_updated",
        description: `Updated progress in ${topic.topicName} to ${progress}%`
      });

      res.json(topic);
    } catch (error) {
      res.status(500).json({ message: "Failed to update learning progress" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const stats = await storage.getUserStats(userId);
      const interviews = await storage.getInterviews(userId);
      const submissions = await storage.getCodeSubmissions(userId);
      const activities = await storage.getRecentActivities(userId, 30);

      const analytics = {
        totalInterviews: interviews.length,
        completedInterviews: interviews.filter(i => i.isCompleted).length,
        averageScore: interviews.length > 0 
          ? interviews.reduce((sum, i) => sum + (i.score || 0), 0) / interviews.length 
          : 0,
        totalSubmissions: submissions.length,
        correctSubmissions: submissions.filter(s => s.isCorrect).length,
        averageEfficiency: submissions.length > 0
          ? submissions.reduce((sum, s) => sum + (s.efficiencyScore || 0), 0) / submissions.length
          : 0,
        weeklyActivity: activities.filter(a => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return a.createdAt > weekAgo;
        }).length,
        stats
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
