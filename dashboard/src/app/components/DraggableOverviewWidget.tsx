import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './DraggableOverviewWidget.module.css';

interface DraggableOverviewWidgetProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function DraggableOverviewWidget({ id, children, className = '' }: DraggableOverviewWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.draggableOverviewWidget} ${className} ${isDragging ? styles.dragging : ''}`}
      data-drag-handle-props={JSON.stringify({ ...attributes, ...listeners })}
    >
      {children}
    </div>
  );
}
