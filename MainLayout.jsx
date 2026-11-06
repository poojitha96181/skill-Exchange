import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';

export default function MainLayout({ admin = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="app-shell">
      <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
      <div className="app-body">
        <Sidebar admin={admin} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}