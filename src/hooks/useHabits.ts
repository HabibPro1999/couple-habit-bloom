
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Habit } from "@/contexts/types/habit.types";
import { mapHabitFromDB, mapHabitToDB } from "@/utils/mappers/habit.mapper";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        console.log("No user found, skipping habit fetch");
        return [];
      }
      
      console.log("Fetching habits for user:", user.id);
      
      // Get habits based on the RLS policies
      const { data, error } = await supabase
        .from("habits")
        .select("*");
        
      if (error) {
        console.error("Error fetching habits:", error);
        setError(error.message);
        throw error;
      }
      
      console.log("Fetched habits:", data);
      const mappedHabits = data.map(mapHabitFromDB);
      setHabits(mappedHabits);
      return mappedHabits;
    } catch (error: any) {
      console.error("Error in fetchHabits:", error);
      setError(error.message);
      toast.error("Error fetching habits", {
        description: error.message
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const addHabit = async (habitData: Omit<Habit, "id" | "createdAt" | "updatedAt">) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!user) {
        const errorMsg = "User must be logged in to add a habit";
        console.error(errorMsg);
        setError(errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log("Adding habit with data:", habitData);
      
      const dbData = {
        ...mapHabitToDB(habitData),
        creator_id: user.id
      };
      
      console.log("Mapped habit data for DB:", dbData);
      
      const { data, error } = await supabase
        .from("habits")
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error("Error adding habit:", error);
        setError(error.message);
        throw error;
      }
      
      console.log("Successfully added habit:", data);
      
      const newHabit = mapHabitFromDB(data);
      setHabits(prevHabits => [...prevHabits, newHabit]);
      
      toast.success("Habit added successfully");
      return newHabit;
    } catch (error: any) {
      console.error("Error in addHabit:", error);
      setError(error.message);
      toast.error("Error adding habit", {
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateHabit = async (updatedHabit: Habit) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Updating habit:", updatedHabit);
      
      const { error } = await supabase
        .from("habits")
        .update(mapHabitToDB(updatedHabit))
        .eq("id", updatedHabit.id);

      if (error) {
        console.error("Error updating habit:", error);
        setError(error.message);
        throw error;
      }
      
      console.log("Successfully updated habit");
      
      setHabits(habits.map(habit => 
        habit.id === updatedHabit.id ? updatedHabit : habit
      ));
      
      toast.success("Habit updated successfully");
      return updatedHabit;
    } catch (error: any) {
      console.error("Error in updateHabit:", error);
      setError(error.message);
      toast.error("Error updating habit", {
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Deleting habit with ID:", habitId);
      
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId);

      if (error) {
        console.error("Error deleting habit:", error);
        setError(error.message);
        throw error;
      }
      
      console.log("Successfully deleted habit");
      
      setHabits(habits.filter(habit => habit.id !== habitId));
      toast.success("Habit deleted successfully");
    } catch (error: any) {
      console.error("Error in deleteHabit:", error);
      setError(error.message);
      toast.error("Error deleting habit", {
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    habits,
    isLoading,
    error,
    fetchHabits,
    addHabit,
    updateHabit,
    deleteHabit,
  };
};
