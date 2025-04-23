
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
      
      // Map the data to match our interface
      const mappedHabits = data?.map(habit => ({
        id: habit.id,
        title: habit.title,
        description: habit.description || undefined,
        type: habit.type as HabitType,
        recurrence: habit.recurrence as RecurrenceType,
        recurrenceDays: habit.recurrence_days || undefined,
        visibility: habit.visibility as VisibilityType || "visible",
        completionRequirement: habit.completion_requirement as CompletionRequirementType || "both",
        createdAt: habit.created_at,
        updatedAt: habit.updated_at
      })) || [];
      
      setHabits(mappedHabits);
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

      // Map the data to match our interface
      const mappedCompletions = data?.map(completion => ({
        id: completion.id,
        habitId: completion.habit_id,
        userId: completion.user_id,
        date: completion.date,
        completed: completion.completed
      })) || [];
      
      setCompletions(mappedCompletions);
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
        
        if (currentUserProfile) {
          setCurrentUser({
            id: currentUserProfile.id,
            name: currentUserProfile.name,
            isPartner: !!currentUserProfile.is_partner
          });
        }
        
        if (partnerProfile) {
          setPartner({
            id: partnerProfile.id,
            name: partnerProfile.name,
            isPartner: !!partnerProfile.is_partner
          });
        }
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
      
      if (data) {
        setMotivationalMessage({
          id: data.id,
          text: data.text,
          senderId: data.sender_id,
          createdAt: data.created_at,
          expiresAt: data.expires_at
        });
      } else {
        setMotivationalMessage(null);
      }
    } catch (error: any) {
      if (error.code !== "PGRST116") { // Skip error for empty result
        toast.error("Error fetching motivational message", {
          description: error.message
        });
      }
    }
  };

  const addHabit = async (habitData: Omit<Habit, "id" | "createdAt" | "updatedAt">) => {
    try {
      // Transform our interface data to match Supabase schema
      const supabaseHabitData = {
        title: habitData.title,
        description: habitData.description,
        type: habitData.type,
        recurrence: habitData.recurrence,
        recurrence_days: habitData.recurrenceDays,
        visibility: habitData.visibility,
        completion_requirement: habitData.completionRequirement,
        user_id: user?.id
      };

      const { data, error } = await supabase
        .from("habits")
        .insert([supabaseHabitData])
        .select()
        .single();

      if (error) throw error;
      
      // Map the response back to our interface
      const newHabit: Habit = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        type: data.type as HabitType,
        recurrence: data.recurrence as RecurrenceType,
        recurrenceDays: data.recurrence_days || undefined,
        visibility: data.visibility as VisibilityType || "visible",
        completionRequirement: data.completion_requirement as CompletionRequirementType || "both",
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setHabits([...habits, newHabit]);
    } catch (error: any) {
      toast.error("Error adding habit", {
        description: error.message
      });
    }
  };

  const updateHabit = async (updatedHabit: Habit) => {
    try {
      // Transform our interface data to match Supabase schema
      const supabaseHabitData = {
        id: updatedHabit.id,
        title: updatedHabit.title,
        description: updatedHabit.description,
        type: updatedHabit.type,
        recurrence: updatedHabit.recurrence,
        recurrence_days: updatedHabit.recurrenceDays,
        visibility: updatedHabit.visibility,
        completion_requirement: updatedHabit.completionRequirement,
      };

      const { error } = await supabase
        .from("habits")
        .update(supabaseHabitData)
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
        
        // Map the response back to our interface
        const newCompletion: HabitCompletion = {
          id: data.id,
          habitId: data.habit_id,
          userId: data.user_id,
          date: data.date,
          completed: data.completed
        };

        setCompletions([...completions, newCompletion]);
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
      
      // Map the response back to our interface
      const newMessage: MotivationalMessage = {
        id: data.id,
        text: data.text,
        senderId: data.sender_id,
        createdAt: data.created_at,
        expiresAt: data.expires_at
      };

      setMotivationalMessage(newMessage);
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
