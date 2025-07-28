"use client";
import { useState } from "react";
import {
  IconLogout,
  IconMenu2,
} from "@tabler/icons-react";
import Sidebar from "./Sidebar";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const logout = async () => {
    try {
      const response = await axios.get('/api/auth/logout');
      // jika sukses, redirect ke halaman login
      if (response.data.success) {
        window.location.href = '/login';
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
      } else {
        console.log('An unknown error occurred');
      }
    }
  }

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
          <button onClick={logout} className="flex items-center space-x-2 text-red-500 hover:text-red-700">
            <span className="">Logout</span>
            <IconLogout className="w-6 h-6" />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-5 ">
          {children}
        </main>
      </div>
    </div>
  );
}