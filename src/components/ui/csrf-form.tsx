'use client';

import { useCSRFToken } from '@/lib/csrf-protection';
import { FormHTMLAttributes, ReactNode } from 'react';

interface CSRFProtectedFormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: ReactNode;
  onSubmit?: (formData: FormData) => void | Promise<void>;
}

/**
 * Form component with built-in CSRF protection
 * Automatically adds CSRF token to form submissions
 */
export function CSRFProtectedForm({ children, onSubmit, ...props }: CSRFProtectedFormProps) {
  const { addToFormData, getToken } = useCSRFToken();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!onSubmit) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    
    // Add CSRF token to form data
    const protectedFormData = addToFormData(formData);
    
    // Check if CSRF token was added
    const token = getToken();
    if (!token) {
      console.warn('CSRF token not found. Please refresh the page.');
      return;
    }

    try {
      await onSubmit(protectedFormData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form {...props} onSubmit={handleSubmit}>
      {children}
    </form>
  );
}

/**
 * Hidden input component for CSRF token in regular forms
 */
export function CSRFTokenInput() {
  const { getToken } = useCSRFToken();
  const token = getToken();

  if (!token) {
    return null;
  }

  return <input type="hidden" name="_csrf_token" value={token} />;
}