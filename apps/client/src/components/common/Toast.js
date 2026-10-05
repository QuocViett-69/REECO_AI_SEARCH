import React from 'react';
import { Check, Info, WarningCircle } from '@phosphor-icons/react';

export function ToastContainer({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" id="toastContainer" role="status" aria-live="polite">
      {toasts.map((toast) => {
        let Icon = Info;
        if (toast.type === 'success') Icon = Check;
        if (toast.type === 'error') Icon = WarningCircle;

        return (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-icon">
              <Icon size={18} />
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-desc">{toast.desc}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
