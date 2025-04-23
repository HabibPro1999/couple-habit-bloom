
import React, { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Habit, HabitCompletion, User, MotivationalMessage } from "./types/habit.types";
import { useHabits } from "@/hooks/useHabits";
import { useCompletions } from "@/hooks/useCompletions";
import { useUsers } from "@/hooks/useUsers";
import { useMotivationalMessages } from "@/hooks/useMotivationalMessages";

export type { 
  Habit, 
  HabitCompletion, 
  User, 
  MotivationalMessage 
} from "./types/habit.types";
export type { 
  HabitType, 
  VisibilityType, 
  CompletionRequirementType, 
  RecurrenceType 
} from "./types/habit.types";

interface HabitContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  currentUser: User | null;
  partner: User | null;
  motivationalMessage: MotivationalMessage | null;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "updatedAt">) => Promise<Habit>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;
  getHabitCompletion: (habitId: string, date: string) => boolean;
  getPartnerHabitCompletion: (habitId: string, date: string) => boolean;
  getPersonalHabits: () => Habit[];
  getSharedHabits: () => Habit[];
  getVisiblePartnerHabits: () => Habit[];
  getHabitsForDate: (date: string) => Habit[];
  sendMotivationalMessage: (text: string) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { habits, fetchHabits, addHabit, updateHabit, deleteHabit } = useHabits();
  const { completions, fetchCompletions, toggleCompletion } = useCompletions();
  const { currentUser, partner, fetchUsers } = useUsers(user?.id);
  const { motivationalMessage, fetchMotivationalMessage, sendMessage } = useMotivationalMessages();

  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchCompletions();
      fetchUsers();
      fetchMotivationalMessage();
    }
  }, [user]);

  const getHabitCompletion = (habitId: string, date: string): boolean => {
    const completion = completions.find(
      (c) => c.habitId === habitId && c.userId === user?.id && c.date === date
    );
    return completion ? completion.completed : false;
  };

  const getPartnerHabitCompletion = (habitId: string, date: string): boolean => {
    if (!partner) return false;
    const completion = completions.find(
      (c) => c.habitId === habitId && c.userId === partner.id && c.date === date
    );
    return completion ? completion.completed : false;
  };

  // Updated to only return personal habits that belong to the current user
  const getPersonalHabits = () => habits.filter(
    habit => habit.type === "personal" && habit.user_id === user?.id
  );
  
  // Updated to only return shared habits that belong to the current user
  const getSharedHabits = () => habits.filter(
    habit => habit.type === "shared" && habit.user_id === user?.id
  );
  
  // Updated to respect new RLS policies - only show visible partner habits
  const getVisiblePartnerHabits = () => {
    if (!partner) return [];
    return habits.filter(habit => 
      habit.type === "personal" && 
      habit.visibility === "visible" &&
      habit.user_id === partner.id
    );
  };

  const getHabitsForDate = (date: string) => {
    const dayOfWeek = new Date(date).getDay();
    // Updated to only return habits for the current user
    return habits.filter(habit => {
      if (habit.user_id !== user?.id && (habit.type !== "personal" || habit.visibility !== "visible" || habit.user_id !== partner?.id)) {
        return false;
      }
      
      if (habit.recurrence === "daily") return true;
      if (habit.recurrence === "specific-days" && habit.recurrenceDays) {
        return habit.recurrenceDays.includes(dayOfWeek);
      }
      return false;
    });
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    if (user) {
      await toggleCompletion(habitId, date, user.id);
    }
  };

  const sendMotivationalMessage = async (text: string) => {
    if (user) {
      await sendMessage(text, user.id);
    }
  };

  const value = {
    habits,
    completions,
    currentUser,
    partner,
    motivationalMessage,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    getHabitCompletion,
    getPartnerHabitCompletion,
    getPersonalHabits,
    getSharedHabits,
    getVisiblePartnerHabits,
    getHabitsForDate,
    sendMotivationalMessage,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

export function useHabitContext() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error("useHabitContext must be used within a HabitProvider");
  }
  return context;
}
