import { useState } from "react";
import { X, Search, Parentheses, Cog, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComponent: (componentType: string) => void;
  componentType: 'entity' | 'block' | 'item';
}

export default function ComponentModal({ isOpen, onClose, onAddComponent, componentType }: ComponentModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const componentCategories = {
    entity: {
      movement: {
        icon: Target,
        components: [
          {
            name: 'minecraft:movement',
            description: 'Basic movement speed',
            category: 'movement'
          },
          {
            name: 'minecraft:navigation.walk',
            description: 'Ground navigation',
            category: 'movement'
          },
          {
            name: 'minecraft:jump.static',
            description: 'Jumping ability',
            category: 'movement'
          },
          {
            name: 'minecraft:movement.basic',
            description: 'Basic movement mechanics',
            category: 'movement'
          }
        ]
      },
      behavior: {
        icon: Parentheses,
        components: [
          {
            name: 'minecraft:behavior.random_stroll',
            description: 'Random walking behavior',
            category: 'behavior'
          },
          {
            name: 'minecraft:behavior.look_at_player',
            description: 'Look at nearby players',
            category: 'behavior'
          },
          {
            name: 'minecraft:behavior.panic',
            description: 'Flee when attacked',
            category: 'behavior'
          },
          {
            name: 'minecraft:behavior.float',
            description: 'Float in water',
            category: 'behavior'
          }
        ]
      },
      attributes: {
        icon: Cog,
        components: [
          {
            name: 'minecraft:health',
            description: 'Entity health points',
            category: 'attributes'
          },
          {
            name: 'minecraft:attack',
            description: 'Attack damage',
            category: 'attributes'
          },
          {
            name: 'minecraft:scale',
            description: 'Entity size multiplier',
            category: 'attributes'
          }
        ]
      },
      physics: {
        icon: Zap,
        components: [
          {
            name: 'minecraft:physics',
            description: 'Physics simulation',
            category: 'physics'
          },
          {
            name: 'minecraft:collision_box',
            description: 'Collision boundaries',
            category: 'physics'
          },
          {
            name: 'minecraft:pushable',
            description: 'Can be pushed by entities',
            category: 'physics'
          }
        ]
      }
    },
    block: {
      basic: {
        icon: Cog,
        components: [
          {
            name: 'minecraft:destructible_by_mining',
            description: 'Mining properties',
            category: 'basic'
          },
          {
            name: 'minecraft:destructible_by_explosion',
            description: 'Explosion resistance',
            category: 'basic'
          },
          {
            name: 'minecraft:friction',
            description: 'Surface friction',
            category: 'basic'
          }
        ]
      },
      visual: {
        icon: Target,
        components: [
          {
            name: 'minecraft:geometry',
            description: 'Custom 3D model',
            category: 'visual'
          },
          {
            name: 'minecraft:material_instances',
            description: 'Texture and rendering',
            category: 'visual'
          },
          {
            name: 'minecraft:map_color',
            description: 'Color on maps',
            category: 'visual'
          }
        ]
      }
    },
    item: {
      basic: {
        icon: Cog,
        components: [
          {
            name: 'minecraft:max_stack_size',
            description: 'Stack size limit',
            category: 'basic'
          },
          {
            name: 'minecraft:icon',
            description: 'Item texture',
            category: 'basic'
          },
          {
            name: 'minecraft:display_name',
            description: 'Item display name',
            category: 'basic'
          }
        ]
      },
      functionality: {
        icon: Parentheses,
        components: [
          {
            name: 'minecraft:food',
            description: 'Consumable food item',
            category: 'functionality'
          },
          {
            name: 'minecraft:durability',
            description: 'Tool durability',
            category: 'functionality'
          },
          {
            name: 'minecraft:weapon',
            description: 'Weapon properties',
            category: 'functionality'
          }
        ]
      }
    }
  };

  const currentComponents = componentCategories[componentType] || {};
  
  const allComponents = Object.values(currentComponents).flatMap(category => category.components);
  
  const filteredComponents = allComponents.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Object.keys(currentComponents);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden" data-testid="component-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add Component
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-modal">
              <X size={16} />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Choose a component to add to your {componentType}
          </DialogDescription>
        </DialogHeader>

        <div className="flex space-x-4 h-96">
          {/* Search and Filters */}
          <div className="w-1/3 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search components..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-component-search"
              />
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-1 h-auto">
                <TabsTrigger value="all" className="justify-start" data-testid="filter-all">
                  All Categories
                </TabsTrigger>
                {categories.map((category) => {
                  const CategoryIcon = currentComponents[category].icon;
                  return (
                    <TabsTrigger 
                      key={category} 
                      value={category} 
                      className="justify-start"
                      data-testid={`filter-${category}`}
                    >
                      <CategoryIcon className="mr-2" size={16} />
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>

          {/* Component List */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid gap-3">
              {filteredComponents.length > 0 ? (
                filteredComponents.map((component) => (
                  <div
                    key={component.name}
                    className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => {
                      onAddComponent(component.name);
                      onClose();
                    }}
                    data-testid={`component-${component.name.replace('minecraft:', '').replace(':', '-')}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-mono text-sm font-medium text-primary mb-1">
                          {component.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {component.description}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {component.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No components found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} data-testid="button-cancel">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
