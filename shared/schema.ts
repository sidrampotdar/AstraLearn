import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  learningStreak: integer("learning_streak").default(0).notNull(),
  mockInterviews: integer("mock_interviews").default(0).notNull(),
  codeChallenges: integer("code_challenges").default(0).notNull(),
  aiScore: text("ai_score").default("0.0").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const learningTopics = pgTable("learning_topics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  topicName: text("topic_name").notNull(),
  progress: integer("progress").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  question: text("question").notNull(),
  userAnswer: text("user_answer"),
  aiFeedback: text("ai_feedback"),
  score: integer("score"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const codeSubmissions = pgTable("code_submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  problemTitle: text("problem_title").notNull(),
  code: text("code").notNull(),
  language: text("language").notNull(),
  aiSuggestions: text("ai_suggestions"),
  efficiencyScore: integer("efficiency_score"),
  isCorrect: boolean("is_correct").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resumeFeedback = pgTable("resume_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  resumeContent: text("resume_content").notNull(),
  aiFeedback: jsonb("ai_feedback").notNull(),
  overallScore: text("overall_score").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const techNotes = pgTable("tech_notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  topic: text("topic").notNull(),
  aiSummary: text("ai_summary"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activityType: text("activity_type").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  updatedAt: true,
});

export const insertLearningTopicSchema = createInsertSchema(learningTopics).omit({
  id: true,
  updatedAt: true,
});

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
});

export const insertCodeSubmissionSchema = createInsertSchema(codeSubmissions).omit({
  id: true,
  createdAt: true,
});

export const insertResumeFeedbackSchema = createInsertSchema(resumeFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertTechNoteSchema = createInsertSchema(techNotes).omit({
  id: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type LearningTopic = typeof learningTopics.$inferSelect;
export type Interview = typeof interviews.$inferSelect;
export type CodeSubmission = typeof codeSubmissions.$inferSelect;
export type ResumeFeedback = typeof resumeFeedback.$inferSelect;
export type TechNote = typeof techNotes.$inferSelect;
export type Activity = typeof activities.$inferSelect;

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type InsertLearningTopic = z.infer<typeof insertLearningTopicSchema>;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type InsertCodeSubmission = z.infer<typeof insertCodeSubmissionSchema>;
export type InsertResumeFeedback = z.infer<typeof insertResumeFeedbackSchema>;
export type InsertTechNote = z.infer<typeof insertTechNoteSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
