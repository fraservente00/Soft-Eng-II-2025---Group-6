import React, { createContext, useState } from 'react';

export const RoleContext = createContext(undefined);

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(null); // 'customer' | 'officer' | null

  const setRoleValue = (r) => setRole(r);
  const clearRole = () => setRole(null);

  return (
    <RoleContext.Provider value={{ role, setRole: setRoleValue, clearRole }}>
      {children}
    </RoleContext.Provider>
  );
};