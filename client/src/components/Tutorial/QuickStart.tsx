import { useState } from "react";
import { Rocket, CheckCircle, ExternalLink, Download, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodePreview from "@/components/Common/CodePreview";

interface QuickStartProps {
  onNavigate: (section: string) => void;
}

export default function QuickStart({ onNavigate }: QuickStartProps) {
  const [activeTrack, setActiveTrack] = useState('beginner');

  const quickStartTracks = {
    beginner: {
      title: 'Beginner Track',
      description: 'Perfect for first-time addon creators',
      estimatedTime: '30 minutes',
      steps: [
        {
          title: 'Setup Development Environment',
          description: 'Install required tools and setup workspace',
          time: '5 min',
          action: 'Download Tools',
          actionType: 'download'
        },
        {
          title: 'Create Your First Block',
          description: 'Build a simple custom block with unique properties',
          time: '10 min',
          action: 'Open Block Builder',
          actionType: 'navigate',
          section: 'builder-block'
        },
        {
          title: 'Add Custom Texture',
          description: 'Design a texture for your block using the texture creator',
          time: '10 min',
          action: 'Open Texture Creator',
          actionType: 'navigate',
          section: 'texture-creator'
        },
        {
          title: 'Package & Test',
          description: 'Export your addon and test it in Minecraft',
          time: '5 min',
          action: 'Open Packager',
          actionType: 'navigate',
          section: 'addon-packager'
        }
      ]
    },
    intermediate: {
      title: 'Intermediate Track',
      description: 'For users with basic addon experience',
      estimatedTime: '45 minutes',
      steps: [
        {
          title: 'Create Custom Entity',
          description: 'Build a mob with AI behaviors and custom properties',
          time: '15 min',
          action: 'Open Entity Builder',
          actionType: 'navigate',
          section: 'builder-entity'
        },
        {
          title: 'Add Scripted Behaviors',
          description: 'Use JavaScript to add advanced functionality',
          time: '20 min',
          action: 'Open Script Studio',
          actionType: 'navigate',
          section: 'script-studio'
        },
        {
          title: 'Create Loot Tables',
          description: 'Define what your entity drops when defeated',
          time: '10 min',
          action: 'Open Loot Builder',
          actionType: 'navigate',
          section: 'builder-loot'
        }
      ]
    },
    advanced: {
      title: 'Advanced Track',
      description: 'Complex addon development techniques',
      estimatedTime: '60 minutes',
      steps: [
        {
          title: 'Custom Biome Creation',
          description: 'Design entirely new world generation',
          time: '20 min',
          action: 'Open Biome Builder',
          actionType: 'navigate',
          section: 'builder-biome'
        },
        {
          title: 'Advanced Scripting',
          description: 'Complex event handling and API integration',
          time: '25 min',
          action: 'View Script Docs',
          actionType: 'navigate',
          section: 'docs-scripting'
        },
        {
          title: 'Performance Optimization',
          description: 'Optimize your addon for better performance',
          time: '15 min',
          action: 'View Best Practices',
          actionType: 'docs'
        }
      ]
    }
  };

  const sampleManifest = `{
  "format_version": 2,
  "header": {
    "name": "My First Addon",
    "description": "A simple custom block addon",
    "uuid": "12345678-1234-1234-1234-123456789012",
    "version": [1, 0, 0],
    "min_engine_version": [1, 21, 0]
  },
  "modules": [
    {
      "type": "data",
      "uuid": "87654321-4321-4321-4321-210987654321",
      "version": [1, 0, 0]
    }
  ]
}`;

  const sampleBlock = `{
  "format_version": "1.21.0",
  "minecraft:block": {
    "description": {
      "identifier": "my_addon:custom_stone"
    },
    "components": {
      "minecraft:destructible_by_mining": {
        "seconds_to_destroy": 2.0
      },
      "minecraft:map_color": "#7F7F7F"
    }
  }
}`;

  const handleAction = (step: any) => {
    if (step.actionType === 'navigate' && step.section) {
      onNavigate(step.section);
    } else if (step.actionType === 'download') {
      // Handle download action
      window.open('https://code.visualstudio.com/', '_blank');
    }
  };

  const currentTrack = quickStartTracks[activeTrack as keyof typeof quickStartTracks];

  return (
    <section className="p-6" data-testid="quick-start">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Quick Start Guide</h1>
          <p className="text-lg text-muted-foreground">
            Fast track to creating your first addon - choose your experience level
          </p>
        </div>

        {/* Track Selection */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Object.entries(quickStartTracks).map(([key, track]) => (
            <Card
              key={key}
              className={`cursor-pointer transition-colors ${
                activeTrack === key ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
              }`}
              onClick={() => setActiveTrack(key)}
              data-testid={`track-${key}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{track.title}</span>
                  {activeTrack === key && <CheckCircle className="text-primary" size={20} />}
                </CardTitle>
                <CardDescription>{track.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{track.estimatedTime}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Steps List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Rocket className="mr-2" size={20} />
                  {currentTrack.title} Steps
                </CardTitle>
                <CardDescription>
                  Follow these steps to complete your first addon in {currentTrack.estimatedTime}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentTrack.steps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start p-4 border rounded-lg hover:bg-muted transition-colors"
                      data-testid={`step-${index}`}
                    >
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                        <span className="text-sm font-bold text-primary-foreground">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{step.title}</h4>
                          <Badge variant="secondary" className="text-xs">{step.time}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                        <Button
                          size="sm"
                          onClick={() => handleAction(step)}
                          data-testid={`action-${index}`}
                        >
                          {step.actionType === 'navigate' ? (
                            <Play className="mr-2" size={14} />
                          ) : step.actionType === 'download' ? (
                            <Download className="mr-2" size={14} />
                          ) : (
                            <ExternalLink className="mr-2" size={14} />
                          )}
                          {step.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resources & Code Samples */}
          <div className="space-y-6">
            {/* Quick Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Reference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="manifest">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manifest">Manifest</TabsTrigger>
                    <TabsTrigger value="block">Block</TabsTrigger>
                  </TabsList>
                  <TabsContent value="manifest" className="mt-4">
                    <div className="text-xs">
                      <CodePreview code={sampleManifest} language="json" />
                    </div>
                  </TabsContent>
                  <TabsContent value="block" className="mt-4">
                    <div className="text-xs">
                      <CodePreview code={sampleBlock} language="json" />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Essential Tools */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Essential Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Visual Studio Code</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer">
                      <Download size={14} />
                    </a>
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Blockbench (Models)</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://blockbench.net/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} />
                    </a>
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bridge. (IDE)</span>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://bridge-core.app/" target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Always backup your worlds before testing</p>
                <p>• Use descriptive identifiers for your content</p>
                <p>• Test in creative mode first</p>
                <p>• Check the console for error messages</p>
                <p>• Join the Minecraft Bedrock community for help</p>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">After Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => onNavigate('tutorial')}
                  data-testid="button-full-tutorial"
                >
                  Take Full Tutorial
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => onNavigate('docs-concepts')}
                  data-testid="button-read-docs"
                >
                  Read Documentation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
