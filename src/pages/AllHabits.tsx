
import React from "react";
import { useHabitContext } from "@/contexts/HabitContext";
import HabitCard from "@/components/HabitCard";
import { Button } from "@/components/ui/button";
import { Plus, User, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

const AllHabits: React.FC = () => {
  const { getPersonalHabits, getSharedHabits } = useHabitContext();
  const navigate = useNavigate();
  
  const personalHabits = getPersonalHabits();
  const sharedHabits = getSharedHabits();

  return (
    <div className="container max-w-md mx-auto px-4 py-6 page-transition">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold">All Habits</h1>
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
        <p className="text-gray-500">Manage all your personal and shared habits</p>
      </header>
      
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="personal" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>Personal</span>
          </TabsTrigger>
          <TabsTrigger value="shared" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>Shared</span>
          </TabsTrigger>
        </TabsList>
        
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
              <p className="text-gray-500 mb-4">No personal habits yet</p>
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
              <p className="text-gray-500 mb-4">No shared habits yet</p>
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

export default AllHabits;
