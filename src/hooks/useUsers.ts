
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { User, Relationship } from "@/contexts/types/habit.types";
import { mapUserFromDB, mapRelationshipFromDB } from "@/utils/mappers/habit.mapper";
import { toast } from "@/components/ui/sonner";

export const useUsers = (currentUserId: string | undefined) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
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
        .maybeSingle();
      
      if (currentUserError) throw currentUserError;
      
      if (currentUserData) {
        const currentUserProfile = mapUserFromDB(currentUserData);
        setCurrentUser(currentUserProfile);
        
        // Get partner id from relationship
        const { data: partnerIdData, error: partnerIdError } = await supabase
          .rpc('get_partner_id', { user_id: currentUserId });
        
        if (partnerIdError) {
          console.warn("No partner found:", partnerIdError);
          setPartner(null);
          return;
        }
        
        // If we have a partner id, fetch the partner's profile
        if (partnerIdData) {
          const { data: partnerData, error: partnerError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", partnerIdData)
            .maybeSingle();
            
          if (partnerError) {
            console.warn("Error fetching partner profile:", partnerError);
          } else if (partnerData) {
            setPartner(mapUserFromDB(partnerData));
            
            // Fetch the relationship
            const { data: relationshipData, error: relationshipError } = await supabase
              .from("relationships")
              .select("*")
              .or(`user_id_1.eq.${currentUserId},user_id_2.eq.${currentUserId}`)
              .maybeSingle();
              
            if (relationshipError) {
              console.warn("Error fetching relationship:", relationshipError);
            } else if (relationshipData) {
              setRelationship(mapRelationshipFromDB(relationshipData));
            }
          }
        } else {
          setPartner(null);
        }
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
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
    relationship,
    fetchUsers,
    isLoading
  };
};
