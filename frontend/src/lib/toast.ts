import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
        padding: '12px',
        borderRadius: '8px',
      },
      icon: '✅',
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: '#fff',
        padding: '12px',
        borderRadius: '8px',
      },
      icon: '❌',
    });
  },

  warning: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#f59e0b',
        color: '#fff',
        padding: '12px',
        borderRadius: '8px',
      },
      icon: '⚠️',
    });
  },

  info: (message: string) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: '#3b82f6',
        color: '#fff',
        padding: '12px',
        borderRadius: '8px',
      },
      icon: 'ℹ️',
    });
  },

  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages, {
      style: {
        padding: '12px',
        borderRadius: '8px',
      },
    });
  },
};
