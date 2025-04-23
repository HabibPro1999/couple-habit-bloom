import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";
import { toast } from "@/components/ui/sonner";

// Define habit types
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
  recurrenceDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  visibility?: VisibilityType; // For personal habits
  completionRequirement?: CompletionRequirementType; // For shared habits
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string; // ISO format YYYY-MM-DD
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
  isPartner: boolean;
}

export interface MotivationalMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  expiresAt: string;
}

interface HabitContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  currentUser: User | null;
  partner: User | null;
  motivationalMessage: MotivationalMessage | null;
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "updatedAt">) => Promise<void>;
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
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [motivationalMessage, setMotivationalMessage] = useState<MotivationalMessage | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchCompletions();
      fetchProfiles();
      fetchMotivationalMessage();
    }
  }, [user]);

  const fetchHabits = async () => {
    try {
      const { data, error } = await supabase
        .from("habits")
        .select("*");
      
      if (error) throw error;
      setHabits(data || []);
    } catch (error: any) {
      toast.error("Error fetching habits", {
        description: error.message
      });
    }
  };

  const fetchCompletions = async () => {
    try {
      const { data, error } = await supabase
        .from("habit_completions")
        .select("*");
      
      if (error) throw error;
      setCompletions(data || []);
    } catch (error: any) {
      toast.error("Error fetching completions", {
        description: error.message
      });
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");
      
      if (error) throw error;

      if (data) {
        const currentUserProfile = data.find(profile => profile.id === user?.id);
        const partnerProfile = data.find(profile => profile.id !== user?.id);
        
        setCurrentUser(currentUserProfile || null);
        setPartner(partnerProfile || null);
      }
    } catch (error: any) {
      toast.error("Error fetching profiles", {
        description: error.message
      });
    }
  };

  const fetchMotivationalMessage = async () => {
    try {
      const { data, error } = await supabase
        .from("motivational_messages")
        .select("*")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      setMotivationalMessage(data || null);
    } catch (error: any) {
      toast.error("Error fetching motivational message", {
        description: error.message
      });
    }
  };

  const addHabit = async (habitData: Omit<Habit, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { data, error } = await supabase
        .from("habits")
        .insert([{ ...habitData, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      setHabits([...habits, data]);
    } catch (error: any) {
      toast.error("Error adding habit", {
        description: error.message
      });
    }
  };

  const updateHabit = async (updatedHabit: Habit) => {
    try {
      const { error } = await supabase
        .from("habits")
        .update(updatedHabit)
        .eq("id", updatedHabit.id);

      if (error) throw error;
      setHabits(habits.map(habit => 
        habit.id === updatedHabit.id ? updatedHabit : habit
      ));
    } catch (error: any) {
      toast.error("Error updating habit", {
        description: error.message
      });
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId);

      if (error) throw error;
      setHabits(habits.filter(habit => habit.id !== habitId));
    } catch (error: any) {
      toast.error("Error deleting habit", {
        description: error.message
      });
    }
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    try {
      const existingCompletion = completions.find(
        completion =>
          completion.habitId === habitId &&
          completion.userId === user?.id &&
          completion.date === date
      );

      if (existingCompletion) {
        const { error } = await supabase
          .from("habit_completions")
          .update({ completed: !existingCompletion.completed })
          .eq("id", existingCompletion.id);

        if (error) throw error;
        setCompletions(completions.map(completion =>
          completion.id === existingCompletion.id
            ? { ...completion, completed: !completion.completed }
            : completion
        ));
      } else {
        const { data, error } = await supabase
          .from("habit_completions")
          .insert([{
            habit_id: habitId,
            user_id: user?.id,
            date,
            completed: true
          }])
          .select()
          .single();

        if (error) throw error;
        setCompletions([...completions, data]);
      }
    } catch (error: any) {
      toast.error("Error toggling habit completion", {
        description: error.message
      });
    }
  };

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
    return habits.filter(habit => habit.type === "personal");
  };

  const getSharedHabits = () => {
    return habits.filter(habit => habit.type === "shared");
  };

  const getVisiblePartnerHabits = () => {
    return habits.filter(
      habit => habit.type === "personal" && habit.visibility === "visible"
    );
  };

  const getHabitsForDate = (date: string) => {
    const dayOfWeek = new Date(date).getDay();
    return habits.filter(habit => {
      if (habit.recurrence === "daily") {
        return true;
      } else if (habit.recurrence === "specific-days" && habit.recurrenceDays) {
        return habit.recurrenceDays.includes(dayOfWeek);
      }
      return false;
    });
  };

  const sendMotivationalMessage = async (text: string) => {
    try {
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { data, error } = await supabase
        .from("motivational_messages")
        .insert([{
          text,
          sender_id: user?.id,
          expires_at: expiresAt.toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      setMotivationalMessage(data);
    } catch (error: any) {
      toast.error("Error sending motivational message", {
        description: error.message
      });
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
