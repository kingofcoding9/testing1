import { ReactNode, useState, useCallback } from 'react';
import { ChevronDown, ChevronRight, MoreHorizontal, Minimize2, Maximize2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCollapsible } from '@/hooks/useCollapsible';
import { cn } from '@/lib/utils';

export interface CollapsibleTab {
  /** Unique identifier for the tab */
  id: string;
  /** Tab title/label */
  title: string;
  /** Tab content */
  content: ReactNode;
  /** Optional description */
  description?: string;
  /** Icon to display next to title */
  icon?: ReactNode;
  /** Badge content (e.g., count) */
  badge?: string | number;
  /** Whether this tab is collapsible */
  collapsible?: boolean;
  /** Whether to disable this tab */
  disabled?: boolean;
}

export interface CollapsibleTabsContainerProps {
  /** Array of tab definitions */
  tabs: CollapsibleTab[];
  /** Currently active tab ID */
  activeTab?: string;
  /** Callback when active tab changes */
  onActiveTabChange?: (tabId: string) => void;
  /** Storage key for localStorage persistence */
  storageKey: string;
  /** Container title */
  title?: string;
  /** Container description */
  description?: string;
  /** Whether to show global expand/collapse controls */
  showGlobalControls?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether to show content in collapsed state (as preview) */
  showCollapsedPreview?: boolean;
  /** Test ID for the component */
  'data-testid'?: string;
}

/**
 * A container component that makes individual tabs collapsible while maintaining the tab interface.
 * Integrates with the existing tab system and provides localStorage persistence.
 */
export function CollapsibleTabsContainer({
  tabs,
  activeTab,
  onActiveTabChange,
  storageKey,
  title,
  description,
  showGlobalControls = true,
  className,
  showCollapsedPreview = false,
  'data-testid': testId,
}: CollapsibleTabsContainerProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.id || '');
  const currentActiveTab = activeTab || internalActiveTab;

  // Initialize collapsible state for all collapsible tabs
  const collapsibleTabIds = tabs.filter(tab => tab.collapsible !== false).map(tab => tab.id);
  const collapsible = useCollapsible({
    storageKey: `tabs-${storageKey}`,
    defaultCollapsed: false,
    initialSections: collapsibleTabIds
  });

  const handleTabChange = useCallback((tabId: string) => {
    if (onActiveTabChange) {
      onActiveTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  }, [onActiveTabChange]);

  const renderTabContent = (tab: CollapsibleTab) => {
    if (tab.collapsible === false) {
      // Non-collapsible tab - render content directly
      return (
        <div className="p-4" data-testid={`tab-content-${tab.id}`}>
          {tab.content}
        </div>
      );
    }

    const isCollapsed = collapsible.isCollapsed(tab.id);

    return (
      <Collapsible
        open={!isCollapsed}
        onOpenChange={(open) => collapsible.setSection(tab.id, !open)}
        data-testid={`collapsible-tab-${tab.id}`}
      >
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between p-4 h-auto rounded-none border-b",
              "hover:bg-muted/50 transition-colors duration-200",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            data-testid={`tab-collapse-trigger-${tab.id}`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1 text-left">
              {/* Tab icon */}
              {tab.icon && (
                <div className="flex-shrink-0">
                  {tab.icon}
                </div>
              )}

              {/* Title and description */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground text-sm leading-tight truncate">
                    {tab.title}
                  </h3>
                  {tab.badge !== undefined && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
                      {tab.badge}
                    </Badge>
                  )}
                </div>
                {tab.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {tab.description}
                  </p>
                )}
                {isCollapsed && showCollapsedPreview && (
                  <p className="text-xs text-muted-foreground mt-1 opacity-70">
                    Click to expand content...
                  </p>
                )}
              </div>
            </div>

            {/* Chevron */}
            <div className={cn(
              "flex-shrink-0 transition-transform duration-200",
              isCollapsed ? "rotate-0" : "rotate-180"
            )}>
              <ChevronDown className="w-4 h-4" />
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent 
          className="overflow-hidden transition-all duration-200 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
          data-testid={`tab-collapsible-content-${tab.id}`}
        >
          <div className="p-4 pt-0">
            {tab.content}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <TooltipProvider>
      <div className={cn("w-full", className)} data-testid={testId}>
        {/* Header with title and controls */}
        {(title || showGlobalControls) && (
          <div className="flex items-center justify-between mb-4 p-4 bg-muted/30 rounded-t-lg border">
            {title && (
              <div>
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            )}
            
            {showGlobalControls && collapsibleTabIds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {collapsible.getExpandedCount()} expanded, {collapsible.getCollapsedCount()} collapsed
                </span>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={collapsible.expandAll}
                        disabled={collapsible.getCollapsedCount() === 0}
                        data-testid={`${testId}-expand-all`}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Expand all tabs</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={collapsible.collapseAll}
                        disabled={collapsible.getExpandedCount() === 0}
                        data-testid={`${testId}-collapse-all`}
                      >
                        <Minimize2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Collapse all tabs</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabs container */}
        <Card className="overflow-hidden">
          <Tabs value={currentActiveTab} onValueChange={handleTabChange}>
            {/* Tab navigation */}
            <CardHeader className="p-0">
              <TabsList className="grid w-full h-auto bg-transparent p-0 rounded-none border-b">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    disabled={tab.disabled}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 rounded-none border-r last:border-r-0",
                      "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                      "data-[state=active]:border-b-2 data-[state=active]:border-primary"
                    )}
                    data-testid={`tab-trigger-${tab.id}`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.title}</span>
                    {tab.badge !== undefined && (
                      <Badge variant="secondary" className="text-xs">
                        {tab.badge}
                      </Badge>
                    )}
                    {tab.collapsible !== false && (
                      <div className="ml-auto">
                        {collapsible.isCollapsed(tab.id) ? (
                          <ChevronRight className="w-3 h-3 opacity-50" />
                        ) : (
                          <ChevronDown className="w-3 h-3 opacity-50" />
                        )}
                      </div>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardHeader>

            {/* Tab content */}
            <CardContent className="p-0">
              {tabs.map((tab) => (
                <TabsContent 
                  key={tab.id} 
                  value={tab.id}
                  className="m-0 border-0 ring-0 focus-visible:ring-0"
                  data-testid={`tab-panel-${tab.id}`}
                >
                  {renderTabContent(tab)}
                </TabsContent>
              ))}
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </TooltipProvider>
  );
}

/**
 * A simplified collapsible tab container for when you don't need the full tab interface,
 * just collapsible sections that look like tabs.
 */
export interface SimpleCollapsibleTabsProps {
  /** Array of tab definitions */
  tabs: CollapsibleTab[];
  /** Storage key for localStorage persistence */
  storageKey: string;
  /** Container title */
  title?: string;
  /** Container description */
  description?: string;
  /** Whether to show global expand/collapse controls */
  showGlobalControls?: boolean;
  /** Additional CSS classes for the container */
  className?: string;
  /** Test ID for the component */
  'data-testid'?: string;
}

export function SimpleCollapsibleTabs({
  tabs,
  storageKey,
  title,
  description,
  showGlobalControls = true,
  className,
  'data-testid': testId,
}: SimpleCollapsibleTabsProps) {
  const collapsible = useCollapsible({
    storageKey: `simple-tabs-${storageKey}`,
    defaultCollapsed: false,
    initialSections: tabs.map(tab => tab.id)
  });

  return (
    <TooltipProvider>
      <div className={cn("w-full space-y-2", className)} data-testid={testId}>
        {/* Header with title and controls */}
        {(title || showGlobalControls) && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <div>
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
            )}
            
            {showGlobalControls && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {collapsible.getExpandedCount()} expanded, {collapsible.getCollapsedCount()} collapsed
                </span>
                <div className="flex gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={collapsible.expandAll}
                        disabled={collapsible.getCollapsedCount() === 0}
                        data-testid={`${testId}-expand-all`}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Expand all sections</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={collapsible.collapseAll}
                        disabled={collapsible.getExpandedCount() === 0}
                        data-testid={`${testId}-collapse-all`}
                      >
                        <Minimize2 className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Collapse all sections</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Simple collapsible sections */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <Card key={tab.id} className="overflow-hidden">
              <Collapsible
                open={!collapsible.isCollapsed(tab.id)}
                onOpenChange={(open) => collapsible.setSection(tab.id, !open)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between p-4 h-auto rounded-none",
                      "hover:bg-muted/50 transition-colors duration-200",
                      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    )}
                    disabled={tab.disabled}
                    data-testid={`simple-tab-trigger-${tab.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 text-left">
                      {tab.icon && (
                        <div className="flex-shrink-0">
                          {tab.icon}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-foreground text-sm leading-tight truncate">
                            {tab.title}
                          </h3>
                          {tab.badge !== undefined && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {tab.badge}
                            </Badge>
                          )}
                        </div>
                        {tab.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {tab.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={cn(
                      "flex-shrink-0 transition-transform duration-200",
                      collapsible.isCollapsed(tab.id) ? "rotate-0" : "rotate-180"
                    )}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden transition-all duration-200">
                  <div className="p-4 pt-0 border-t">
                    {tab.content}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}