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
      
      const { data, error } = await supabase
        .from("habits")
        .select("*");
        
      if (error) throw error;
      setHabits(data.map(mapHabitFromDB));
    } catch (error: any) {
      toast.error("Error fetching habits", {
        description: error.message
      });
    }
  };

  const addHabit = async (habitData: Omit<Habit, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (!user) throw new Error("User must be logged in to add a habit");
      
      const dbData = {
        ...mapHabitToDB(habitData),
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from("habits")
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;
      const newHabit = mapHabitFromDB(data);
      setHabits([...habits, newHabit]);
      return newHabit;
    } catch (error: any) {
      toast.error("Error adding habit", {
        description: error.message
      });
      throw error;
    }
  };

  const updateHabit = async (updatedHabit: Habit) => {
    try {
      const { error } = await supabase
        .from("habits")
        .update(mapHabitToDB(updatedHabit))
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

  return {
    habits,
    fetchHabits,
    addHabit,
    updateHabit,
    deleteHabit,
  };
};
