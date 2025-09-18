import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface CollapsibleState {
  [key: string]: boolean;
}

export interface UseCollapsibleProps {
  /** Storage key for localStorage persistence */
  storageKey: string;
  /** Default collapsed state for sections */
  defaultCollapsed?: boolean;
  /** Initial sections to set up */
  initialSections?: string[];
}

export interface UseCollapsibleReturn {
  /** Current collapsed state for all sections */
  collapsedSections: CollapsibleState;
  /** Toggle a specific section's collapsed state */
  toggleSection: (sectionId: string) => void;
  /** Set a specific section's collapsed state */
  setSection: (sectionId: string, collapsed: boolean) => void;
  /** Check if a section is collapsed */
  isCollapsed: (sectionId: string) => boolean;
  /** Expand all sections */
  expandAll: () => void;
  /** Collapse all sections */
  collapseAll: () => void;
  /** Get count of collapsed sections */
  getCollapsedCount: () => number;
  /** Get count of expanded sections */
  getExpandedCount: () => number;
  /** Get all section IDs */
  getSectionIds: () => string[];
  /** Add a new section with default state */
  addSection: (sectionId: string, collapsed?: boolean) => void;
  /** Remove a section from state */
  removeSection: (sectionId: string) => void;
}

/**
 * A hook for managing collapsible sections with localStorage persistence.
 * Provides utilities for expanding/collapsing sections individually or all at once.
 */
export function useCollapsible({
  storageKey,
  defaultCollapsed = false,
  initialSections = []
}: UseCollapsibleProps): UseCollapsibleReturn {
  // Initialize localStorage state with initial sections
  const getInitialState = (): CollapsibleState => {
    const initial: CollapsibleState = {};
    initialSections.forEach(sectionId => {
      initial[sectionId] = defaultCollapsed;
    });
    return initial;
  };

  const [collapsedSections, setCollapsedSections] = useLocalStorage<CollapsibleState>(
    `collapsible-${storageKey}`,
    getInitialState()
  );

  const toggleSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  }, [setCollapsedSections]);

  const setSection = useCallback((sectionId: string, collapsed: boolean) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: collapsed
    }));
  }, [setCollapsedSections]);

  const isCollapsed = useCallback((sectionId: string) => {
    return collapsedSections[sectionId] ?? defaultCollapsed;
  }, [collapsedSections, defaultCollapsed]);

  const expandAll = useCallback(() => {
    const allSections = Object.keys(collapsedSections);
    const updated: CollapsibleState = {};
    allSections.forEach(sectionId => {
      updated[sectionId] = false;
    });
    setCollapsedSections(updated);
  }, [collapsedSections, setCollapsedSections]);

  const collapseAll = useCallback(() => {
    const allSections = Object.keys(collapsedSections);
    const updated: CollapsibleState = {};
    allSections.forEach(sectionId => {
      updated[sectionId] = true;
    });
    setCollapsedSections(updated);
  }, [collapsedSections, setCollapsedSections]);

  const getCollapsedCount = useCallback(() => {
    return Object.values(collapsedSections).filter(Boolean).length;
  }, [collapsedSections]);

  const getExpandedCount = useCallback(() => {
    return Object.values(collapsedSections).filter(collapsed => !collapsed).length;
  }, [collapsedSections]);

  const getSectionIds = useCallback(() => {
    return Object.keys(collapsedSections);
  }, [collapsedSections]);

  const addSection = useCallback((sectionId: string, collapsed?: boolean) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: collapsed ?? defaultCollapsed
    }));
  }, [setCollapsedSections, defaultCollapsed]);

  const removeSection = useCallback((sectionId: string) => {
    setCollapsedSections(prev => {
      const { [sectionId]: removed, ...rest } = prev;
      return rest;
    });
  }, [setCollapsedSections]);

  return {
    collapsedSections,
    toggleSection,
    setSection,
    isCollapsed,
    expandAll,
    collapseAll,
    getCollapsedCount,
    getExpandedCount,
    getSectionIds,
    addSection,
    removeSection
  };
}