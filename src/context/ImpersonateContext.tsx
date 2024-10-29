import React, { createContext, useContext, useState } from 'react';

const ImpersonateContext = createContext(null);

interface ImpersonationData {
  name: string;
}
export const ImpersonationContext = createContext<{
  impersonationData: ImpersonationData | null;
  setImpersonationData: React.Dispatch<React.SetStateAction<ImpersonationData | null>>;
} | null>(null);

export const useImpersonate = () => {
  const context = useContext(ImpersonationContext);
  if (!context) {
    throw new Error('useImpersonation must be used within an ImpersonationProvider');
  }
  return context;
};

export const ImpersonationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [impersonationData, setImpersonationData] = useState<ImpersonationData | null>(null);

  return (
    <ImpersonationContext.Provider value={{ impersonationData, setImpersonationData }}>
      //{children}  {/* Renders child components within this provider */}
    </ImpersonationContext.Provider>
  );
};
//export const useImpersonate = () => useContext(ImpersonateContext);
