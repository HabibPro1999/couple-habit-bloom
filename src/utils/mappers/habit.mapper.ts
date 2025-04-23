
import { Habit, HabitCompletion, User, MotivationalMessage, Relationship } from "@/contexts/types/habit.types";

export const mapHabitFromDB = (data: any): Habit => ({
  id: data.id,
  title: data.title,
  description: data.description,
  type: data.type,
  recurrence: data.recurrence,
  recurrenceDays: data.recurrence_days,
  visibility: data.visibility,
  completionRequirement: data.completion_requirement,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
  creatorId: data.creator_id,
});

export const mapHabitToDB = (habit: Partial<Habit>) => ({
  title: habit.title,
  description: habit.description,
  type: habit.type,
  recurrence: habit.recurrence,
  recurrence_days: habit.recurrenceDays,
  visibility: habit.visibility,
  completion_requirement: habit.completionRequirement,
  creator_id: habit.creatorId,
});

export const mapCompletionFromDB = (data: any): HabitCompletion => ({
  id: data.id,
  habitId: data.habit_id,
  userId: data.user_id,
  date: data.date,
  completed: data.completed,
});

export const mapCompletionToDB = (completion: Partial<HabitCompletion>) => ({
  habit_id: completion.habitId,
  user_id: completion.userId,
  date: completion.date,
  completed: completion.completed,
});

export const mapUserFromDB = (data: any): User => ({
  id: data.id,
  name: data.name,
});

export const mapRelationshipFromDB = (data: any): Relationship => ({
  id: data.id,
  userId1: data.user_id_1,
  userId2: data.user_id_2,
  createdAt: data.created_at,
  updatedAt: data.updated_at,
});

export const mapMotivationalMessageFromDB = (data: any): MotivationalMessage => ({
  id: data.id,
  text: data.text,
  senderId: data.sender_id,
  createdAt: data.created_at,
  expiresAt: data.expires_at,
});

export const mapMotivationalMessageToDB = (message: Partial<MotivationalMessage>) => ({
  text: message.text,
  sender_id: message.senderId,
  expires_at: message.expiresAt,
});
