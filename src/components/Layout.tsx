
import React from "react";
import BottomNav from "./BottomNav";
import NavBar from "./NavBar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen pb-16">
      <NavBar />
      <main>{children}</main>
      <BottomNav />
    </div>
  );
};

export default Layout;
