import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Setup } from '@/pages/Setup';
import { Home } from '@/pages/Home';
import { Analysis } from '@/pages/Analysis';
import { Results } from '@/pages/Results';
export default function App() {
    const [hasConfig, setHasConfig] = useState(null);
    useEffect(() => {
        window.electron.getConfig().then((cfg) => {
            setHasConfig(cfg !== null);
        });
    }, []);
    if (hasConfig === null) {
        return (_jsx("div", { className: "flex items-center justify-center h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }));
    }
    return (_jsx(MemoryRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: hasConfig ? '/home' : '/setup', replace: true }) }), _jsx(Route, { path: "/setup", element: _jsx(Setup, { onConfigSaved: () => setHasConfig(true) }) }), _jsx(Route, { path: "/home", element: _jsx(Home, {}) }), _jsx(Route, { path: "/analysis/:sessionId", element: _jsx(Analysis, {}) }), _jsx(Route, { path: "/results/:sessionId", element: _jsx(Results, {}) })] }) }));
}
