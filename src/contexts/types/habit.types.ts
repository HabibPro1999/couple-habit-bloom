
export type HabitType = "personal" | "shared";
export type VisibilityType = "visible" | "secret";
export type CompletionRequirementType = "one" | "both";
export type RecurrenceType = "daily" | "specific-days";

export interface Habit {
  id: string;
  title: string;
  description?: string;
  type: HabitType;
  recurrence: RecurrenceType;
  recurrenceDays?: number[];
  visibility?: VisibilityType;
  completionRequirement?: CompletionRequirementType;
  createdAt: string;
  updatedAt: string;
  creatorId: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
}

export interface Relationship {
  id: string;
  userId1: string;
  userId2: string;
  createdAt: string;
  updatedAt: string;
}

export interface MotivationalMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  expiresAt: string;
}
