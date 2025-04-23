
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/contexts/types/habit.types";
import { mapUserFromDB } from "@/utils/mappers/habit.mapper";
import { toast } from "@/components/ui/sonner";

export const useUsers = (currentUserId: string | undefined) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      if (!currentUserId) {
        return;
      }
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_partner", true);
      
      if (error) throw error;

      if (data) {
        const users = data.map(mapUserFromDB);
        const currentUserProfile = users.find(user => user.id === currentUserId);
        
        // Find partner (a user marked as partner who is not the current user)
        const partnerProfile = users.find(user => 
          user.id !== currentUserId && user.isPartner
        );
        
        if (currentUserProfile) setCurrentUser(currentUserProfile);
        if (partnerProfile) setPartner(partnerProfile);
      }
    } catch (error: any) {
      toast.error("Error fetching users", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch users if currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      fetchUsers();
    }
  }, [currentUserId]);

  return {
    currentUser,
    partner,
    fetchUsers,
    isLoading
  };
};
