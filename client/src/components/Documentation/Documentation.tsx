import { useState, useEffect } from "react";
import { 
  Search, BookOpen, Rocket, Layers, Package, Code, Image, 
  Zap, Wrench, Lightbulb, AlertTriangle, Star, Filter,
  ChevronRight, ArrowRight, Copy, ExternalLink, Eye,
  FileText, Settings, Target, Shield, Clock, Users
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { SimpleCollapsibleTabs, CollapsibleTab } from "@/components/ui/collapsible-tabs";

// Import existing documentation components
import CoreConcepts from "./CoreConcepts";
import EntityDocs from "./EntityDocs";
import BlockDocs from "./BlockDocs";
import ItemDocs from "./ItemDocs";
import ScriptingDocs from "./ScriptingDocs";
import QuickStart from "../Tutorial/QuickStart";
import InteractiveTutorial from "../Tutorial/InteractiveTutorial";

// New component imports (to be created)
import GettingStartedTab from "./tabs/GettingStartedTab";
import EntityDevelopmentTab from "./tabs/EntityDevelopmentTab";
import BlockDevelopmentTab from "./tabs/BlockDevelopmentTab";
import ItemDevelopmentTab from "./tabs/ItemDevelopmentTab";
import ScriptingApiTab from "./tabs/ScriptingApiTab";
import ResourcePacksTab from "./tabs/ResourcePacksTab";
import BehaviorPacksTab from "./tabs/BehaviorPacksTab";
import AdvancedTopicsTab from "./tabs/AdvancedTopicsTab";
import BestPracticesTab from "./tabs/BestPracticesTab";
import TroubleshootingTab from "./tabs/TroubleshootingTab";

interface DocumentationProps {
  onNavigate?: (section: string) => void;
  initialTab?: string;
}

export default function Documentation({ onNavigate, initialTab = 'getting-started' }: DocumentationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [readingProgress, setReadingProgress] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const { toast } = useToast();

  // Documentation tab configuration
  const documentationTabs = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Rocket,
      emoji: '🚀',
      description: 'Setup, first steps, and basic concepts',
      difficulty: 'beginner' as const,
      estimatedTime: '30 min',
      completion: readingProgress['getting-started'] || 0
    },
    {
      id: 'entity-development',
      title: 'Entity Development',
      icon: Target,
      emoji: '🏗️',
      description: 'Creating custom entities, behaviors, and AI',
      difficulty: 'intermediate' as const,
      estimatedTime: '2 hours',
      completion: readingProgress['entity-development'] || 0
    },
    {
      id: 'block-development',
      title: 'Block Development',
      icon: Package,
      emoji: '🧱',
      description: 'Custom blocks, mechanics, and interactions',
      difficulty: 'intermediate' as const,
      estimatedTime: '1.5 hours',
      completion: readingProgress['block-development'] || 0
    },
    {
      id: 'item-development',
      title: 'Item Development',
      icon: Shield,
      emoji: '📦',
      description: 'Items, tools, armor, and special mechanics',
      difficulty: 'intermediate' as const,
      estimatedTime: '1.5 hours',
      completion: readingProgress['item-development'] || 0
    },
    {
      id: 'scripting-apis',
      title: 'Scripting & APIs',
      icon: Code,
      emoji: '💻',
      description: 'JavaScript/TypeScript scripting and API reference',
      difficulty: 'advanced' as const,
      estimatedTime: '3 hours',
      completion: readingProgress['scripting-apis'] || 0
    },
    {
      id: 'resource-packs',
      title: 'Resource Packs',
      icon: Image,
      emoji: '🎨',
      description: 'Textures, models, animations, and visual assets',
      difficulty: 'intermediate' as const,
      estimatedTime: '2 hours',
      completion: readingProgress['resource-packs'] || 0
    },
    {
      id: 'behavior-packs',
      title: 'Behavior Packs',
      icon: Settings,
      emoji: '⚡',
      description: 'Game rules, loot tables, recipes, and worldgen',
      difficulty: 'intermediate' as const,
      estimatedTime: '2 hours',
      completion: readingProgress['behavior-packs'] || 0
    },
    {
      id: 'advanced-topics',
      title: 'Advanced Topics',
      icon: Layers,
      emoji: '🛠️',
      description: 'Performance, architecture, and complex patterns',
      difficulty: 'advanced' as const,
      estimatedTime: '2 hours',
      completion: readingProgress['advanced-topics'] || 0
    },
    {
      id: 'best-practices',
      title: 'Best Practices',
      icon: Lightbulb,
      emoji: '📚',
      description: 'Organization, testing, and deployment guidelines',
      difficulty: 'intermediate' as const,
      estimatedTime: '1 hour',
      completion: readingProgress['best-practices'] || 0
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: AlertTriangle,
      emoji: '🔧',
      description: 'Common errors, debugging, and solutions',
      difficulty: 'beginner' as const,
      estimatedTime: '45 min',
      completion: readingProgress['troubleshooting'] || 0
    }
  ];

  // Load reading progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('documentation-progress');
    if (savedProgress) {
      setReadingProgress(JSON.parse(savedProgress));
    }
    
    const savedBookmarks = localStorage.getItem('documentation-bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  // Save reading progress to localStorage
  const updateProgress = (tabId: string, progress: number) => {
    const newProgress = { ...readingProgress, [tabId]: progress };
    setReadingProgress(newProgress);
    localStorage.setItem('documentation-progress', JSON.stringify(newProgress));
  };

  // Toggle bookmarks
  const toggleBookmark = (tabId: string) => {
    const newBookmarks = bookmarks.includes(tabId)
      ? bookmarks.filter(id => id !== tabId)
      : [...bookmarks, tabId];
    setBookmarks(newBookmarks);
    localStorage.setItem('documentation-bookmarks', JSON.stringify(newBookmarks));
    
    toast({
      title: bookmarks.includes(tabId) ? "Bookmark removed" : "Bookmark added",
      description: `${documentationTabs.find(tab => tab.id === tabId)?.title} ${bookmarks.includes(tabId) ? 'removed from' : 'added to'} bookmarks.`,
    });
  };

  // Global search functionality
  const performGlobalSearch = (term: string) => {
    if (!term.trim()) {
      setGlobalSearchResults([]);
      setShowGlobalSearch(false);
      return;
    }

    // This would be enhanced with actual search indexing
    const results = documentationTabs.filter(tab => 
      tab.title.toLowerCase().includes(term.toLowerCase()) ||
      tab.description.toLowerCase().includes(term.toLowerCase())
    );
    
    setGlobalSearchResults(results);
    setShowGlobalSearch(true);
  };

  // Difficulty colors
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  // Render individual tab content
  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'getting-started':
        return <GettingStartedTab onNavigate={onNavigate} onProgressUpdate={(progress) => updateProgress('getting-started', progress)} />;
      case 'entity-development':
        return <EntityDevelopmentTab onNavigate={onNavigate} onProgressUpdate={(progress) => updateProgress('entity-development', progress)} />;
      case 'block-development':
        return <BlockDevelopmentTab onNavigate={onNavigate} onProgressUpdate={(progress) => updateProgress('block-development', progress)} />;
      case 'item-development':
        return <ItemDevelopmentTab onNavigate={onNavigate} onProgressUpdate={(progress) => updateProgress('item-development', progress)} />;
      case 'scripting-apis':
        return <ScriptingApiTab onNavigate={onNavigate} onProgressUpdate={(progress) => updateProgress('scripting-apis', progress)} />;
      case 'resource-packs':
        return <ResourcePacksTab onNavigate={onNavigate} onProgressUpdate={(progress) => updateProgress('resource-packs', progress)} />;
      case 'behavior-packs':
        return <BehaviorPacksTab onNavigate={onNavigate} onProgressUpdate={(progress) => updateProgress('behavior-packs', progress)} />;
      case 'advanced-topics':
        return <AdvancedTopicsTab onNavigate={onNavigate} onProgressUpdate={(progress) => updateProgress('advanced-topics', progress)} />;
      case 'best-practices':
        return <BestPracticesTab onNavigate={onNavigate} onProgressUpdate={(progress) => updateProgress('best-practices', progress)} />;
      case 'troubleshooting':
        return <TroubleshootingTab onNavigate={onNavigate} onProgressUpdate={(progress) => updateProgress('troubleshooting', progress)} />;
      default:
        return <GettingStartedTab onNavigate={onNavigate} onProgressUpdate={(progress) => updateProgress('getting-started', progress)} />;
    }
  };

  // Convert documentation tabs to CollapsibleTab format
  const collapsibleTabs: CollapsibleTab[] = documentationTabs.map((tab) => ({
    id: tab.id,
    title: tab.title,
    description: `${tab.description} • ${tab.difficulty} • ${tab.estimatedTime}`,
    icon: (
      <div className="flex items-center gap-2">
        <span className="text-lg">{tab.emoji}</span>
        <tab.icon className="h-4 w-4" />
      </div>
    ),
    badge: `${Math.round(tab.completion)}%`,
    content: (
      <div className="space-y-4">
        {/* Section header with progress and bookmark */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{tab.emoji}</span>
              <tab.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">{tab.title}</h3>
              <p className="text-sm text-muted-foreground">{tab.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className={getDifficultyColor(tab.difficulty)}>
              {tab.difficulty}
            </Badge>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Progress</div>
              <div className="font-medium">{Math.round(tab.completion)}%</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(tab.id);
              }}
              className="p-2"
              data-testid={`bookmark-${tab.id}`}
            >
              <Star className={`h-4 w-4 ${bookmarks.includes(tab.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Reading Progress</span>
            <span className="font-medium">{Math.round(tab.completion)}%</span>
          </div>
          <Progress value={tab.completion} className="h-2" />
        </div>

        {/* Tab content */}
        <div className="min-h-96">
          {renderTabContent(tab.id)}
        </div>
      </div>
    )
  }));

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6" data-testid="documentation-hub">
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-blue-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Minecraft Bedrock Documentation
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          The complete guide to Minecraft Bedrock addon development. From beginner tutorials to advanced techniques,
          everything you need to create amazing addons for Minecraft Bedrock Edition.
        </p>
        
        {/* Global Search */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all documentation..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              performGlobalSearch(e.target.value);
            }}
            className="pl-10 py-2 text-lg"
            data-testid="global-search-input"
          />
          
          {/* Global Search Results */}
          {showGlobalSearch && globalSearchResults.length > 0 && (
            <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-auto">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Search Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {globalSearchResults.map((result) => (
                  <Button
                    key={result.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3"
                    onClick={() => {
                      // Close search and let user manually expand the section they want
                      setShowGlobalSearch(false);
                      setSearchTerm('');
                    }}
                    data-testid={`search-result-${result.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <result.icon className="h-5 w-5" />
                      <div className="text-left">
                        <div className="font-medium">{result.emoji} {result.title}</div>
                        <div className="text-sm text-muted-foreground">{result.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Collapsible Documentation Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Documentation Sections</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {documentationTabs.length} Sections
            </Badge>
            <Badge variant="outline" className="text-sm">
              {bookmarks.length} Bookmarked
            </Badge>
          </div>
        </div>

        {/* Collapsible Documentation Tabs */}
        <SimpleCollapsibleTabs
          tabs={collapsibleTabs}
          storageKey="documentation"
          title="Interactive Documentation Hub"
          description="Expand the sections you're working on. All sections can be open simultaneously for easy reference."
          showGlobalControls={true}
          data-testid="documentation-collapsible-tabs"
        />
      </div>
    </div>
  );
}