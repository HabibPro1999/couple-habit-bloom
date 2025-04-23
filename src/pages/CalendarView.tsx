
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useHabitContext } from "@/contexts/HabitContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isSameDay } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Users } from "lucide-react";

const CalendarView: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { habits, getHabitsForDate, getHabitCompletion, completions } = useHabitContext();
  
  // Function to get all habit completions for a specific date
  const getCompletionsForDate = (date: Date) => {
    if (!date) return [];
    
    const dateString = format(date, "yyyy-MM-dd");
    const habitsForDate = getHabitsForDate(dateString);
    
    return habitsForDate.map(habit => ({
      habit,
      completed: getHabitCompletion(habit.id, dateString)
    }));
  };
  
  // Get all dates with habit completions
  const getDaysWithCompletions = () => {
    const daysWithCompletions = new Set<string>();
    
    completions.forEach(completion => {
      daysWithCompletions.add(completion.date);
    });
    
    return Array.from(daysWithCompletions).map(dateString => new Date(dateString));
  };
  
  const completionDates = getDaysWithCompletions();
  const selectedDateCompletions = date ? getCompletionsForDate(date) : [];
  const selectedDateString = date ? format(date, "yyyy-MM-dd") : "";

  return (
    <div className="container max-w-md mx-auto px-4 py-6 page-transition">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Habit Calendar</h1>
        <p className="text-gray-500">Track your progress over time</p>
      </header>
      
      <div className="mb-6">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          modifiers={{
            completed: completionDates,
          }}
          modifiersStyles={{
            completed: { 
              fontWeight: 'bold' 
            }
          }}
        />
      </div>
      
      {date && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {format(date, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateCompletions.length > 0 ? (
              <div className="space-y-3">
                {selectedDateCompletions.map(({ habit, completed }) => (
                  <div key={habit.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {habit.type === "personal" ? (
                        <User className="h-4 w-4 text-couple-primary" />
                      ) : (
                        <Users className="h-4 w-4 text-couple-secondary" />
                      )}
                      <span className={completed ? "line-through text-gray-400" : ""}>
                        {habit.title}
                      </span>
                    </div>
                    <Checkbox checked={completed} disabled />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No habits scheduled for this day
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarView;
