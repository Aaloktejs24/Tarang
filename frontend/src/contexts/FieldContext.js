import React from 'react';
export const FieldContext = React.createContext({ 
    isFieldDisabled: () => false, 
    fieldComments: {},
    isRejected: false
});
