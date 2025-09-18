import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { 
  Copy, 
  Download, 
  Play, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  ChevronLeft, 
  Book, 
  Code2, 
  Zap, 
  FileCode, 
  Settings,
  Package,
  FunctionSquare,
  Layers,
  X,
  Plus,
  Filter,
  Star,
  Box,
  Target,
  Cpu,
  Maximize2,
  Minimize2,
  Save,
  RotateCcw,
  Terminal,
  Lightbulb
} from "lucide-react";
import Editor from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import { useCollapsible } from "@/hooks/useCollapsible";
import { CollapsibleSection, CollapsibleGroup } from "@/components/ui/collapsible-section";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CodePreview from "@/components/Common/CodePreview";
import { minecraftRegistry } from "@shared/minecraftRegistry";
import { cn } from "@/lib/utils";

// Types for the enhanced Script Studio
interface ScriptTab {
  id: string;
  name: string;
  content: string;
  language: 'javascript' | 'typescript';
}

interface SelectedElement {
  id: string;
  name: string;
  type: string;
  module: string;
  element: any;
}

interface ParameterValues {
  [paramName: string]: string;
}

interface FilterState {
  modules: string[];
  types: string[];
  complexity: 'all' | 'beginner' | 'intermediate' | 'advanced';
  favorites: boolean;
}

interface AutocompleteItem {
  label: string;
  kind: Monaco.languages.CompletionItemKind;
  detail?: string;
  documentation?: string;
  insertText: string;
  range: Monaco.IRange;
}

interface MonacoEditorRef {
  editor: Monaco.editor.IStandaloneCodeEditor | null;
  monaco: typeof Monaco | null;
}

export default function ScriptStudio() {
  // Core state
  const [scripts, setScripts] = useState<ScriptTab[]>([
    { 
      id: "1", 
      name: "Main Script", 
      content: `// Welcome to the enhanced Script Studio!
// Professional Monaco Editor with intelligent autocomplete

import { world } from '@minecraft/server';

// Start typing to see VS Code-style suggestions
// Try typing "world." to see available methods
world.sendMessage("Hello from Script Studio!");

// The editor now features:
// ✓ Syntax highlighting
// ✓ Intelligent autocomplete with 476+ API elements  
// ✓ Parameter hints and type information
// ✓ JSDoc documentation in suggestions
// ✓ Error detection and warnings
// ✓ Bracket matching and auto-closing

`, 
      language: "typescript" 
    }
  ]);
  const [activeScriptId, setActiveScriptId] = useState("1");
  const [editorExpanded, setEditorExpanded] = useState(false);
  const editorRef = useRef<MonacoEditorRef>({ editor: null, monaco: null });
  
  // Browser state
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(["@minecraft/server"]));
  const [expandedElements, setExpandedElements] = useState<Set<string>>(new Set());
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    modules: [],
    types: [],
    complexity: 'all',
    favorites: false
  });
  
  // Parameter state
  const [parameterValues, setParameterValues] = useState<ParameterValues>({});
  const [showParameterHelper, setShowParameterHelper] = useState(true);
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [documentationOpen, setDocumentationOpen] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Process registry data
  const registryData = useMemo(() => {
    const modules = Object.keys(minecraftRegistry.modules);
    const elements = Object.values(minecraftRegistry.modules).flatMap(module => module.elements || []);
    
    // Group elements by type and module
    const elementsByModule = modules.reduce((acc, moduleName) => {
      const moduleData = minecraftRegistry.modules[moduleName as keyof typeof minecraftRegistry.modules];
      if (moduleData) {
        acc[moduleName] = {
          ...moduleData,
          elementsByType: (moduleData.elements || []).reduce((typeAcc: any, element: any) => {
            if (!typeAcc[element.type]) typeAcc[element.type] = [];
            typeAcc[element.type].push(element);
            return typeAcc;
          }, {})
        };
      }
      return acc;
    }, {} as any);

    return {
      modules,
      elements,
      elementsByModule,
      totalElements: elements.length
    };
  }, []);

  // Monaco Editor setup and autocomplete provider
  const setupMonacoEditor = useCallback((editor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) => {
    editorRef.current = { editor, monaco };

    // Add comprehensive TypeScript definitions for Minecraft Bedrock APIs
    const minecraftServerTypes = `
// Minecraft Server API Type Definitions
declare module "@minecraft/server" {
  /**
   * Represents the world and its properties.
   */
  export class World {
    /**
     * Sends a message to all players in the world.
     * @param message - The message to send
     */
    sendMessage(message: string): void;
    
    /**
     * Gets all players currently in the world.
     */
    getAllPlayers(): Player[];
    
    /**
     * Gets a player by name.
     * @param name - Player name
     */
    getPlayers(options?: { name?: string }): Player[];
    
    /**
     * Gets the default spawn location for the world.
     */
    getDefaultSpawnLocation(): Vector3;
    
    /**
     * Gets all entities in the world.
     */
    getEntities(options?: EntityQueryOptions): Entity[];
    
    /**
     * Gets the current time of day.
     */
    getTimeOfDay(): number;
    
    /**
     * Sets the time of day.
     */
    setTimeOfDay(timeOfDay: number): void;
    
    /**
     * Event system for world events.
     */
    afterEvents: WorldAfterEvents;
    beforeEvents: WorldBeforeEvents;
  }
  
  /**
   * Represents a player in the game.
   */
  export class Player extends Entity {
    /**
     * The player's name.
     */
    readonly name: string;
    
    /**
     * Whether the player is an operator.
     */
    readonly isOp: boolean;
    
    /**
     * Sends a message to this player.
     */
    sendMessage(message: string): void;
    
    /**
     * Kicks the player from the server.
     */
    kick(reason?: string): void;
    
    /**
     * Teleports the player to a location.
     */
    teleport(location: Vector3, teleportOptions?: TeleportOptions): void;
    
    /**
     * Runs a command as this player.
     */
    runCommand(commandString: string): CommandResult;
  }
  
  /**
   * Base class for all entities.
   */
  export class Entity {
    /**
     * Unique identifier for the entity.
     */
    readonly id: string;
    
    /**
     * Current location of the entity.
     */
    readonly location: Vector3;
    
    /**
     * Current velocity of the entity.
     */
    readonly velocity: Vector3;
    
    /**
     * The entity's rotation.
     */
    readonly rotation: Vector2;
    
    /**
     * Whether the entity is valid and exists.
     */
    readonly isValid: boolean;
    
    /**
     * The entity's dimension.
     */
    readonly dimension: Dimension;
    
    /**
     * Teleports the entity to a location.
     */
    teleport(location: Vector3, teleportOptions?: TeleportOptions): void;
    
    /**
     * Removes the entity from the world.
     */
    remove(): void;
    
    /**
     * Runs a command as this entity.
     */
    runCommand(commandString: string): CommandResult;
    
    /**
     * Gets a component from the entity.
     */
    getComponent<T extends keyof EntityComponentMap>(componentId: T): EntityComponentMap[T] | undefined;
    
    /**
     * Checks if entity has a component.
     */
    hasComponent<T extends keyof EntityComponentMap>(componentId: T): boolean;
  }
  
  /**
   * Represents a dimension (Overworld, Nether, End).
   */
  export class Dimension {
    /**
     * Identifier for this dimension.
     */
    readonly id: string;
    
    /**
     * Gets a block at the specified location.
     */
    getBlock(location: Vector3): Block | undefined;
    
    /**
     * Sets a block at the specified location.
     */
    setBlockType(location: Vector3, blockType: BlockType): void;
    
    /**
     * Gets all entities in this dimension.
     */
    getEntities(options?: EntityQueryOptions): Entity[];
    
    /**
     * Spawns an entity at the specified location.
     */
    spawnEntity(identifier: string, location: Vector3): Entity;
  }
  
  /**
   * Represents a block in the world.
   */
  export class Block {
    /**
     * Location of this block.
     */
    readonly location: Vector3;
    
    /**
     * The block type.
     */
    readonly type: BlockType;
    
    /**
     * The dimension this block is in.
     */
    readonly dimension: Dimension;
    
    /**
     * Whether this block is valid.
     */
    readonly isValid: boolean;
  }
  
  /**
   * Represents a block type.
   */
  export class BlockType {
    /**
     * Identifier for this block type.
     */
    readonly id: string;
  }
  
  // Common interfaces and types
  export interface Vector3 {
    x: number;
    y: number;
    z: number;
  }
  
  export interface Vector2 {
    x: number;
    y: number;
  }
  
  export interface EntityQueryOptions {
    type?: string;
    name?: string;
    location?: Vector3;
    maxDistance?: number;
    minDistance?: number;
  }
  
  export interface TeleportOptions {
    dimension?: Dimension;
    rotation?: Vector2;
    facingLocation?: Vector3;
    checkForBlocks?: boolean;
    keepVelocity?: boolean;
  }
  
  export interface CommandResult {
    successCount: number;
  }
  
  export interface EntityComponentMap {
    "minecraft:health": HealthComponent;
    "minecraft:inventory": InventoryComponent;
    "minecraft:movement": MovementComponent;
  }
  
  export class HealthComponent {
    readonly currentValue: number;
    readonly defaultValue: number;
    readonly effectiveMax: number;
    readonly effectiveMin: number;
    resetToDefaultValue(): void;
    resetToMaxValue(): void;
    resetToMinValue(): void;
    setCurrentValue(value: number): void;
  }
  
  export class InventoryComponent {
    readonly additionalSlotsPerStrength: number;
    readonly canBeSiphonedFrom: boolean;
    readonly container: Container;
    readonly containerType: string;
    readonly inventorySize: number;
    readonly private: boolean;
    readonly restrictToOwner: boolean;
  }
  
  export class MovementComponent {
    readonly maxTurn: number;
    readonly value: number;
    setCurrent(value: number): void;
  }
  
  export class Container {
    readonly emptySlotsCount: number;
    readonly size: number;
    addItem(itemStack: ItemStack): ItemStack | undefined;
    getItem(slot: number): ItemStack | undefined;
    setItem(slot: number, itemStack?: ItemStack): void;
    swapItems(slot: number, otherSlot: number, otherContainer: Container): void;
    transferItem(fromSlot: number, toSlot: number, toContainer: Container): ItemStack | undefined;
  }
  
  export class ItemStack {
    readonly amount: number;
    readonly isStackable: boolean;
    readonly keepOnDeath: boolean;
    readonly lockMode: ItemLockMode;
    readonly maxAmount: number;
    readonly nameTag?: string;
    readonly type: ItemType;
    readonly typeId: string;
  }
  
  export class ItemType {
    readonly id: string;
  }
  
  export enum ItemLockMode {
    inventory = "inventory",
    none = "none",
    slot = "slot"
  }
  
  // Event system interfaces
  export interface WorldAfterEvents {
    playerJoin: PlayerJoinAfterEventSignal;
    playerLeave: PlayerLeaveAfterEventSignal;
    entitySpawn: EntitySpawnAfterEventSignal;
    blockBreak: BlockBreakAfterEventSignal;
    blockPlace: BlockPlaceAfterEventSignal;
    itemUse: ItemUseAfterEventSignal;
    buttonPush: ButtonPushAfterEventSignal;
    leverAction: LeverActionAfterEventSignal;
  }
  
  export interface WorldBeforeEvents {
    playerJoin: PlayerJoinBeforeEventSignal;
    playerLeave: PlayerLeaveBeforeEventSignal;
    entitySpawn: EntitySpawnBeforeEventSignal;
    blockBreak: BlockBreakBeforeEventSignal;
    blockPlace: BlockPlaceBeforeEventSignal;
    itemUse: ItemUseBeforeEventSignal;
  }
  
  export interface PlayerJoinAfterEventSignal {
    subscribe(callback: (event: PlayerJoinAfterEvent) => void): (event: PlayerJoinAfterEvent) => void;
    unsubscribe(callback: (event: PlayerJoinAfterEvent) => void): void;
  }
  
  export interface PlayerJoinAfterEvent {
    readonly player: Player;
    readonly playerId: string;
    readonly playerName: string;
  }
  
  export interface PlayerLeaveAfterEventSignal {
    subscribe(callback: (event: PlayerLeaveAfterEvent) => void): (event: PlayerLeaveAfterEvent) => void;
    unsubscribe(callback: (event: PlayerLeaveAfterEvent) => void): void;
  }
  
  export interface PlayerLeaveAfterEvent {
    readonly playerId: string;
    readonly playerName: string;
  }
  
  export interface EntitySpawnAfterEventSignal {
    subscribe(callback: (event: EntitySpawnAfterEvent) => void): (event: EntitySpawnAfterEvent) => void;
    unsubscribe(callback: (event: EntitySpawnAfterEvent) => void): void;
  }
  
  export interface EntitySpawnAfterEvent {
    readonly entity: Entity;
    readonly cause: EntityInitializationCause;
  }
  
  export enum EntityInitializationCause {
    Born = "Born",
    Event = "Event",
    Loaded = "Loaded",
    Spawned = "Spawned",
    Transformed = "Transformed"
  }
  
  export interface BlockBreakAfterEventSignal {
    subscribe(callback: (event: BlockBreakAfterEvent) => void): (event: BlockBreakAfterEvent) => void;
    unsubscribe(callback: (event: BlockBreakAfterEvent) => void): void;
  }
  
  export interface BlockBreakAfterEvent {
    readonly block: Block;
    readonly brokenBlockPermutation: BlockPermutation;
    readonly dimension: Dimension;
    readonly player?: Player;
  }
  
  export interface BlockPlaceAfterEventSignal {
    subscribe(callback: (event: BlockPlaceAfterEvent) => void): (event: BlockPlaceAfterEvent) => void;
    unsubscribe(callback: (event: BlockPlaceAfterEvent) => void): void;
  }
  
  export interface BlockPlaceAfterEvent {
    readonly block: Block;
    readonly dimension: Dimension;
    readonly player?: Player;
  }
  
  export interface ItemUseAfterEventSignal {
    subscribe(callback: (event: ItemUseAfterEvent) => void): (event: ItemUseAfterEvent) => void;
    unsubscribe(callback: (event: ItemUseAfterEvent) => void): void;
  }
  
  export interface ItemUseAfterEvent {
    readonly itemStack: ItemStack;
    readonly player: Player;
    readonly source: Entity;
  }
  
  export interface ButtonPushAfterEventSignal {
    subscribe(callback: (event: ButtonPushAfterEvent) => void): (event: ButtonPushAfterEvent) => void;
    unsubscribe(callback: (event: ButtonPushAfterEvent) => void): void;
  }
  
  export interface ButtonPushAfterEvent {
    readonly block: Block;
    readonly dimension: Dimension;
    readonly source: Entity;
  }
  
  export interface LeverActionAfterEventSignal {
    subscribe(callback: (event: LeverActionAfterEvent) => void): (event: LeverActionAfterEvent) => void;
    unsubscribe(callback: (event: LeverActionAfterEvent) => void): void;
  }
  
  export interface LeverActionAfterEvent {
    readonly block: Block;
    readonly dimension: Dimension;
    readonly isPowered: boolean;
    readonly player: Player;
  }
  
  // Before event signal interfaces (similar structure)
  export interface PlayerJoinBeforeEventSignal {
    subscribe(callback: (event: PlayerJoinBeforeEvent) => void): (event: PlayerJoinBeforeEvent) => void;
    unsubscribe(callback: (event: PlayerJoinBeforeEvent) => void): void;
  }
  
  export interface PlayerJoinBeforeEvent {
    readonly player: Player;
    readonly playerId: string;
    readonly playerName: string;
    cancel: boolean;
  }
  
  export interface PlayerLeaveBeforeEventSignal {
    subscribe(callback: (event: PlayerLeaveBeforeEvent) => void): (event: PlayerLeaveBeforeEvent) => void;
    unsubscribe(callback: (event: PlayerLeaveBeforeEvent) => void): void;
  }
  
  export interface PlayerLeaveBeforeEvent {
    readonly player: Player;
    readonly playerId: string;
    readonly playerName: string;
    cancel: boolean;
  }
  
  export interface EntitySpawnBeforeEventSignal {
    subscribe(callback: (event: EntitySpawnBeforeEvent) => void): (event: EntitySpawnBeforeEvent) => void;
    unsubscribe(callback: (event: EntitySpawnBeforeEvent) => void): void;
  }
  
  export interface EntitySpawnBeforeEvent {
    readonly entity: Entity;
    readonly cause: EntityInitializationCause;
    cancel: boolean;
  }
  
  export interface BlockBreakBeforeEventSignal {
    subscribe(callback: (event: BlockBreakBeforeEvent) => void): (event: BlockBreakBeforeEvent) => void;
    unsubscribe(callback: (event: BlockBreakBeforeEvent) => void): void;
  }
  
  export interface BlockBreakBeforeEvent {
    readonly block: Block;
    readonly dimension: Dimension;
    readonly itemStack?: ItemStack;
    readonly player?: Player;
    cancel: boolean;
  }
  
  export interface BlockPlaceBeforeEventSignal {
    subscribe(callback: (event: BlockPlaceBeforeEvent) => void): (event: BlockPlaceBeforeEvent) => void;
    unsubscribe(callback: (event: BlockPlaceBeforeEvent) => void): void;
  }
  
  export interface BlockPlaceBeforeEvent {
    readonly block: Block;
    readonly dimension: Dimension;
    readonly face: Direction;
    readonly faceLocation: Vector3;
    readonly itemStack: ItemStack;
    readonly player?: Player;
    cancel: boolean;
  }
  
  export interface ItemUseBeforeEventSignal {
    subscribe(callback: (event: ItemUseBeforeEvent) => void): (event: ItemUseBeforeEvent) => void;
    unsubscribe(callback: (event: ItemUseBeforeEvent) => void): void;
  }
  
  export interface ItemUseBeforeEvent {
    readonly itemStack: ItemStack;
    readonly player: Player;
    readonly source: Entity;
    cancel: boolean;
  }
  
  export class BlockPermutation {
    readonly type: BlockType;
    getAllStates(): Record<string, string | number | boolean>;
    getState(stateName: string): string | number | boolean | undefined;
    getTags(): string[];
    hasTag(tag: string): boolean;
    matches(blockName: string, states?: Record<string, string | number | boolean>): boolean;
    withState(name: string, value: string | number | boolean): BlockPermutation;
  }
  
  export enum Direction {
    Down = 0,
    Up = 1,
    North = 2,
    South = 3,
    West = 4,
    East = 5
  }
  
  // Global world instance
  export const world: World;
  
  // System utilities
  export namespace system {
    /**
     * Runs a function after a specified number of ticks.
     */
    export function runTimeout(callback: () => void, tickDelay?: number): number;
    
    /**
     * Runs a function at a specified interval.
     */
    export function runInterval(callback: () => void, tickInterval?: number): number;
    
    /**
     * Clears a timeout or interval.
     */
    export function clearRun(runId: number): void;
    
    /**
     * Gets the current tick.
     */
    export function currentTick: number;
  }
}
`;

    const minecraftServerUITypes = `
// Minecraft Server UI API Type Definitions
declare module "@minecraft/server-ui" {
  /**
   * Base class for all forms.
   */
  export abstract class FormData {
    /**
     * Whether the form was canceled.
     */
    readonly canceled: boolean;
  }
  
  /**
   * Represents a simple action form with buttons.
   */
  export class ActionFormData {
    /**
     * Creates a new ActionFormData.
     */
    constructor();
    
    /**
     * Adds a button to the form.
     */
    button(text: string, iconPath?: string): ActionFormData;
    
    /**
     * Sets the body text of the form.
     */
    body(bodyText: string): ActionFormData;
    
    /**
     * Sets the title of the form.
     */
    title(titleText: string): ActionFormData;
    
    /**
     * Shows the form to a player.
     */
    show(player: Player): Promise<ActionFormResponse>;
  }
  
  /**
   * Response from an action form.
   */
  export interface ActionFormResponse extends FormData {
    /**
     * Index of the selected button, or undefined if canceled.
     */
    readonly selection?: number;
  }
  
  /**
   * Represents a modal form with text fields and toggles.
   */
  export class ModalFormData {
    /**
     * Creates a new ModalFormData.
     */
    constructor();
    
    /**
     * Adds a dropdown field to the form.
     */
    dropdown(label: string, options: string[], defaultValueIndex?: number): ModalFormData;
    
    /**
     * Adds a slider field to the form.
     */
    slider(label: string, minimumValue: number, maximumValue: number, valueStep: number, defaultValue?: number): ModalFormData;
    
    /**
     * Adds a text field to the form.
     */
    textField(label: string, placeholderText?: string, defaultValue?: string): ModalFormData;
    
    /**
     * Sets the title of the form.
     */
    title(titleText: string): ModalFormData;
    
    /**
     * Adds a toggle field to the form.
     */
    toggle(label: string, defaultValue?: boolean): ModalFormData;
    
    /**
     * Shows the form to a player.
     */
    show(player: Player): Promise<ModalFormResponse>;
  }
  
  /**
   * Response from a modal form.
   */
  export interface ModalFormResponse extends FormData {
    /**
     * Values from the form fields.
     */
    readonly formValues?: (boolean | number | string)[];
  }
  
  /**
   * Represents a message form with up to two buttons.
   */
  export class MessageFormData {
    /**
     * Creates a new MessageFormData.
     */
    constructor();
    
    /**
     * Sets the body text of the form.
     */
    body(bodyText: string): MessageFormData;
    
    /**
     * Sets the text for button 1.
     */
    button1(text: string): MessageFormData;
    
    /**
     * Sets the text for button 2.
     */
    button2(text: string): MessageFormData;
    
    /**
     * Sets the title of the form.
     */
    title(titleText: string): MessageFormData;
    
    /**
     * Shows the form to a player.
     */
    show(player: Player): Promise<MessageFormResponse>;
  }
  
  /**
   * Response from a message form.
   */
  export interface MessageFormResponse extends FormData {
    /**
     * Index of the selected button (0 or 1), or undefined if canceled.
     */
    readonly selection?: number;
  }
  
  // Import Player from server module
  import { Player } from "@minecraft/server";
}
`;

    const minecraftServerGameTestTypes = `
// Minecraft Server GameTest API Type Definitions
declare module "@minecraft/server-gametest" {
  import { BlockLocation, BlockType, Dimension, Entity, EntityType, ItemStack, Player } from "@minecraft/server";
  
  /**
   * Main GameTest class for creating tests.
   */
  export class Test {
    /**
     * Asserts that a block at the specified location is of the expected type.
     */
    assertBlockTypePresent(blockType: BlockType, blockLocation: BlockLocation, isPresent?: boolean): void;
    
    /**
     * Asserts that a container at the specified location contains the specified item.
     */
    assertContainerContains(itemStack: ItemStack, blockLocation: BlockLocation): void;
    
    /**
     * Asserts that a container at the specified location is empty.
     */
    assertContainerEmpty(blockLocation: BlockLocation): void;
    
    /**
     * Asserts that an entity is present at the specified location.
     */
    assertEntityPresent(entityType: EntityType, blockLocation: BlockLocation, isPresent?: boolean): void;
    
    /**
     * Asserts that an entity has the specified component.
     */
    assertEntityHasComponent(entityType: EntityType, componentIdentifier: string, blockLocation: BlockLocation, hasComponent?: boolean): void;
    
    /**
     * Fails the test with the specified error message.
     */
    fail(errorMessage: string): void;
    
    /**
     * Gets a block at the specified location.
     */
    getBlock(blockLocation: BlockLocation): Block;
    
    /**
     * Gets the dimension for this test.
     */
    getDimension(): Dimension;
    
    /**
     * Gets fence block locations around the test area.
     */
    getFenceBlocks(): BlockLocation[];
    
    /**
     * Kills all entities of the specified type in the test area.
     */
    killAllEntities(): void;
    
    /**
     * Presses a button at the specified location.
     */
    pressButton(blockLocation: BlockLocation): void;
    
    /**
     * Pulls a lever at the specified location.
     */
    pullLever(blockLocation: BlockLocation): void;
    
    /**
     * Pulses a redstone block at the specified location.
     */
    pulseRedstone(blockLocation: BlockLocation, duration: number): void;
    
    /**
     * Spawns an entity at the specified location.
     */
    spawn(entityType: EntityType, blockLocation: BlockLocation): Entity;
    
    /**
     * Spawns an entity with data at the specified location.
     */
    spawnWithoutBehaviors(entityType: EntityType, blockLocation: BlockLocation): Entity;
    
    /**
     * Spawns a simulated player at the specified location.
     */
    spawnSimulatedPlayer(blockLocation: BlockLocation, name?: string): SimulatedPlayer;
    
    /**
     * Succeeds the test if it reaches this point.
     */
    succeed(): void;
    
    /**
     * Succeeds the test when the specified condition is true.
     */
    succeedWhen(callback: () => void): void;
    
    /**
     * Succeeds the test if it doesn't fail within the specified number of ticks.
     */
    succeedOnTick(tick: number): void;
    
    /**
     * Succeeds the test if it doesn't fail within the specified number of ticks, then runs a callback.
     */
    succeedOnTickWhen(tick: number, callback: () => void): void;
    
    /**
     * Sets a block at the specified location.
     */
    setBlockType(blockType: BlockType, blockLocation: BlockLocation): void;
    
    /**
     * Sets a block permutation at the specified location.
     */
    setBlockPermutation(blockPermutation: BlockPermutation, blockLocation: BlockLocation): void;
    
    /**
     * Sets the time of day.
     */
    setTntFuse(entity: Entity, fuseLength: number): void;
    
    /**
     * Runs a function after the specified number of ticks.
     */
    runAfterDelay(delayTicks: number, callback: () => void): void;
    
    /**
     * Runs a function at the specified tick.
     */
    runAtTickTime(tick: number, callback: () => void): void;
  }
  
  /**
   * Represents a simulated player for testing.
   */
  export class SimulatedPlayer extends Player {
    /**
     * Simulates the player looking in a specific direction.
     */
    lookAtBlock(blockLocation: BlockLocation): void;
    
    /**
     * Simulates the player looking at an entity.
     */
    lookAtEntity(entity: Entity): void;
    
    /**
     * Simulates the player looking at a specific location.
     */
    lookAtLocation(location: Vector3): void;
    
    /**
     * Simulates the player moving in a specific direction.
     */
    move(westEast: number, northSouth: number, speed?: number): void;
    
    /**
     * Simulates the player moving to a specific location.
     */
    moveToLocation(location: Vector3, speed?: number): void;
    
    /**
     * Simulates the player navigating to a specific block.
     */
    navigateToBlock(blockLocation: BlockLocation, speed?: number): void;
    
    /**
     * Simulates the player navigating to a specific entity.
     */
    navigateToEntity(entity: Entity, speed?: number): void;
    
    /**
     * Simulates the player navigating to a specific location.
     */
    navigateToLocation(location: Vector3, speed?: number): void;
    
    /**
     * Simulates the player stopping movement.
     */
    stopMoving(): void;
    
    /**
     * Simulates the player jumping.
     */
    jump(): void;
    
    /**
     * Simulates the player interacting with a block.
     */
    interactWithBlock(blockLocation: BlockLocation): void;
    
    /**
     * Simulates the player interacting with an entity.
     */
    interactWithEntity(entity: Entity): void;
    
    /**
     * Simulates the player attacking an entity.
     */
    attack(entity: Entity): void;
    
    /**
     * Simulates the player attacking a location.
     */
    attackBlock(blockLocation: BlockLocation, direction?: Direction): void;
    
    /**
     * Simulates the player breaking a block.
     */
    breakBlock(blockLocation: BlockLocation, direction?: Direction): void;
    
    /**
     * Simulates the player using an item.
     */
    useItem(itemStack: ItemStack): void;
    
    /**
     * Simulates the player using an item on a block.
     */
    useItemOnBlock(itemStack: ItemStack, blockLocation: BlockLocation, direction?: Direction): void;
    
    /**
     * Simulates the player using an item in a specific direction.
     */
    useItemInSlot(slot: number): void;
    
    /**
     * Simulates the player using an item in a slot on a block.
     */
    useItemInSlotOnBlock(slot: number, blockLocation: BlockLocation, direction?: Direction): void;
    
    /**
     * Gives an item to the simulated player.
     */
    giveItem(itemStack: ItemStack, selectSlot?: boolean): void;
    
    /**
     * Sets the item in the simulated player's inventory.
     */
    setItem(itemStack: ItemStack, slot: number, selectSlot?: boolean): void;
  }
  
  /**
   * Tags for registering GameTests.
   */
  export interface GameTestSequence {
    thenExecute(callback: () => void): GameTestSequence;
    thenExecuteAfter(delayTicks: number, callback: () => void): GameTestSequence;
    thenExecuteFor(tickCount: number, callback: () => void): GameTestSequence;
    thenFail(errorMessage: string): void;
    thenIdle(delayTicks: number): GameTestSequence;
    thenSucceed(): void;
    thenWait(callback: () => void): GameTestSequence;
    thenWaitAfter(delayTicks: number, callback: () => void): GameTestSequence;
  }
  
  /**
   * Register a GameTest function.
   */
  export function register(testClassName: string, testName: string, testFunction: (test: Test) => void): void;
  
  /**
   * Register a GameTest with additional configuration.
   */
  export function registerAsync(testClassName: string, testName: string, testFunction: (test: Test) => Promise<void>): void;
  
  // Common interfaces and imports
  import { BlockLocation, Vector3, Direction, BlockPermutation, Block } from "@minecraft/server";
}
`;

    // Create JavaScript-compatible JSDoc type definitions
    const minecraftServerJSTypes = `
// Minecraft Server API JavaScript Type Definitions with JSDoc
/**
 * @namespace MinecraftServer
 */

/**
 * Represents the world and its properties.
 * @class
 */
class World {
  /**
   * Sends a message to all players in the world.
   * @param {string} message - The message to send
   * @returns {void}
   */
  sendMessage(message) {}
  
  /**
   * Gets all players currently in the world.
   * @returns {Player[]} Array of all players
   */
  getAllPlayers() {}
  
  /**
   * Gets players by name or other criteria.
   * @param {Object} [options] - Filter options
   * @param {string} [options.name] - Player name to filter by
   * @returns {Player[]} Array of matching players
   */
  getPlayers(options) {}
  
  /**
   * Gets the default spawn location for the world.
   * @returns {Vector3} The spawn location
   */
  getDefaultSpawnLocation() {}
  
  /**
   * Gets all entities in the world.
   * @param {EntityQueryOptions} [options] - Filter options
   * @returns {Entity[]} Array of entities
   */
  getEntities(options) {}
  
  /**
   * Gets the current time of day.
   * @returns {number} Current time of day
   */
  getTimeOfDay() {}
  
  /**
   * Sets the time of day.
   * @param {number} timeOfDay - Time to set
   * @returns {void}
   */
  setTimeOfDay(timeOfDay) {}
  
  /**
   * Event system for world events.
   * @type {WorldAfterEvents}
   */
  afterEvents;
  
  /**
   * Event system for world events (before they happen).
   * @type {WorldBeforeEvents}
   */
  beforeEvents;
}

/**
 * Represents a player in the game.
 * @class
 * @extends Entity
 */
class Player extends Entity {
  /**
   * The player's name.
   * @type {string}
   * @readonly
   */
  name;
  
  /**
   * Whether the player is an operator.
   * @type {boolean}
   * @readonly
   */
  isOp;
  
  /**
   * Sends a message to this player.
   * @param {string} message - Message to send
   * @returns {void}
   */
  sendMessage(message) {}
  
  /**
   * Kicks the player from the server.
   * @param {string} [reason] - Reason for kick
   * @returns {void}
   */
  kick(reason) {}
  
  /**
   * Teleports the player to a location.
   * @param {Vector3} location - Target location
   * @param {TeleportOptions} [teleportOptions] - Teleport options
   * @returns {void}
   */
  teleport(location, teleportOptions) {}
  
  /**
   * Runs a command as this player.
   * @param {string} commandString - Command to run
   * @returns {CommandResult} Command result
   */
  runCommand(commandString) {}
}

/**
 * Base class for all entities.
 * @class
 */
class Entity {
  /**
   * Unique identifier for the entity.
   * @type {string}
   * @readonly
   */
  id;
  
  /**
   * Current location of the entity.
   * @type {Vector3}
   * @readonly
   */
  location;
  
  /**
   * Current velocity of the entity.
   * @type {Vector3}
   * @readonly
   */
  velocity;
  
  /**
   * The entity's rotation.
   * @type {Vector2}
   * @readonly
   */
  rotation;
  
  /**
   * Whether the entity is valid and exists.
   * @type {boolean}
   * @readonly
   */
  isValid;
  
  /**
   * The entity's dimension.
   * @type {Dimension}
   * @readonly
   */
  dimension;
  
  /**
   * Teleports the entity to a location.
   * @param {Vector3} location - Target location
   * @param {TeleportOptions} [teleportOptions] - Teleport options
   * @returns {void}
   */
  teleport(location, teleportOptions) {}
  
  /**
   * Removes the entity from the world.
   * @returns {void}
   */
  remove() {}
  
  /**
   * Runs a command as this entity.
   * @param {string} commandString - Command to run
   * @returns {CommandResult} Command result
   */
  runCommand(commandString) {}
  
  /**
   * Gets a component from the entity.
   * @param {string} componentId - Component identifier
   * @returns {*} Component or undefined
   */
  getComponent(componentId) {}
  
  /**
   * Checks if entity has a component.
   * @param {string} componentId - Component identifier
   * @returns {boolean} True if component exists
   */
  hasComponent(componentId) {}
}

/**
 * Represents a dimension (Overworld, Nether, End).
 * @class
 */
class Dimension {
  /**
   * Identifier for this dimension.
   * @type {string}
   * @readonly
   */
  id;
  
  /**
   * Gets a block at the specified location.
   * @param {Vector3} location - Block location
   * @returns {Block|undefined} Block or undefined
   */
  getBlock(location) {}
  
  /**
   * Sets a block at the specified location.
   * @param {Vector3} location - Block location
   * @param {BlockType} blockType - Block type to set
   * @returns {void}
   */
  setBlockType(location, blockType) {}
  
  /**
   * Gets all entities in this dimension.
   * @param {EntityQueryOptions} [options] - Filter options
   * @returns {Entity[]} Array of entities
   */
  getEntities(options) {}
  
  /**
   * Spawns an entity at the specified location.
   * @param {string} identifier - Entity identifier
   * @param {Vector3} location - Spawn location
   * @returns {Entity} Spawned entity
   */
  spawnEntity(identifier, location) {}
}

/**
 * Represents a block in the world.
 * @class
 */
class Block {
  /**
   * Location of this block.
   * @type {Vector3}
   * @readonly
   */
  location;
  
  /**
   * The block type.
   * @type {BlockType}
   * @readonly
   */
  type;
  
  /**
   * The dimension this block is in.
   * @type {Dimension}
   * @readonly
   */
  dimension;
  
  /**
   * Whether this block is valid.
   * @type {boolean}
   * @readonly
   */
  isValid;
}

/**
 * Represents a block type.
 * @class
 */
class BlockType {
  /**
   * Identifier for this block type.
   * @type {string}
   * @readonly
   */
  id;
}

/**
 * @typedef {Object} Vector3
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 * @property {number} z - Z coordinate
 */

/**
 * @typedef {Object} Vector2
 * @property {number} x - X coordinate
 * @property {number} y - Y coordinate
 */

/**
 * @typedef {Object} EntityQueryOptions
 * @property {string} [type] - Entity type filter
 * @property {string} [name] - Entity name filter
 * @property {Vector3} [location] - Location filter
 * @property {number} [maxDistance] - Maximum distance
 * @property {number} [minDistance] - Minimum distance
 */

/**
 * @typedef {Object} TeleportOptions
 * @property {Dimension} [dimension] - Target dimension
 * @property {Vector2} [rotation] - Target rotation
 * @property {Vector3} [facingLocation] - Location to face
 * @property {boolean} [checkForBlocks] - Check for blocks
 * @property {boolean} [keepVelocity] - Keep velocity
 */

/**
 * @typedef {Object} CommandResult
 * @property {number} successCount - Number of successful commands
 */

/**
 * Global world instance
 * @type {World}
 */
const world = new World();

/**
 * System utilities for timing and scheduling
 * @namespace
 */
const system = {
  /**
   * Runs a function after a specified number of ticks.
   * @param {Function} callback - Function to run
   * @param {number} [tickDelay] - Delay in ticks
   * @returns {number} Run ID
   */
  runTimeout: function(callback, tickDelay) {},
  
  /**
   * Runs a function at a specified interval.
   * @param {Function} callback - Function to run
   * @param {number} [tickInterval] - Interval in ticks
   * @returns {number} Run ID
   */
  runInterval: function(callback, tickInterval) {},
  
  /**
   * Clears a timeout or interval.
   * @param {number} runId - Run ID to clear
   * @returns {void}
   */
  clearRun: function(runId) {},
  
  /**
   * Gets the current tick.
   * @type {number}
   */
  currentTick: 0
};
`;

    const minecraftServerUIJSTypes = `
// Minecraft Server UI API JavaScript Type Definitions with JSDoc

/**
 * Represents a simple action form with buttons.
 * @class
 */
class ActionFormData {
  /**
   * Creates a new ActionFormData.
   * @constructor
   */
  constructor() {}
  
  /**
   * Adds a button to the form.
   * @param {string} text - Button text
   * @param {string} [iconPath] - Optional icon path
   * @returns {ActionFormData} This form for chaining
   */
  button(text, iconPath) {}
  
  /**
   * Sets the body text of the form.
   * @param {string} bodyText - Body text
   * @returns {ActionFormData} This form for chaining
   */
  body(bodyText) {}
  
  /**
   * Sets the title of the form.
   * @param {string} titleText - Title text
   * @returns {ActionFormData} This form for chaining
   */
  title(titleText) {}
  
  /**
   * Shows the form to a player.
   * @param {Player} player - Player to show form to
   * @returns {Promise<ActionFormResponse>} Form response
   */
  show(player) {}
}

/**
 * Represents a modal form with text fields and toggles.
 * @class
 */
class ModalFormData {
  /**
   * Creates a new ModalFormData.
   * @constructor
   */
  constructor() {}
  
  /**
   * Adds a dropdown field to the form.
   * @param {string} label - Field label
   * @param {string[]} options - Dropdown options
   * @param {number} [defaultValueIndex] - Default selected index
   * @returns {ModalFormData} This form for chaining
   */
  dropdown(label, options, defaultValueIndex) {}
  
  /**
   * Adds a slider field to the form.
   * @param {string} label - Field label
   * @param {number} minimumValue - Minimum value
   * @param {number} maximumValue - Maximum value
   * @param {number} valueStep - Step size
   * @param {number} [defaultValue] - Default value
   * @returns {ModalFormData} This form for chaining
   */
  slider(label, minimumValue, maximumValue, valueStep, defaultValue) {}
  
  /**
   * Adds a text field to the form.
   * @param {string} label - Field label
   * @param {string} [placeholderText] - Placeholder text
   * @param {string} [defaultValue] - Default value
   * @returns {ModalFormData} This form for chaining
   */
  textField(label, placeholderText, defaultValue) {}
  
  /**
   * Sets the title of the form.
   * @param {string} titleText - Title text
   * @returns {ModalFormData} This form for chaining
   */
  title(titleText) {}
  
  /**
   * Adds a toggle field to the form.
   * @param {string} label - Field label
   * @param {boolean} [defaultValue] - Default value
   * @returns {ModalFormData} This form for chaining
   */
  toggle(label, defaultValue) {}
  
  /**
   * Shows the form to a player.
   * @param {Player} player - Player to show form to
   * @returns {Promise<ModalFormResponse>} Form response
   */
  show(player) {}
}

/**
 * Represents a message form with up to two buttons.
 * @class
 */
class MessageFormData {
  /**
   * Creates a new MessageFormData.
   * @constructor
   */
  constructor() {}
  
  /**
   * Sets the body text of the form.
   * @param {string} bodyText - Body text
   * @returns {MessageFormData} This form for chaining
   */
  body(bodyText) {}
  
  /**
   * Sets the text for button 1.
   * @param {string} text - Button text
   * @returns {MessageFormData} This form for chaining
   */
  button1(text) {}
  
  /**
   * Sets the text for button 2.
   * @param {string} text - Button text
   * @returns {MessageFormData} This form for chaining
   */
  button2(text) {}
  
  /**
   * Sets the title of the form.
   * @param {string} titleText - Title text
   * @returns {MessageFormData} This form for chaining
   */
  title(titleText) {}
  
  /**
   * Shows the form to a player.
   * @param {Player} player - Player to show form to
   * @returns {Promise<MessageFormResponse>} Form response
   */
  show(player) {}
}

/**
 * @typedef {Object} ActionFormResponse
 * @property {boolean} canceled - Whether the form was canceled
 * @property {number} [selection] - Index of selected button
 */

/**
 * @typedef {Object} ModalFormResponse
 * @property {boolean} canceled - Whether the form was canceled
 * @property {Array<boolean|number|string>} [formValues] - Form field values
 */

/**
 * @typedef {Object} MessageFormResponse
 * @property {boolean} canceled - Whether the form was canceled
 * @property {number} [selection] - Index of selected button (0 or 1)
 */
`;

    // Add the TypeScript definitions to Monaco's TypeScript service
    monaco.languages.typescript.typescriptDefaults.addExtraLib(minecraftServerTypes, 'minecraft-server.d.ts');
    monaco.languages.typescript.typescriptDefaults.addExtraLib(minecraftServerUITypes, 'minecraft-server-ui.d.ts');
    monaco.languages.typescript.typescriptDefaults.addExtraLib(minecraftServerGameTestTypes, 'minecraft-server-gametest.d.ts');
    
    // Add the JavaScript definitions to Monaco's JavaScript service
    monaco.languages.typescript.javascriptDefaults.addExtraLib(minecraftServerJSTypes, 'minecraft-server-js.js');
    monaco.languages.typescript.javascriptDefaults.addExtraLib(minecraftServerUIJSTypes, 'minecraft-server-ui-js.js');
    
    // Configure TypeScript compiler options for better IntelliSense
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      allowJs: true,
      typeRoots: ["node_modules/@types"]
    });
    
    // Configure JavaScript compiler options for better IntelliSense
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      allowJs: true,
      checkJs: true, // Enable type checking for JavaScript
      typeRoots: ["node_modules/@types"]
    });
    
    // Set stricter diagnostics options for better error detection
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [1108] // Ignore missing return type warnings for now
    });
    
    // Set JavaScript diagnostics options
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
      diagnosticCodesToIgnore: [1108, 7016] // Ignore missing return type warnings and implicit any
    });

    // Register completion provider for TypeScript
    monaco.languages.registerCompletionItemProvider('typescript', {
      provideCompletionItems: (model, position) => {
        const suggestions: Monaco.languages.CompletionItem[] = [];
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // Get line content to analyze context
        const lineContent = model.getLineContent(position.lineNumber);
        const beforeCursor = lineContent.substring(0, position.column - 1);
        
        // Check if we're after a dot (for method completion)
        const dotMatch = beforeCursor.match(/(\\w+)\\.$/) || beforeCursor.match(/(\\w+\\.\\w+)\\.$/) ;
        
        if (dotMatch) {
          // Provide method/property completions for specific objects
          const objectName = dotMatch[1];
          
          // Find elements that could be methods/properties of this object
          registryData.elements.forEach((element: any) => {
            if (element.type === 'class' && element.name.toLowerCase().includes(objectName.toLowerCase())) {
              // Add methods if available
              if (element.methods) {
                element.methods.forEach((method: any) => {
                  const params = method.parameters 
                    ? method.parameters.map((p: any) => `${p.name}: ${p.type}`).join(', ')
                    : '';
                  
                  suggestions.push({
                    label: method.name,
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: `${method.name}(${params}): ${method.returnType || 'void'}`,
                    documentation: method.description || `Method from ${element.name}`,
                    insertText: method.parameters 
                      ? `${method.name}(\\${1})`
                      : `${method.name}()`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                  });
                });
              }
              
              // Add properties if available
              if (element.properties) {
                element.properties.forEach((prop: any) => {
                  suggestions.push({
                    label: prop.name,
                    kind: monaco.languages.CompletionItemKind.Property,
                    detail: `${prop.name}: ${prop.type}`,
                    documentation: prop.description || `Property from ${element.name}`,
                    insertText: prop.name,
                    range,
                  });
                });
              }
            }
          });
        } else {
          // General completions - classes, functions, enums
          registryData.elements.forEach((element: any) => {
            const shouldInclude = !word.word || element.name.toLowerCase().includes(word.word.toLowerCase());
            
            if (shouldInclude) {
              let kind: Monaco.languages.CompletionItemKind;
              let detail = '';
              let insertText = element.name;
              
              switch (element.type) {
                case 'class':
                  kind = monaco.languages.CompletionItemKind.Class;
                  detail = `class ${element.name}`;
                  break;
                case 'interface':
                  kind = monaco.languages.CompletionItemKind.Interface;
                  detail = `interface ${element.name}`;
                  break;
                case 'enum':
                  kind = monaco.languages.CompletionItemKind.Enum;
                  detail = `enum ${element.name}`;
                  break;
                case 'function':
                  kind = monaco.languages.CompletionItemKind.Function;
                  const params = element.parameters 
                    ? element.parameters.map((p: any) => `${p.name}: ${p.type}`).join(', ')
                    : '';
                  detail = `function ${element.name}(${params})`;
                  insertText = element.parameters ? `${element.name}(\\${1})` : `${element.name}()`;
                  break;
                default:
                  kind = monaco.languages.CompletionItemKind.Variable;
                  detail = `${element.type} ${element.name}`;
              }
              
              suggestions.push({
                label: element.name,
                kind,
                detail: `${detail} - ${element.module}`,
                documentation: element.description || `${element.type} from ${element.module}`,
                insertText,
                insertTextRules: insertText.includes('${') 
                  ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet 
                  : undefined,
                range,
              });
            }
          });
          
          // Add common imports
          if (beforeCursor.includes('import')) {
            registryData.modules.forEach(moduleName => {
              suggestions.push({
                label: moduleName,
                kind: monaco.languages.CompletionItemKind.Module,
                detail: `Import from ${moduleName}`,
                documentation: `Minecraft module: ${moduleName}`,
                insertText: moduleName,
                range,
              });
            });
          }
        }

        return { suggestions };
      },
    });

    // Create a shared completion provider function for both TypeScript and JavaScript
    const createCompletionProvider = () => ({
      provideCompletionItems: (model: Monaco.editor.ITextModel, position: Monaco.Position) => {
        const suggestions: Monaco.languages.CompletionItem[] = [];
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        // Get line content to analyze context
        const lineContent = model.getLineContent(position.lineNumber);
        const beforeCursor = lineContent.substring(0, position.column - 1);
        
        // Check if we're after a dot (for method completion)
        const dotMatch = beforeCursor.match(/(\\w+)\\.$/) || beforeCursor.match(/(\\w+\\.\\w+)\\.$/) ;
        
        if (dotMatch) {
          // Provide method/property completions for specific objects
          const objectName = dotMatch[1];
          
          // Find elements that could be methods/properties of this object
          registryData.elements.forEach((element: any) => {
            if (element.type === 'class' && element.name.toLowerCase().includes(objectName.toLowerCase())) {
              // Add methods if available
              if (element.methods) {
                element.methods.forEach((method: any) => {
                  const params = method.parameters 
                    ? method.parameters.map((p: any) => `${p.name}: ${p.type}`).join(', ')
                    : '';
                  
                  suggestions.push({
                    label: method.name,
                    kind: monaco.languages.CompletionItemKind.Method,
                    detail: `${method.name}(${params}): ${method.returnType || 'void'}`,
                    documentation: method.description || `Method from ${element.name}`,
                    insertText: method.parameters 
                      ? `${method.name}(\\${1})`
                      : `${method.name}()`,
                    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                    range,
                  });
                });
              }
              
              // Add properties if available
              if (element.properties) {
                element.properties.forEach((prop: any) => {
                  suggestions.push({
                    label: prop.name,
                    kind: monaco.languages.CompletionItemKind.Property,
                    detail: `${prop.name}: ${prop.type}`,
                    documentation: prop.description || `Property from ${element.name}`,
                    insertText: prop.name,
                    range,
                  });
                });
              }
            }
          });
        } else {
          // General completions - classes, functions, enums
          registryData.elements.forEach((element: any) => {
            const shouldInclude = !word.word || element.name.toLowerCase().includes(word.word.toLowerCase());
            
            if (shouldInclude) {
              let kind: Monaco.languages.CompletionItemKind;
              let detail = '';
              let insertText = element.name;
              
              switch (element.type) {
                case 'class':
                  kind = monaco.languages.CompletionItemKind.Class;
                  detail = `class ${element.name}`;
                  break;
                case 'interface':
                  kind = monaco.languages.CompletionItemKind.Interface;
                  detail = `interface ${element.name}`;
                  break;
                case 'enum':
                  kind = monaco.languages.CompletionItemKind.Enum;
                  detail = `enum ${element.name}`;
                  break;
                case 'function':
                  kind = monaco.languages.CompletionItemKind.Function;
                  const params = element.parameters 
                    ? element.parameters.map((p: any) => `${p.name}: ${p.type}`).join(', ')
                    : '';
                  detail = `function ${element.name}(${params})`;
                  insertText = element.parameters ? `${element.name}(\\${1})` : `${element.name}()`;
                  break;
                default:
                  kind = monaco.languages.CompletionItemKind.Variable;
                  detail = `${element.type} ${element.name}`;
              }
              
              suggestions.push({
                label: element.name,
                kind,
                detail: `${detail} - ${element.module}`,
                documentation: element.description || `${element.type} from ${element.module}`,
                insertText,
                insertTextRules: insertText.includes('${') 
                  ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet 
                  : undefined,
                range,
              });
            }
          });
          
          // Add common imports
          if (beforeCursor.includes('import')) {
            registryData.modules.forEach(moduleName => {
              suggestions.push({
                label: moduleName,
                kind: monaco.languages.CompletionItemKind.Module,
                detail: `Import from ${moduleName}`,
                documentation: `Minecraft module: ${moduleName}`,
                insertText: moduleName,
                range,
              });
            });
          }
        }

        return { suggestions };
      },
    });

    // Register the comprehensive completion provider for both TypeScript and JavaScript
    monaco.languages.registerCompletionItemProvider('typescript', createCompletionProvider());
    monaco.languages.registerCompletionItemProvider('javascript', createCompletionProvider());

    // Configure additional editor features - main scrolling config is in Editor component options
    // Only set features that aren't configured in the main options
    editor.updateOptions({
      suggest: {
        showIcons: true,
        showSnippets: true,
        showWords: true,
        showTypeParameters: true,
      },
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
      },
      quickSuggestionsDelay: 100,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabCompletion: 'on',
      wordBasedSuggestions: 'allDocuments',
      parameterHints: {
        enabled: true,
        cycle: true,
      },
    });
  }, [registryData]);

  // Search and filter logic
  const filteredElements = useMemo(() => {
    let filtered = registryData.elements;

    // Text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((element: any) => 
        element.name.toLowerCase().includes(searchLower) ||
        element.description?.toLowerCase().includes(searchLower) ||
        element.module.toLowerCase().includes(searchLower)
      );
    }

    // Module filter
    if (filters.modules.length > 0) {
      filtered = filtered.filter((element: any) => filters.modules.includes(element.module));
    }

    // Type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter((element: any) => filters.types.includes(element.type));
    }

    // Favorites filter
    if (filters.favorites) {
      filtered = filtered.filter((element: any) => favorites.has(element.id));
    }

    return filtered;
  }, [registryData.elements, searchTerm, filters, favorites]);

  // Helper functions
  const getElementIcon = (type: string) => {
    switch (type) {
      case 'class': return <Box className="w-4 h-4 text-blue-500" />;
      case 'interface': return <Layers className="w-4 h-4 text-green-500" />;
      case 'enum': return <Target className="w-4 h-4 text-yellow-500" />;
      case 'function': return <FunctionSquare className="w-4 h-4 text-purple-500" />;
      case 'type': return <Code2 className="w-4 h-4 text-cyan-500" />;
      default: return <Cpu className="w-4 h-4 text-gray-500" />;
    }
  };

  // Script management
  const addScript = () => {
    const newId = Date.now().toString();
    const newScript: ScriptTab = {
      id: newId,
      name: `Script ${scripts.length + 1}`,
      content: "// New Minecraft script\\nimport { world } from '@minecraft/server';\\n\\n",
      language: "typescript"
    };
    setScripts(prev => [...prev, newScript]);
    setActiveScriptId(newId);
  };

  const removeScript = (scriptId: string) => {
    if (scripts.length <= 1) return;
    setScripts(prev => prev.filter(s => s.id !== scriptId));
    if (activeScriptId === scriptId) {
      setActiveScriptId(scripts.find(s => s.id !== scriptId)?.id || scripts[0].id);
    }
  };

  const updateScript = (scriptId: string, updates: Partial<ScriptTab>) => {
    setScripts(prev => prev.map(script => 
      script.id === scriptId ? { ...script, ...updates } : script
    ));
  };

  const activeScript = scripts.find(s => s.id === activeScriptId) || scripts[0];

  // Element selection
  const selectElement = useCallback((element: any) => {
    setSelectedElement({
      id: element.id,
      name: element.name,
      type: element.type,
      module: element.module,
      element
    });
    setParameterValues({});
  }, []);

  // Toggle functions
  const toggleFavorite = useCallback((elementId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(elementId)) {
        newSet.delete(elementId);
      } else {
        newSet.add(elementId);
      }
      return newSet;
    });
  }, []);

  // Export functionality
  const exportScript = (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;

    const blob = new Blob([script.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.name.replace(/\\s+/g, '_')}.${script.language === 'typescript' ? 'ts' : 'js'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyScript = async (scriptId: string) => {
    const script = scripts.find(s => s.id === scriptId);
    if (!script) return;

    try {
      await navigator.clipboard.writeText(script.content);
    } catch (err) {
      console.error('Failed to copy script:', err);
    }
  };

  const insertCode = (code: string) => {
    if (editorRef.current.editor) {
      const editor = editorRef.current.editor;
      const selection = editor.getSelection();
      const range = selection || editor.getModel()?.getFullModelRange();
      
      if (range) {
        editor.executeEdits('insert-code', [{
          range,
          text: code,
          forceMoveMarkers: true,
        }]);
        editor.focus();
      }
    }
  };

  return (
    <section className="h-full flex flex-col" data-testid="script-studio">
      {/* Header - Compact */}
      <div className="p-3 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Script Studio</h2>
            <p className="text-xs text-muted-foreground">
              Professional Monaco Editor • {registryData.totalElements} API elements • VS Code-style autocomplete
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              data-testid="button-toggle-sidebar"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span className="ml-1 hidden sm:inline">API</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditorExpanded(!editorExpanded)}
              data-testid="button-toggle-fullscreen"
            >
              {editorExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Editor Prominent Layout */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - API Browser (Collapsible) */}
          {!sidebarCollapsed && (
            <>
              <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
                <div className="h-full flex flex-col border-r bg-muted/20">
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm">API Browser</h3>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                          data-testid="button-toggle-advanced-search"
                        >
                          <Filter className="w-3 h-3" />
                        </Button>
                        <Badge variant="secondary" className="text-xs">{filteredElements.length}</Badge>
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                      <Input
                        placeholder="Search APIs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-7 h-8 text-sm"
                        data-testid="input-api-search"
                      />
                    </div>

                    {showAdvancedSearch && (
                      <div className="mt-2 p-2 bg-muted rounded space-y-2">
                        <div>
                          <Label className="text-xs font-medium">Modules</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {registryData.modules.map(module => (
                              <Badge
                                key={module}
                                variant={filters.modules.includes(module) ? "default" : "outline"}
                                className="cursor-pointer text-xs h-5"
                                onClick={() => {
                                  setFilters(prev => ({
                                    ...prev,
                                    modules: prev.modules.includes(module)
                                      ? prev.modules.filter(m => m !== module)
                                      : [...prev.modules, module]
                                  }));
                                }}
                              >
                                {module.replace('@minecraft/', '')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                      {filteredElements.map((element: any) => (
                        <div
                          key={element.id}
                          className={cn(
                            "p-2 rounded cursor-pointer transition-colors hover:bg-muted",
                            selectedElement?.id === element.id ? "bg-accent" : ""
                          )}
                          onClick={() => selectElement(element)}
                          data-testid={`element-${element.name}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              {getElementIcon(element.type)}
                              <span className="font-medium text-sm truncate">{element.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {element.type}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-5 h-5 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(element.id);
                                }}
                              >
                                <Star
                                  className={cn(
                                    "w-3 h-3",
                                    favorites.has(element.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                  )}
                                />
                              </Button>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {element.module} • {element.description?.slice(0, 40)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          {/* Main Panel - Editor Focused */}
          <ResizablePanel defaultSize={sidebarCollapsed ? 100 : 75}>
            <div className="h-full flex flex-col">
              {/* Script Tabs - Compact */}
              <div className="flex items-center justify-between p-2 border-b bg-muted/10">
                <div className="flex items-center gap-1">
                  {scripts.map(script => (
                    <div key={script.id} className="flex items-center">
                      <Button
                        variant={script.id === activeScriptId ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setActiveScriptId(script.id)}
                        className="rounded-r-none h-8 text-xs"
                      >
                        {script.name}
                      </Button>
                      {scripts.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeScript(script.id)}
                          className="rounded-l-none border-l-0 px-1 h-8"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={addScript} className="h-8">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-1">
                  <Select
                    value={activeScript.language}
                    onValueChange={(value: 'javascript' | 'typescript') => 
                      updateScript(activeScriptId, { language: value })
                    }
                  >
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="typescript">TS</SelectItem>
                      <SelectItem value="javascript">JS</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyScript(activeScriptId)}
                    data-testid="button-copy-script"
                    className="h-8"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => exportScript(activeScriptId)}
                    data-testid="button-export-script"
                    className="h-8"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Monaco Editor - PROMINENT POSITION */}
              <div className="flex-1 flex flex-col bg-editor">
                <div className="flex-1">
                  <Editor
                    height="100%"
                    defaultLanguage={activeScript.language}
                    language={activeScript.language}
                    value={activeScript.content}
                    onChange={(value) => updateScript(activeScriptId, { content: value || '' })}
                    onMount={setupMonacoEditor}
                    theme="vs-dark"
                    beforeMount={(monaco) => {
                      // Ensure dark theme is applied before mounting to prevent white flash
                      monaco.editor.setTheme('vs-dark');
                    }}
                    options={{
                      // Basic editor appearance
                      fontSize: 14,
                      lineHeight: 20,
                      fontFamily: 'JetBrains Mono, Consolas, Monaco, Courier New, monospace',
                      minimap: { enabled: false },
                      roundedSelection: false,
                      padding: { top: 16, bottom: 16 },
                      automaticLayout: true,
                      
                      // SCROLLING CONFIGURATION - FIXED FOR PROPER SCROLLING
                      scrollBeyondLastLine: true,  // Allow scrolling beyond last line
                      scrollbar: {
                        vertical: 'auto',           // Auto show/hide vertical scrollbar
                        horizontal: 'auto',         // Auto show/hide horizontal scrollbar
                        verticalScrollbarSize: 14,  // Larger scrollbars for easier interaction
                        horizontalScrollbarSize: 14,
                        handleMouseWheel: true,     // Ensure mouse wheel events are handled
                        useShadows: false,          // Disable shadows for performance
                      },
                      mouseWheelScrollSensitivity: 1,     // Normal mouse wheel sensitivity
                      fastScrollSensitivity: 5,           // Fast scroll sensitivity
                      scrollPredominantAxis: true,        // Better multi-directional scrolling
                      smoothScrolling: true,              // Smooth scroll animation
                      disableLayerHinting: false,         // Keep layer hinting for performance
                      
                      // Cursor and selection
                      cursorStyle: 'line',
                      cursorWidth: 2,
                      cursorBlinking: 'blink',
                      renderLineHighlight: 'line',
                      selectOnLineNumbers: true,
                      
                      // Line numbers and margins
                      lineNumbersMinChars: 4,
                      glyphMargin: false,
                      
                      // Code folding
                      folding: true,
                      foldingStrategy: 'indentation',
                      showFoldingControls: 'mouseover',
                      
                      // Word wrapping
                      wordWrap: 'off',
                      wordWrapColumn: 80,
                      wrappingIndent: 'indent',
                    }}
                    data-testid="monaco-editor"
                  />
                </div>
              </div>

              {/* Bottom Panel - Documentation & Tools (Collapsible) */}
              {documentationOpen && (
                <>
                  <ResizableHandle withHandle />
                  <div className="h-48 border-t bg-muted/10">
                    <Tabs defaultValue="docs" className="h-full flex flex-col">
                      <TabsList className="grid w-full grid-cols-3 h-8">
                        <TabsTrigger value="docs" className="text-xs">
                          <Book className="w-3 h-3 mr-1" />
                          Docs
                        </TabsTrigger>
                        <TabsTrigger value="tools" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          Tools
                        </TabsTrigger>
                        <TabsTrigger value="templates" className="text-xs">
                          <Settings className="w-3 h-3 mr-1" />
                          Templates
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="docs" className="flex-1 p-3 overflow-auto">
                        {selectedElement ? (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getElementIcon(selectedElement.type)}
                                <div>
                                  <h4 className="font-semibold text-sm">{selectedElement.name}</h4>
                                  <p className="text-xs text-muted-foreground">{selectedElement.module}</p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => insertCode(`${selectedElement.name}`)}
                                data-testid="button-insert-code"
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                Insert
                              </Button>
                            </div>
                            <p className="text-sm">{selectedElement.element.description}</p>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Book className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Select an API element to view documentation</p>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="tools" className="flex-1 p-3">
                        <div className="text-center py-8">
                          <Terminal className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Code tools and utilities</p>
                        </div>
                      </TabsContent>

                      <TabsContent value="templates" className="flex-1 p-3 overflow-auto">
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            {
                              name: "Hello World",
                              code: `import { world } from '@minecraft/server';\\nworld.sendMessage("Hello!");`
                            },
                            {
                              name: "Player Events",
                              code: `import { world } from '@minecraft/server';\\nworld.afterEvents.playerJoin.subscribe((event) => {\\n  world.sendMessage(\`Welcome \${event.player.name}!\`);\\n});`
                            }
                          ].map((template, idx) => (
                            <Card key={idx} className="cursor-pointer hover:bg-muted/50" onClick={() => insertCode(template.code)}>
                              <CardHeader className="p-2">
                                <CardTitle className="text-xs">{template.name}</CardTitle>
                              </CardHeader>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </>
              )}

              {/* Toggle Documentation Panel */}
              <div className="absolute bottom-2 right-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDocumentationOpen(!documentationOpen)}
                  className="h-8"
                >
                  {documentationOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </section>
  );
}