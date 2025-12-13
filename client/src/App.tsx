import { useState, useEffect } from 'react';

interface ApiResponse {
  message: string;
  version: string;
}

function App(): React.ReactElement {
  const [message, setMessage] = useState<string>('Loading...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/`);
        const data: ApiResponse = await response.json();
        setMessage(`${data.message} (v${data.version})`);
      } catch (err) {
        setError('Failed to connect to API');
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Full Stack Application</h1>
        <p>React + Vite Frontend with Node.js + Express Backend</p>
      </header>

      <main style={styles.main}>
        <section style={styles.section}>
          <h2>Welcome</h2>
          {error ? <p style={styles.error}>{error}</p> : <p style={styles.message}>{message}</p>}
        </section>

        <section style={styles.section}>
          <h2>Getting Started</h2>
          <ul style={styles.list}>
            <li>Frontend runs on port 3000</li>
            <li>Backend API runs on port 3001</li>
            <li>Edit source files and see changes instantly</li>
          </ul>
        </section>
      </main>

      <footer style={styles.footer}>
        <p>© 2024 Full Stack Monorepo</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#282c34',
    color: 'white',
    padding: '2rem',
    textAlign: 'center',
  },
  main: {
    flex: 1,
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  message: {
    fontSize: '1.1rem',
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  error: {
    fontSize: '1.1rem',
    color: '#f44336',
    fontWeight: 'bold',
  },
  list: {
    lineHeight: '1.8',
  },
  footer: {
    backgroundColor: '#282c34',
    color: 'white',
    padding: '1.5rem',
    textAlign: 'center',
  },
};

export default App;
