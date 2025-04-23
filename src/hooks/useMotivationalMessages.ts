
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MotivationalMessage } from "@/contexts/types/habit.types";
import { mapMotivationalMessageFromDB } from "@/utils/mappers/habit.mapper";
import { toast } from "@/components/ui/sonner";

export const useMotivationalMessages = () => {
  const [motivationalMessage, setMotivationalMessage] = useState<MotivationalMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMotivationalMessage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // The RLS policy will automatically filter so we only see messages sent by the partner
      const { data, error } = await supabase
        .from("motivational_messages")
        .select("*")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.warn("Error fetching motivational message:", error);
        setError(error.message);
        // Don't throw here to avoid blocking other data fetching
        return null;
      }
      
      if (data) {
        const message = mapMotivationalMessageFromDB(data);
        console.log("Fetched motivational message:", message);
        setMotivationalMessage(message);
        return message;
      } else {
        console.log("No motivational message found");
        setMotivationalMessage(null);
        return null;
      }
    } catch (error: any) {
      console.error("Error in fetchMotivationalMessage:", error);
      setError(error.message);
      // Suppress toast for this non-critical feature
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (text: string, userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Sending motivational message:", text);
      
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { data, error } = await supabase
        .from("motivational_messages")
        .insert([{
          text,
          sender_id: userId,
          expires_at: expiresAt.toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error("Error sending motivational message:", error);
        setError(error.message);
        throw error;
      }
      
      console.log("Message sent successfully:", data);
      
      // Don't update local state after sending a message
      // Because the sender shouldn't see it (controlled by RLS)
      toast.success("Message sent to your partner successfully!");
      return data;
    } catch (error: any) {
      console.error("Error in sendMessage:", error);
      setError(error.message);
      toast.error("Error sending motivational message", {
        description: error.message
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    motivationalMessage,
    isLoading,
    error,
    fetchMotivationalMessage,
    sendMessage,
  };
};
