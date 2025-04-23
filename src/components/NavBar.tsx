
import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

const NavBar = () => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast.error("Error signing out", {
        description: error.message
      });
    }
  };

  return (
    <div className="w-full border-b">
      <div className="container max-w-md mx-auto px-4 py-2 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-couple-primary">Couple Habits</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="text-gray-500 hover:text-gray-700"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </div>
  );
};

export default NavBar;
