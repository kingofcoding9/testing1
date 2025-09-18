import { useState } from "react";
import { Copy, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodePreview from "@/components/Common/CodePreview";
import ValidationStatus from "@/components/Common/ValidationStatus";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function ClientEntityBuilder() {
  const [identifier, setIdentifier] = useLocalStorage('client-entity-identifier', '');
  const [geometryModel, setGeometryModel] = useLocalStorage('client-entity-geometry', '');
  const [textureDefault, setTextureDefault] = useLocalStorage('client-entity-texture-default', '');
  const [renderDistance, setRenderDistance] = useLocalStorage('client-entity-render-distance', '50');
  const [enableOutline, setEnableOutline] = useLocalStorage('client-entity-outline', false);
  const [activeTab, setActiveTab] = useState('basic');

  const clientEntityConfig = {
    identifier,
    geometryModel,
    textureDefault,
    renderDistance: parseInt(renderDistance) || 50,
    enableOutline
  };

  const clientEntityJSON = {
    "format_version": "1.21.0",
    "minecraft:client_entity": {
      "description": {
        "identifier": clientEntityConfig.identifier || "my_addon:custom_entity",
        "materials": {
          "default": "entity_alphatest"
        },
        "textures": {
          "default": clientEntityConfig.textureDefault || "textures/entity/custom_entity"
        },
        "geometry": {
          "default": clientEntityConfig.geometryModel || "geometry.custom_entity"
        },
        "render_controllers": [
          "controller.render.default"
        ]
      }
    }
  };

  const validation = { isValid: true, errors: [] };

  return (
    <section className="p-6" data-testid="client-entity-builder">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Builder Form */}
          <div className="builder-form rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4">Client Entity Configuration</h3>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="bg-muted rounded-lg p-1">
                <TabsTrigger value="basic" data-testid="tab-basic">Basic</TabsTrigger>
                <TabsTrigger value="rendering" data-testid="tab-rendering">Rendering</TabsTrigger>
                <TabsTrigger value="animations" data-testid="tab-animations">Animations</TabsTrigger>
                <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div>
                  <Label htmlFor="client-entity-identifier">Entity Identifier</Label>
                  <Input
                    id="client-entity-identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="my_addon:custom_entity"
                    data-testid="input-identifier"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must match the behavior pack entity identifier
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="geometry-model">Geometry Model</Label>
                  <Input
                    id="geometry-model"
                    value={geometryModel}
                    onChange={(e) => setGeometryModel(e.target.value)}
                    placeholder="geometry.custom_entity"
                    data-testid="input-geometry-model"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Reference to the 3D model geometry
                  </p>
                </div>

                <div>
                  <Label htmlFor="texture-default">Default Texture Path</Label>
                  <Input
                    id="texture-default"
                    value={textureDefault}
                    onChange={(e) => setTextureDefault(e.target.value)}
                    placeholder="textures/entity/custom_entity"
                    data-testid="input-texture-default"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Path to the entity texture file
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="rendering" className="space-y-4">
                <div>
                  <Label htmlFor="render-distance">Render Distance</Label>
                  <Input
                    id="render-distance"
                    type="number"
                    min="1"
                    max="256"
                    value={renderDistance}
                    onChange={(e) => setRenderDistance(e.target.value)}
                    data-testid="input-render-distance"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum distance at which entity is rendered (in blocks)
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <h4 className="font-medium text-foreground">Enable Outline</h4>
                    <p className="text-xs text-muted-foreground">Show selection outline when targeted</p>
                  </div>
                  <Switch
                    checked={enableOutline}
                    onCheckedChange={setEnableOutline}
                    data-testid="switch-enable-outline"
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Material Types</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>entity_alphatest:</strong> Standard entity rendering with transparency</p>
                    <p><strong>entity_static:</strong> Static entities without animations</p>
                    <p><strong>entity_emissive:</strong> Entities that emit light</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="animations" className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  <p>Animation configuration will be available soon</p>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="text-center text-muted-foreground py-8">
                  <p>Advanced rendering properties will be available soon</p>
                </div>
              </TabsContent>
            </Tabs>
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
            
            <CodePreview code={JSON.stringify(clientEntityJSON, null, 2)} language="json" />

            <div className="mt-4">
              <ValidationStatus validation={validation} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
