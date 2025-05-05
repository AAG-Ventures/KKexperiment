'use client';

import { useState, useEffect } from 'react';
import './FileContent.module.css';
import PDFViewer from './PDFViewer';

// Inline styles to ensure content is visible
const fileStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    width: '100%',
    overflow: 'auto',
    backgroundColor: 'var(--background-secondary, #f8f9fa)',
    borderRadius: '8px',
    padding: '16px',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minHeight: '300px',
    color: 'var(--foreground-secondary, #6c757d)',
  },
  imageContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    overflow: 'auto',
    width: '100%',
    height: '100%',
    minHeight: '300px',
  },
  imagePreview: {
    maxWidth: '100%',
    height: 'auto',
    objectFit: 'contain' as const,
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  pdfContainer: {
    width: '100%',
    height: '100%',
    minHeight: '600px',
  },
  pdfPreview: {
    width: '100%',
    height: '100%',
    minHeight: '600px',
    border: 'none',
    borderRadius: '8px',
  },
  codeContainer: {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    borderRadius: '8px',
    backgroundColor: 'var(--background-tertiary, #e9ecef)',
  },
  textPreview: {
    padding: '16px',
    margin: 0,
    width: '100%',
    whiteSpace: 'pre-wrap' as const,
    fontFamily: 'monospace',
    fontSize: '14px',
    color: 'var(--foreground-primary, #212529)',
    backgroundColor: 'var(--background-tertiary, #e9ecef)',
    borderRadius: '8px',
    overflow: 'auto',
  },
  noPreview: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minHeight: '300px',
    color: 'var(--foreground-secondary, #6c757d)',
    textAlign: 'center' as const,
    padding: '24px',
  },
  fileIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  fileInfoTable: {
    marginTop: '24px',
    borderCollapse: 'collapse' as const,
    width: '100%',
    maxWidth: '500px',
  },
  tableCell: {
    padding: '8px 16px',
    textAlign: 'left' as const,
    borderBottom: '1px solid var(--border-light, #dee2e6)',
  },
  tableCellLabel: {
    fontWeight: 500,
    width: '140px',
    color: 'var(--foreground-primary, #212529)',
  },
  emptyState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    minHeight: '300px',
    color: 'var(--foreground-secondary, #6c757d)',
    fontSize: '16px',
    fontStyle: 'italic',
  },
};

interface FileContentProps {
  file: File | null;
}

export default function FileContent({ file }: FileContentProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      setFileContent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setFileType(file.type);

    // Handle different file types
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } else if (
      file.type === 'text/plain' || 
      file.type === 'text/html' || 
      file.type === 'text/css' || 
      file.type === 'text/javascript' ||
      file.type === 'application/json' ||
      file.type === 'application/xml' ||
      file.name.endsWith('.tsx') ||
      file.name.endsWith('.jsx') ||
      file.name.endsWith('.ts') ||
      file.name.endsWith('.js') ||
      file.name.endsWith('.md')
    ) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileContent(reader.result as string);
        setLoading(false);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      // Set the file type to PDF and let the PDFViewer component handle the rendering
      setFileType('application/pdf');
      setLoading(false);
      console.log('Detected PDF file, will use PDFViewer component');
    } else {
      // For unknown file types, just show file info
      setLoading(false);
    }
  }, [file]);

  // Add console log to debug
  console.log('FileContent rendering with file:', file ? file.name : 'none');
  console.log('File type:', fileType);
  console.log('Preview state:', preview ? 'has preview' : 'no preview');
  console.log('File content state:', fileContent ? 'has content' : 'no content');
  
  // Clean up object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
        console.log('Revoked object URL:', preview);
      }
    };
  }, [preview]);
  
  if (!file) return <div style={fileStyles.emptyState}>No file selected</div>;

  return (
    <div style={fileStyles.container}>
      {loading ? (
        <div style={fileStyles.loading}>Loading file content...</div>
      ) : (
        <>
          {fileType.startsWith('image/') && preview ? (
            <div style={fileStyles.imageContainer}>
              <img src={preview} alt={file.name} style={fileStyles.imagePreview} />
            </div>
          ) : fileType === 'application/pdf' ? (
            <div style={fileStyles.pdfContainer}>
              {/* Use the dedicated PDF viewer component */}
              <PDFViewer file={file} />
            </div>
          ) : fileContent ? (
            <div style={fileStyles.codeContainer}>
              <pre style={fileStyles.textPreview}>{fileContent}</pre>
            </div>
          ) : (
            <div style={fileStyles.noPreview}>
              <div style={fileStyles.fileIcon}>📄</div>
              <h3>File Information</h3>
              <p>No preview available for {file.type || 'unknown file type'}</p>
              <table style={fileStyles.fileInfoTable}>
                <tbody>
                  <tr>
                    <td style={{...fileStyles.tableCell, ...fileStyles.tableCellLabel}}>Name:</td>
                    <td style={fileStyles.tableCell}>{file.name}</td>
                  </tr>
                  <tr>
                    <td style={{...fileStyles.tableCell, ...fileStyles.tableCellLabel}}>Size:</td>
                    <td style={fileStyles.tableCell}>{(file.size / 1024).toFixed(2)} KB</td>
                  </tr>
                  <tr>
                    <td style={{...fileStyles.tableCell, ...fileStyles.tableCellLabel}}>Type:</td>
                    <td style={fileStyles.tableCell}>{file.type || 'Unknown'}</td>
                  </tr>
                  <tr>
                    <td style={{...fileStyles.tableCell, ...fileStyles.tableCellLabel}}>Last Modified:</td>
                    <td style={fileStyles.tableCell}>{new Date(file.lastModified).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
