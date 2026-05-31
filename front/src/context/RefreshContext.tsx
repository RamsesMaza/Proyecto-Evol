import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface RefreshContextType {
  refreshKey: number;
  notifyRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const RefreshProvider = ({ children }: { children: ReactNode }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const notifyRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
  }, []);

  return (
    <RefreshContext.Provider value={{ refreshKey, notifyRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) throw new Error('useRefresh must be used within RefreshProvider');
  return context;
};
