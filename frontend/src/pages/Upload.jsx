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
} from 'lucide-react';

function UploadZone({ title, description, icon: Icon, endpoint, type }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

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
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div className="glass-card animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          type === 'customers' ? 'bg-accent-cyan/10' : 'bg-accent-emerald/10'
        }`}>
          <Icon className={`w-5 h-5 ${
            type === 'customers' ? 'text-accent-cyan' : 'text-accent-emerald'
          }`} />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">{title}</h3>
          <p className="text-xs text-text-secondary">{description}</p>
        </div>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
          dragOver
            ? 'border-accent-indigo bg-accent-indigo/5'
            : 'border-border hover:border-border-hover'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-accent-indigo animate-spin" />
            <p className="text-sm text-text-secondary">Processing CSV...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-bg-card flex items-center justify-center">
              <UploadIcon className="w-6 h-6 text-text-muted" />
            </div>
            <div>
              <p className="text-sm text-text-primary font-medium">
                Drop your CSV file here, or <span className="text-accent-indigo">browse</span>
              </p>
              <p className="text-xs text-text-muted mt-1">CSV files only, up to 10MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="mt-4 p-4 rounded-xl bg-accent-emerald/5 border border-accent-emerald/20">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-5 h-5 text-accent-emerald" />
            <span className="font-medium text-accent-emerald">{result.message}</span>
          </div>
          <div className="text-sm text-text-secondary space-y-1">
            <p>Total records: <span className="text-text-primary font-medium">{result.total}</span></p>
            <p>Processed: <span className="text-accent-emerald font-medium">{result.processed}</span></p>
            {result.errors > 0 && (
              <p>Errors: <span className="text-accent-rose font-medium">{result.errors}</span></p>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-accent-rose/5 border border-accent-rose/20">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-accent-rose" />
            <span className="text-sm text-accent-rose">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Upload() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Upload Data</h1>
        <p className="text-text-secondary mt-1">Import your customer and order data via CSV files</p>
      </div>

      {/* Format hints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="glass-card !p-4 animate-fade-in delay-1">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-4 h-4 text-accent-cyan" />
            <span className="text-sm font-medium text-text-primary">Customer CSV Format</span>
          </div>
          <code className="text-xs text-text-muted bg-bg-primary/50 px-3 py-2 rounded-lg block">
            name,email,phone,city
          </code>
        </div>
        <div className="glass-card !p-4 animate-fade-in delay-2">
          <div className="flex items-center gap-2 mb-2">
            <FileSpreadsheet className="w-4 h-4 text-accent-emerald" />
            <span className="text-sm font-medium text-text-primary">Order CSV Format</span>
          </div>
          <code className="text-xs text-text-muted bg-bg-primary/50 px-3 py-2 rounded-lg block">
            customerEmail,amount,date
          </code>
        </div>
      </div>

      {/* Upload zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
