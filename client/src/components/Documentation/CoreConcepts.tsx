import { useState } from "react";
import { ChevronRight, BookOpen, FileText, Code, Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CodePreview from "@/components/Common/CodePreview";

interface CoreConceptsProps {
  onNavigate: (section: string) => void;
}

export default function CoreConcepts({ onNavigate }: CoreConceptsProps) {
  const [readingProgress] = useState(25);
  const [expandedSections, setExpandedSections] = useState<string[]>(['addon-structure']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const tableOfContents = [
    { id: 'addon-structure', title: '1. Addon Structure', completed: true },
    { id: 'behavior-packs', title: '2. Behavior Packs', completed: true },
    { id: 'resource-packs', title: '3. Resource Packs', completed: false },
    { id: 'manifests', title: '4. Manifests', completed: false },
    { id: 'components', title: '5. Components', completed: false },
    { id: 'events', title: '6. Events', completed: false },
    { id: 'identifiers', title: '7. Identifiers', completed: false },
    { id: 'best-practices', title: '8. Best Practices', completed: false },
  ];

  const sampleManifest = `{
  "format_version": 2,
  "header": {
    "description": "My Custom Addon",
    "name": "My Addon",
    "uuid": "b6b0b3d6-6b6b-4b6b-8b6b-6b6b6b6b6b6b",
    "version": [1, 0, 0],
    "min_engine_version": [1, 21, 0]
  },
  "modules": [
    {
      "description": "Behavior Pack Module",
      "type": "data",
      "uuid": "a5a5a5a5-5a5a-4a5a-8a5a-5a5a5a5a5a5a",
      "version": [1, 0, 0]
    }
  ]
}`;

  const sampleEntity = `{
  "format_version": "1.21.0",
  "minecraft:entity": {
    "description": {
      "identifier": "my_addon:custom_pig",
      "is_spawnable": true,
      "is_summonable": true
    },
    "components": {
      "minecraft:health": {
        "value": 10,
        "max": 10
      },
      "minecraft:movement": {
        "value": 0.25
      }
    }
  }
}`;

  return (
    <section className="p-6" data-testid="core-concepts">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Core Concepts</h1>
          <p className="text-lg text-muted-foreground">
            Understanding the fundamentals of Minecraft: Bedrock Edition addon development
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Reading Progress</span>
              <span className="text-sm text-muted-foreground">{readingProgress}%</span>
            </div>
            <Progress value={readingProgress} className="mb-4" />
            <p className="text-sm text-muted-foreground">
              Track your progress through the core concepts documentation
            </p>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2" size={20} />
              Table of Contents
            </CardTitle>
            <CardDescription>
              Navigate through the core concepts of addon development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2">
                {tableOfContents.slice(0, 4).map((item) => (
                  <li key={item.id}>
                    <button
                      className="flex items-center text-left hover:text-primary transition-colors"
                      onClick={() => toggleSection(item.id)}
                      data-testid={`toc-${item.id}`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-3 ${item.completed ? 'bg-primary' : 'bg-muted'}`} />
                      <span className="text-sm">{item.title}</span>
                      <ChevronRight 
                        className={`ml-auto transition-transform ${expandedSections.includes(item.id) ? 'rotate-90' : ''}`}
                        size={16} 
                      />
                    </button>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2">
                {tableOfContents.slice(4).map((item) => (
                  <li key={item.id}>
                    <button
                      className="flex items-center text-left hover:text-primary transition-colors"
                      onClick={() => toggleSection(item.id)}
                      data-testid={`toc-${item.id}`}
                    >
                      <div className={`w-2 h-2 rounded-full mr-3 ${item.completed ? 'bg-primary' : 'bg-muted'}`} />
                      <span className="text-sm">{item.title}</span>
                      <ChevronRight 
                        className={`ml-auto transition-transform ${expandedSections.includes(item.id) ? 'rotate-90' : ''}`}
                        size={16} 
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <div className="space-y-8">
          {/* Addon Structure */}
          <Collapsible 
            open={expandedSections.includes('addon-structure')}
            onOpenChange={() => toggleSection('addon-structure')}
          >
            <CollapsibleTrigger className="w-full" data-testid="section-addon-structure">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-left flex items-center justify-between">
                    <span className="flex items-center">
                      <Layers className="mr-2" size={20} />
                      1. Addon Structure
                    </span>
                    <ChevronRight 
                      className={`transition-transform ${expandedSections.includes('addon-structure') ? 'rotate-90' : ''}`}
                      size={20} 
                    />
                  </CardTitle>
                  <CardDescription className="text-left">
                    Understanding the fundamental structure of Minecraft addons
                  </CardDescription>
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground mb-4">
                  Minecraft: Bedrock Edition addons consist of two main components: Behavior Packs and Resource Packs. 
                  Understanding their structure is crucial for successful addon development.
                </p>
                
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-foreground mb-2">Typical Addon Structure:</h4>
                  <CodePreview 
                    code={`My_Addon/
├── Behavior_Pack/
│   ├── manifest.json
│   ├── entities/
│   │   └── custom_entity.json
│   ├── items/
│   │   └── custom_item.json
│   ├── blocks/
│   │   └── custom_block.json
│   ├── recipes/
│   │   └── custom_recipe.json
│   └── scripts/
│       └── main.js
└── Resource_Pack/
    ├── manifest.json
    ├── textures/
    │   ├── entity/
    │   ├── blocks/
    │   └── items/
    ├── models/
    │   └── entity/
    ├── sounds/
    └── animations/`}
                    language="text"
                  />
                </div>

                <div className="tutorial-step p-4 rounded-lg mb-4">
                  <h4 className="font-medium text-foreground mb-2">📁 Folder Organization</h4>
                  <p className="text-muted-foreground text-sm">
                    Each addon should have a clear folder structure. Behavior packs contain game logic, 
                    while resource packs contain visual and audio assets. The manifest.json files are 
                    essential for Minecraft to recognize your addon.
                  </p>
                </div>

                <div className="bg-accent/10 border border-accent rounded-lg p-4">
                  <h4 className="font-medium text-foreground mb-2">Key Points:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Behavior packs define game mechanics and logic</li>
                    <li>Resource packs define visual and audio elements</li>
                    <li>Each pack must have a unique manifest.json file</li>
                    <li>File names and folder structure matter</li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Behavior Packs */}
          <Collapsible 
            open={expandedSections.includes('behavior-packs')}
            onOpenChange={() => toggleSection('behavior-packs')}
          >
            <CollapsibleTrigger className="w-full" data-testid="section-behavior-packs">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-left flex items-center justify-between">
                    <span className="flex items-center">
                      <Code className="mr-2" size={20} />
                      2. Behavior Packs
                    </span>
                    <ChevronRight 
                      className={`transition-transform ${expandedSections.includes('behavior-packs') ? 'rotate-90' : ''}`}
                      size={20} 
                    />
                  </CardTitle>
                  <CardDescription className="text-left">
                    The logic engine of your addon - entities, blocks, and game mechanics
                  </CardDescription>
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground mb-4">
                  Behavior packs define how entities, blocks, and items behave in the game. 
                  They contain the logic and functionality of your custom content.
                </p>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">🎯 Entity Behaviors</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        Define AI, movement, health, and interaction logic for custom mobs and NPCs.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">🧱 Block Logic</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        Control block properties, states, and interactions with players and other entities.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-foreground mb-3">Sample Entity Definition:</h4>
                  <CodePreview code={sampleEntity} language="json" />
                </div>

                <div className="tutorial-step p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">💡 Pro Tip</h4>
                  <p className="text-muted-foreground text-sm">
                    Start with simple entities and gradually add more complex behaviors. 
                    Use the official Minecraft documentation to understand available components.
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Manifest Files */}
          <Collapsible 
            open={expandedSections.includes('manifests')}
            onOpenChange={() => toggleSection('manifests')}
          >
            <CollapsibleTrigger className="w-full" data-testid="section-manifests">
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="text-left flex items-center justify-between">
                    <span className="flex items-center">
                      <FileText className="mr-2" size={20} />
                      4. Manifests
                    </span>
                    <ChevronRight 
                      className={`transition-transform ${expandedSections.includes('manifests') ? 'rotate-90' : ''}`}
                      size={20} 
                    />
                  </CardTitle>
                  <CardDescription className="text-left">
                    The configuration files that tell Minecraft about your addon
                  </CardDescription>
                </CardHeader>
              </Card>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground mb-4">
                  The manifest.json file is the heart of every pack. It contains metadata about your addon, 
                  including its name, version, and dependencies.
                </p>

                <div className="mb-6">
                  <h4 className="font-medium text-foreground mb-3">Sample Manifest File:</h4>
                  <CodePreview code={sampleManifest} language="json" />
                </div>

                <div className="bg-muted rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-foreground mb-2">Important Fields:</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li><strong>format_version:</strong> The manifest format version (use 2)</li>
                    <li><strong>header.uuid:</strong> Must be unique for each pack</li>
                    <li><strong>header.version:</strong> Your pack version [major, minor, patch]</li>
                    <li><strong>min_engine_version:</strong> Minimum Minecraft version required</li>
                    <li><strong>modules:</strong> Defines what type of pack this is</li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Interactive Example */}
        <Card className="bg-accent/10 border-accent">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="mr-2" size={20} />
              Interactive Example
            </CardTitle>
            <CardDescription>
              Try creating a simple entity to see how behavior packs work
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onNavigate('builder-entity')}
              data-testid="button-open-entity-builder"
            >
              <ArrowRight className="mr-2" size={16} />
              Open Entity Builder
            </Button>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t border-border">
          <Button 
            variant="secondary" 
            disabled
            data-testid="button-previous-concept"
          >
            Previous
          </Button>
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-2 h-2 bg-muted rounded-full"></div>
            <div className="w-2 h-2 bg-muted rounded-full"></div>
            <div className="w-2 h-2 bg-muted rounded-full"></div>
          </div>
          <Button 
            onClick={() => onNavigate('docs-entities')}
            data-testid="button-next-concept"
          >
            Next <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
