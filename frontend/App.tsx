import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { StoreProvider } from './StoreContext';
import { StudentView } from './components/StudentView';
import { AdminView } from './components/AdminView';
import { Mic2, Settings } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Mic2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">ChoirRecord</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${!isAdmin ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              Student Studio
            </Link>
            <Link
              to="/admin"
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isAdmin ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <Settings className="w-4 h-4" />
              Director Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navigation />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<StudentView />} />
              <Route path="/admin" element={<AdminView />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
              <p>ChoirRecord Pro &copy; {new Date().getFullYear()}</p>
              <p className="mt-1 text-xs text-slate-400">Local demo version. Data is not persisted across page reloads.</p>
            </div>
          </footer>
        </div>
      </HashRouter>
    </StoreProvider>
  );
};

export default App;
