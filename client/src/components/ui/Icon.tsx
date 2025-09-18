import { cn } from "@/lib/utils";

// Icon size variants
export type IconSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | 'nav' | 'toolbar' | 'tab' | 'action';

const sizeClasses: Record<IconSize, string> = {
  xs: 'w-3 h-3', // 12px
  sm: 'w-4 h-4', // 16px  
  base: 'w-5 h-5', // 20px
  lg: 'w-6 h-6', // 24px
  xl: 'w-8 h-8', // 32px
  nav: 'w-6 h-6', // 24px for navigation
  toolbar: 'w-5 h-5', // 20px for toolbar
  tab: 'w-4 h-4', // 18px for tabs (using 16px as closest)
  action: 'w-4 h-4', // 16px for actions
};

export interface IconProps {
  name: string;
  size?: IconSize;
  className?: string;
  alt?: string;
}

/**
 * Centralized Icon component for displaying custom Minecraft icons
 * Handles proper scaling and loading for 16x16 pixel art icons
 */
export function Icon({ name, size = 'base', className, alt }: IconProps) {
  return (
    <img
      src={`/icons/website-icons/${name}`}
      alt={alt || name.replace('.png', '').replace(/[-_]/g, ' ')}
      className={cn(
        sizeClasses[size],
        'object-contain',
        className
      )}
      style={{
        imageRendering: 'pixelated', // Ensure crisp pixel art display
        WebkitImageRendering: '-webkit-optimize-contrast',
        MozImageRendering: '-moz-crisp-edges',
      }}
      data-testid={`icon-${name.replace('.png', '')}`}
    />
  );
}

export default Icon;