import React, { useState } from 'react';
import content from '../content.json';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

// Password field with a show/hide toggle. Always starts hidden and never
// persists its visibility state.
export const PasswordInput: React.FC<Props> = ({ className = '', ...props }) => {
  const [visible, setVisible] = useState(false);
  const label = visible ? content.common.hidePassword : content.common.showPassword;

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-brand-500 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={label}
        title={label}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-brand-600"
      >
        {visible ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" x2="22" y1="2" y2="22" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
};
