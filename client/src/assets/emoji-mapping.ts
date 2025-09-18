// Emoji mapping system for Minecraft Bedrock Creator Suite
// Maps semantic icon names to appropriate emoji equivalents

export const emojiMap = {
  // Navigation Icons
  entityBuilder: '🏃', // entity/character
  blockBuilder: '🧱', // blocks/building
  itemBuilder: '🍎', // items/objects
  recipeBuilder: '⚒️', // crafting/tools
  lootBuilder: '💎', // treasure/loot
  biomeBuilder: '🌍', // world/environment
  spawnBuilder: '🥚', // spawning/birth
  textureCreator: '🎨', // pixel art/creativity
  scriptStudio: '💻', // coding/programming
  addonPackager: '📦', // packaging/export
  validator: '✅', // validation/checking
  externalTools: '🔗', // external links
  documentation: '📖', // documentation/books
  coreConcepts: '📚', // core concepts/books
  community: '👥', // community/people
  omniScience: '⭐', // star/special
  
  // Action Icons
  add: '➕', // add/plus
  remove: '➖', // remove/minus
  edit: '✏️', // edit/pencil
  delete: '🗑️', // delete/trash
  settings: '⚙️', // settings/gear
  save: '💾', // save/disk
  export: '📤', // export/upload
  import: '📥', // import/download
  copy: '📋', // copy/clipboard
  download: '⬇️', // download/arrow down
  folder: '📁', // folder
  
  // Tool Icons (TextureCreator)
  brush: '🖌️', // brush/paint
  pencil: '✏️', // pencil/edit
  eraser: '🧽', // eraser/sponge
  fill: '🪣', // fill/bucket
  rectangle: '🔲', // rectangle/square
  circle: '⭕', // circle
  line: '📏', // line/ruler
  select: '👆', // select/pointer
  
  // Feature Icons (Welcome page)
  dragon: '🐉', // entity/dragon
  blocks: '🧱', // blocks
  textures: '🎨', // textures/art
  scripts: '📜', // scripts/code
  docs: '📖', // documentation
  packages: '📦', // packages/bundles
  
  // External Tools
  blockbench: '🎯', // modeling/precision tool
  bridgeCore: '🌉', // bridge/connection
  snowstorm: '❄️', // particles/effects
  pixilart: '🎨', // pixel art/creativity
  structureEditor: '🏗️', // structure/building
  lootTabler: '📊', // tables/data/analysis
  dialogueEditor: '💬', // conversation/dialogue/chat
  
  // Category Icons (Registries)
  core: '⚙️', // core/settings
  movement: '🏃', // movement/speed
  behavior: '🧠', // intelligence/behavior
  interaction: '🤝', // interaction/handshake
  environment: '🌍', // nature/environment
  visual: '🎨', // visual/art
  utility: '🔧', // utility/tools
  physics: '⚛️', // physics/atom
  lighting: '💡', // lighting/bulb
  transformation: '🔄', // transformation/cycle
  redstone: '🔴', // redstone/red circle
  placement: '📐', // placement/ruler
  loot: '💎', // loot/gem
  states: '🔢', // states/numbers
} as const;

// Type for all available emoji names
export type EmojiName = keyof typeof emojiMap;

// Helper function to get emoji from semantic name
export function getEmoji(iconName: EmojiName): string {
  return emojiMap[iconName];
}

// Validation helper to check if emoji mapping exists
export function isValidEmojiName(iconName: string): iconName is EmojiName {
  return iconName in emojiMap;
}

// Get emoji with fallback
export function getEmojiWithFallback(iconName: string, fallback: string = '❓'): string {
  if (isValidEmojiName(iconName)) {
    return emojiMap[iconName];
  }
  console.warn(`No emoji mapping found for: ${iconName}`);
  return fallback;
}