
import React, { createContext, useContext, useState, useEffect } from "react";

// Define habit types
export type HabitType = "personal" | "shared";
export type VisibilityType = "visible" | "secret";
export type CompletionRequirementType = "one" | "both";
export type RecurrenceType = "daily" | "specific-days";

export interface Habit {
  id: string;
  title: string;
  description?: string;
  type: HabitType;
  recurrence: RecurrenceType;
  recurrenceDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  visibility?: VisibilityType; // For personal habits
  completionRequirement?: CompletionRequirementType; // For shared habits
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  userId: string;
  date: string; // ISO format YYYY-MM-DD
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
  isPartner: boolean;
}

interface HabitContextType {
  habits: Habit[];
  completions: HabitCompletion[];
  currentUser: User;
  partner: User | null;
  // Habit operations
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "updatedAt">) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (habitId: string) => void;
  // Completion operations
  toggleHabitCompletion: (habitId: string, date: string) => void;
  getHabitCompletion: (habitId: string, date: string) => boolean;
  getPartnerHabitCompletion: (habitId: string, date: string) => boolean;
  // Filter operations
  getPersonalHabits: () => Habit[];
  getSharedHabits: () => Habit[];
  getVisiblePartnerHabits: () => Habit[];
  getHabitsForDate: (date: string) => Habit[];
}

// Create the context with an undefined default value
const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Mock data for initial development
const mockHabits: Habit[] = [
  {
    id: "1",
    title: "Morning Meditation",
    description: "10 minutes mindfulness practice",
    type: "personal",
    recurrence: "daily",
    visibility: "visible",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Drink Water",
    description: "At least 8 glasses",
    type: "personal",
    recurrence: "daily",
    visibility: "visible",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Evening Walk",
    description: "30 minutes together",
    type: "shared",
    recurrence: "daily",
    completionRequirement: "both",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Grocery Shopping",
    description: "Buy food for the week",
    type: "shared",
    recurrence: "specific-days",
    recurrenceDays: [0, 3], // Sunday and Wednesday
    completionRequirement: "one",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Journal Writing",
    description: "Private thoughts",
    type: "personal",
    recurrence: "daily",
    visibility: "secret",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockCompletions: HabitCompletion[] = [
  {
    id: "c1",
    habitId: "1",
    userId: "user1",
    date: new Date().toISOString().split("T")[0],
    completed: true,
  },
  {
    id: "c2",
    habitId: "3",
    userId: "user1",
    date: new Date().toISOString().split("T")[0],
    completed: true,
  },
  {
    id: "c3",
    habitId: "3",
    userId: "user2",
    date: new Date().toISOString().split("T")[0],
    completed: false,
  },
];

const mockCurrentUser: User = {
  id: "user1",
  name: "Alex",
  isPartner: false,
};

const mockPartner: User = {
  id: "user2",
  name: "Jordan",
  isPartner: true,
};

// Hook to use the habit context
export function useHabitContext() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error("useHabitContext must be used within a HabitProvider");
  }
  return context;
}

// Provider component
export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>(mockHabits);
  const [completions, setCompletions] = useState<HabitCompletion[]>(mockCompletions);
  const [currentUser] = useState<User>(mockCurrentUser);
  const [partner] = useState<User | null>(mockPartner);

  // Load data from local storage on mount
  useEffect(() => {
    const storedHabits = localStorage.getItem("habits");
    const storedCompletions = localStorage.getItem("completions");
    
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
    }
    
    if (storedCompletions) {
      setCompletions(JSON.parse(storedCompletions));
    }
  }, []);

  // Save data to local storage when it changes
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("completions", JSON.stringify(completions));
  }, [completions]);

  // Function to add a new habit
  const addHabit = (habitData: Omit<Habit, "id" | "createdAt" | "updatedAt">) => {
    const newHabit: Habit = {
      ...habitData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setHabits([...habits, newHabit]);
  };

  // Function to update an existing habit
  const updateHabit = (updatedHabit: Habit) => {
    setHabits(
      habits.map((habit) =>
        habit.id === updatedHabit.id
          ? { ...updatedHabit, updatedAt: new Date().toISOString() }
          : habit
      )
    );
  };

  // Function to delete a habit
  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter((habit) => habit.id !== habitId));
    setCompletions(completions.filter((completion) => completion.habitId !== habitId));
  };

  // Function to toggle habit completion
  const toggleHabitCompletion = (habitId: string, date: string) => {
    const existingCompletion = completions.find(
      (completion) =>
        completion.habitId === habitId &&
        completion.userId === currentUser.id &&
        completion.date === date
    );

    if (existingCompletion) {
      setCompletions(
        completions.map((completion) =>
          completion.id === existingCompletion.id
            ? { ...completion, completed: !completion.completed }
            : completion
        )
      );
    } else {
      setCompletions([
        ...completions,
        {
          id: Date.now().toString(),
          habitId,
          userId: currentUser.id,
          date,
          completed: true,
        },
      ]);
    }
  };

  // Function to get habit completion status
  const getHabitCompletion = (habitId: string, date: string): boolean => {
    const completion = completions.find(
      (c) => c.habitId === habitId && c.userId === currentUser.id && c.date === date
    );
    return completion ? completion.completed : false;
  };

  // Function to get partner's habit completion status
  const getPartnerHabitCompletion = (habitId: string, date: string): boolean => {
    if (!partner) return false;
    const completion = completions.find(
      (c) => c.habitId === habitId && c.userId === partner.id && c.date === date
    );
    return completion ? completion.completed : false;
  };

  // Function to get personal habits
  const getPersonalHabits = (): Habit[] => {
    return habits.filter((habit) => habit.type === "personal");
  };

  // Function to get shared habits
  const getSharedHabits = (): Habit[] => {
    return habits.filter((habit) => habit.type === "shared");
  };

  // Function to get visible partner habits
  const getVisiblePartnerHabits = (): Habit[] => {
    return habits.filter(
      (habit) => habit.type === "personal" && habit.visibility === "visible"
    );
  };

  // Function to get habits due for a specific date
  const getHabitsForDate = (date: string): Habit[] => {
    const dayOfWeek = new Date(date).getDay();
    
    return habits.filter((habit) => {
      if (habit.recurrence === "daily") {
        return true;
      } else if (habit.recurrence === "specific-days" && habit.recurrenceDays) {
        return habit.recurrenceDays.includes(dayOfWeek);
      }
      return false;
    });
  };

  // Value object that will be passed to consumers
  const value = {
    habits,
    completions,
    currentUser,
    partner,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    getHabitCompletion,
    getPartnerHabitCompletion,
    getPersonalHabits,
    getSharedHabits,
    getVisiblePartnerHabits,
    getHabitsForDate,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}
