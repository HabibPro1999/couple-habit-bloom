
import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const ensureUserProfile = async (currentUser: User) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", currentUser.id)
        .maybeSingle();
        
      if (profileCheckError) {
        console.error("Error checking profile:", profileCheckError);
        return;
      }
      
      // If no profile exists, create one
      if (!existingProfile) {
        console.log("Creating new profile for user:", currentUser.id);
        const { error: createProfileError } = await supabase
          .from("profiles")
          .insert([{
            id: currentUser.id,
            name: currentUser.email?.split('@')[0] || 'User'
          }]);
          
        if (createProfileError) {
          console.error("Error creating profile:", createProfileError);
          toast.error("Error setting up your profile");
        } else {
          console.log("Profile created successfully");
        }
      }
    } catch (error) {
      console.error("Error in ensureUserProfile:", error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
        
        // Ensure profile exists when user signs in
        if (event === 'SIGNED_IN' && newSession?.user) {
          ensureUserProfile(newSession.user);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setIsLoading(false);
      
      // Ensure profile exists for existing session
      if (existingSession?.user) {
        ensureUserProfile(existingSession.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
