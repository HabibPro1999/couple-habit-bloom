
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useHabitContext } from "@/contexts/HabitContext";
import { useAuth } from "@/contexts/AuthContext";

const MotivationalMessage: React.FC = () => {
  const { motivationalMessage, currentUser } = useHabitContext();
  const { user } = useAuth();
  
  // Only show messages that were sent by someone else (partner)
  // This is now enforced by RLS policy as well
  if (!motivationalMessage || motivationalMessage.senderId === user?.id) return null;
  
  return (
    <Card className="bg-couple-secondary/10 border-none mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <MessageSquare className="h-5 w-5 text-couple-secondary mt-1" />
          <div>
            <p className="text-gray-600 italic">{motivationalMessage.text}</p>
            <p className="text-sm text-gray-400 mt-1">From your partner</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MotivationalMessage;
