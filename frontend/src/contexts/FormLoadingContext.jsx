import React, { createContext, useContext } from 'react';

const FormLoadingContext = createContext(false);

export const FormLoadingProvider = ({ isLoading, children }) => (
  <FormLoadingContext.Provider value={isLoading}>
    {children}
  </FormLoadingContext.Provider>
);

export const useFormLoading = () => useContext(FormLoadingContext);
