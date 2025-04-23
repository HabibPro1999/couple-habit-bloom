
import React from "react";
import { useHabitContext } from "@/contexts/HabitContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays, addDays } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CalendarView: React.FC = () => {
  const { getHabitsForDate, getHabitCompletion } = useHabitContext();
  
  // Generate array of last 7 days including today
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date,
      dateString: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE d"),
      isToday: i === 6
    };
  });

  return (
    <div className="container max-w-md mx-auto px-4 py-6 page-transition">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Habit History</h1>
        <p className="text-gray-500">Track your progress over time</p>
      </header>
      
      <Tabs defaultValue={format(new Date(), "yyyy-MM-dd")} className="w-full">
        <TabsList className="w-full mb-6 grid grid-cols-7">
          {days.map((day) => (
            <TabsTrigger
              key={day.dateString}
              value={day.dateString}
              className={`text-sm ${day.isToday ? "font-bold" : ""}`}
            >
              {day.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {days.map((day) => {
          const habitsForDate = getHabitsForDate(day.dateString);
          
          return (
            <TabsContent key={day.dateString} value={day.dateString}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    {format(day.date, "MMMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {habitsForDate.length > 0 ? (
                    <div className="space-y-3">
                      {habitsForDate.map(habit => {
                        const completed = getHabitCompletion(habit.id, day.dateString);
                        return (
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
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No habits scheduled for this day
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default CalendarView;
