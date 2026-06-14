import { useState, useRef } from 'react';
import api from '../api/axios';
import {
  Upload as UploadIcon,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
  ShoppingCart,
  Zap,
} from 'lucide-react';

function UploadZone({ title, description, icon: Icon, endpoint, type }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const isCustomers = type === 'customers';
  const accent = isCustomers ? '#2563EB' : '#16A34A';
  const accentBg = isCustomers ? '#EFF6FF' : '#F0FDF4';
  const accentBorder = isCustomers ? '#BFDBFE' : '#BBF7D0';

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post(endpoint, formData);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div style={{
      background: '#FFFFFF',
      border: `1px solid ${accentBorder}`,
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '11px',
          background: accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon style={{ width: '20px', height: '20px', color: accent }} />
        </div>
        <div>
          <h3 style={{ fontWeight: '700', color: '#111827', fontSize: '1rem', margin: 0 }}>{title}</h3>
          <p style={{ fontSize: '0.78rem', color: '#9CA3AF', margin: 0 }}>{description}</p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragOver ? accent : '#E5E7EB'}`,
          borderRadius: '12px',
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? accentBg : '#FAFAFA',
          transition: 'all 0.2s',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <Loader2 style={{ width: '36px', height: '36px', color: accent, animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>Processing CSV...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: '#FFFFFF', border: '1px solid #E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <UploadIcon style={{ width: '22px', height: '22px', color: '#9CA3AF' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500', margin: '0 0 4px' }}>
                Drop your CSV here, or{' '}
                <span style={{ color: accent, fontWeight: '600' }}>browse</span>
              </p>
              <p style={{ fontSize: '0.75rem', color: '#9CA3AF', margin: 0 }}>CSV files only · up to 10MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Success result */}
      {result && (
        <div style={{
          marginTop: '1rem', padding: '1rem 1.25rem',
          borderRadius: '12px', background: '#F0FDF4', border: '1px solid #BBF7D0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <CheckCircle2 style={{ width: '18px', height: '18px', color: '#16A34A', flexShrink: 0 }} />
            <span style={{ fontWeight: '600', color: '#15803D', fontSize: '0.875rem' }}>{result.message}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#6B7280', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span>Total: <strong style={{ color: '#111827' }}>{result.total}</strong></span>
            <span>Processed: <strong style={{ color: '#16A34A' }}>{result.processed}</strong></span>
            {result.errors > 0 && (
              <span>Errors: <strong style={{ color: '#DC2626' }}>{result.errors}</strong></span>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '1rem', padding: '1rem 1.25rem',
          borderRadius: '12px', background: '#FEF2F2', border: '1px solid #FECACA',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <XCircle style={{ width: '18px', height: '18px', color: '#DC2626', flexShrink: 0 }} />
          <span style={{ fontSize: '0.875rem', color: '#B91C1C' }}>{error}</span>
        </div>
      )}
    </div>
  );
}

export default function Upload() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: '#FFF7ED', border: '1px solid #FDE68A',
          borderRadius: '999px', padding: '4px 14px',
          fontSize: '11px', fontWeight: '600', color: '#B45309',
          letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem',
        }}>
          <Zap style={{ width: '11px', height: '11px' }} />
          Data Import
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          Upload Data
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0 }}>
          Import your customer and order data via CSV files to get started.
        </p>
      </div>

      {/* Format hints */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: FileSpreadsheet, label: 'Customer CSV format', code: 'name, email, phone, city', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
          { icon: FileSpreadsheet, label: 'Order CSV format', code: 'customerEmail, amount, date', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
        ].map(({ icon: Icon, label, code, color, bg, border }) => (
          <div key={label} style={{
            background: '#FFFFFF', border: `1px solid ${border}`,
            borderRadius: '12px', padding: '1rem 1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: '14px', height: '14px', color }} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#374151' }}>{label}</span>
            </div>
            <code style={{
              display: 'block', fontSize: '0.75rem', color: '#6B7280',
              background: '#F9FAFB', border: '1px solid #F3F4F6',
              borderRadius: '8px', padding: '8px 12px', letterSpacing: '0.01em',
            }}>
              {code}
            </code>
          </div>
        ))}
      </div>

      {/* Upload zones */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        <UploadZone
          title="Customers"
          description="Upload customer records"
          icon={Users}
          endpoint="/upload/customers"
          type="customers"
        />
        <UploadZone
          title="Orders"
          description="Upload order history"
          icon={ShoppingCart}
          endpoint="/upload/orders"
          type="orders"
        />
      </div>
    </div>
  );
}