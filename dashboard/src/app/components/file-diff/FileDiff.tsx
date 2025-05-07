"use client";

import React, { useState } from 'react';
import styles from './fileDiff.module.css';
import { FileIcon, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number;
  oldLineNumber?: number;
}

interface FileVersionProps {
  fileName: string;
  filePath: string;
  timestamp: Date;
  author: string;
  diffLines: DiffLine[];
  previousVersion?: string;
}

export const FileDiff: React.FC<FileVersionProps> = ({
  fileName,
  filePath,
  timestamp,
  author,
  diffLines,
  previousVersion
}) => {
  const [expanded, setExpanded] = useState(true);
  const [showingDiff, setShowingDiff] = useState(true);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const toggleDiff = () => {
    setShowingDiff(!showingDiff);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  const addedLines = diffLines.filter(line => line.type === 'added').length;
  const removedLines = diffLines.filter(line => line.type === 'removed').length;

  return (
    <div className={styles.fileDiffContainer}>
      <div className={styles.fileHeader} onClick={toggleExpand}>
        <div className={styles.fileInfo}>
          <FileIcon size={16} className={styles.fileIcon} />
          <span className={styles.fileName}>{fileName}</span>
          <span className={styles.filePath}>{filePath}</span>
        </div>
        <div className={styles.diffStats}>
          <span className={styles.addedLines}>+{addedLines}</span>
          <span className={styles.removedLines}>-{removedLines}</span>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>
      
      {expanded && (
        <div className={styles.diffContent}>
          <div className={styles.diffMeta}>
            <div className={styles.versionInfo}>
              <Clock size={14} />
              <span>Edited by {author} on {formatDate(timestamp)}</span>
            </div>
            {previousVersion && (
              <button 
                className={styles.diffToggle} 
                onClick={toggleDiff}
              >
                {showingDiff ? 'Show Current Version' : 'Show Changes'}
              </button>
            )}
          </div>
          
          <div className={styles.diffViewer}>
            <table className={styles.diffTable}>
              <tbody>
                {diffLines.map((line, index) => (
                  <tr 
                    key={index} 
                    className={`${styles.diffLine} ${styles[line.type]}`}
                  >
                    <td className={styles.lineNumber}>
                      {line.oldLineNumber || ''}
                    </td>
                    <td className={styles.lineNumber}>
                      {line.lineNumber}
                    </td>
                    <td className={styles.lineContent}>
                      <pre>{line.content}</pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileDiff;
