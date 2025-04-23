
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
      
      // Fetch current user's profile
      const { data: currentUserData, error: currentUserError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUserId)
        .single();
      
      if (currentUserError) throw currentUserError;
      
      if (currentUserData) {
        const currentUserProfile = mapUserFromDB(currentUserData);
        setCurrentUser(currentUserProfile);
        
        // If current user has a partner_id, fetch the partner's profile
        if (currentUserProfile.partnerId) {
          const { data: partnerData, error: partnerError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUserProfile.partnerId)
            .single();
            
          if (partnerError) throw partnerError;
          
          if (partnerData) {
            setPartner(mapUserFromDB(partnerData));
          }
        }
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
