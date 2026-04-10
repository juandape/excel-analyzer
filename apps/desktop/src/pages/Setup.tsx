/** Página Setup — configuración de IA (solo se muestra si no hay config guardada). */
import { useEffect, useState } from 'react';
import type { AIProvider } from '@excel-analyzer/shared-types';

interface Props {
  onConfigSaved: () => void;
}

const PROVIDERS: {
  value: AIProvider;
  label: string;
  description: string;
  badge?: string;
}[] = [
  {
    value: 'openai',
    label: 'OpenAI',
    description: 'GPT-4o · Rápido y preciso',
    badge: 'Recomendado',
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    description: 'Claude · Ideal para documentos largos',
  },
  {
    value: 'ollama',
    label: 'Ollama Local',
    description: 'Llama 3 · Sin internet ni suscripción',
  },
];

export function Setup({ onConfigSaved }: Props) {
  const [provider, setProvider] = useState<AIProvider | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    error?: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Cargar config guardada para pre-seleccionar proveedor
  useEffect(() => {
    window.electron
      .getConfig()
      .then((cfg) => {
        if (cfg) {
          setProvider(cfg.aiProvider);
          if (cfg.ollamaBaseUrl) setOllamaUrl(cfg.ollamaBaseUrl);
        } else {
          setProvider('openai');
        }
        setLoadingConfig(false);
      })
      .catch(() => {
        setProvider('openai');
        setLoadingConfig(false);
      });
  }, []);

  const effectiveProvider = provider ?? 'openai';
  const needsApiKey = effectiveProvider !== 'ollama';

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    await window.electron.saveConfig({
      aiProvider: effectiveProvider,
      apiKey: needsApiKey ? apiKey : undefined,
      ollamaBaseUrl: effectiveProvider === 'ollama' ? ollamaUrl : undefined,
    });
    const result = await window.electron.testConnection();
    setTestResult(result);
    setTesting(false);
  }

  async function handleSave() {
    setSaving(true);
    await window.electron.saveConfig({
      aiProvider: effectiveProvider,
      apiKey: needsApiKey ? apiKey : undefined,
      ollamaBaseUrl: effectiveProvider === 'ollama' ? ollamaUrl : undefined,
    });
    setSaving(false);
    onConfigSaved();
  }

  const canSave = testResult?.ok === true;

  if (loadingConfig) {
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
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '3px solid #E8DDD5',
            borderTopColor: '#8B6145',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#FAF7F2' }}>
      {/* ── Panel izquierdo — visual ─────────────────────────────── */}
      <div
        style={{
          width: '38%',
          minWidth: 280,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 36px',
          position: 'relative',
          overflow: 'hidden',
          background:
            'linear-gradient(160deg, #5C4033 0%, #8B6145 60%, #C4956A 100%)',
        }}
      >
        {/* Círculos decorativos */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        {/* Logo / nombre */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
              }}
            >
              📊
            </div>
            <span
              style={{
                color: '#F5EDE3',
                fontWeight: 700,
                fontSize: 18,
                letterSpacing: '-0.3px',
              }}
            >
              Excel Analyzer
            </span>
          </div>

          <h2
            style={{
              color: '#FFFFFF',
              fontSize: 26,
              fontWeight: 700,
              lineHeight: 1.35,
              marginBottom: 12,
            }}
          >
            Análisis empresarial
            <br />
            potenciado por IA
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            Sube tus archivos, escribe lo que necesitas saber y obtén reportes
            ejecutivos en segundos.
          </p>
        </div>

        {/* Features */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {[
            { icon: '📁', text: 'Excel, Word, PDF e imágenes' },
            { icon: '🔒', text: 'Tu API key nunca sale del dispositivo' },
            { icon: '📝', text: 'Reportes Word y presentaciones PPT' },
          ].map((f) => (
            <div
              key={f.text}
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: 13 }}>
                {f.text}
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            color: 'rgba(255,255,255,0.35)',
            fontSize: 11,
            position: 'relative',
            zIndex: 1,
          }}
        >
          v1.0.0
        </p>
      </div>

      {/* ── Panel derecho — formulario ───────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 40px',
          overflowY: 'auto',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: '#2D1F14',
              marginBottom: 4,
            }}
          >
            Conecta tu IA
          </h1>
          <p style={{ color: '#9A7D6B', fontSize: 14, marginBottom: 28 }}>
            Solo necesitas hacer esto una vez
          </p>

          {/* Selector de proveedor */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              marginBottom: 24,
            }}
          >
            {PROVIDERS.map((p) => {
              const selected = effectiveProvider === p.value;
              return (
                <label
                  key={p.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 16px',
                    borderRadius: 14,
                    cursor: 'pointer',
                    border: selected
                      ? '2px solid #8B6145'
                      : '2px solid #E8DDD5',
                    background: selected ? '#FDF6F0' : '#FFFFFF',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* Radio custom */}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      flexShrink: 0,
                      border: selected
                        ? '6px solid #8B6145'
                        : '2px solid #C4A899',
                      background: '#fff',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => {
                      setProvider(p.value);
                      setTestResult(null);
                    }}
                  />
                  <input
                    type='radio'
                    name='provider'
                    value={p.value}
                    checked={selected}
                    onChange={() => {
                      setProvider(p.value);
                      setTestResult(null);
                    }}
                    style={{ display: 'none' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          color: '#2D1F14',
                          fontSize: 14,
                        }}
                      >
                        {p.label}
                      </span>
                      {p.badge && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 7px',
                            borderRadius: 20,
                            background: '#EDD9C8',
                            color: '#7A4E2D',
                          }}
                        >
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#9A7D6B', fontSize: 12, marginTop: 2 }}>
                      {p.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          {/* API Key */}
          {needsApiKey && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#4A3728',
                  marginBottom: 6,
                }}
              >
                API Key
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    border: '2px solid #E8DDD5',
                    borderRadius: 10,
                    padding: '11px 52px 11px 14px',
                    fontSize: 13,
                    outline: 'none',
                    background: '#FFFFFF',
                    color: '#2D1F14',
                    fontFamily: 'monospace',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#8B6145')}
                  onBlur={(e) => (e.target.style.borderColor = '#E8DDD5')}
                />
                <button
                  type='button'
                  onClick={() => setShowKey(!showKey)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#9A7D6B',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {showKey ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: '#B39484', marginTop: 5 }}>
                🔒 Guardada en el llavero de tu sistema. Nunca sale de tu
                computadora.
              </p>
            </div>
          )}

          {/* Ollama URL */}
          {provider === 'ollama' && (
            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#4A3728',
                  marginBottom: 6,
                }}
              >
                URL de Ollama
              </label>
              <input
                type='text'
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  border: '2px solid #E8DDD5',
                  borderRadius: 10,
                  padding: '11px 14px',
                  fontSize: 13,
                  outline: 'none',
                  background: '#FFFFFF',
                  color: '#2D1F14',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#8B6145')}
                onBlur={(e) => (e.target.style.borderColor = '#E8DDD5')}
              />
            </div>
          )}

          {/* Resultado test */}
          {testResult && (
            <div
              style={{
                borderRadius: 10,
                padding: '11px 14px',
                fontSize: 13,
                marginBottom: 16,
                background: testResult.ok ? '#F0FAF4' : '#FDF2F2',
                border: testResult.ok
                  ? '1px solid #86EFAC'
                  : '1px solid #FECACA',
                color: testResult.ok ? '#166534' : '#B91C1C',
              }}
            >
              {testResult.ok
                ? '✓ Conexión exitosa — listo para analizar'
                : `✗ ${testResult.error}`}
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleTest}
              disabled={testing || (needsApiKey && !apiKey.trim())}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor:
                  testing || (needsApiKey && !apiKey.trim())
                    ? 'not-allowed'
                    : 'pointer',
                opacity: testing || (needsApiKey && !apiKey.trim()) ? 0.45 : 1,
                background: '#FFFFFF',
                border: '2px solid #C4A899',
                color: '#5C4033',
                transition: 'all 0.15s',
              }}
            >
              {testing ? 'Verificando...' : 'Verificar conexión'}
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: !canSave || saving ? 'not-allowed' : 'pointer',
                opacity: !canSave || saving ? 0.45 : 1,
                background: canSave
                  ? 'linear-gradient(135deg, #8B6145, #5C4033)'
                  : '#C4A899',
                border: 'none',
                color: '#FFFFFF',
                transition: 'all 0.15s',
              }}
            >
              {saving ? 'Guardando...' : 'Guardar y continuar →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
