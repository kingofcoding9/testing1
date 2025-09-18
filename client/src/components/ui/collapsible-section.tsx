import { ReactNode, KeyboardEvent } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CollapsibleSectionProps {
  /** Unique identifier for the section */
  id: string;
  /** Section title/label */
  title: string;
  /** Section content */
  children: ReactNode;
  /** Whether the section is collapsed */
  collapsed?: boolean;
  /** Callback when collapse state changes */
  onToggle?: (collapsed: boolean) => void;
  /** Optional description or subtitle */
  description?: string;
  /** Icon to display next to title */
  icon?: ReactNode;
  /** Badge content (e.g., count) */
  badge?: string | number;
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the trigger */
  triggerClassName?: string;
  /** Additional CSS classes for the content */
  contentClassName?: string;
  /** Whether to show the chevron icon */
  showChevron?: boolean;
  /** Custom chevron icons */
  chevronIcons?: {
    collapsed: ReactNode;
    expanded: ReactNode;
  };
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Whether to disable the section */
  disabled?: boolean;
  /** Test ID for the component */
  'data-testid'?: string;
}

/**
 * A reusable collapsible section component with consistent styling and behavior.
 * Supports localStorage persistence when used with useCollapsible hook.
 */
export function CollapsibleSection({
  id,
  title,
  children,
  collapsed = false,
  onToggle,
  description,
  icon,
  badge,
  badgeVariant = 'secondary',
  className,
  triggerClassName,
  contentClassName,
  showChevron = true,
  chevronIcons,
  animationDuration = 200,
  disabled = false,
  'data-testid': testId,
}: CollapsibleSectionProps) {
  const handleToggle = () => {
    if (disabled) return;
    onToggle?.(!collapsed);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    // Support Enter and Space for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  const defaultChevronIcons = {
    collapsed: <ChevronRight className="w-4 h-4" />,
    expanded: <ChevronDown className="w-4 h-4" />
  };

  const activeChevronIcons = chevronIcons || defaultChevronIcons;

  return (
    <Collapsible 
      open={!collapsed} 
      onOpenChange={(open) => onToggle?.(!open)}
      className={cn(
        "group",
        className
      )}
      data-testid={testId}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-between p-3 h-auto",
            "hover:bg-muted/50 transition-colors duration-200",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            disabled && "opacity-50 cursor-not-allowed",
            triggerClassName
          )}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          data-testid={testId ? `${testId}-trigger` : `collapsible-trigger-${id}`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1 text-left">
            {/* Chevron */}
            {showChevron && (
              <div className={cn(
                "flex-shrink-0 transition-transform duration-200",
                !collapsed && "rotate-0",
                collapsed && "-rotate-90"
              )}>
                {collapsed ? activeChevronIcons.collapsed : activeChevronIcons.expanded}
              </div>
            )}

            {/* Icon */}
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}

            {/* Title and description */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground text-sm leading-tight truncate">
                  {title}
                </h3>
                {badge !== undefined && (
                  <Badge 
                    variant={badgeVariant}
                    className="text-xs flex-shrink-0"
                    data-testid={testId ? `${testId}-badge` : `collapsible-badge-${id}`}
                  >
                    {badge}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {description}
                </p>
              )}
            </div>
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent 
        className={cn(
          "overflow-hidden transition-all duration-200",
          "data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
          contentClassName
        )}
        style={{
          '--collapsible-animation-duration': `${animationDuration}ms`
        } as React.CSSProperties}
        data-testid={testId ? `${testId}-content` : `collapsible-content-${id}`}
      >
        <div className="pt-2 pb-1 px-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export interface CollapsibleGroupProps {
  /** Group title */
  title?: string;
  /** Group description */
  description?: string;
  /** Whether to show expand/collapse all controls */
  showControls?: boolean;
  /** Callback for expand all */
  onExpandAll?: () => void;
  /** Callback for collapse all */
  onCollapseAll?: () => void;
  /** Number of collapsed sections */
  collapsedCount?: number;
  /** Number of expanded sections */
  expandedCount?: number;
  /** Children (CollapsibleSection components) */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Test ID for the component */
  'data-testid'?: string;
}

/**
 * A container component for grouping collapsible sections with optional controls.
 */
export function CollapsibleGroup({
  title,
  description,
  showControls = false,
  onExpandAll,
  onCollapseAll,
  collapsedCount = 0,
  expandedCount = 0,
  children,
  className,
  'data-testid': testId,
}: CollapsibleGroupProps) {
  return (
    <div className={cn("space-y-2", className)} data-testid={testId}>
      {(title || showControls) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <div>
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
          
          {showControls && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {expandedCount} expanded, {collapsedCount} collapsed
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onExpandAll}
                  disabled={expandedCount === expandedCount + collapsedCount}
                  data-testid={testId ? `${testId}-expand-all` : 'expand-all'}
                >
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCollapseAll}
                  disabled={collapsedCount === expandedCount + collapsedCount}
                  data-testid={testId ? `${testId}-collapse-all` : 'collapse-all'}
                >
                  Collapse All
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}