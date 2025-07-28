'use client'
import { useState, useEffect, FormEvent, useCallback, useRef } from 'react';
import { IconPlus, IconEdit, IconTrash, IconX, IconUsers, IconSearch, IconDotsVertical, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

// Custom hook for debouncing
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserFormData {
  name: string;
  email: string;
  role: string;
  password?: string;
}

const MobileActions = ({ user, onEdit, onDelete }: {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (id: string, name: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
      >
        <IconDotsVertical className="w-5 h-5" />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <ul className="py-1">
            <li>
              <button
                onClick={() => {
                  onEdit(user);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <IconEdit className="w-4 h-4 mr-3" />
                Edit
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  onDelete(user.id, user.name);
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <IconTrash className="w-4 h-4 mr-3" />
                Hapus
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

const UserModal = ({ isOpen, onClose, onSubmit, user, isSubmitting }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  user: User | null;
  isSubmitting: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {user ? 'Edit Pengguna' : 'Tambah Pengguna'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            disabled={isSubmitting}
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={user?.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue={user?.email}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password {user && <span className="text-gray-500 text-xs">(kosongkan jika tidak ingin mengubah)</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="role"
              name="role"
              defaultValue={user?.role || 'USER'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
              disabled={isSubmitting}
            >
              <option value="USER">User</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-w-[80px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button onClick={handlePrevious} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
          Previous
        </button>
        <button onClick={handleNext} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Halaman <span className="font-medium">{currentPage}</span> dari <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              <IconChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              <IconChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default function UsersPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users?page=${page}&limit=10&search=${search}`);
      if (!response.ok) throw new Error('Gagal memuat pengguna');
      const data = await response.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers(currentPage, debouncedSearchTerm);
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, fetchUsers, status]);

  const handleModalOpen = (user: User | null = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const rawData = Object.fromEntries(formData.entries());

    const data: UserFormData = {
      name: rawData.name as string,
      email: rawData.email as string,
      role: rawData.role as string,
    };

    if (rawData.password) {
      data.password = rawData.password as string;
    }

    const promise = fetch(selectedUser ? `/api/users/${selectedUser.id}` : '/api/users', {
      method: selectedUser ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Gagal menyimpan pengguna');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Menyimpan pengguna...',
      success: (res) => {
        fetchUsers(selectedUser ? currentPage : 1, '');
        if (!selectedUser) setSearchTerm('');
        handleModalClose();
        return selectedUser ? 'Pengguna berhasil diperbarui' : 'Pengguna berhasil ditambahkan';
      },
      error: (err) => err.message || 'Terjadi kesalahan',
    }).finally(() => setIsSubmitting(false));
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}"?`)) {
      const promise = fetch(`/api/users/${id}`, { method: 'DELETE' }).then(async (res) => {
        if (!res.ok) {
          throw new Error('Gagal menghapus pengguna');
        }
      });

      toast.promise(promise, {
        loading: 'Menghapus pengguna...',
        success: () => {
          fetchUsers(currentPage, debouncedSearchTerm);
          return 'Pengguna berhasil dihapus';
        },
        error: 'Gagal menghapus pengguna',
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'MANAGER': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  const canPerformActions = session?.user?.role === 'ADMIN';

  const renderLoading = () => (
    <div className="text-center py-12">
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Memuat data...</span>
      </div>
    </div>
  );

  const renderEmpty = () => (
    <div className="text-center py-12">
      <div className="text-gray-500">
        {searchTerm ? 'Tidak ada pengguna yang sesuai dengan pencarian' : 'Tidak ada data pengguna'}
      </div>
    </div>
  );

  return (
    <div className="mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
          <IconUsers className="w-7 h-7 mr-3 text-blue-600" />
          Manajemen Pengguna
        </h1>
        {canPerformActions && (
          <button
            onClick={() => handleModalOpen()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            <IconPlus className="w-4 h-4 mr-2" />
            Tambah Pengguna
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <IconSearch className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, email, atau role..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                {canPerformActions && <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={canPerformActions ? 4 : 3} className="py-12">{renderLoading()}</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={canPerformActions ? 4 : 3} className="py-12">{renderEmpty()}</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    {canPerformActions && (
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleModalOpen(user)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit pengguna"
                          >
                            <IconEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus pengguna"
                          >
                            <IconTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          {isLoading ? renderLoading() : users.length === 0 ? renderEmpty() : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div>
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                    {canPerformActions && (
                      <MobileActions
                        user={user}
                        onEdit={handleModalOpen}
                        onDelete={handleDelete}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        user={selectedUser}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
