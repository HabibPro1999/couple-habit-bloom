import React, { useState } from "react";
import { useHabitContext } from "@/contexts/HabitContext";
import HabitCard from "@/components/HabitCard";
import { Button } from "@/components/ui/button";
import { Plus, User, Users, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import MotivationalMessage from "@/components/MotivationalMessage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

const Today: React.FC = () => {
  const { getHabitsForDate, getPersonalHabits, getSharedHabits, sendMotivationalMessage } = useHabitContext();
  const [today] = useState(new Date().toISOString().split("T")[0]);
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState("");
  const { toast } = useToast();
  
  const todayHabits = getHabitsForDate(today);
  const personalHabits = todayHabits.filter(habit => habit.type === "personal");
  const sharedHabits = todayHabits.filter(habit => habit.type === "shared");

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMotivationalMessage(messageText);
      setMessageText("");
      toast({
        title: "Message sent!",
        description: "Your partner will see your motivational message.",
      });
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-6 page-transition">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">Today's Habits</h1>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="rounded-full bg-couple-secondary text-white border-0 hover:bg-couple-secondary hover:opacity-90"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="sr-only">Send motivational message</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send a motivational message</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                  <Input
                    placeholder="Write something nice..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                  <Button onClick={handleSendMessage}>Send Message</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-couple-primary text-white border-0 hover:bg-couple-primary hover:opacity-90"
              onClick={() => navigate("/add-habit")}
            >
              <Plus className="h-5 w-5" />
              <span className="sr-only">Add new habit</span>
            </Button>
          </div>
        </div>
        <p className="text-gray-500">
          {new Date(today).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </header>
      
      <MotivationalMessage />
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="personal" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>Personal</span>
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>Shared</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-2">
          {todayHabits.length > 0 ? (
            todayHabits.map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                onClick={() => navigate(`/habit/${habit.id}`)}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No habits for today</p>
              <Button 
                onClick={() => navigate("/add-habit")}
                className="bg-couple-primary hover:bg-couple-primary hover:opacity-90"
              >
                Add your first habit
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="personal" className="space-y-2">
          {personalHabits.length > 0 ? (
            personalHabits.map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                onClick={() => navigate(`/habit/${habit.id}`)}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No personal habits for today</p>
              <Button 
                onClick={() => navigate("/add-habit")}
                className="bg-couple-primary hover:bg-couple-primary hover:opacity-90"
              >
                Add personal habit
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="shared" className="space-y-2">
          {sharedHabits.length > 0 ? (
            sharedHabits.map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                onClick={() => navigate(`/habit/${habit.id}`)}
              />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No shared habits for today</p>
              <Button 
                onClick={() => navigate("/add-habit")}
                className="bg-couple-secondary hover:bg-couple-secondary hover:opacity-90"
              >
                Add shared habit
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Today;
