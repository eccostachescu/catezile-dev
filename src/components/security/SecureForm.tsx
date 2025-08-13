import { ReactNode, useState } from 'react';
import { TurnstileWidget } from './TurnstileWidget';
import { HoneypotField } from './HoneypotField';

interface SecureFormProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>, securityData: SecurityData) => void | Promise<void>;
  turnstileEnabled?: boolean;
  className?: string;
  sitekey?: string;
}

export interface SecurityData {
  turnstile_token?: string;
  honeypot: string;
}

// Default Turnstile site key
const DEFAULT_TURNSTILE_SITE_KEY = '0x4AAAAAABrQ3wFVHcRcM8W6';

export function SecureForm({ 
  children, 
  onSubmit, 
  turnstileEnabled = false,
  className = '',
  sitekey = DEFAULT_TURNSTILE_SITE_KEY
}: SecureFormProps) {
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Check honeypot
    if (honeypot) {
      console.warn('Honeypot triggered, blocking submission');
      return;
    }

    // Check Turnstile if enabled
    if (turnstileEnabled && !turnstileToken) {
      alert('Please complete the security verification');
      return;
    }

    setIsSubmitting(true);

    try {
      const securityData: SecurityData = {
        honeypot,
        ...(turnstileEnabled && { turnstile_token: turnstileToken })
      };

      await onSubmit(e, securityData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <HoneypotField 
        value={honeypot}
        onChange={setHoneypot}
      />
      
      {children}
      
      {turnstileEnabled && (
        <div className="mb-4">
          <TurnstileWidget
            sitekey={sitekey}
            onVerify={setTurnstileToken}
            onError={() => setTurnstileToken('')}
            onExpire={() => setTurnstileToken('')}
            theme="auto"
          />
        </div>
      )}
    </form>
  );
}