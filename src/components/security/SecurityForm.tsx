import { ReactNode, useState } from 'react';
import { TurnstileWidget } from './TurnstileWidget';
import { HoneypotField } from './HoneypotField';

interface SecurityFormProps {
  children: ReactNode;
  onSubmit: (data: FormData, securityData: SecurityData) => void | Promise<void>;
  turnstileEnabled?: boolean;
  className?: string;
}

interface SecurityData {
  turnstile_token?: string;
  honeypot: string;
}

const TURNSTILE_SITE_KEY = '0x4AAAAAABrQ3wFVHcRcM8W6';

export function SecurityForm({ 
  children, 
  onSubmit, 
  turnstileEnabled = true,
  className = '' 
}: SecurityFormProps) {
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
      const formData = new FormData(e.currentTarget);
      const securityData: SecurityData = {
        honeypot,
        ...(turnstileEnabled && { turnstile_token: turnstileToken })
      };

      await onSubmit(formData, securityData);
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
            sitekey={TURNSTILE_SITE_KEY}
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