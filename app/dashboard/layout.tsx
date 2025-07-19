"use client";
import { useState } from "react";
import {
  IconLogout,
  IconMenu2,
} from "@tabler/icons-react";
import Sidebar from "./Sidebar";
import Link from "next/dist/client/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative min-h-screen md:flex">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
        ></div>
      )}

      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white drop-shadow p-4 flex items-center justify-between">
          <div className="flex items-center">
            <button className="text-gray-500 md:hidden" onClick={toggleSidebar}>
              <IconMenu2 className="w-6 h-6" />
            </button>
            <div className="relative ml-4 font-bold text-xl">
              Dashboard
            </div>
          </div>
          <Link href="/login" className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
            <div className="flex items-center space-x-2 text-red-500 hover:text-red-700">
              <span className="">Logout</span>
              <IconLogout className="w-6 h-6" />
            </div>
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
