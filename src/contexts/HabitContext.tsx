
import React, { createContext, useContext, useEffect, useCallback, useState } from "react";
import { useAuth } from "./AuthContext";
import { Habit, HabitCompletion, User, MotivationalMessage } from "./types/habit.types";
import { useHabits } from "@/hooks/useHabits";
import { useCompletions } from "@/hooks/useCompletions";
import { useUsers } from "@/hooks/useUsers";
import { useMotivationalMessages } from "@/hooks/useMotivationalMessages";
import { toast } from "@/components/ui/sonner";

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
  isLoading: boolean;
  error: string | null;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "updatedAt" | "creatorId">) => Promise<Habit>;
  updateHabit: (habit: Habit) => Promise<Habit>;
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
  const { user, isLoading: authLoading } = useAuth();
  const { habits, isLoading: habitsLoading, error: habitsError, fetchHabits, addHabit, updateHabit, deleteHabit } = useHabits();
  const { completions, isLoading: completionsLoading, fetchCompletions, toggleCompletion } = useCompletions();
  const { currentUser, partner, isLoading: usersLoading, fetchUsers } = useUsers(user?.id);
  const { motivationalMessage, isLoading: messagesLoading, fetchMotivationalMessage, sendMessage } = useMotivationalMessages();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (user) {
      try {
        setIsLoading(true);
        setError(null);
        console.log("Fetching all data for user:", user.id);
        
        const results = await Promise.allSettled([
          fetchHabits(),
          fetchCompletions(),
          fetchUsers(),
          fetchMotivationalMessage()
        ]);
        
        const failures = results.filter(result => result.status === 'rejected');
        if (failures.length > 0) {
          console.warn("Some data fetching operations failed:", failures);
          const errorMessages = failures.map((failure: any) => failure.reason?.message || 'Unknown error').join(', ');
          setError(errorMessages);
          
          if (failures.length > 1 || failures[0] !== results[3]) {
            toast.error("Some data couldn't be loaded", {
              description: "Please try refreshing the page"
            });
          }
        } else {
          console.log("All data fetched successfully");
          setError(null);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.message);
        toast.error("Error loading data", {
          description: error.message
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [user, fetchHabits, fetchCompletions, fetchUsers, fetchMotivationalMessage]);

  useEffect(() => {
    console.log("HabitContext: User changed, fetching data", user?.id);
    if (user && !authLoading) {
      fetchData();
    }
  }, [user, authLoading, fetchData]);

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

  const getPersonalHabits = () => {
    console.log("Getting personal habits, all habits:", habits.length);
    const personalHabits = habits.filter(
      habit => habit.type === "personal" && habit.creatorId === user?.id
    );
    console.log("Personal habits:", personalHabits.length);
    return personalHabits;
  };
  
  const getSharedHabits = () => {
    console.log("Getting shared habits, all habits:", habits.length);
    const sharedHabits = habits.filter(
      habit => habit.type === "shared" && habit.creatorId === user?.id
    );
    console.log("Shared habits:", sharedHabits.length);
    return sharedHabits;
  };
  
  const getVisiblePartnerHabits = () => {
    if (!partner) return [];
    console.log("Getting visible partner habits, partner id:", partner.id);
    const partnerHabits = habits.filter(habit => 
      habit.type === "personal" && 
      habit.visibility === "visible" &&
      habit.creatorId === partner.id
    );
    console.log("Visible partner habits:", partnerHabits.length);
    return partnerHabits;
  };

  const getHabitsForDate = (date: string) => {
    const dayOfWeek = new Date(date).getDay();
    console.log("Getting habits for date:", date, "Day of week:", dayOfWeek);
    const filteredHabits = habits.filter(habit => {
      const isOwnPersonalHabit = habit.creatorId === user?.id && habit.type === "personal";
      const isOwnSharedHabit = habit.creatorId === user?.id && habit.type === "shared";
      const isPartnerVisibleHabit = partner && 
                                 habit.creatorId === partner.id && 
                                 habit.type === "personal" && 
                                 habit.visibility === "visible";
      
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

  const handleAddHabit = async (habitData: Omit<Habit, "id" | "createdAt" | "updatedAt" | "creatorId">) => {
    if (!user) {
      throw new Error("User must be logged in to add a habit");
    }
    
    // Add the creatorId to the habit data
    const habitWithCreator = {
      ...habitData,
      creatorId: user.id
    };
    
    return await addHabit(habitWithCreator);
  };

  // Combine loading states
  const combinedLoading = isLoading || habitsLoading || completionsLoading || usersLoading || messagesLoading;

  const value = {
    habits,
    completions,
    currentUser,
    partner,
    motivationalMessage,
    isLoading: combinedLoading,
    error: error || habitsError,
    addHabit: handleAddHabit,
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
