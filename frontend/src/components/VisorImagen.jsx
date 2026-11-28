import { useEffect } from 'react';
import Icon from './Icon.jsx';

/** Visor ligero para ampliar una imagen al hacer clic y cerrarla con Escape o clic fuera. */
export default function VisorImagen({ src, alt = 'Vista ampliada', titulo, onClose }) {
  useEffect(() => {
    if (!src) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [src, onClose]);

  if (!src) return null;

  return (
    <div
      className="lightbox-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={titulo || alt}
    >
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="lightbox-close"
          onClick={onClose}
          aria-label="Cerrar imagen ampliada"
        >
          <Icon name="x" size={20} stroke={2.4} />
        </button>

        <img src={src} alt={alt} className="lightbox-img" />

        {titulo && <div className="lightbox-caption">{titulo}</div>}
      </div>
    </div>
  );
}
