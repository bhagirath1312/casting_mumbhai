'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    ageFrom: '',
    ageTo: '',
    ageExact: '',
    gender: '',
    location: '',
    mobile: '',
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Protect route
  useEffect(() => {
    if (status !== 'loading' && (!session || session.user.role !== 'admin')) {
      router.push('/');
    }
  }, [session, status, router]);

  // Fetch users
  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetch('/api/users')
        .then(res => res.json())
        .then(data => {
          const nonAdminUsers = data.filter(u => u.role !== 'admin');
          setUsers(nonAdminUsers);
          setFilteredUsers(nonAdminUsers);
          setIsLoadingUsers(false);
        });
    }
  }, [session]);

  // Filter users
  useEffect(() => {
    const searchLower = search.toLowerCase();
    const filtered = users.filter(user => {
      const matchSearch =
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower);

      let matchAge = true;
      const age = parseInt(user.age);
      if (filters.ageExact) {
        matchAge = age === parseInt(filters.ageExact);
      } else {
        if (filters.ageFrom && age < parseInt(filters.ageFrom)) matchAge = false;
        if (filters.ageTo && age > parseInt(filters.ageTo)) matchAge = false;
      }

      const matchGender = filters.gender ? user.gender === filters.gender : true;
      const matchLocation = filters.location
        ? user.location.toLowerCase().includes(filters.location.toLowerCase())
        : true;

      return matchSearch && matchAge && matchGender && matchLocation;
    });

    setFilteredUsers(filtered);
  }, [search, filters, users]);

  // CSV export
  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Age', 'Gender', 'Location'];
    const rows = filteredUsers.map(u => [u.name, u.email, u.mobile, u.age, u.gender, u.location]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'users.csv');
  };

  // PDF export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['Name', 'Email', 'Phone', 'Age', 'Gender', 'Location']],
      body: filteredUsers.map(u => [u.name, u.email, u.mobile, u.age, u.gender, u.location]),
    });
    doc.save('users.pdf');
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({
      ageFrom: '',
      ageTo: '',
      ageExact: '',
      gender: '',
      location: '',
      mobile: '',
    });
  };

  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  if (status === 'loading' || isLoadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4F0F9]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-t-4 border-purple-500 border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-xl font-semibold text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F0F9] text-gray-800 pt-5">
      {/* Header */}
      
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center ">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex space-x-2">
            <button 
              onClick={() => router.push('/admin/casting-status')}
              className="hidden md:block bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Casting Status
            </button>
            <button 
              onClick={toggleMobileFilters} 
              className="md:hidden bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg"
            >
              {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main search bar - always visible */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full p-3 pl-4 pr-10 rounded-lg bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <span className="absolute right-3 top-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
          </div>
        </div>

        {/* Filters - toggleable on mobile */}
        <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} md:block mb-6 bg-white rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="From Age"
                value={filters.ageFrom}
                onChange={e => setFilters({ ...filters, ageFrom: e.target.value, ageExact: '' })}
                className="p-2 rounded-lg w-1/2 bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <input
                type="number"
                placeholder="To Age"
                value={filters.ageTo}
                onChange={e => setFilters({ ...filters, ageTo: e.target.value, ageExact: '' })}
                className="p-2 rounded-lg w-1/2 bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <input
              type="number"
              placeholder="Exact Age"
              value={filters.ageExact}
              onChange={e => setFilters({ ...filters, ageExact: e.target.value, ageFrom: '', ageTo: '' })}
              className="p-2 rounded-lg w-full bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <select
              value={filters.gender}
              onChange={e => setFilters({ ...filters, gender: e.target.value })}
              className="p-2 rounded-lg w-full bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="text"
              placeholder="Filter by location"
              value={filters.location}
              onChange={e => setFilters({ ...filters, location: e.target.value })}
              className="p-2 rounded-lg w-full bg-gray-100 text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button 
            onClick={handleExportCSV} 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-1 shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>CSV</span>
          </button>
          <button 
            onClick={handleExportPDF} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-1 shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>PDF</span>
          </button>
          <button 
            onClick={() => router.push('/admin/casting-status')} 
            className="md:hidden bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Casting
          </button>
          <button 
            onClick={handleResetFilters} 
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-1 shadow-md hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset</span>
          </button>
        </div>

        {/* Users count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-8">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, idx) => (
                    <tr 
                      key={idx} 
                      className="hover:bg-purple-50 transition-colors duration-150"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{user.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{user.email}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{user.mobile}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{user.age}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{user.gender}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{user.location}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No users found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="text-center text-sm text-gray-600 py-4">
          Casting Nation • {new Date().getFullYear()} © All rights reserved
        </footer>
      </div>
    </div>
  );
}