
import React, { useEffect } from "react";
import { useHabitContext } from "@/contexts/HabitContext";
import HabitCard from "@/components/HabitCard";
import { User, UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PartnerHabits: React.FC = () => {
  const { getVisiblePartnerHabits, partner, fetchData, isLoading, error } = useHabitContext();
  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("PartnerHabits component mounted, fetching data");
    fetchData();
  }, [fetchData]);
  
  const visiblePartnerHabits = getVisiblePartnerHabits();
  console.log("Partner habits in PartnerHabits component:", visiblePartnerHabits.length);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6 text-center page-transition">
        <h1 className="text-2xl font-bold mb-4">Partner's Habits</h1>
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-couple-primary" />
          <span className="ml-2">Loading partner data...</span>
        </div>
      </div>
    );
  }

  if (!partner) {
    console.log("No partner found in PartnerHabits component");
    return (
      <div className="container max-w-md mx-auto px-4 py-6 text-center page-transition">
        <h1 className="text-2xl font-bold mb-4">Partner's Habits</h1>
        <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
          <User className="h-16 w-16 mx-auto mb-4 text-couple-primary opacity-50" />
          <p className="text-gray-600 mb-4">No partner connected yet</p>
          <p className="text-sm text-gray-500 mb-6">
            You need to be connected with a partner to see their habits.
            Once connected, visible habits will appear here.
          </p>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate("/all-habits")}
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Your Own Habits</span>
          </Button>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6 text-center page-transition">
        <h1 className="text-2xl font-bold mb-4">{partner.name}'s Habits</h1>
        <div className="bg-red-50 rounded-lg p-6 shadow-sm">
          <p className="text-red-600 mb-4">Error loading partner habits</p>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => fetchData()}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    );
  }

  console.log("Partner found:", partner.name, "with ID:", partner.id);
  
  return (
    <div className="container max-w-md mx-auto px-4 py-6 page-transition">
      <header className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">{partner.name}'s Habits</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchData()}
            title="Refresh habits"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-gray-500">
          Visible personal habits your partner is working on
        </p>
      </header>
      
      {visiblePartnerHabits.length > 0 ? (
        <div className="space-y-2">
          {visiblePartnerHabits.map(habit => (
            <HabitCard 
              key={habit.id} 
              habit={habit}
              date={today}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <User className="h-16 w-16 mx-auto mb-4 text-couple-primary opacity-50" />
          <p className="text-gray-500">
            Your partner hasn't shared any visible habits yet
          </p>
        </div>
      )}
    </div>
  );
};

export default PartnerHabits;
