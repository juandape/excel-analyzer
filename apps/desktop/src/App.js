import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { MemoryRouter, Routes, Route, Navigate, useNavigate, } from 'react-router-dom';
import { Setup } from '@/pages/Setup';
import { Home } from '@/pages/Home';
import { Analysis } from '@/pages/Analysis';
import { Results } from '@/pages/Results';
function SetupWrapper() {
    const navigate = useNavigate();
    return _jsx(Setup, { onConfigSaved: () => navigate('/home', { replace: true }) });
}
export default function App() {
    const [hasConfig, setHasConfig] = useState(null);
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
        return (_jsx("div", { style: {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#FAF7F2',
            }, children: _jsx("div", { style: {
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '3px solid #E8DDD5',
                    borderTopColor: '#8B6145',
                    animation: 'spin 0.8s linear infinite',
                } }) }));
    }
    const initialRoute = hasConfig ? '/home' : '/setup';
    return (_jsx(MemoryRouter, { initialEntries: [initialRoute], initialIndex: 0, children: _jsxs(Routes, { children: [_jsx(Route, { path: '/', element: _jsx(Navigate, { to: initialRoute, replace: true }) }), _jsx(Route, { path: '/setup', element: _jsx(SetupWrapper, {}) }), _jsx(Route, { path: '/home', element: _jsx(Home, {}) }), _jsx(Route, { path: '/analysis/:sessionId', element: _jsx(Analysis, {}) }), _jsx(Route, { path: '/results/:sessionId', element: _jsx(Results, {}) })] }) }));
}
