import { Component, type ReactNode } from 'react';
import { t } from './i18n';

/** Si algo falla al dibujar la aplicación, se muestra un mensaje amable en vez de una pantalla en blanco. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  /** Borra lo guardado en este navegador (por si un proyecto dañado causa el fallo) y recarga. */
  private reiniciar = () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('kody.'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* sin almacenamiento */
    }
    location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        style={{
          fontFamily: 'system-ui, sans-serif',
          maxWidth: '34rem',
          margin: '12vh auto',
          padding: '1.5rem',
          border: '3px solid #c7d2fe',
          borderRadius: 20,
          color: '#1e1b4b',
          background: '#fff',
        }}
      >
        <h1>{t('error.titulo')}</h1>
        <p>{t('error.texto')}</p>
        <button
          type="button"
          onClick={this.reiniciar}
          style={{
            padding: '0.7rem 1.2rem',
            fontSize: '1rem',
            fontWeight: 700,
            borderRadius: 999,
            border: 0,
            background: '#4f46e5',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {t('error.boton')}
        </button>
        <pre
          style={{
            whiteSpace: 'pre-wrap',
            fontSize: '0.8rem',
            background: '#eef2ff',
            padding: '0.75rem',
            borderRadius: 10,
          }}
        >
          {String(this.state.error.message)}
        </pre>
      </div>
    );
  }
}
