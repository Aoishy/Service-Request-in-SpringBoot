import { create } from 'zustand';
import type { UserRole } from '../types';

interface RoleState {
  role: UserRole;
  operatorName: string;
  setRole: (role: UserRole) => void;
  setOperatorName: (name: string) => void;
}

export const useRoleStore = create<RoleState>((set) => ({
  role: 'supervisor',
  operatorName: 'Alex Mercer',
  setRole: (role) => set({ role }),
  setOperatorName: (operatorName) => set({ operatorName }),
}));
