import { useState, useEffect, useCallback, useRef } from 'react';
import { updateApplicationProgress } from '../admissionService';

export function useApplicationAutoSave({ appId, activeStep, basicDetails, uploadedDocs, profile, applicationStatus }) {
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const timeoutRef = useRef(null);
  
  // Track if this is the initial mount to prevent immediate auto-save on load
  const isInitialMount = useRef(true);

  // Use refs to hold the latest data so the debounce function has access to current state 
  // without needing to be re-created on every keystroke.
  const latestDataRef = useRef({ basicDetails, uploadedDocs, activeStep, profile, applicationStatus });

  useEffect(() => {
    latestDataRef.current = { basicDetails, uploadedDocs, activeStep, profile, applicationStatus };
  }, [basicDetails, uploadedDocs, activeStep, profile, applicationStatus]);

  const performAutoSave = useCallback(async () => {
    const currentData = latestDataRef.current;
    if (!appId || !currentData.profile?.id || !currentData.applicationStatus) {
      setAutoSaveStatus('idle');
      return;
    }
    
    // Do not auto-save if the application is in a terminal state
    // Note: 'rejected' is removed from this list so that auto-save works during an update request
    if (['pending_final_review', 'approved', 'enrolled'].includes(currentData.applicationStatus)) {
      setAutoSaveStatus('idle');
      return;
    }
    
    setAutoSaveStatus('saving');
    try {
      const payloadMetadata = {
        completed_stage: currentData.activeStep,
        uploaded_docs: currentData.uploadedDocs,
      };

      payloadMetadata.basic_details = {
        ...currentData.basicDetails,
        correspondenceAddress: currentData.basicDetails.sameAsPermanent ? currentData.basicDetails.permanentAddress : currentData.basicDetails.correspondenceAddress,
        fullName: currentData.basicDetails.fullName || currentData.profile?.full_name || '',
        email: currentData.basicDetails.email || currentData.profile?.email || '',
        phone: currentData.basicDetails.phone
      };

      // Maintain the current status so we don't accidentally advance the application
      const currentStatus = currentData.applicationStatus;

      await updateApplicationProgress(
        appId, 
        'AUTO_SAVE', 
        payloadMetadata, 
        currentData.profile.id, 
        currentData.activeStep, 
        currentStatus
      );
      setAutoSaveStatus('saved');
    } catch (err) {
      console.error('Auto-save failed:', err);
      setAutoSaveStatus('error');
    }
  }, [appId]);

  useEffect(() => {
    // Only auto-save if we have an appId (i.e., application exists)
    if (!appId) return;
    
    // Prevent auto-save on initial mount (when data is just loaded from server)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (['pending_final_review', 'approved', 'enrolled'].includes(applicationStatus)) {
      setAutoSaveStatus('idle');
      return;
    }

    // As soon as the user types, show the saving/waiting indicator
    // so it doesn't stay blank during the debounce period
    if (autoSaveStatus === 'saved' || autoSaveStatus === 'idle') {
      setAutoSaveStatus('saving');
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, 1500); // 1.5 seconds debounce

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // because we only want to trigger this effect when the actual data changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(basicDetails), JSON.stringify(uploadedDocs), appId]); 

  return { autoSaveStatus };
}

export const useAutoSave = useApplicationAutoSave;
export default useApplicationAutoSave;
