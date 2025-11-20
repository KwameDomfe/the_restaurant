import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useApp } from '../App';

const Inner = () => {
  const { slug } = useParams();
  const { API_BASE_URL, showToast } = useApp();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        // Menu items are under restaurants app: menu-items endpoint (slug-based)
        const res = await axios.get(`${API_BASE_URL}/menu-items/${slug}/`);
        if (!mounted) return;
        setItem(res.data);
      } catch (e) {
        if (!mounted) return;
        setError('Could not load menu item');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [slug, API_BASE_URL]);

  if (loading) return <div className="container py-5"><div className="text-muted">Loading item…</div></div>;
  if (error) return (
    <div className="container py-5">
      <div className="alert alert-danger">{error}</div>
      <Link className="btn btn-secondary" to="/menu">Back to menu</Link>
    </div>
  );
  if (!item) return (
    <div className="container py-5">
      <div className="text-muted">Menu item not found</div>
      <Link className="btn btn-secondary" to="/menu">Back to menu</Link>
    </div>
  );

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const el = document.createElement('textarea');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      showToast('Link copied to clipboard', 'success');
    } catch (e) {
      showToast('Unable to copy link', 'error');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/menu" className="btn btn-outline-secondary" data-testid="menu-item-detail-back">← Back</Link>
        <button type="button" className="btn btn-outline-primary" onClick={handleCopyLink} data-testid="menu-item-detail-copy-link">
          🔗 Copy Link
        </button>
      </div>
      <div className="card shadow-sm">
        <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop'} alt={item.name} className="card-img-top" />
        <div className="card-body">
          <h3 className="card-title">{item.name}</h3>
          <p className="text-muted">GHC {parseFloat(item.price).toFixed(2)}</p>
          {item.description ? (<p>{item.description}</p>) : null}
        </div>
      </div>
    </div>
  );
};

export default function MenuItemDetailPage() {
  return <Inner />;
}
