
import React, { createContext, useContext, useEffect, useCallback } from "react";
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
  fetchData: () => Promise<void>;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export function HabitProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { habits, fetchHabits, addHabit, updateHabit, deleteHabit } = useHabits();
  const { completions, fetchCompletions, toggleCompletion } = useCompletions();
  const { currentUser, partner, fetchUsers } = useUsers(user?.id);
  const { motivationalMessage, fetchMotivationalMessage, sendMessage } = useMotivationalMessages();

  const fetchData = useCallback(async () => {
    if (user) {
      try {
        console.log("Fetching all data for user:", user.id);
        await Promise.all([
          fetchHabits(),
          fetchCompletions(),
          fetchUsers(),
          fetchMotivationalMessage()
        ]);
        console.log("All data fetched successfully");
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }, [user, fetchHabits, fetchCompletions, fetchUsers, fetchMotivationalMessage]);

  useEffect(() => {
    console.log("HabitContext: User changed, fetching data", user?.id);
    fetchData();
  }, [user, fetchData]);

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

  // Personal habits that belong to the current user
  const getPersonalHabits = () => {
    console.log("Getting personal habits, all habits:", habits.length);
    const personalHabits = habits.filter(
      habit => habit.type === "personal" && habit.user_id === user?.id
    );
    console.log("Personal habits:", personalHabits.length);
    return personalHabits;
  };
  
  // Shared habits that belong to the current user
  const getSharedHabits = () => {
    console.log("Getting shared habits, all habits:", habits.length);
    const sharedHabits = habits.filter(
      habit => habit.type === "shared" && habit.user_id === user?.id
    );
    console.log("Shared habits:", sharedHabits.length);
    return sharedHabits;
  };
  
  // Visible partner habits
  const getVisiblePartnerHabits = () => {
    if (!partner) return [];
    console.log("Getting visible partner habits, partner id:", partner.id);
    const partnerHabits = habits.filter(habit => 
      habit.type === "personal" && 
      habit.visibility === "visible" &&
      habit.user_id === partner.id
    );
    console.log("Visible partner habits:", partnerHabits.length);
    return partnerHabits;
  };

  const getHabitsForDate = (date: string) => {
    const dayOfWeek = new Date(date).getDay();
    console.log("Getting habits for date:", date, "Day of week:", dayOfWeek);
    // Return habits for the current user based on the date
    const filteredHabits = habits.filter(habit => {
      // Own personal habits
      const isOwnPersonalHabit = habit.user_id === user?.id && habit.type === "personal";
      
      // Own shared habits
      const isOwnSharedHabit = habit.user_id === user?.id && habit.type === "shared";
      
      // Partner's visible personal habits
      const isPartnerVisibleHabit = partner && 
                                 habit.user_id === partner.id && 
                                 habit.type === "personal" && 
                                 habit.visibility === "visible";
      
      // Check if this habit should be shown based on recurrence
      let matchesRecurrence = false;
      if (habit.recurrence === "daily") {
        matchesRecurrence = true;
      } else if (habit.recurrence === "specific-days" && habit.recurrenceDays) {
        matchesRecurrence = habit.recurrenceDays.includes(dayOfWeek);
      }
      
      return (isOwnPersonalHabit || isOwnSharedHabit || isPartnerVisibleHabit) && matchesRecurrence;
    });
    
    console.log("Habits for date after filtering:", filteredHabits.length);
    return filteredHabits;
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    if (user) {
      console.log("Toggling habit completion for habit:", habitId, "date:", date);
      await toggleCompletion(habitId, date, user.id);
    }
  };

  const sendMotivationalMessage = async (text: string) => {
    if (user) {
      console.log("Sending motivational message:", text);
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
    fetchData
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
