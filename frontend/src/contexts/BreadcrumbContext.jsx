"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';

const BreadcrumbContext = createContext({
  breadcrumbs: [],
  setBreadcrumbs: () => {},
});

export const BreadcrumbProvider = ({ children }) => {
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  return (
    <BreadcrumbContext.Provider value={{ breadcrumbs, setBreadcrumbs }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbs = (initialBreadcrumbs = []) => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }

  const { breadcrumbs, setBreadcrumbs } = context;

  // Convenience hook to set breadcrumbs on mount and clear on unmount
  React.useEffect(() => {
    setBreadcrumbs(initialBreadcrumbs);
    return () => {
      setBreadcrumbs([]);
    };
    // We intentionally don't want to re-run this if setBreadcrumbs changes identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialBreadcrumbs)]);

  return { breadcrumbs, setBreadcrumbs };
};
