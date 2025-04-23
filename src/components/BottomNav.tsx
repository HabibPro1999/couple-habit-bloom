
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, List, User, Calendar } from "lucide-react";

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-10">
      <div className="container max-w-md mx-auto px-4">
        <div className="flex justify-around">
          <button
            className={`flex flex-col items-center py-3 px-5 ${
              isActive("/") ? "text-couple-primary" : "text-gray-500"
            }`}
            onClick={() => navigate("/")}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Today</span>
          </button>
          
          <button
            className={`flex flex-col items-center py-3 px-5 ${
              isActive("/all-habits") ? "text-couple-primary" : "text-gray-500"
            }`}
            onClick={() => navigate("/all-habits")}
          >
            <List className="h-6 w-6" />
            <span className="text-xs mt-1">All Habits</span>
          </button>
          
          <button
            className={`flex flex-col items-center py-3 px-5 ${
              isActive("/partner-habits") ? "text-couple-primary" : "text-gray-500"
            }`}
            onClick={() => navigate("/partner-habits")}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Partner</span>
          </button>
          
          <button
            className={`flex flex-col items-center py-3 px-5 ${
              isActive("/calendar") ? "text-couple-primary" : "text-gray-500"
            }`}
            onClick={() => navigate("/calendar")}
          >
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Calendar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
