
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/contexts/types/habit.types";
import { mapUserFromDB } from "@/utils/mappers/habit.mapper";
import { toast } from "@/components/ui/sonner";

export const useUsers = (currentUserId: string | undefined) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");
      
      if (error) throw error;

      if (data) {
        const users = data.map(mapUserFromDB);
        const currentUserProfile = users.find(user => user.id === currentUserId);
        const partnerProfile = users.find(user => user.id !== currentUserId);
        
        if (currentUserProfile) setCurrentUser(currentUserProfile);
        if (partnerProfile) setPartner(partnerProfile);
      }
    } catch (error: any) {
      toast.error("Error fetching users", {
        description: error.message
      });
    }
  };

  return {
    currentUser,
    partner,
    fetchUsers,
  };
};
