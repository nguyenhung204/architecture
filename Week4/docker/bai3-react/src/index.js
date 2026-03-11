import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Hello, Docker React!</h1>
      <p>React app running inside a Docker container.</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
