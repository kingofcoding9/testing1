import { useState, useMemo } from "react";
import { Search, Plus, Filter, Info, Zap, Settings, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface ComponentItem {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  version: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  properties: any[];
  example: string;
  keywords: string[];
  stability: 'stable' | 'experimental' | 'beta';
  dependencies?: string[];
  conflicts?: string[];
}

interface ComponentSelectorProps {
  components: ComponentItem[];
  selectedComponents: string[];
  onAddComponent: (componentName: string) => void;
  onRemoveComponent?: (componentName: string) => void;
  title?: string;
  description?: string;
  maxComponents?: number;
  showCategories?: boolean;
  showCompatibility?: boolean;
}

export default function ComponentSelector({
  components,
  selectedComponents,
  onAddComponent,
  onRemoveComponent,
  title = "Component Selector",
  description = "Choose components to add to your build",
  maxComponents,
  showCategories = true,
  showCompatibility = true
}: ComponentSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedStability, setSelectedStability] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("browse");

  // Group components by category
  const categories = useMemo(() => {
    const cats = Array.from(new Set(components.map(c => c.category)));
    return cats.sort();
  }, [components]);

  // Filter components based on search and filters
  const filteredComponents = useMemo(() => {
    return components.filter(component => {
      const matchesSearch = 
        component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        component.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === "all" || component.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "all" || component.difficulty === selectedDifficulty;
      const matchesStability = selectedStability === "all" || component.stability === selectedStability;
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesStability;
    });
  }, [components, searchTerm, selectedCategory, selectedDifficulty, selectedStability]);

  // Group filtered components by category
  const componentsByCategory = useMemo(() => {
    const grouped: Record<string, ComponentItem[]> = {};
    filteredComponents.forEach(component => {
      if (!grouped[component.category]) {
        grouped[component.category] = [];
      }
      grouped[component.category].push(component);
    });
    return grouped;
  }, [filteredComponents]);

  // Check component compatibility
  const checkCompatibility = (component: ComponentItem) => {
    if (!showCompatibility) return { compatible: true, issues: [] };
    
    const issues: string[] = [];
    const selectedComponentObjects = components.filter(c => selectedComponents.includes(c.name));
    
    // Check conflicts
    if (component.conflicts) {
      const conflictingSelected = component.conflicts.filter(conflict => 
        selectedComponents.includes(conflict)
      );
      if (conflictingSelected.length > 0) {
        issues.push(`Conflicts with: ${conflictingSelected.join(', ')}`);
      }
    }
    
    // Check dependencies
    if (component.dependencies) {
      const missingDeps = component.dependencies.filter(dep => 
        !selectedComponents.includes(dep)
      );
      if (missingDeps.length > 0) {
        issues.push(`Requires: ${missingDeps.join(', ')}`);
      }
    }
    
    // Check for reverse conflicts
    selectedComponentObjects.forEach(selected => {
      if (selected.conflicts?.includes(component.name)) {
        issues.push(`Conflicts with selected: ${selected.name}`);
      }
    });
    
    return {
      compatible: issues.length === 0,
      issues
    };
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return <Zap className="w-3 h-3 text-green-500" />;
      case 'intermediate': return <Settings className="w-3 h-3 text-yellow-500" />;
      case 'advanced': return <AlertTriangle className="w-3 h-3 text-red-500" />;
      default: return null;
    }
  };

  const getStabilityColor = (stability: string) => {
    switch (stability) {
      case 'stable': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'beta': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'experimental': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const isComponentSelected = (componentName: string) => selectedComponents.includes(componentName);
  const canAddMore = !maxComponents || selectedComponents.length < maxComponents;

  return (
    <TooltipProvider>
      <Card className="component-selector">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browse" data-testid="tab-browse">Browse Components</TabsTrigger>
              <TabsTrigger value="selected" data-testid="tab-selected">
                Selected ({selectedComponents.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search components..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                    data-testid="input-search-components"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {showCategories && (
                    <div>
                      <Label htmlFor="category-filter">Category</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger id="category-filter" data-testid="select-category">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <div>
                    <Label htmlFor="difficulty-filter">Difficulty</Label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger id="difficulty-filter" data-testid="select-difficulty">
                        <SelectValue placeholder="All Levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="stability-filter">Stability</Label>
                    <Select value={selectedStability} onValueChange={setSelectedStability}>
                      <SelectTrigger id="stability-filter" data-testid="select-stability">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                        <SelectItem value="beta">Beta</SelectItem>
                        <SelectItem value="experimental">Experimental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Component Grid */}
              <ScrollArea className="h-[500px]">
                <div className="space-y-6">
                  {Object.entries(componentsByCategory).map(([category, categoryComponents]) => (
                    <div key={category} className="space-y-3">
                      {showCategories && (
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                          {category} ({categoryComponents.length})
                        </h4>
                      )}
                      <div className="grid gap-3">
                        {categoryComponents.map((component) => {
                          const compatibility = checkCompatibility(component);
                          const isSelected = isComponentSelected(component.name);
                          
                          return (
                            <Card 
                              key={component.name} 
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                isSelected ? 'ring-2 ring-primary' : ''
                              } ${
                                !compatibility.compatible ? 'opacity-60' : ''
                              }`}
                              data-testid={`component-card-${component.name}`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h5 className="font-medium text-sm truncate">{component.name}</h5>
                                      {getDifficultyIcon(component.difficulty)}
                                      <Badge className={`text-xs ${getStabilityColor(component.stability)}`}>
                                        {component.stability}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                      {component.description}
                                    </p>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {component.keywords.slice(0, 3).map((keyword) => (
                                        <Badge key={keyword} variant="outline" className="text-xs">
                                          {keyword}
                                        </Badge>
                                      ))}
                                    </div>
                                    {!compatibility.compatible && (
                                      <div className="text-xs text-red-600 dark:text-red-400">
                                        {compatibility.issues.join('; ')}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                          <Info className="w-4 h-4" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="left" className="max-w-xs">
                                        <div className="space-y-1 text-xs">
                                          <p><strong>Version:</strong> {component.version}</p>
                                          <p><strong>Properties:</strong> {component.properties.length}</p>
                                          {component.subcategory && (
                                            <p><strong>Subcategory:</strong> {component.subcategory}</p>
                                          )}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                    
                                    {isSelected ? (
                                      onRemoveComponent && (
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          className="h-8"
                                          onClick={() => onRemoveComponent(component.name)}
                                          data-testid={`button-remove-${component.name}`}
                                        >
                                          Remove
                                        </Button>
                                      )
                                    ) : (
                                      <Button
                                        variant="default"
                                        size="sm"
                                        className="h-8"
                                        disabled={!compatibility.compatible || !canAddMore}
                                        onClick={() => onAddComponent(component.name)}
                                        data-testid={`button-add-${component.name}`}
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {filteredComponents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No components found matching your filters.</p>
                      <p className="text-sm">Try adjusting your search terms or filters.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="selected" className="space-y-4">
              {selectedComponents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No components selected yet.</p>
                  <p className="text-sm">Switch to the Browse tab to add components.</p>
                </div>
              ) : (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {selectedComponents.map((componentName) => {
                      const component = components.find(c => c.name === componentName);
                      if (!component) return null;
                      
                      return (
                        <Card key={componentName} data-testid={`selected-component-${componentName}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h5 className="font-medium text-sm">{component.name}</h5>
                                  {getDifficultyIcon(component.difficulty)}
                                  <Badge className={`text-xs ${getStabilityColor(component.stability)}`}>
                                    {component.stability}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  {component.description}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {component.category}
                                </Badge>
                              </div>
                              {onRemoveComponent && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onRemoveComponent(componentName)}
                                  data-testid={`button-remove-selected-${componentName}`}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
              
              {maxComponents && (
                <div className="text-sm text-muted-foreground text-center">
                  {selectedComponents.length} / {maxComponents} components selected
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}