
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { HabitCompletion } from "@/contexts/types/habit.types";
import { mapCompletionFromDB, mapCompletionToDB } from "@/utils/mappers/habit.mapper";
import { toast } from "@/components/ui/sonner";

export const useCompletions = () => {
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompletions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("habit_completions")
        .select("*");
      
      if (error) {
        console.error("Error fetching completions:", error);
        setError(error.message);
        throw error;
      }
      
      const mappedCompletions = data.map(mapCompletionFromDB);
      setCompletions(mappedCompletions);
      return mappedCompletions;
    } catch (error: any) {
      console.error("Error in fetchCompletions:", error);
      setError(error.message);
      toast.error("Error fetching completions", {
        description: error.message
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCompletion = async (habitId: string, date: string, userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const existingCompletion = completions.find(
        completion =>
          completion.habitId === habitId &&
          completion.userId === userId &&
          completion.date === date
      );

      if (existingCompletion) {
        // Update existing completion
        const { error } = await supabase
          .from("habit_completions")
          .update({ completed: !existingCompletion.completed })
          .eq("id", existingCompletion.id);

        if (error) {
          console.error("Error updating completion:", error);
          setError(error.message);
          throw error;
        }
        
        // Update local state
        setCompletions(completions.map(completion =>
          completion.id === existingCompletion.id
            ? { ...completion, completed: !completion.completed }
            : completion
        ));
        
        return { ...existingCompletion, completed: !existingCompletion.completed };
      } else {
        // Create new completion
        const newCompletion = {
          habit_id: habitId,
          user_id: userId,
          date,
          completed: true
        };
        
        const { data, error } = await supabase
          .from("habit_completions")
          .insert([newCompletion])
          .select()
          .single();

        if (error) {
          console.error("Error creating completion:", error);
          setError(error.message);
          throw error;
        }
        
        // Update local state
        const mappedCompletion = mapCompletionFromDB(data);
        setCompletions([...completions, mappedCompletion]);
        
        return mappedCompletion;
      }
    } catch (error: any) {
      console.error("Error in toggleCompletion:", error);
      setError(error.message);
      toast.error("Error toggling completion", {
        description: error.message
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    completions,
    isLoading,
    error,
    fetchCompletions,
    toggleCompletion,
  };
};
