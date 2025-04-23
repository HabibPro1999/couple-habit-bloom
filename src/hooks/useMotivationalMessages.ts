
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MotivationalMessage } from "@/contexts/types/habit.types";
import { mapMotivationalMessageFromDB } from "@/utils/mappers/habit.mapper";
import { toast } from "@/components/ui/sonner";

export const useMotivationalMessages = () => {
  const [motivationalMessage, setMotivationalMessage] = useState<MotivationalMessage | null>(null);

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
        setMotivationalMessage(mapMotivationalMessageFromDB(data));
      } else {
        setMotivationalMessage(null);
      }
    } catch (error: any) {
      if (error.code !== "PGRST116") {
        toast.error("Error fetching motivational message", {
          description: error.message
        });
      }
    }
  };

  const sendMessage = async (text: string, userId: string) => {
    try {
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

      if (error) throw error;
      setMotivationalMessage(mapMotivationalMessageFromDB(data));
    } catch (error: any) {
      toast.error("Error sending motivational message", {
        description: error.message
      });
    }
  };

  return {
    motivationalMessage,
    fetchMotivationalMessage,
    sendMessage,
  };
};
