import React from 'react';
import { ThemeProvider, useTheme } from './theme/ThemeContext';
import { Dashboard } from './pages/Dashboard';

function AppContent(): React.ReactElement {
  const { theme } = useTheme();

  return (
    <div
      style={{
        fontFamily: theme.typography.fontFamily,
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      <Dashboard />
    </div>
  );
}

export function App(): React.ReactElement {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
