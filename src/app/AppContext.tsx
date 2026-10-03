import { createContext, useContext } from 'react';
import type { useAppController } from './useAppController';

// useAppController'ın döndürdüğü her şey (durum + işleyiciler) bu tipten gelir.
export type AppController = ReturnType<typeof useAppController>;

export const AppContext = createContext<AppController | null>(null);

export function useApp(): AppController {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp, AppContext.Provider dışında kullanılamaz');
  return value;
}
