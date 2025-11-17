import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SystemParams {
  loginSystemName: string;
  menuSystemName: string;
  version: string;
}

interface State {
  params: SystemParams;
}

interface Actions {
  setParams: (p: Partial<SystemParams>) => void;
}

const defaults: SystemParams = {
  loginSystemName: '智惠实验室系统',
  menuSystemName: '智惠实验室系统',
  version: 'v0.0.1'
};

export const useSystemStore = create<State & Actions>()(
  persist(
    (set) => ({
      params: defaults,
      setParams: (p) => set((s) => ({ params: { ...s.params, ...p } }))
    }),
    { name: 'system-params-store' }
  )
);

