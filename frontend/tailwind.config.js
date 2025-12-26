/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background colors - Premium White Palette
        'app-bg': '#F8FAFC',
        'surface': '#FFFFFF',

        // Border colors
        'border-subtle': 'rgba(0, 0, 0, 0.06)',

        // Text colors
        'text-primary': '#0F172A',
        'text-secondary': '#475569',
        'text-muted': '#94A3B8',

        // Accent colors - Premium Indigo
        'accent': {
          DEFAULT: '#6366F1',
          dark: '#4F46E5',
          light: '#A5B4FC',
          glow: 'rgba(99, 102, 241, 0.4)',
        },

        // Status colors
        'success': '#10B981',
        'warning': '#F59E0B',
        'danger': '#EF4444',
      },

      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },

      fontSize: {
        'xs': ['12px', { lineHeight: '1.5' }],
        'sm': ['14px', { lineHeight: '1.6' }],
        'base': ['15px', { lineHeight: '1.6' }],
        'lg': ['18px', { lineHeight: '1.5' }],
        'xl': ['20px', { lineHeight: '1.5' }],
        '2xl': ['24px', { lineHeight: '1.3' }],
        '3xl': ['30px', { lineHeight: '1.2' }],
        '4xl': ['36px', { lineHeight: '1.2' }],
        '5xl': ['48px', { lineHeight: '1.1' }],
        '6xl': ['60px', { lineHeight: '1.0' }],
      },

      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.01em',
        'wide': '0.05em',
      },

      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '64': '64px',
        '96': '96px',
        '120': '120px',
      },

      borderRadius: {
        'sm': '8px',
        'DEFAULT': '10px',
        'md': '10px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '20px',
        'full': '9999px',
      },

      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.04)',
        'md': '0 4px 6px rgba(0, 0, 0, 0.04), 0 2px 4px rgba(0, 0, 0, 0.02)',
        'lg': '0 10px 20px rgba(0, 0, 0, 0.06), 0 4px 8px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px rgba(0, 0, 0, 0.02), 0 10px 20px rgba(0, 0, 0, 0.04)',
        'elevated': '0 8px 16px rgba(0, 0, 0, 0.04), 0 16px 32px rgba(0, 0, 0, 0.06)',
        'modal': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.3)',
        'button-primary': '0 4px 14px rgba(99, 102, 241, 0.35)',
        'button-primary-hover': '0 6px 20px rgba(99, 102, 241, 0.5)',
      },

      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '10px',
        'lg': '20px',
      },

      transitionDuration: {
        'DEFAULT': '200ms',
      },

      transitionTimingFunction: {
        'DEFAULT': 'ease',
      },

      maxWidth: {
        'container': '1280px',
      },

      animation: {
        'fade-in': 'fadeIn 200ms ease-in',
        'fade-in-up': 'fadeInUp 500ms ease forwards',
        'slide-up': 'slideUp 200ms ease-out',
        'slide-in': 'slideIn 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'pulse': 'pulse 2s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}
