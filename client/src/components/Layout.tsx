import React from 'react';
import { useRoleStore } from '../store/roleStore';
import { useSocket } from '../hooks/useSocket';
import { LiveIndicator } from './LiveIndicator';
import {
  ShieldCheck,
  UserCheck,
  Activity,
  Cpu,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { role, setRole } = useRoleStore();
  const { isConnected } = useSocket();

  return (
    <div className="min-h-screen bg-[#0b0c16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#101221]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between">

        {/* Brand */}
        <div className="flex items-center gap-3">

          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Cpu className="w-5 h-5 text-white" />
          </div>

          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              ServiceDesk

              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Real-Time Core
              </span>
            </h1>

            <p className="text-[11px] text-slate-400 hidden sm:block">
              Worker Pool Concurrency & WebSocket Dispatcher
            </p>
          </div>
        </div>

        {/* Middle Status */}
        <div className="hidden md:flex items-center gap-4">
          <LiveIndicator isConnected={isConnected} />
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-3">

          <div className="bg-[#181a30] p-1 rounded-xl border border-slate-700/80 flex items-center gap-1 shadow-inner">

            <button
              onClick={() => setRole('operator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'operator'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Operator
            </button>

            <button
              onClick={() => setRole('supervisor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                role === 'supervisor'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Supervisor
            </button>

          </div>
        </div>

      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 bg-[#0c0d18]">

        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2">

          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />

            <span>
              Spring Boot Worker Pool Concurrency System
            </span>
          </div>

          <div className="font-mono text-[11px] text-slate-500">
            Real-time events: WebSocket • DB: PostgreSQL
          </div>

        </div>

      </footer>

    </div>
  );
};