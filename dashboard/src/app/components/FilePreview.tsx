'use client';

import { useState, useEffect } from 'react';
import styles from './FilePreview.module.css';

interface FilePreviewProps {
  file: File | null;
  onClose: () => void;
}

export default function FilePreview({ file, onClose }: FilePreviewProps) {
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
    } else if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } else {
      // For unknown file types, just show file info
      setLoading(false);
    }
  }, [file]);

  if (!file) return null;

  return (
    <div className={styles.previewOverlay}>
      <div className={styles.previewContainer}>
        <div className={styles.previewHeader}>
          <h3>File Preview: {file.name}</h3>
          <button 
            onClick={onClose}
            className={styles.closeButton}
          >
            ×
          </button>
        </div>
        <div className={styles.previewContent}>
          {loading ? (
            <div className={styles.loading}>Loading preview...</div>
          ) : (
            <>
              {fileType.startsWith('image/') && preview ? (
                <img src={preview} alt={file.name} className={styles.imagePreview} />
              ) : fileType === 'application/pdf' && preview ? (
                <iframe 
                  src={preview} 
                  title={file.name} 
                  className={styles.pdfPreview}
                />
              ) : fileContent ? (
                <pre className={styles.textPreview}>{fileContent}</pre>
              ) : (
                <div className={styles.noPreview}>
                  <p>No preview available for {file.type || 'unknown file type'}</p>
                  <p>File size: {(file.size / 1024).toFixed(2)} KB</p>
                  <p>Last modified: {new Date(file.lastModified).toLocaleString()}</p>
                </div>
              )}
            </>
          )}
        </div>
        <div className={styles.previewFooter}>
          <div>Size: {(file.size / 1024).toFixed(2)} KB</div>
          <div>Type: {file.type || 'Unknown'}</div>
        </div>
      </div>
    </div>
  );
}
