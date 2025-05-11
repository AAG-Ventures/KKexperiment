'use client'

import React, { useEffect, useRef } from 'react';
import styles from './ContextMenu.module.css';
import Portal from './Portal';

export interface ContextMenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ items, position, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Adjust position if menu would render outside viewport
  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200), // 200 is estimated menu width
    y: Math.min(position.y, window.innerHeight - items.length * 36), // 36 is estimated item height
  };

  return (
    <Portal>
      <div 
        className={styles.contextMenu} 
        style={{ 
          top: adjustedPosition.y, 
          left: adjustedPosition.x 
        }}
        ref={menuRef}
      >
        {items.map((item, index) => (
          <div 
            key={index} 
            className={styles.menuItem}
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
            <span className={styles.itemLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </Portal>
  );
};

export default ContextMenu;
