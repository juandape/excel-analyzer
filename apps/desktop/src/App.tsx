import { useEffect, useState } from 'react';
import {
  MemoryRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { Setup } from '@/pages/Setup';
import { Home } from '@/pages/Home';
import { Analysis } from '@/pages/Analysis';
import { Results } from '@/pages/Results';

function SetupWrapper() {
  const navigate = useNavigate();
  return <Setup onConfigSaved={() => navigate('/home', { replace: true })} />;
}

export default function App() {
  const [hasConfig, setHasConfig] = useState<boolean | null>(null);

  useEffect(() => {
    window.electron
      .getConfig()
      .then((cfg) => {
        setHasConfig(cfg !== null);
      })
      .catch(() => {
        // Si keytar falla (permisos, keychain bloqueado, etc.), tratar como sin configuración
        setHasConfig(false);
      });
  }, []);

  if (hasConfig === null) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#FAF7F2',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '3px solid #E8DDD5',
            borderTopColor: '#8B6145',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  const initialRoute = hasConfig ? '/home' : '/setup';

  return (
    <MemoryRouter initialEntries={[initialRoute]} initialIndex={0}>
      <Routes>
        <Route path='/' element={<Navigate to={initialRoute} replace />} />
        <Route path='/setup' element={<SetupWrapper />} />
        <Route path='/home' element={<Home />} />
        <Route path='/analysis/:sessionId' element={<Analysis />} />
        <Route path='/results/:sessionId' element={<Results />} />
      </Routes>
    </MemoryRouter>
  );
}
