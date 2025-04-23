import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useHabitContext, Habit, HabitType, RecurrenceType, VisibilityType, CompletionRequirementType } from "@/contexts/HabitContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const HabitForm: React.FC = () => {
  const { habitId } = useParams<{ habitId: string }>();
  const navigate = useNavigate();
  const { habits, addHabit, updateHabit, deleteHabit } = useHabitContext();
  const { user } = useAuth();
  
  // Default values for a new habit
  const defaultHabit: Omit<Habit, "id" | "createdAt" | "updatedAt"> = {
    title: "",
    description: "",
    type: "personal",
    recurrence: "daily",
    recurrenceDays: [1, 2, 3, 4, 5], // Monday to Friday
    visibility: "visible",
    completionRequirement: "one",
    user_id: user?.id || "", // Add the user_id property with a default value
  };
  
  const [formData, setFormData] = useState(defaultHabit);
  const [isEditing, setIsEditing] = useState(false);
  
  // Load habit data if editing existing habit
  useEffect(() => {
    if (habitId) {
      const habit = habits.find(h => h.id === habitId);
      if (habit) {
        setFormData(habit);
        setIsEditing(true);
      } else {
        navigate("/");
      }
    }
  }, [habitId, habits, navigate]);

  // Update user_id when user changes
  useEffect(() => {
    if (user && !isEditing) {
      setFormData(prev => ({ ...prev, user_id: user.id }));
    }
  }, [user, isEditing]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTypeChange = (type: HabitType) => {
    setFormData(prev => ({ 
      ...prev, 
      type,
      // Reset type-specific fields
      ...(type === "personal" 
        ? { visibility: "visible", completionRequirement: undefined } 
        : { visibility: undefined, completionRequirement: "one" })
    }));
  };
  
  const handleRecurrenceChange = (recurrence: RecurrenceType) => {
    setFormData(prev => ({ ...prev, recurrence }));
  };
  
  const handleVisibilityChange = (checked: boolean) => {
    setFormData(prev => ({ 
      ...prev, 
      visibility: checked ? "visible" : "secret" 
    }));
  };
  
  const handleCompletionRequirementChange = (value: CompletionRequirementType) => {
    setFormData(prev => ({ 
      ...prev, 
      completionRequirement: value 
    }));
  };
  
  const handleRecurrenceDaysChange = (values: string[]) => {
    const daysArray = values.map(v => parseInt(v, 10));
    setFormData(prev => ({ ...prev, recurrenceDays: daysArray }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a habit title");
      return;
    }
    
    try {
      if (isEditing && habitId) {
        updateHabit({ ...formData, id: habitId } as Habit);
        toast.success("Habit updated successfully");
      } else {
        addHabit(formData);
        toast.success("Habit created successfully");
      }
      navigate("/");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    }
  };
  
  const handleDelete = () => {
    if (habitId && window.confirm("Are you sure you want to delete this habit?")) {
      deleteHabit(habitId);
      toast.success("Habit deleted successfully");
      navigate("/");
    }
  };
  
  return (
    <div className="container max-w-md mx-auto px-4 py-6 page-transition">
      <header className="mb-6">
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Habit" : "Create New Habit"}
          </h1>
        </div>
      </header>
      
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type">Habit Type</Label>
              <RadioGroup 
                defaultValue={formData.type} 
                value={formData.type}
                onValueChange={(value) => handleTypeChange(value as HabitType)}
                className="flex space-x-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal" className="cursor-pointer">Personal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="shared" id="shared" />
                  <Label htmlFor="shared" className="cursor-pointer">Shared</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Morning Meditation"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                placeholder="e.g., 10 minutes mindfulness practice"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recurrence">Recurrence</Label>
              <RadioGroup 
                defaultValue={formData.recurrence} 
                value={formData.recurrence}
                onValueChange={(value) => handleRecurrenceChange(value as RecurrenceType)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="cursor-pointer">Every Day</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific-days" id="specific-days" />
                  <Label htmlFor="specific-days" className="cursor-pointer">Specific Days</Label>
                </div>
              </RadioGroup>
              
              {formData.recurrence === "specific-days" && (
                <div className="mt-2">
                  <Label className="mb-2 block">Select Days</Label>
                  <ToggleGroup 
                    type="multiple" 
                    className="justify-between"
                    value={formData.recurrenceDays?.map(d => d.toString()) || []}
                    onValueChange={handleRecurrenceDaysChange}
                  >
                    <ToggleGroupItem value="0" aria-label="Sunday">S</ToggleGroupItem>
                    <ToggleGroupItem value="1" aria-label="Monday">M</ToggleGroupItem>
                    <ToggleGroupItem value="2" aria-label="Tuesday">T</ToggleGroupItem>
                    <ToggleGroupItem value="3" aria-label="Wednesday">W</ToggleGroupItem>
                    <ToggleGroupItem value="4" aria-label="Thursday">T</ToggleGroupItem>
                    <ToggleGroupItem value="5" aria-label="Friday">F</ToggleGroupItem>
                    <ToggleGroupItem value="6" aria-label="Saturday">S</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              )}
            </div>
            
            {formData.type === "personal" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="visibility">Visible to Partner</Label>
                  <Switch 
                    id="visibility"
                    checked={formData.visibility === "visible"}
                    onCheckedChange={handleVisibilityChange}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {formData.visibility === "visible" 
                    ? "Your partner will be able to see this habit" 
                    : "Only you will be able to see this habit"}
                </p>
              </div>
            )}
            
            {formData.type === "shared" && (
              <div className="space-y-2">
                <Label htmlFor="completionRequirement">Completion Requirement</Label>
                <RadioGroup 
                  defaultValue={formData.completionRequirement} 
                  value={formData.completionRequirement}
                  onValueChange={(value) => handleCompletionRequirementChange(value as CompletionRequirementType)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="one" id="one" />
                    <Label htmlFor="one" className="cursor-pointer">
                      One Person (either you or your partner)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both" className="cursor-pointer">
                      Both People (both you and your partner)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            <div className="pt-4 flex justify-between">
              {isEditing ? (
                <>
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                  <Button 
                    type="submit"
                    className={formData.type === "personal" 
                      ? "bg-couple-primary hover:bg-couple-primary hover:opacity-90" 
                      : "bg-couple-secondary hover:bg-couple-secondary hover:opacity-90"}
                  >
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className={formData.type === "personal" 
                      ? "bg-couple-primary hover:bg-couple-primary hover:opacity-90" 
                      : "bg-couple-secondary hover:bg-couple-secondary hover:opacity-90"}
                  >
                    Create Habit
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitForm;
