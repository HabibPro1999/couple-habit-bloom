
import React from "react";
import { Habit, useHabitContext } from "@/contexts/HabitContext";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Users } from "lucide-react";
import { format } from "date-fns";

interface HabitCardProps {
  habit: Habit;
  date?: string; // ISO string YYYY-MM-DD
  onClick?: () => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ 
  habit, 
  date = new Date().toISOString().split("T")[0],
  onClick 
}) => {
  const { 
    toggleHabitCompletion, 
    getHabitCompletion, 
    getPartnerHabitCompletion,
    currentUser,
    partner
  } = useHabitContext();

  const isCompleted = getHabitCompletion(habit.id, date);
  const isPartnerCompleted = getPartnerHabitCompletion(habit.id, date);
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleHabitCompletion(habit.id, date);
  };

  return (
    <Card 
      className={`w-full mb-3 overflow-hidden transition-all duration-300 border-l-4 habit-list-item
        ${habit.type === 'personal' ? 'border-l-couple-primary' : 'border-l-couple-secondary'}
        ${isCompleted ? 'opacity-80' : 'opacity-100'}
      `}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {habit.type === "personal" ? (
            <User 
              className="h-5 w-5 text-couple-primary" 
              aria-hidden="true" 
            />
          ) : (
            <Users 
              className="h-5 w-5 text-couple-secondary" 
              aria-hidden="true" 
            />
          )}
          <div className="flex flex-col">
            <h3 className={`font-medium text-base ${isCompleted ? 'line-through text-gray-400' : ''}`}>
              {habit.title}
            </h3>
            {habit.description && (
              <p className="text-sm text-gray-500 truncate max-w-[200px]">
                {habit.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {habit.type === "shared" && habit.completionRequirement === "both" && (
            <div className="flex flex-col items-center mr-2">
              <span className="text-xs text-gray-500 mb-1">Partner</span>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center
                ${isPartnerCompleted 
                  ? 'bg-couple-secondary border-couple-secondary' 
                  : 'border-gray-300'}`}
              >
                {isPartnerCompleted && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          )}
          
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 mb-1">
              {habit.type === "shared" && habit.completionRequirement === "both" 
                ? currentUser.name 
                : "Today"}
            </span>
            <Checkbox 
              className="habit-checkbox"
              checked={isCompleted}
              onCheckedChange={() => {}}
              onClick={handleToggle}
              aria-label={`Mark ${habit.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HabitCard;
