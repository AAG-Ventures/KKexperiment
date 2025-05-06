import React from 'react';
import ReactMarkdown from 'react-markdown';
import styles from './MarkdownViewer.module.css';

interface MarkdownViewerProps {
  content: string;
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  return (
    <div className={styles.markdownContainer}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
