/** UI Designer Agent tools — design tokens, component specs, accessibility checks. */

export function generateDesignTokens(theme: 'light' | 'dark'): Record<string, string> {
  const base = {
    '--color-primary': 'hsl(220, 70%, 50%)',
    '--color-secondary': 'hsl(260, 60%, 50%)',
    '--color-background': theme === 'light' ? 'hsl(0, 0%, 100%)' : 'hsl(220, 20%, 10%)',
    '--color-foreground': theme === 'light' ? 'hsl(220, 20%, 10%)' : 'hsl(0, 0%, 95%)',
    '--spacing-xs': '0.25rem',
    '--spacing-sm': '0.5rem',
    '--spacing-md': '1rem',
    '--spacing-lg': '1.5rem',
    '--spacing-xl': '2rem',
    '--radius-sm': '0.25rem',
    '--radius-md': '0.5rem',
    '--radius-lg': '1rem',
  };
  return base;
}

export function generateComponentSpec(componentName: string): string {
  return `Component: ${componentName}\nVariants: default, hover, active, disabled\nSpacing: --spacing-md`;
}
