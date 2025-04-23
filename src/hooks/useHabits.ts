
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Habit } from "@/contexts/types/habit.types";
import { mapHabitFromDB, mapHabitToDB } from "@/utils/mappers/habit.mapper";
import { toast } from "@/components/ui/sonner";

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);

  const fetchHabits = async () => {
    try {
      const { data, error } = await supabase.from("habits").select("*");
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
      const { data, error } = await supabase
        .from("habits")
        .insert([mapHabitToDB(habitData)])
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
