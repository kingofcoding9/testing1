import { useState } from "react";
import { Plus, Copy, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodePreview from "@/components/Common/CodePreview";
import ValidationStatus from "@/components/Common/ValidationStatus";
import ComponentModal from "@/components/Common/ComponentModal";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { validateEntityJSON } from "@/lib/minecraft/validation";
import { generateEntityJSON } from "@/lib/minecraft/templates";

interface EntityComponent {
  id: string;
  type: string;
  enabled: boolean;
  properties: Record<string, any>;
}

export default function EntityBuilder() {
  const [identifier, setIdentifier] = useLocalStorage('entity-identifier', '');
  const [displayName, setDisplayName] = useLocalStorage('entity-display-name', '');
  const [components, setComponents] = useLocalStorage<EntityComponent[]>('entity-components', [
    {
      id: 'health',
      type: 'minecraft:health',
      enabled: true,
      properties: { value: 20, max: 20 }
    }
  ]);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [activeTab, setActiveTab] = useState('health');

  const entityJSON = generateEntityJSON(identifier, displayName, components);
  const validation = validateEntityJSON(entityJSON);

  const updateComponent = (id: string, properties: Record<string, any>) => {
    setComponents(components.map(comp => 
      comp.id === id ? { ...comp, properties: { ...comp.properties, ...properties } } : comp
    ));
  };

  const toggleComponent = (id: string) => {
    setComponents(components.map(comp =>
      comp.id === id ? { ...comp, enabled: !comp.enabled } : comp
    ));
  };

  const addComponent = (componentType: string) => {
    const newComponent: EntityComponent = {
      id: `component-${Date.now()}`,
      type: componentType,
      enabled: true,
      properties: getDefaultProperties(componentType)
    };
    setComponents([...components, newComponent]);
    setShowComponentModal(false);
  };

  const getDefaultProperties = (type: string): Record<string, any> => {
    switch (type) {
      case 'minecraft:movement':
        return { value: 0.25 };
      case 'minecraft:navigation.walk':
        return { can_path_over_water: false, avoid_water: true };
      case 'minecraft:movement.basic':
        return {};
      case 'minecraft:jump.static':
        return { jump_power: 0.42 };
      case 'minecraft:behavior.random_stroll':
        return { priority: 6, speed_multiplier: 1.0 };
      case 'minecraft:behavior.look_at_player':
        return { priority: 7, look_distance: 6.0 };
      case 'minecraft:behavior.panic':
        return { priority: 1, speed_multiplier: 1.25 };
      case 'minecraft:behavior.float':
        return { priority: 0 };
      default:
        return {};
    }
  };

  const renderHealthTab = () => {
    const healthComponent = components.find(c => c.id === 'health');
    if (!healthComponent) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div>
            <h4 className="font-medium text-foreground">Health Component</h4>
            <p className="text-xs text-muted-foreground">Defines entity's health points</p>
          </div>
          <Switch
            checked={healthComponent.enabled}
            onCheckedChange={() => toggleComponent('health')}
            data-testid="switch-health-enabled"
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="max-health">Max Health</Label>
            <Input
              id="max-health"
              type="number"
              value={healthComponent.properties.max || 20}
              onChange={(e) => updateComponent('health', { max: parseInt(e.target.value) || 20 })}
              data-testid="input-max-health"
            />
          </div>
          <div>
            <Label htmlFor="current-health">Current Health</Label>
            <Input
              id="current-health"
              type="number"
              value={healthComponent.properties.value || 20}
              onChange={(e) => updateComponent('health', { value: parseInt(e.target.value) || 20 })}
              data-testid="input-current-health"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderMovementTab = () => {
    const movementComponents = components.filter(c => 
      ['minecraft:movement', 'minecraft:navigation.walk', 'minecraft:movement.basic', 'minecraft:jump.static'].includes(c.type)
    );

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Configure entity movement properties and navigation capabilities.
        </div>
        
        {movementComponents.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No movement components added yet. Use "Add Component" to add movement components.</p>
          </div>
        ) : (
          movementComponents.map((component) => (
            <div key={component.id} className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-foreground">{component.type}</h4>
                  <p className="text-xs text-muted-foreground">
                    {component.type === 'minecraft:movement' && 'Controls basic movement speed'}
                    {component.type === 'minecraft:navigation.walk' && 'Enables land navigation'}
                    {component.type === 'minecraft:movement.basic' && 'Basic movement mechanics'}
                    {component.type === 'minecraft:jump.static' && 'Jumping capabilities'}
                  </p>
                </div>
                <Switch
                  checked={component.enabled}
                  onCheckedChange={() => toggleComponent(component.id)}
                  data-testid={`switch-${component.id}-enabled`}
                />
              </div>
              
              {component.type === 'minecraft:movement' && (
                <div>
                  <Label htmlFor={`movement-speed-${component.id}`}>Movement Speed</Label>
                  <Input
                    id={`movement-speed-${component.id}`}
                    type="number"
                    step="0.1"
                    value={component.properties.value || 0.25}
                    onChange={(e) => updateComponent(component.id, { value: parseFloat(e.target.value) || 0.25 })}
                    data-testid={`input-movement-speed-${component.id}`}
                  />
                </div>
              )}
              
              {component.type === 'minecraft:navigation.walk' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={component.properties.can_path_over_water || false}
                      onCheckedChange={(checked) => updateComponent(component.id, { can_path_over_water: checked })}
                      data-testid={`switch-path-over-water-${component.id}`}
                    />
                    <Label>Can path over water</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={component.properties.avoid_water || false}
                      onCheckedChange={(checked) => updateComponent(component.id, { avoid_water: checked })}
                      data-testid={`switch-avoid-water-${component.id}`}
                    />
                    <Label>Avoid water</Label>
                  </div>
                </div>
              )}
              
              {component.type === 'minecraft:jump.static' && (
                <div>
                  <Label htmlFor={`jump-power-${component.id}`}>Jump Power</Label>
                  <Input
                    id={`jump-power-${component.id}`}
                    type="number"
                    step="0.1"
                    value={component.properties.jump_power || 0.42}
                    onChange={(e) => updateComponent(component.id, { jump_power: parseFloat(e.target.value) || 0.42 })}
                    data-testid={`input-jump-power-${component.id}`}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  const renderBehaviorTab = () => {
    const behaviorComponents = components.filter(c => 
      c.type.startsWith('minecraft:behavior.')
    );

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Configure entity AI behaviors and interactions.
        </div>
        
        {behaviorComponents.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No behavior components added yet. Use "Add Component" to add AI behaviors.</p>
          </div>
        ) : (
          behaviorComponents.map((component) => (
            <div key={component.id} className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-foreground">{component.type}</h4>
                  <p className="text-xs text-muted-foreground">
                    {component.type === 'minecraft:behavior.random_stroll' && 'Makes entity wander randomly'}
                    {component.type === 'minecraft:behavior.look_at_player' && 'Entity looks at nearby players'}
                    {component.type === 'minecraft:behavior.panic' && 'Entity flees when hurt'}
                    {component.type === 'minecraft:behavior.float' && 'Entity floats in water'}
                  </p>
                </div>
                <Switch
                  checked={component.enabled}
                  onCheckedChange={() => toggleComponent(component.id)}
                  data-testid={`switch-${component.id}-enabled`}
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`priority-${component.id}`}>Priority</Label>
                  <Input
                    id={`priority-${component.id}`}
                    type="number"
                    value={component.properties.priority || 1}
                    onChange={(e) => updateComponent(component.id, { priority: parseInt(e.target.value) || 1 })}
                    data-testid={`input-priority-${component.id}`}
                  />
                </div>
                
                {(component.type === 'minecraft:behavior.random_stroll' || component.type === 'minecraft:behavior.panic') && (
                  <div>
                    <Label htmlFor={`speed-multiplier-${component.id}`}>Speed Multiplier</Label>
                    <Input
                      id={`speed-multiplier-${component.id}`}
                      type="number"
                      step="0.1"
                      value={component.properties.speed_multiplier || 1.0}
                      onChange={(e) => updateComponent(component.id, { speed_multiplier: parseFloat(e.target.value) || 1.0 })}
                      data-testid={`input-speed-multiplier-${component.id}`}
                    />
                  </div>
                )}
                
                {component.type === 'minecraft:behavior.look_at_player' && (
                  <div>
                    <Label htmlFor={`look-distance-${component.id}`}>Look Distance</Label>
                    <Input
                      id={`look-distance-${component.id}`}
                      type="number"
                      step="0.1"
                      value={component.properties.look_distance || 6.0}
                      onChange={(e) => updateComponent(component.id, { look_distance: parseFloat(e.target.value) || 6.0 })}
                      data-testid={`input-look-distance-${component.id}`}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderAdvancedTab = () => {
    const advancedComponents = components.filter(c => 
      !['minecraft:health', 'minecraft:movement', 'minecraft:navigation.walk', 'minecraft:movement.basic', 'minecraft:jump.static'].includes(c.type) &&
      !c.type.startsWith('minecraft:behavior.')
    );

    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Configure advanced entity properties and custom components.
        </div>
        
        {advancedComponents.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No advanced components added yet. Use "Add Component" to add custom components.</p>
          </div>
        ) : (
          advancedComponents.map((component) => (
            <div key={component.id} className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-foreground">{component.type}</h4>
                  <p className="text-xs text-muted-foreground">Custom component</p>
                </div>
                <Switch
                  checked={component.enabled}
                  onCheckedChange={() => toggleComponent(component.id)}
                  data-testid={`switch-${component.id}-enabled`}
                />
              </div>
              
              <div className="text-sm">
                <Label>Component Properties</Label>
                <pre className="bg-background p-2 rounded text-xs mt-1 overflow-x-auto">
                  {JSON.stringify(component.properties, null, 2)}
                </pre>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <section className="p-6" data-testid="entity-builder">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Builder Form */}
          <div className="builder-form rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Entity Configuration</h3>
            
            {/* Basic Info */}
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="entity-identifier">Entity Identifier</Label>
                <Input
                  id="entity-identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="my_addon:custom_entity"
                  data-testid="input-identifier"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: namespace:identifier (e.g., my_addon:custom_zombie)
                </p>
              </div>
              
              <div>
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Custom Entity"
                  data-testid="input-display-name"
                />
              </div>
            </div>

            {/* Component Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="bg-muted rounded-lg p-1">
                <TabsTrigger value="health" data-testid="tab-health">Health</TabsTrigger>
                <TabsTrigger value="movement" data-testid="tab-movement">Movement</TabsTrigger>
                <TabsTrigger value="behavior" data-testid="tab-behavior">Behavior</TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="health" className="mt-4">
                {renderHealthTab()}
              </TabsContent>

              <TabsContent value="movement" className="mt-4">
                {renderMovementTab()}
              </TabsContent>

              <TabsContent value="behavior" className="mt-4">
                {renderBehaviorTab()}
              </TabsContent>

              <TabsContent value="advanced" className="mt-4">
                {renderAdvancedTab()}
              </TabsContent>
            </Tabs>

            {/* Add Component Button */}
            <Button 
              className="w-full" 
              onClick={() => setShowComponentModal(true)}
              data-testid="button-add-component"
            >
              <Plus className="mr-2" size={16} />
              Add Component
            </Button>
          </div>

          {/* JSON Output */}
          <div className="builder-form rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">Generated JSON</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  data-testid="button-copy-json"
                >
                  <Copy className="mr-2" size={16} />
                  Copy
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm"
                  data-testid="button-export-json"
                >
                  <Download className="mr-2" size={16} />
                  Export
                </Button>
              </div>
            </div>
            
            <CodePreview code={JSON.stringify(entityJSON, null, 2)} language="json" />

            {/* Validation Status */}
            <div className="mt-4">
              <ValidationStatus validation={validation} />
            </div>
          </div>
        </div>
      </div>

      {/* Component Modal */}
      <ComponentModal
        isOpen={showComponentModal}
        onClose={() => setShowComponentModal(false)}
        onAddComponent={addComponent}
        componentType="entity"
      />
    </section>
  );
}
