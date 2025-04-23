
import React from "react";
import { useHabitContext } from "@/contexts/HabitContext";
import HabitCard from "@/components/HabitCard";
import { User } from "lucide-react";

const PartnerHabits: React.FC = () => {
  const { getVisiblePartnerHabits, partner } = useHabitContext();
  const today = new Date().toISOString().split("T")[0];
  
  const visiblePartnerHabits = getVisiblePartnerHabits();

  if (!partner) {
    return (
      <div className="container max-w-md mx-auto px-4 py-6 text-center page-transition">
        <h1 className="text-2xl font-bold mb-4">Partner's Habits</h1>
        <p className="text-gray-500">No partner connected yet</p>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-6 page-transition">
      <header className="mb-6">
        <div className="flex items-center mb-2">
          <h1 className="text-2xl font-bold">{partner.name}'s Habits</h1>
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
