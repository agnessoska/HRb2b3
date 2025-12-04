// PDF Color Palette (mapped from Tailwind/index.css)
export const colors = {
  background: '#FAFAFA', // Zinc-50
  foreground: '#09090B', // Zinc-950
  
  primary: '#8B5CF6',    // Violet-600
  secondary: '#FAE8FF',  // Fuchsia-100
  
  success: '#10B981',    // Emerald-500
  successLight: '#ECFDF5', // Emerald-50
  
  warning: '#FBBF24',    // Amber-400
  warningLight: '#FFFBEB', // Amber-50
  
  destructive: '#F43F5E', // Rose-500
  destructiveLight: '#FFF1F2', // Rose-50
  
  info: '#0EA5E9',       // Sky-500
  
  muted: '#F4F4F5',      // Zinc-100
  mutedForeground: '#71717A', // Zinc-500
  
  border: '#E4E4E7',     // Zinc-200
  
  // Specific for PDF elements
  cardBackground: '#FFFFFF',
  textPrimary: '#09090B',
  textSecondary: '#71717A',
};

// Common Layout Spacing
export const spacing = {
  pagePadding: 24,
  cardPadding: 16,
  gap: 12,
  borderRadius: 8, // Simplified from 1rem (16px) for PDF
};
