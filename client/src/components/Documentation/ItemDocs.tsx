import { useState } from "react";
import { Search, Gem, Copy, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodePreview from "@/components/Common/CodePreview";

export default function ItemDocs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('basic-items');

  const itemTopics = [
    {
      id: 'basic-items',
      title: 'Basic Items',
      description: 'Simple items with basic properties'
    },
    {
      id: 'tools-weapons',
      title: 'Tools & Weapons',
      description: 'Items with durability and functionality'
    },
    {
      id: 'food-items',
      title: 'Food Items',
      description: 'Consumable items that restore hunger'
    },
    {
      id: 'custom-behavior',
      title: 'Custom Behavior',
      description: 'Items with scripted functionality'
    }
  ];

  const basicItemExample = `{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:custom_gem",
      "menu_category": {
        "category": "items"
      }
    },
    "components": {
      "minecraft:max_stack_size": 64,
      "minecraft:icon": {
        "texture": "custom_gem"
      },
      "minecraft:display_name": {
        "value": "Custom Gem"
      }
    }
  }
}`;

  const foodItemExample = `{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:custom_food",
      "menu_category": {
        "category": "nature"
      }
    },
    "components": {
      "minecraft:max_stack_size": 64,
      "minecraft:icon": {
        "texture": "custom_food"
      },
      "minecraft:food": {
        "nutrition": 4,
        "saturation_modifier": 0.6,
        "can_always_eat": false
      },
      "minecraft:use_animation": "eat"
    }
  }
}`;

  const toolItemExample = `{
  "format_version": "1.21.0",
  "minecraft:item": {
    "description": {
      "identifier": "my_addon:custom_pickaxe",
      "menu_category": {
        "category": "equipment"
      }
    },
    "components": {
      "minecraft:max_stack_size": 1,
      "minecraft:icon": {
        "texture": "custom_pickaxe"
      },
      "minecraft:durability": {
        "max_durability": 250
      },
      "minecraft:digger": {
        "use_efficiency": true,
        "destroy_speeds": [
          {
            "block": "minecraft:stone",
            "speed": 8
          }
        ]
      }
    }
  }
}`;

  const itemComponents = [
    {
      name: 'minecraft:max_stack_size',
      description: 'Maximum number of items that can be stacked',
      properties: ['value (1-64)'],
      category: 'Basic'
    },
    {
      name: 'minecraft:icon',
      description: 'Texture used for the item icon',
      properties: ['texture'],
      category: 'Visual'
    },
    {
      name: 'minecraft:food',
      description: 'Makes the item consumable as food',
      properties: ['nutrition', 'saturation_modifier'],
      category: 'Consumable'
    },
    {
      name: 'minecraft:durability',
      description: 'Adds durability to tools and weapons',
      properties: ['max_durability', 'damage_chance'],
      category: 'Tools'
    },
    {
      name: 'minecraft:digger',
      description: 'Allows the item to break blocks efficiently',
      properties: ['destroy_speeds', 'use_efficiency'],
      category: 'Tools'
    },
    {
      name: 'minecraft:weapon',
      description: 'Defines weapon properties like attack damage',
      properties: ['on_hurt_entity'],
      category: 'Combat'
    }
  ];

  const filteredComponents = itemComponents.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTopicContent = () => {
    switch (selectedTopic) {
      case 'basic-items':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Basic Item Structure</h3>
              <p className="text-muted-foreground mb-4">
                Basic items are simple objects that players can collect, craft with, or use. 
                They form the foundation of most custom content.
              </p>
              <CodePreview code={basicItemExample} language="json" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Essential Components</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• <strong>identifier:</strong> Unique item ID</p>
                  <p>• <strong>menu_category:</strong> Creative menu placement</p>
                  <p>• <strong>max_stack_size:</strong> Stack limit (1-64)</p>
                  <p>• <strong>icon:</strong> Item texture reference</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Menu Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• <strong>items:</strong> General items</p>
                  <p>• <strong>equipment:</strong> Tools and armor</p>
                  <p>• <strong>nature:</strong> Food and natural items</p>
                  <p>• <strong>construction:</strong> Building materials</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'food-items':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Food Items</h3>
              <p className="text-muted-foreground mb-4">
                Food items can be consumed by players to restore hunger and saturation. 
                They require specific components to function properly.
              </p>
              <CodePreview code={foodItemExample} language="json" />
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Food Properties</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-2">
                    <strong>nutrition:</strong> Hunger points restored (1-20)
                  </p>
                  <p className="text-muted-foreground">
                    <strong>saturation_modifier:</strong> Saturation efficiency (0.0-1.0)
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">
                    <strong>can_always_eat:</strong> Can eat when full
                  </p>
                  <p className="text-muted-foreground">
                    <strong>use_animation:</strong> Animation when consuming
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'tools-weapons':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">Tools & Weapons</h3>
              <p className="text-muted-foreground mb-4">
                Tools and weapons have durability and special functionality for breaking blocks or combat.
              </p>
              <CodePreview code={toolItemExample} language="json" />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Durability System</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Tools break after max_durability uses</p>
                  <p>• damage_chance controls break probability</p>
                  <p>• Can be repaired with materials</p>
                  <p>• Stack size should be 1 for tools</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mining Efficiency</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• destroy_speeds defines break speed</p>
                  <p>• use_efficiency enables faster mining</p>
                  <p>• Target specific block types</p>
                  <p>• Higher speed = faster breaking</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <Gem size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Select a topic to view documentation</p>
          </div>
        );
    }
  };

  return (
    <section className="p-6" data-testid="item-docs">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Item Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Complete guide to creating custom items in Minecraft: Bedrock Edition
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Topic Navigation */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {itemTopics.map((topic) => (
                  <button
                    key={topic.id}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTopic === topic.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setSelectedTopic(topic.id)}
                    data-testid={`topic-${topic.id}`}
                  >
                    <div className="font-medium text-sm">{topic.title}</div>
                    <div className="text-xs opacity-80">{topic.description}</div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Component Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Components</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm"
                    data-testid="input-component-search"
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {filteredComponents.map((component) => (
                    <div
                      key={component.name}
                      className="p-2 border rounded-lg hover:bg-muted cursor-pointer"
                      data-testid={`component-${component.name.replace('minecraft:', '')}`}
                    >
                      <div className="font-mono text-xs text-primary">{component.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{component.description}</div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {component.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                {renderTopicContent()}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex justify-between items-center mt-6">
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://learn.microsoft.com/en-us/minecraft/creator/reference/content/itemreference/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-testid="button-official-docs"
                >
                  <ExternalLink size={14} className="mr-2" />
                  Official Docs
                </a>
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" data-testid="button-copy-example">
                  <Copy size={14} className="mr-2" />
                  Copy Example
                </Button>
                <Button size="sm" data-testid="button-try-builder">
                  Try Item Builder
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
