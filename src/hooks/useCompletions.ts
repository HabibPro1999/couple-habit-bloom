
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { HabitCompletion } from "@/contexts/types/habit.types";
import { mapCompletionFromDB } from "@/utils/mappers/habit.mapper";
import { toast } from "@/components/ui/sonner";

export const useCompletions = () => {
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);

  const fetchCompletions = async () => {
    try {
      const { data, error } = await supabase
        .from("habit_completions")
        .select("*");
      
      if (error) throw error;
      setCompletions(data.map(mapCompletionFromDB));
    } catch (error: any) {
      toast.error("Error fetching completions", {
        description: error.message
      });
    }
  };

  const toggleCompletion = async (habitId: string, date: string, userId: string) => {
    try {
      const existingCompletion = completions.find(
        completion =>
          completion.habitId === habitId &&
          completion.userId === userId &&
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
            user_id: userId,
            date,
            completed: true
          }])
          .select()
          .single();

        if (error) throw error;
        const newCompletion = mapCompletionFromDB(data);
        setCompletions([...completions, newCompletion]);
      }
    } catch (error: any) {
      toast.error("Error toggling completion", {
        description: error.message
      });
    }
  };

  return {
    completions,
    fetchCompletions,
    toggleCompletion,
  };
};
