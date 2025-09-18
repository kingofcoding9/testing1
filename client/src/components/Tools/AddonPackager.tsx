import { useState } from "react";
import { Download, Package, File, Folder, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { exportAddonPack } from "@/lib/export/addon";

interface AddonFile {
  path: string;
  type: 'behavior' | 'resource';
  content: string;
  size: number;
}

export default function AddonPackager() {
  const [addonName, setAddonName] = useLocalStorage('addon-name', '');
  const [addonDescription, setAddonDescription] = useLocalStorage('addon-description', '');
  const [authorName, setAuthorName] = useLocalStorage('addon-author', '');
  const [version, setVersion] = useLocalStorage('addon-version', '1.0.0');
  const [minEngineVersion, setMinEngineVersion] = useLocalStorage('addon-min-engine', '1.21.0');
  const [includeBehaviorPack, setIncludeBehaviorPack] = useLocalStorage('addon-include-bp', true);
  const [includeResourcePack, setIncludeResourcePack] = useLocalStorage('addon-include-rp', true);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [files] = useState<AddonFile[]>([
    {
      path: 'entities/custom_entity.json',
      type: 'behavior',
      content: '{"format_version": "1.21.0"}',
      size: 1024
    },
    {
      path: 'blocks/custom_block.json',
      type: 'behavior',
      content: '{"format_version": "1.21.0"}',
      size: 2048
    },
    {
      path: 'textures/entity/custom_entity.png',
      type: 'resource',
      content: 'binary',
      size: 4096
    }
  ]);

  const behaviorFiles = files.filter(f => f.type === 'behavior');
  const resourceFiles = files.filter(f => f.type === 'resource');

  const packConfig = {
    name: addonName,
    description: addonDescription,
    author: authorName,
    version,
    minEngineVersion,
    includeBehaviorPack,
    includeResourcePack,
    files
  };

  const validateConfig = () => {
    const errors = [];
    if (!addonName.trim()) errors.push('Addon name is required');
    if (!authorName.trim()) errors.push('Author name is required');
    if (!version.trim()) errors.push('Version is required');
    if (!includeBehaviorPack && !includeResourcePack) {
      errors.push('At least one pack type must be included');
    }
    return errors;
  };

  const validationErrors = validateConfig();
  const isValid = validationErrors.length === 0;

  const handleExport = async () => {
    if (!isValid) return;

    setIsExporting(true);
    setExportProgress(0);
    setExportStatus('idle');

    try {
      // Simulate export progress
      const steps = [
        'Generating manifests...',
        'Collecting behavior pack files...',
        'Collecting resource pack files...',
        'Creating archive structure...',
        'Compressing files...',
        'Finalizing export...'
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setExportProgress((i + 1) / steps.length * 100);
      }

      const blob = await exportAddonPack(packConfig);
      
      // Download the file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${addonName.replace(/[^a-zA-Z0-9]/g, '_')}.mcaddon`;
      a.click();
      URL.revokeObjectURL(url);

      setExportStatus('success');
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
    } finally {
      setIsExporting(false);
      setTimeout(() => {
        setExportProgress(0);
        setExportStatus('idle');
      }, 3000);
    }
  };

  const getTotalSize = (fileList: AddonFile[]) => {
    const totalBytes = fileList.reduce((sum, file) => sum + file.size, 0);
    return totalBytes < 1024 ? `${totalBytes} B` : `${(totalBytes / 1024).toFixed(1)} KB`;
  };

  return (
    <section className="p-6" data-testid="addon-packager">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <div className="builder-form rounded-lg p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Addon Configuration</h3>
              
              <Tabs defaultValue="basic" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="basic" data-testid="tab-basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="packs" data-testid="tab-packs">Pack Settings</TabsTrigger>
                  <TabsTrigger value="advanced" data-testid="tab-advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="addon-name">Addon Name</Label>
                      <Input
                        id="addon-name"
                        value={addonName}
                        onChange={(e) => setAddonName(e.target.value)}
                        placeholder="My Custom Addon"
                        data-testid="input-addon-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="author-name">Author</Label>
                      <Input
                        id="author-name"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Your Name"
                        data-testid="input-author-name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="addon-description">Description</Label>
                    <Textarea
                      id="addon-description"
                      value={addonDescription}
                      onChange={(e) => setAddonDescription(e.target.value)}
                      placeholder="Describe your addon..."
                      rows={3}
                      data-testid="textarea-addon-description"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="1.0.0"
                        data-testid="input-version"
                      />
                    </div>
                    <div>
                      <Label htmlFor="min-engine-version">Min Engine Version</Label>
                      <Input
                        id="min-engine-version"
                        value={minEngineVersion}
                        onChange={(e) => setMinEngineVersion(e.target.value)}
                        placeholder="1.21.0"
                        data-testid="input-min-engine-version"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="packs" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium text-foreground">Include Behavior Pack</h4>
                        <p className="text-sm text-muted-foreground">Contains game logic, entities, and blocks</p>
                      </div>
                      <Switch
                        checked={includeBehaviorPack}
                        onCheckedChange={setIncludeBehaviorPack}
                        data-testid="switch-include-behavior-pack"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <h4 className="font-medium text-foreground">Include Resource Pack</h4>
                        <p className="text-sm text-muted-foreground">Contains textures, models, and sounds</p>
                      </div>
                      <Switch
                        checked={includeResourcePack}
                        onCheckedChange={setIncludeResourcePack}
                        data-testid="switch-include-resource-pack"
                      />
                    </div>
                  </div>

                  {/* File Preview */}
                  <div className="space-y-4">
                    {includeBehaviorPack && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">
                          Behavior Pack Files ({behaviorFiles.length})
                        </h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {behaviorFiles.map((file, index) => (
                            <div key={index} className="flex items-center p-2 bg-muted rounded text-sm">
                              <File className="mr-2" size={16} />
                              <span className="flex-1">{file.path}</span>
                              <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {includeResourcePack && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2">
                          Resource Pack Files ({resourceFiles.length})
                        </h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {resourceFiles.map((file, index) => (
                            <div key={index} className="flex items-center p-2 bg-muted rounded text-sm">
                              <File className="mr-2" size={16} />
                              <span className="flex-1">{file.path}</span>
                              <span className="text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="text-center text-muted-foreground py-8">
                    <p>Advanced packaging options will be available soon</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Export Panel */}
          <div className="space-y-6">
            {/* Pack Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2" size={20} />
                  Pack Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Files:</span>
                  <span className="font-medium">{files.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Size:</span>
                  <span className="font-medium">{getTotalSize(files)}</span>
                </div>
                {includeBehaviorPack && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Behavior Pack:</span>
                    <span className="font-medium">{getTotalSize(behaviorFiles)}</span>
                  </div>
                )}
                {includeResourcePack && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resource Pack:</span>
                    <span className="font-medium">{getTotalSize(resourceFiles)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Validation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {isValid ? (
                    <Check className="mr-2 text-green-500" size={20} />
                  ) : (
                    <AlertCircle className="mr-2 text-destructive" size={20} />
                  )}
                  Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isValid ? (
                  <p className="text-green-600 text-sm">All configurations are valid and ready for export.</p>
                ) : (
                  <div className="space-y-2">
                    {validationErrors.map((error, index) => (
                      <p key={index} className="text-destructive text-sm flex items-center">
                        <AlertCircle className="mr-2" size={16} />
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Export */}
            <Card>
              <CardHeader>
                <CardTitle>Export Addon</CardTitle>
                <CardDescription>
                  Generate a .mcaddon file ready for installation in Minecraft
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isExporting && (
                  <div>
                    <Progress value={exportProgress} className="mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      Exporting... {Math.round(exportProgress)}%
                    </p>
                  </div>
                )}

                {exportStatus === 'success' && (
                  <div className="p-3 bg-green-500/10 border border-green-500 rounded-lg">
                    <div className="flex items-center text-green-600">
                      <Check className="mr-2" size={16} />
                      <span className="text-sm">Export completed successfully!</span>
                    </div>
                  </div>
                )}

                {exportStatus === 'error' && (
                  <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
                    <div className="flex items-center text-destructive">
                      <AlertCircle className="mr-2" size={16} />
                      <span className="text-sm">Export failed. Please try again.</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={handleExport}
                  disabled={!isValid || isExporting}
                  data-testid="button-export-addon"
                >
                  <Download className="mr-2" size={16} />
                  {isExporting ? 'Exporting...' : 'Export Addon'}
                </Button>

                <div className="text-xs text-muted-foreground">
                  <p>The exported .mcaddon file can be imported directly into Minecraft: Bedrock Edition.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
