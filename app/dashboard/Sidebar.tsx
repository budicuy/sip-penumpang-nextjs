'use client';
import {
  IconX,
  IconHome,
  IconFileText,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react"; // 

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isSidebarOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession(); // 2. Gunakan useSession untuk mendapatkan data user

  const handleLinkClick = () => {
    if (isSidebarOpen) {
      toggleSidebar();
    }
  };

  const linkClass = (path: string) => {
    return `flex items-center p-4 rounded transition-colors ${pathname === path
      ? 'bg-white text-blue-800'
      : 'hover:bg-blue-100 hover:text-blue-800'
      }`;
  };

  return (
    <aside
      className={`bg-gradient-to-br from-blue-800 to-blue-400 text-white w-64 min-h-screen p-4 transform transition-transform md:translate-x-0 fixed md:relative z-30 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{
          // jika role user adalah ADMIN, tampilkan "Admin", jika MANAGER tampilkan "Manager", Jika USER tampilkan "User"
          session?.user?.role === 'USER' ? 'User' :
            session?.user?.role === 'MANAGER' ? 'Manager' :
              session?.user?.role === 'ADMIN' ? 'Admin' : 'Manager'
        }</h1>
        <button className="md:hidden" onClick={toggleSidebar}>
          <IconX className="w-6 h-6" />
        </button>
      </div>
      <nav className="mt-8">
        <ul>
          <li className="mb-4">
            <Link href="/dashboard" onClick={handleLinkClick} className={linkClass("/dashboard")}>
              <IconHome className="w-6 h-6 mr-2" />
              Dashboard
            </Link>
          </li>
          <li className="mb-2">
            <span className="text-white/90 text-sm">Kelola</span>
          </li>
          <li className="mb-4">
            <Link href="/dashboard/penumpang" onClick={handleLinkClick} className={linkClass("/dashboard/penumpang")}>
              <div className="flex items-center">
                <IconFileText className="w-6 h-6 mr-2" />
                <span>Data Penumpang</span>
              </div>
            </Link>
          </li>
          {session?.user?.role === 'ADMIN' && (
            <li className="mb-4">
              <Link href="/dashboard/users" onClick={handleLinkClick} className={linkClass("/dashboard/users")}>
                <div className="flex items-center">
                  <IconUsers className="w-6 h-6 mr-2" />
                  <span>Data Pengguna</span>
                </div>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
}
