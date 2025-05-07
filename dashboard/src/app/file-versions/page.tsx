"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, FileIcon } from 'lucide-react';
import { FileDiff } from '../components/file-diff/FileDiff';
import { FileList } from '../components/file-list/FileList';
import styles from './fileVersions.module.css';

const FileVersionsPage = () => {
  // Sample data - this would normally come from an API
  const sampleDiff = {
    fileName: 'dashboard.tsx',
    filePath: 'src/app/components/dashboard/dashboard.tsx',
    timestamp: new Date(),
    author: 'AI Assistant',
    previousVersion: 'v1',
    diffLines: [
      { type: 'unchanged', content: 'import React from "react";', lineNumber: 1, oldLineNumber: 1 },
      { type: 'unchanged', content: 'import styles from "./dashboard.module.css";', lineNumber: 2, oldLineNumber: 2 },
      { type: 'unchanged', content: '', lineNumber: 3, oldLineNumber: 3 },
      { type: 'unchanged', content: 'interface DashboardProps {', lineNumber: 4, oldLineNumber: 4 },
      { type: 'unchanged', content: '  title: string;', lineNumber: 5, oldLineNumber: 5 },
      { type: 'removed', content: '  showSidebar: boolean;', lineNumber: 6, oldLineNumber: 6 },
      { type: 'added', content: '  showSidebar?: boolean;', lineNumber: 6 },
      { type: 'added', content: '  theme?: "light" | "dark";', lineNumber: 7 },
      { type: 'unchanged', content: '}', lineNumber: 8, oldLineNumber: 7 },
      { type: 'unchanged', content: '', lineNumber: 9, oldLineNumber: 8 },
      { type: 'unchanged', content: 'const Dashboard: React.FC<DashboardProps> = ({', lineNumber: 10, oldLineNumber: 9 },
      { type: 'unchanged', content: '  title,', lineNumber: 11, oldLineNumber: 10 },
      { type: 'removed', content: '  showSidebar', lineNumber: 12, oldLineNumber: 11 },
      { type: 'added', content: '  showSidebar = true,', lineNumber: 12 },
      { type: 'added', content: '  theme = "dark"', lineNumber: 13 },
      { type: 'unchanged', content: '}) => {', lineNumber: 14, oldLineNumber: 12 },
      { type: 'unchanged', content: '  return (', lineNumber: 15, oldLineNumber: 13 },
      { type: 'unchanged', content: '    <div className={styles.dashboard}>', lineNumber: 16, oldLineNumber: 14 },
      { type: 'unchanged', content: '      <header className={styles.header}>', lineNumber: 17, oldLineNumber: 15 },
      { type: 'unchanged', content: '        <h1>{title}</h1>', lineNumber: 18, oldLineNumber: 16 },
      { type: 'unchanged', content: '      </header>', lineNumber: 19, oldLineNumber: 17 },
      { type: 'unchanged', content: '      <main className={styles.main}>', lineNumber: 20, oldLineNumber: 18 },
      { type: 'removed', content: '        {showSidebar && <div className={styles.sidebar}>Sidebar</div>}', lineNumber: 21, oldLineNumber: 19 },
      { type: 'added', content: '        {showSidebar && <div className={`${styles.sidebar} ${styles[theme]}`}>Sidebar</div>}', lineNumber: 21 },
      { type: 'unchanged', content: '        <div className={styles.content}>Content</div>', lineNumber: 22, oldLineNumber: 20 },
      { type: 'unchanged', content: '      </main>', lineNumber: 23, oldLineNumber: 21 },
      { type: 'unchanged', content: '    </div>', lineNumber: 24, oldLineNumber: 22 },
      { type: 'unchanged', content: '  );', lineNumber: 25, oldLineNumber: 23 },
      { type: 'unchanged', content: '};', lineNumber: 26, oldLineNumber: 24 },
      { type: 'unchanged', content: '', lineNumber: 27, oldLineNumber: 25 },
      { type: 'unchanged', content: 'export default Dashboard;', lineNumber: 28, oldLineNumber: 26 },
    ]
  };

  // Sample older version
  const olderVersion = {
    fileName: 'dashboard.module.css',
    filePath: 'src/app/components/dashboard/dashboard.module.css',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    author: 'AI Assistant',
    previousVersion: 'v1',
    diffLines: [
      { type: 'unchanged', content: '.dashboard {', lineNumber: 1, oldLineNumber: 1 },
      { type: 'unchanged', content: '  display: flex;', lineNumber: 2, oldLineNumber: 2 },
      { type: 'unchanged', content: '  flex-direction: column;', lineNumber: 3, oldLineNumber: 3 },
      { type: 'unchanged', content: '  height: 100vh;', lineNumber: 4, oldLineNumber: 4 },
      { type: 'unchanged', content: '}', lineNumber: 5, oldLineNumber: 5 },
      { type: 'unchanged', content: '', lineNumber: 6, oldLineNumber: 6 },
      { type: 'unchanged', content: '.header {', lineNumber: 7, oldLineNumber: 7 },
      { type: 'removed', content: '  background-color: #333;', lineNumber: 8, oldLineNumber: 8 },
      { type: 'added', content: '  background-color: var(--background-secondary);', lineNumber: 8 },
      { type: 'removed', content: '  color: white;', lineNumber: 9, oldLineNumber: 9 },
      { type: 'added', content: '  color: var(--foreground-primary);', lineNumber: 9 },
      { type: 'unchanged', content: '  padding: 1rem;', lineNumber: 10, oldLineNumber: 10 },
      { type: 'unchanged', content: '}', lineNumber: 11, oldLineNumber: 11 },
      { type: 'unchanged', content: '', lineNumber: 12, oldLineNumber: 12 },
      { type: 'unchanged', content: '.main {', lineNumber: 13, oldLineNumber: 13 },
      { type: 'unchanged', content: '  display: flex;', lineNumber: 14, oldLineNumber: 14 },
      { type: 'unchanged', content: '  flex: 1;', lineNumber: 15, oldLineNumber: 15 },
      { type: 'unchanged', content: '}', lineNumber: 16, oldLineNumber: 16 },
      { type: 'unchanged', content: '', lineNumber: 17, oldLineNumber: 17 },
      { type: 'unchanged', content: '.sidebar {', lineNumber: 18, oldLineNumber: 18 },
      { type: 'removed', content: '  width: 250px;', lineNumber: 19, oldLineNumber: 19 },
      { type: 'added', content: '  width: 280px;', lineNumber: 19 },
      { type: 'removed', content: '  background-color: #f5f5f5;', lineNumber: 20, oldLineNumber: 20 },
      { type: 'added', content: '  background-color: var(--background-tertiary);', lineNumber: 20 },
      { type: 'unchanged', content: '  padding: 1rem;', lineNumber: 21, oldLineNumber: 21 },
      { type: 'unchanged', content: '}', lineNumber: 22, oldLineNumber: 22 },
      { type: 'unchanged', content: '', lineNumber: 23, oldLineNumber: 23 },
      { type: 'added', content: '.dark {', lineNumber: 24 },
      { type: 'added', content: '  background-color: var(--background-secondary);', lineNumber: 25 },
      { type: 'added', content: '  color: var(--foreground-primary);', lineNumber: 26 },
      { type: 'added', content: '}', lineNumber: 27 },
      { type: 'added', content: '', lineNumber: 28 },
      { type: 'added', content: '.light {', lineNumber: 29 },
      { type: 'added', content: '  background-color: #f5f5f5;', lineNumber: 30 },
      { type: 'added', content: '  color: #333;', lineNumber: 31 },
      { type: 'added', content: '}', lineNumber: 32 },
      { type: 'added', content: '', lineNumber: 33 },
      { type: 'unchanged', content: '.content {', lineNumber: 34, oldLineNumber: 24 },
      { type: 'unchanged', content: '  flex: 1;', lineNumber: 35, oldLineNumber: 25 },
      { type: 'unchanged', content: '  padding: 1rem;', lineNumber: 36, oldLineNumber: 26 },
      { type: 'unchanged', content: '}', lineNumber: 37, oldLineNumber: 27 },
    ]
  };

  // Sample modified files for file browser integration
  const sampleFiles: any[] = [
    {
      id: 'file-1',
      name: 'dashboard.tsx',
      path: 'src/app/components/dashboard/',
      type: 'file',
      status: 'modified',
      lastModified: new Date(),
      fileType: 'tsx'
    },
    {
      id: 'file-2',
      name: 'dashboard.module.css',
      path: 'src/app/components/dashboard/',
      type: 'file',
      status: 'modified',
      lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000),
      fileType: 'css'
    },
    {
      id: 'file-3',
      name: 'header.tsx',
      path: 'src/app/components/layout/',
      type: 'file',
      status: 'unchanged',
      lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      fileType: 'tsx'
    },
    {
      id: 'file-4',
      name: 'sidebar.tsx',
      path: 'src/app/components/layout/',
      type: 'file',
      status: 'added',
      lastModified: new Date(Date.now() - 60 * 60 * 1000),
      fileType: 'tsx'
    },
    {
      id: 'file-5',
      name: 'old-component.tsx',
      path: 'src/app/components/deprecated/',
      type: 'file',
      status: 'deleted',
      lastModified: new Date(Date.now() - 30 * 60 * 1000),
      fileType: 'tsx'
    }
  ];

  const handleFileClick = (file: any) => {
    console.log('Clicked file:', file.name);
    // In a real implementation, this would navigate to the file diff view
  };

  return (
    <div className={styles.fileVersionsWrapper}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.backLink}>
            <ChevronLeft size={20} />
            <span>Back to Dashboard</span>
          </Link>
          <h1>File Versions</h1>
        </div>
      </header>
      
      <main className={styles.main}>
        <div className={styles.fileInfoHeader}>
          <div className={styles.fileTitle}>
            <FileIcon size={20} />
            <h2>dashboard.tsx</h2>
          </div>
          <p className={styles.filePath}>src/app/components/dashboard/dashboard.tsx</p>
        </div>
        
        <div className={styles.versionsContainer}>
          <h3>Recent Changes</h3>
          <div className={styles.fileVersions}>
            <FileDiff 
              fileName={sampleDiff.fileName}
              filePath={sampleDiff.filePath}
              timestamp={sampleDiff.timestamp}
              author={sampleDiff.author}
              diffLines={sampleDiff.diffLines as any}
              previousVersion={sampleDiff.previousVersion}
            />
            <FileDiff 
              fileName={olderVersion.fileName}
              filePath={olderVersion.filePath}
              timestamp={olderVersion.timestamp}
              author={olderVersion.author}
              diffLines={olderVersion.diffLines as any}
              previousVersion={olderVersion.previousVersion}
            />
          </div>
        </div>
        
        <div className={styles.filesListSection}>
          <h3>Files in Project</h3>
          <p className={styles.filesListDescription}>
            Files modified by agents show visual indicators:
            <span className={`${styles.legendItem} ${styles.legendModified}`}>Modified</span>
            <span className={`${styles.legendItem} ${styles.legendAdded}`}>Added</span>
            <span className={`${styles.legendItem} ${styles.legendDeleted}`}>Deleted</span>
          </p>
          <div className={styles.filesList}>
            <FileList 
              files={sampleFiles} 
              onFileClick={handleFileClick} 
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FileVersionsPage;
