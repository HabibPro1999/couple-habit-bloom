
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Habit } from "@/contexts/types/habit.types";
import { mapHabitFromDB, mapHabitToDB } from "@/utils/mappers/habit.mapper";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const { user } = useAuth();

  const fetchHabits = async () => {
    try {
      if (!user) return;
      
      console.log("Fetching habits for user:", user.id);
      
      // Get habits based on the RLS policies
      const { data, error } = await supabase
        .from("habits")
        .select("*");
        
      if (error) {
        console.error("Error fetching habits:", error);
        throw error;
      }
      
      console.log("Fetched habits:", data);
      setHabits(data.map(mapHabitFromDB));
    } catch (error: any) {
      console.error("Error in fetchHabits:", error);
      toast.error("Error fetching habits", {
        description: error.message
      });
    }
  };

  const addHabit = async (habitData: Omit<Habit, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (!user) throw new Error("User must be logged in to add a habit");
      
      console.log("Adding habit with data:", habitData);
      
      const dbData = {
        ...mapHabitToDB(habitData),
        user_id: user.id
      };
      
      console.log("Mapped habit data for DB:", dbData);
      
      const { data, error } = await supabase
        .from("habits")
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error("Error adding habit:", error);
        throw error;
      }
      
      console.log("Successfully added habit:", data);
      
      const newHabit = mapHabitFromDB(data);
      setHabits([...habits, newHabit]);
      
      // Fetch all habits again to ensure everything is in sync
      await fetchHabits();
      
      return newHabit;
    } catch (error: any) {
      console.error("Error in addHabit:", error);
      toast.error("Error adding habit", {
        description: error.message
      });
      throw error;
    }
  };

  const updateHabit = async (updatedHabit: Habit) => {
    try {
      console.log("Updating habit:", updatedHabit);
      
      const { error } = await supabase
        .from("habits")
        .update(mapHabitToDB(updatedHabit))
        .eq("id", updatedHabit.id);

      if (error) {
        console.error("Error updating habit:", error);
        throw error;
      }
      
      console.log("Successfully updated habit");
      
      setHabits(habits.map(habit => 
        habit.id === updatedHabit.id ? updatedHabit : habit
      ));
      
      // Fetch all habits again to ensure everything is in sync
      await fetchHabits();
    } catch (error: any) {
      console.error("Error in updateHabit:", error);
      toast.error("Error updating habit", {
        description: error.message
      });
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      console.log("Deleting habit with ID:", habitId);
      
      const { error } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId);

      if (error) {
        console.error("Error deleting habit:", error);
        throw error;
      }
      
      console.log("Successfully deleted habit");
      
      setHabits(habits.filter(habit => habit.id !== habitId));
    } catch (error: any) {
      console.error("Error in deleteHabit:", error);
      toast.error("Error deleting habit", {
        description: error.message
      });
    }
  };

  return {
    habits,
    fetchHabits,
    addHabit,
    updateHabit,
    deleteHabit,
  };
};
