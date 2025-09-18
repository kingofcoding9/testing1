// Centralized icon mapping system for Minecraft Bedrock Creator Suite
// Maps semantic icon names to actual PNG file names

export const iconMap = {
  // Navigation Icons
  entityBuilder: 'armor_stand.png',
  blockBuilder: 'brick.png',
  itemBuilder: 'apple.png',
  recipeBuilder: 'anvil-hammer.png',
  lootBuilder: 'diamond.png',
  biomeBuilder: 'brick.png', // terrain/block representation
  spawnBuilder: 'egg.png',
  textureCreator: 'brush.png',
  scriptStudio: 'minecart_command_block.png',
  addonPackager: 'bundle.png',
  validator: 'book_enchanted.png',
  externalTools: 'anvil-crossout.png',
  documentation: 'book_normal.png',
  coreConcepts: 'book_portfolio.png',
  community: 'banner_pattern.png',
  omniScience: 'nether_star.png',
  
  // Action Icons
  add: 'arrow_large.png',
  remove: 'arrowLeft.png', 
  edit: 'book_writable.png',
  delete: 'brick.png', // block barrier representation
  settings: 'anvil-arrow.png',
  save: 'auto_save.png',
  export: 'auto_save.png',
  import: 'bundle.png',
  copy: 'book_written.png',
  download: 'bundle.png',
  folder: 'bundle.png', // folder icon for documentation
  
  // Tool Icons (TextureCreator)
  brush: 'brush.png',
  pencil: 'feather.png',
  eraser: 'clay_ball.png', // placeholder for eraser
  fill: 'bucket_water.png',
  rectangle: 'brick.png',
  circle: 'ender_pearl.png', // round object
  line: 'arrow.png',
  select: 'fishing_rod_uncast.png', // pointing tool
  
  // Feature Icons (Welcome page)
  dragon: 'egg_null.png', // entity icon
  blocks: 'brick.png',
  textures: 'brush.png',
  scripts: 'redstone_dust.png',
  docs: 'book_normal.png',
  packages: 'bundle.png',
  
  // External Tools
  blockbench: 'diamond_pickaxe.png', // modeling tool
  bridgeCore: 'bamboo_door.png', // bridge-like structure
  snowstorm: 'bucket_powder_snow.png', // particle effects/snow
  pixilart: 'brush.png', // pixel art editor
  
  // Category Icons (Registries)
  core: 'anvil-hammer.png', // ⚙️
  movement: 'gold_boots.png', // 🏃 movement/speed
  behavior: 'book_enchanted.png', // 🧠 intelligence/behavior
  interaction: 'carrot_golden.png', // 🤝 interaction/reward 
  environment: 'bamboo.png', // 🌍 nature/environment
  visual: 'brush.png', // 🎨
  utility: 'anvil-crossout.png', // 🔧
  physics: 'nether_star.png', // ⚛️ placeholder
  lighting: 'glowstone_dust.png', // 💡
  transformation: 'clock_item.png', // 🔄 placeholder
  redstone: 'redstone_dust.png', // 🔴
  placement: 'compass_item.png', // 📐 placeholder
  loot: 'diamond.png', // 💎
  states: 'comparator.png', // 🔢 placeholder
} as const;

// Type for all available icon names
export type IconName = keyof typeof iconMap;

// Helper function to get icon file name from semantic name
export function getIconPath(iconName: IconName): string {
  return iconMap[iconName];
}

// Validation helper to check if icon exists
export function isValidIcon(iconName: string): iconName is IconName {
  return iconName in iconMap;
}

// Development-time validation function to check if mapped files exist
export function validateIconMappings(): Promise<{ valid: boolean; missing: string[]; results: Record<string, boolean> }> {
  const results: Record<string, boolean> = {};
  const missing: string[] = [];
  
  const validationPromises = Object.entries(iconMap).map(async ([iconName, fileName]) => {
    try {
      const response = await fetch(`/icons/website-icons/${fileName}`, { method: 'HEAD' });
      const exists = response.ok;
      results[iconName] = exists;
      if (!exists) {
        missing.push(`${iconName} -> ${fileName}`);
      }
      return exists;
    } catch {
      results[iconName] = false;
      missing.push(`${iconName} -> ${fileName} (network error)`);
      return false;
    }
  });
  
  return Promise.all(validationPromises).then(validations => ({
    valid: validations.every(Boolean),
    missing,
    results
  }));
}

// Runtime icon existence check with fallback
export function getValidatedIconPath(iconName: IconName): string {
  const fileName = iconMap[iconName];
  
  // In development, warn about potential issues
  if (import.meta.env.DEV) {
    // Use a simple check without async for runtime usage
    const img = new Image();
    img.onerror = () => {
      console.warn(`Icon file not found: ${iconName} -> ${fileName}`);
    };
    img.src = `/icons/website-icons/${fileName}`;
  }
  
  return fileName;
}

// Type-safe icon validation
export function assertValidIcon(iconName: string): asserts iconName is IconName {
  if (!isValidIcon(iconName)) {
    throw new Error(`Invalid icon name: ${iconName}. Available icons: ${Object.keys(iconMap).join(', ')}`);
  }
}