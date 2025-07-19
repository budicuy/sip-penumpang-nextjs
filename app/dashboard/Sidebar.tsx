"use client";
import {
  IconX,
  IconHome,
  IconFileText,
} from "@tabler/icons-react";
import Link from "next/link";

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
  return (
    <aside
      className={`bg-blue-800 text-white w-64 min-h-screen p-4 transform transition-transform md:translate-x-0 fixed md:relative z-30 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin</h1>
        <button className="md:hidden" onClick={toggleSidebar}>
          <IconX className="w-6 h-6" />
        </button>
      </div>
      <nav className="mt-8">
        <ul>
          <li className="mb-4">
            <Link href="/dashboard" className="flex items-center p-4 rounded bg-blue-700">
              <IconHome className="w-6 h-6 mr-2" />
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <span className="text-white/90 text-sm">Kelola</span>
          </li>
          <li className="mb-4">
            <Link href="/dashboard/penumpang" className="flex items-center justify-between p-4 rounded hover:bg-blue-700">
              <div className="flex items-center">
                <IconFileText className="w-6 h-6 mr-2" />
                <span>Data Penumpang</span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
