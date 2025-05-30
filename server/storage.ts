import { 
  users, userStats, learningTopics, interviews, codeSubmissions, 
  resumeFeedback, techNotes, activities,
  type User, type InsertUser, type UserStats, type LearningTopic, 
  type Interview, type CodeSubmission, type ResumeFeedback, 
  type TechNote, type Activity,
  type InsertUserStats, type InsertLearningTopic, type InsertInterview,
  type InsertCodeSubmission, type InsertResumeFeedback, type InsertTechNote,
  type InsertActivity
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // User stats
  getUserStats(userId: number): Promise<UserStats | undefined>;
  createUserStats(stats: InsertUserStats): Promise<UserStats>;
  updateUserStats(userId: number, stats: Partial<UserStats>): Promise<UserStats>;

  // Learning topics
  getLearningTopics(userId: number): Promise<LearningTopic[]>;
  createLearningTopic(topic: InsertLearningTopic): Promise<LearningTopic>;
  updateLearningTopic(id: number, progress: number): Promise<LearningTopic>;

  // Interviews
  getInterviews(userId: number): Promise<Interview[]>;
  getActiveInterview(userId: number): Promise<Interview | undefined>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: number, updates: Partial<Interview>): Promise<Interview>;

  // Code submissions
  getCodeSubmissions(userId: number): Promise<CodeSubmission[]>;
  createCodeSubmission(submission: InsertCodeSubmission): Promise<CodeSubmission>;

  // Resume feedback
  getResumeFeedback(userId: number): Promise<ResumeFeedback[]>;
  createResumeFeedback(feedback: InsertResumeFeedback): Promise<ResumeFeedback>;

  // Tech notes
  getTechNotes(userId: number): Promise<TechNote[]>;
  createTechNote(note: InsertTechNote): Promise<TechNote>;
  updateTechNote(id: number, updates: Partial<TechNote>): Promise<TechNote>;

  // Activities
  getRecentActivities(userId: number, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private userStats: Map<number, UserStats>;
  private learningTopics: Map<number, LearningTopic[]>;
  private interviews: Map<number, Interview[]>;
  private codeSubmissions: Map<number, CodeSubmission[]>;
  private resumeFeedback: Map<number, ResumeFeedback[]>;
  private techNotes: Map<number, TechNote[]>;
  private activities: Map<number, Activity[]>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.userStats = new Map();
    this.learningTopics = new Map();
    this.interviews = new Map();
    this.codeSubmissions = new Map();
    this.resumeFeedback = new Map();
    this.techNotes = new Map();
    this.activities = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date()
    };
    this.users.set(id, user);

    // Initialize user stats
    const stats: UserStats = {
      id: this.currentId++,
      userId: id,
      learningStreak: 0,
      mockInterviews: 0,
      codeChallenges: 0,
      aiScore: "0.0",
      updatedAt: new Date()
    };
    this.userStats.set(id, stats);

    // Initialize default learning topics
    const defaultTopics = [
      { topicName: "Data Structures", progress: 0 },
      { topicName: "Algorithms", progress: 0 },
      { topicName: "System Design", progress: 0 }
    ];

    const topics = defaultTopics.map(topic => ({
      id: this.currentId++,
      userId: id,
      topicName: topic.topicName,
      progress: topic.progress,
      updatedAt: new Date()
    }));

    this.learningTopics.set(id, topics);
    this.interviews.set(id, []);
    this.codeSubmissions.set(id, []);
    this.resumeFeedback.set(id, []);
    this.techNotes.set(id, []);
    this.activities.set(id, []);

    return user;
  }

  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return this.userStats.get(userId);
  }

  async createUserStats(stats: InsertUserStats): Promise<UserStats> {
    const userStats: UserStats = {
      id: this.currentId++,
      ...stats,
      updatedAt: new Date()
    };
    this.userStats.set(stats.userId, userStats);
    return userStats;
  }

  async updateUserStats(userId: number, updates: Partial<UserStats>): Promise<UserStats> {
    const current = this.userStats.get(userId);
    if (!current) throw new Error("User stats not found");
    
    const updated = { ...current, ...updates, updatedAt: new Date() };
    this.userStats.set(userId, updated);
    return updated;
  }

  async getLearningTopics(userId: number): Promise<LearningTopic[]> {
    return this.learningTopics.get(userId) || [];
  }

  async createLearningTopic(topic: InsertLearningTopic): Promise<LearningTopic> {
    const newTopic: LearningTopic = {
      id: this.currentId++,
      ...topic,
      updatedAt: new Date()
    };
    
    const userTopics = this.learningTopics.get(topic.userId) || [];
    userTopics.push(newTopic);
    this.learningTopics.set(topic.userId, userTopics);
    
    return newTopic;
  }

  async updateLearningTopic(id: number, progress: number): Promise<LearningTopic> {
    for (const [userId, topics] of this.learningTopics.entries()) {
      const topicIndex = topics.findIndex(t => t.id === id);
      if (topicIndex !== -1) {
        topics[topicIndex] = { ...topics[topicIndex], progress, updatedAt: new Date() };
        return topics[topicIndex];
      }
    }
    throw new Error("Learning topic not found");
  }

  async getInterviews(userId: number): Promise<Interview[]> {
    return this.interviews.get(userId) || [];
  }

  async getActiveInterview(userId: number): Promise<Interview | undefined> {
    const userInterviews = this.interviews.get(userId) || [];
    return userInterviews.find(interview => !interview.isCompleted);
  }

  async createInterview(interview: InsertInterview): Promise<Interview> {
    const newInterview: Interview = {
      id: this.currentId++,
      ...interview,
      createdAt: new Date()
    };
    
    const userInterviews = this.interviews.get(interview.userId) || [];
    userInterviews.push(newInterview);
    this.interviews.set(interview.userId, userInterviews);
    
    return newInterview;
  }

  async updateInterview(id: number, updates: Partial<Interview>): Promise<Interview> {
    for (const [userId, interviews] of this.interviews.entries()) {
      const interviewIndex = interviews.findIndex(i => i.id === id);
      if (interviewIndex !== -1) {
        interviews[interviewIndex] = { ...interviews[interviewIndex], ...updates };
        return interviews[interviewIndex];
      }
    }
    throw new Error("Interview not found");
  }

  async getCodeSubmissions(userId: number): Promise<CodeSubmission[]> {
    return this.codeSubmissions.get(userId) || [];
  }

  async createCodeSubmission(submission: InsertCodeSubmission): Promise<CodeSubmission> {
    const newSubmission: CodeSubmission = {
      id: this.currentId++,
      ...submission,
      createdAt: new Date()
    };
    
    const userSubmissions = this.codeSubmissions.get(submission.userId) || [];
    userSubmissions.push(newSubmission);
    this.codeSubmissions.set(submission.userId, userSubmissions);
    
    return newSubmission;
  }

  async getResumeFeedback(userId: number): Promise<ResumeFeedback[]> {
    return this.resumeFeedback.get(userId) || [];
  }

  async createResumeFeedback(feedback: InsertResumeFeedback): Promise<ResumeFeedback> {
    const newFeedback: ResumeFeedback = {
      id: this.currentId++,
      ...feedback,
      createdAt: new Date()
    };
    
    const userFeedback = this.resumeFeedback.get(feedback.userId) || [];
    userFeedback.push(newFeedback);
    this.resumeFeedback.set(feedback.userId, userFeedback);
    
    return newFeedback;
  }

  async getTechNotes(userId: number): Promise<TechNote[]> {
    return this.techNotes.get(userId) || [];
  }

  async createTechNote(note: InsertTechNote): Promise<TechNote> {
    const newNote: TechNote = {
      id: this.currentId++,
      ...note,
      updatedAt: new Date()
    };
    
    const userNotes = this.techNotes.get(note.userId) || [];
    userNotes.push(newNote);
    this.techNotes.set(note.userId, userNotes);
    
    return newNote;
  }

  async updateTechNote(id: number, updates: Partial<TechNote>): Promise<TechNote> {
    for (const [userId, notes] of this.techNotes.entries()) {
      const noteIndex = notes.findIndex(n => n.id === id);
      if (noteIndex !== -1) {
        notes[noteIndex] = { ...notes[noteIndex], ...updates, updatedAt: new Date() };
        return notes[noteIndex];
      }
    }
    throw new Error("Tech note not found");
  }

  async getRecentActivities(userId: number, limit: number = 10): Promise<Activity[]> {
    const userActivities = this.activities.get(userId) || [];
    return userActivities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const newActivity: Activity = {
      id: this.currentId++,
      ...activity,
      createdAt: new Date()
    };
    
    const userActivities = this.activities.get(activity.userId) || [];
    userActivities.push(newActivity);
    this.activities.set(activity.userId, userActivities);
    
    return newActivity;
  }
}

export const storage = new MemStorage();
