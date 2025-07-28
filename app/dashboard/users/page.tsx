'use client';

import { useState, useEffect, FormEvent, useCallback } from 'react';
import { IconPlus, IconEdit, IconTrash, IconX, IconUsers, IconSearch } from '@tabler/icons-react';

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

import { useAuth } from '../../hooks/useAuth';

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

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Gagal memuat pengguna');
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleModalOpen = (user: User | null = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setError(null);
  };

  const handleModalClose = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

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

    try {
      const url = selectedUser ? `/api/users/${selectedUser.id}` : '/api/users';
      const method = selectedUser ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menyimpan pengguna');
      }

      await fetchUsers();
      setSuccess(selectedUser ? 'Pengguna berhasil diperbarui' : 'Pengguna berhasil ditambahkan');
      handleModalClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${name}"?`)) {
      setError(null);
      try {
        const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Gagal menghapus pengguna');
        await fetchUsers();
        setSuccess('Pengguna berhasil dihapus');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800';
      case 'MANAGER': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 flex items-center">
          <IconUsers className="w-7 h-7 mr-3 text-blue-600" />
          Manajemen Pengguna
        </h1>
        <button
          onClick={() => handleModalOpen()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
        >
          <IconPlus className="w-4 h-4 mr-2" />
          Tambah Pengguna
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
          <div className="flex-1">{error}</div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 ml-2">
            <IconX className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center">
          <div className="flex-1">{success}</div>
          <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700 ml-2">
            <IconX className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <IconSearch className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-500">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="text-gray-500">
                      {searchTerm ? 'Tidak ada pengguna yang sesuai dengan pencarian' : 'Tidak ada data pengguna'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {currentUser?.role === 'ADMIN' ? (
                          <>
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
                          </>
                        ) : (
                          <>
                            <button
                              className="p-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                              title="Edit pengguna dinonaktifkan"
                              disabled
                            >
                              <IconEdit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                              title="Hapus pengguna dinonaktifkan"
                              disabled
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
