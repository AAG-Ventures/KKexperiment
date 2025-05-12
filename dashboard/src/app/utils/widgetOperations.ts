import React from 'react';

/**
 * Widget operations utility functions
 * This file contains functions related to widget operations in the dashboard
 */

// Widget type definition
export type WidgetType = 'calendar' | 'myTasks' | 'activeProcesses' | 'myAgents' | 'recentActivity';

// Widget data structure
export interface WidgetItem {
  id: string;
  content: React.ReactNode;
  column?: string;
}

/**
 * Handles the selection of widgets to be displayed in the dashboard
 * @param widgetType - The type of widget to be added or removed
 * @param dashboardItems - Current dashboard items state 
 * @param setDashboardItems - State setter for dashboard items
 * @param addNotification - Function to add a notification
 */
export const handleWidgetSelect = (
  widgetType: WidgetType,
  dashboardItems: Record<string, WidgetItem[]>,
  setDashboardItems: React.Dispatch<React.SetStateAction<Record<string, WidgetItem[]>>>,
  addNotification: (notification: { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }) => void
) => {
  console.log(`Widget selected: ${widgetType}`);

  // Check if the widget is already in one of the columns
  let widgetFound = false;
  let widgetColumn = '';
  
  // Find if widget exists in any column
  Object.keys(dashboardItems).forEach(column => {
    const widgetIndex = dashboardItems[column].findIndex(widget => 
      widget.id === widgetType
    );
    
    if (widgetIndex !== -1) {
      widgetFound = true;
      widgetColumn = column;
    }
  });
  
  // If widget is found, remove it
  if (widgetFound) {
    setDashboardItems(prevItems => {
      const newItems = {...prevItems};
      newItems[widgetColumn] = newItems[widgetColumn].filter(
        widget => widget.id !== widgetType
      );
      return newItems;
    });
    
    addNotification({
      title: 'Widget Removed',
      message: `${getWidgetName(widgetType)} widget has been removed from the dashboard.`,
      type: 'info'
    });
  } 
  // If widget is not found, add it to the least populated column
  else {
    // Determine the least populated column
    let leastPopulatedColumn = 'column1';
    let minWidgets = dashboardItems.column1.length;
    
    if (dashboardItems.column2.length < minWidgets) {
      leastPopulatedColumn = 'column2';
      minWidgets = dashboardItems.column2.length;
    }
    
    if (dashboardItems.column3.length < minWidgets) {
      leastPopulatedColumn = 'column3';
    }
    
    // Create a placeholder for the widget - the actual content will be rendered in the dashboard
    const widgetPlaceholder: WidgetItem = {
      id: widgetType,
      content: `Loading ${getWidgetName(widgetType)}...`,
      column: leastPopulatedColumn
    };
    
    // Add the widget to the selected column
    setDashboardItems(prevItems => {
      const newItems = {...prevItems};
      newItems[leastPopulatedColumn] = [...newItems[leastPopulatedColumn], widgetPlaceholder];
      return newItems;
    });
    
    addNotification({
      title: 'Widget Added',
      message: `${getWidgetName(widgetType)} widget has been added to the dashboard.`,
      type: 'success'
    });
  }
};

/**
 * Gets the display name for a widget type
 * @param widgetType - The type of widget
 * @returns The human-readable name of the widget
 */
export const getWidgetName = (widgetType: WidgetType): string => {
  switch (widgetType) {
    case 'calendar':
      return 'Calendar';
    case 'myTasks':
      return 'My Tasks';
    case 'activeProcesses':
      return 'Active Processes';
    case 'myAgents':
      return 'My Agents';
    case 'recentActivity':
      return 'Recent Activity';
    default:
      return 'Widget';
  }
};
