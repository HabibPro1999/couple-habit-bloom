
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useHabitContext, Habit } from "@/contexts/HabitContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Edit, ArrowLeft, User, Users, Calendar as CalendarIcon, Loader2 } from "lucide-react";

const HabitDetail: React.FC = () => {
  const { habitId } = useParams<{ habitId: string }>();
  const navigate = useNavigate();
  const { habits, completions, currentUser, partner, isLoading } = useHabitContext();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  
  useEffect(() => {
    if (habitId && habits.length > 0) {
      const foundHabit = habits.find(h => h.id === habitId);
      if (foundHabit) {
        setHabit(foundHabit);
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [habitId, habits, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (!habit) {
    return null; // Loading or redirect will happen
  }
  
  // Get habit completions
  const habitCompletions = completions.filter(c => c.habitId === habit.id);
  
  // Get dates with completions
  const getDatesWithCompletions = () => {
    if (!currentUser) return [];
    
    const userCompletionDates = habitCompletions
      .filter(c => c.userId === currentUser.id && c.completed)
      .map(c => new Date(c.date));
      
    return userCompletionDates;
  };
  
  // Get partner completions
  const getPartnerCompletions = () => {
    if (!partner) return [];
    
    return habitCompletions
      .filter(c => c.userId === partner.id && c.completed)
      .map(c => new Date(c.date));
  };
  
  const userCompletionDates = getDatesWithCompletions();
  const partnerCompletionDates = getPartnerCompletions();
  
  // Get streak (consecutive days)
  const calculateStreak = () => {
    const sortedDates = userCompletionDates
      .map(date => date.toISOString().split('T')[0])
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
    if (sortedDates.length === 0) return 0;
    
    let streak = 1;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if completed today
    if (sortedDates[0] !== today) return 0;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i-1]);
      const prevDate = new Date(sortedDates[i]);
      
      // Set hours to 0 to compare just the dates
      currentDate.setHours(0, 0, 0, 0);
      prevDate.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(currentDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  // Check if user is the creator
  const isCreator = currentUser && habit.creatorId === currentUser.id;
  
  return (
    <div className="container max-w-md mx-auto px-4 py-6 page-transition">
      <header className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Habit Details</h1>
          </div>
          {isCreator && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(`/edit-habit/${habit.id}`)}
            >
              <Edit className="h-5 w-5" />
            </Button>
          )}
        </div>
      </header>
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {habit.type === "personal" ? (
                <User className="h-5 w-5 text-couple-primary" />
              ) : (
                <Users className="h-5 w-5 text-couple-secondary" />
              )}
              <CardTitle>{habit.title}</CardTitle>
            </div>
            <Badge variant={habit.type === "personal" ? "default" : "secondary"}>
              {habit.type === "personal" ? "Personal" : "Shared"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {habit.description && (
            <p className="text-gray-600">{habit.description}</p>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Recurrence</h3>
              <p className="font-medium">
                {habit.recurrence === "daily" ? "Every Day" : "Specific Days"}
              </p>
              {habit.recurrence === "specific-days" && habit.recurrenceDays && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {habit.recurrenceDays.map((day) => (
                    <Badge key={day} variant="outline" className="text-xs">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day]}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            {habit.type === "personal" && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Visibility</h3>
                <p className="font-medium">
                  {habit.visibility === "visible" ? "Visible to Partner" : "Private"}
                </p>
              </div>
            )}
            
            {habit.type === "shared" && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Completion</h3>
                <p className="font-medium">
                  {habit.completionRequirement === "one" ? "Either Person" : "Both People"}
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-500">Current Streak</h3>
              <span className="text-lg font-bold">{calculateStreak()} days</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Completion History
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="rounded-md border"
            modifiers={{
              completed: userCompletionDates,
              partnerCompleted: habit.type === "shared" ? partnerCompletionDates : [],
            }}
            modifiersStyles={{
              completed: { 
                fontWeight: 'bold',
                backgroundColor: habit.type === "personal" ? '#FFD6E0' : '#D6E6FF'
              },
              partnerCompleted: {
                border: '2px solid #A5D6FF'
              }
            }}
          />
          
          <div className="mt-4 text-sm text-gray-500">
            <p>• Colored days: You completed the habit</p>
            {habit.type === "shared" && (
              <p>• Outlined days: Your partner completed the habit</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitDetail;
