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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableWidget } from './DraggableWidget';
import styles from './DraggableWidgetContainer.module.css';
import widgetStyles from './DraggableWidget.module.css';

interface WidgetItem {
  id: string;
  content: React.ReactNode;
}

interface DraggableWidgetContainerProps {
  initialItems: WidgetItem[];
  columnId: string;
}

export function DraggableWidgetContainer({ initialItems, columnId }: DraggableWidgetContainerProps) {
  const [items, setItems] = useState<WidgetItem[]>(initialItems);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<WidgetItem | null>(null);
  
  // Store widget order in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrder = localStorage.getItem(`widgetOrder-${columnId}`);
      if (savedOrder) {
        try {
          const savedIds = JSON.parse(savedOrder);
          // Reorder initialItems based on saved order
          const newItems = [...initialItems];
          const orderedItems = savedIds
            .map((id: string) => newItems.find(item => item.id === id))
            .filter(Boolean);
          
          // Add any new items that weren't in the saved order
          const missingItems = newItems.filter(
            item => !savedIds.includes(item.id)
          );
          
          setItems([...orderedItems, ...missingItems]);
        } catch (e) {
          console.error('Error parsing saved widget order:', e);
        }
      }
    }
  }, [initialItems, columnId]);

  // Save order to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const itemIds = items.map(item => item.id);
      localStorage.setItem(`widgetOrder-${columnId}`, JSON.stringify(itemIds));
    }
  }, [items, columnId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    setActiveId(id);
    setActiveItem(items.find(item => item.id === id) || null);
    
    // Add a class to the body to indicate drag is active
    document.body.classList.add('dragging-active');
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    
    setActiveId(null);
    setActiveItem(null);
    
    // Remove the class from the body
    document.body.classList.remove('dragging-active');
  }
  
  function handleDragCancel() {
    setActiveId(null);
    setActiveItem(null);
    document.body.classList.remove('dragging-active');
  }

  return (
    <div className={styles.container}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext 
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <DraggableWidget key={item.id} id={item.id}>
              {item.content}
            </DraggableWidget>
          ))}
        </SortableContext>
        
        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeId && activeItem ? (
            <div className={widgetStyles.draggingWidget}>
              {activeItem.content}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
