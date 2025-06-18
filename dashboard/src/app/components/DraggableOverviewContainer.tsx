'use client';

import { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableOverviewWidget } from './DraggableOverviewWidget';
import styles from './DraggableOverviewContainer.module.css';

interface OverviewWidgetItem {
  id: string;
  content: React.ReactNode;
  className?: string;
}

interface DraggableOverviewContainerProps {
  children?: React.ReactNode;
  widgets: OverviewWidgetItem[];
  onWidgetOrderChange?: (newOrder: OverviewWidgetItem[]) => void;
}

export function DraggableOverviewContainer({ 
  children, 
  widgets: initialWidgets, 
  onWidgetOrderChange 
}: DraggableOverviewContainerProps) {
  const [widgets, setWidgets] = useState<OverviewWidgetItem[]>(initialWidgets);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeWidget, setActiveWidget] = useState<OverviewWidgetItem | null>(null);
  
  // Client-side only rendering state
  const [isClient, setIsClient] = useState(false);
  
  // Mark as client side rendered after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update widgets when initialWidgets prop changes
  useEffect(() => {
    setWidgets(initialWidgets);
  }, [initialWidgets]);

  // Store widget order in localStorage
  useEffect(() => {
    if (isClient && widgets.length > 0) {
      const widgetOrder = widgets.map(widget => widget.id);
      localStorage.setItem('overview-widget-order', JSON.stringify(widgetOrder));
      onWidgetOrderChange?.(widgets);
    }
  }, [widgets, isClient, onWidgetOrderChange]);

  // Load widget order from localStorage on mount
  useEffect(() => {
    if (isClient) {
      const savedOrder = localStorage.getItem('overview-widget-order');
      if (savedOrder) {
        try {
          const order: string[] = JSON.parse(savedOrder);
          const orderedWidgets = order
            .map(id => initialWidgets.find(widget => widget.id === id))
            .filter(Boolean) as OverviewWidgetItem[];
          
          // Add any new widgets that weren't in the saved order
          const newWidgets = initialWidgets.filter(
            widget => !order.includes(widget.id)
          );
          
          if (orderedWidgets.length > 0) {
            setWidgets([...orderedWidgets, ...newWidgets]);
          }
        } catch (e) {
          console.warn('Failed to parse saved widget order');
        }
      }
    }
  }, [isClient, initialWidgets]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const activeWidget = widgets.find(widget => widget.id === active.id);
    
    setActiveId(active.id as string);
    setActiveWidget(activeWidget || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWidgets((widgets) => {
        const oldIndex = widgets.findIndex(widget => widget.id === active.id);
        const newIndex = widgets.findIndex(widget => widget.id === over?.id);

        return arrayMove(widgets, oldIndex, newIndex);
      });
    }

    setActiveId(null);
    setActiveWidget(null);
  }

  // Don't render drag context on server
  if (!isClient) {
    return <div className={styles.overviewContainer}>{children}</div>;
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
        <div className={styles.overviewContainer}>
          {widgets.map(widget => (
            <DraggableOverviewWidget 
              key={widget.id} 
              id={widget.id}
              className={widget.className}
            >
              {widget.content}
            </DraggableOverviewWidget>
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}
      >
        {activeWidget ? (
          <div className={styles.dragOverlay}>
            {activeWidget.content}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
