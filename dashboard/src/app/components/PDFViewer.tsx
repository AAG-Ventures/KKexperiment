'use client';

import { useState, useEffect } from 'react';

interface PDFViewerProps {
  file: File;
}

export default function PDFViewer({ file }: PDFViewerProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create an object URL directly from the file
    try {
      const objectUrl = URL.createObjectURL(file);
      console.log('Created PDF object URL:', objectUrl);
      setUrl(objectUrl);
      setError(null);
      
      // Clean up the URL when component unmounts
      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
          console.log('Revoked PDF object URL');
        }
      };
    } catch (err) {
      console.error('Error creating object URL for PDF:', err);
      setError('Failed to create PDF preview');
      return undefined;
    }
  }, [file]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        color: '#ff3333',
        height: '100%'
      }}>
        <p>{error}</p>
      </div>
    );
  }

  if (!url) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
      }}>
        Loading PDF...
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Three different methods to try to render the PDF */}
      
      {/* Method 1: iframe */}
      <iframe 
        src={url}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block'
        }}
        title={file.name}
      />
      
      {/* Fallback message if embedding fails */}
      <div style={{
        textAlign: 'center',
        padding: '1rem',
        borderTop: '1px solid #ccc',
      }}>
        <a 
          href={url}
          download={file.name}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--brand-primary, #673AB7)',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
