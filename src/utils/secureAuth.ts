import { supabase } from "@/integrations/supabase/client";
import { validateEmail, validatePassword, normalizeEmail, logSecurityEvent } from "./security";

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: any;
  session?: any;
}

export const secureSignUp = async (email: string, password: string): Promise<AuthResult> => {
  try {
    // Validate inputs locally first
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return { success: false, error: passwordValidation.error };
    }

    // Use enhanced auth security function
    const { data, error } = await supabase.functions.invoke('enhanced-auth-security', {
      body: {
        action: 'signup',
        email: normalizeEmail(email),
        password: password
      }
    });

    if (error) {
      logSecurityEvent('signup_function_error', { error: error.message });
      return { success: false, error: error.message };
    }

    if (data.error) {
      logSecurityEvent('signup_failed', { email: email.substring(0, 3) + '***' });
      return { success: false, error: data.error };
    }

    logSecurityEvent('signup_success', { email: email.substring(0, 3) + '***' });
    return { 
      success: true, 
      user: data.user, 
      session: data.session 
    };

  } catch (error: any) {
    logSecurityEvent('signup_exception', { error: error.message });
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const secureSignIn = async (email: string, password: string): Promise<AuthResult> => {
  try {
    // Validate inputs locally first
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: emailValidation.error };
    }

    if (!password) {
      return { success: false, error: 'Password is required' };
    }

    // Use enhanced auth security function
    const { data, error } = await supabase.functions.invoke('enhanced-auth-security', {
      body: {
        action: 'login',
        email: normalizeEmail(email),
        password: password
      }
    });

    if (error) {
      logSecurityEvent('login_function_error', { error: error.message });
      return { success: false, error: error.message };
    }

    if (data.error) {
      logSecurityEvent('login_failed', { email: email.substring(0, 3) + '***' });
      return { success: false, error: data.error };
    }

    logSecurityEvent('login_success', { email: email.substring(0, 3) + '***' });
    return { 
      success: true, 
      user: data.user, 
      session: data.session 
    };

  } catch (error: any) {
    logSecurityEvent('login_exception', { error: error.message });
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const secureEmailStorage = {
  async store(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('secure-email-storage', {
        body: {
          action: 'store',
          email,
          password
        }
      });

      if (error) {
        logSecurityEvent('email_storage_error', { error: error.message });
        return { success: false, error: error.message };
      }

      if (data.error) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (error: any) {
      logSecurityEvent('email_storage_exception', { error: error.message });
      return { success: false, error: 'Failed to store email credentials' };
    }
  },

  async retrieve(): Promise<{ success: boolean; email?: string; password?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('secure-email-storage', {
        body: {
          action: 'retrieve'
        }
      });

      if (error) {
        logSecurityEvent('email_retrieval_error', { error: error.message });
        return { success: false, error: error.message };
      }

      if (data.error) {
        return { success: false, error: data.error };
      }

      return { 
        success: true, 
        email: data.email, 
        password: data.password 
      };
    } catch (error: any) {
      logSecurityEvent('email_retrieval_exception', { error: error.message });
      return { success: false, error: 'Failed to retrieve email credentials' };
    }
  }
};