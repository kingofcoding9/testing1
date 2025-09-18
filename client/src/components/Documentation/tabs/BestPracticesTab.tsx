import { useState } from "react";
import { 
  Search, Lightbulb, Copy, ExternalLink, Filter, BookOpen, Target, 
  CheckCircle, FileText, Code, Database, Shield, Users, Settings,
  ChevronRight, AlertTriangle, Info, Clock, Activity, BarChart3,
  Download, Upload, ArrowRight, Wrench, Eye, Layers, Globe,
  Star, Award, TrendingUp, GitBranch, TestTube
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import CodePreview from "@/components/Common/CodePreview";

interface BestPracticesTabProps {
  onNavigate?: (section: string) => void;
  onProgressUpdate?: (progress: number) => void;
}

export default function BestPracticesTab({ onNavigate, onProgressUpdate }: BestPracticesTabProps) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Best practices categories
  const practiceCategories = [
    {
      id: 'code-organization',
      title: 'Code Organization & Structure',
      description: 'Organizing code for maintainability and scalability',
      difficulty: 'intermediate' as const,
      estimatedTime: '1 hour',
      icon: FileText,
      content: {
        overview: 'Proper code organization is essential for maintaining large addons and collaborating with others.',
        principles: [
          'Single Responsibility Principle - Each file/function has one job',
          'Don\'t Repeat Yourself (DRY) - Avoid code duplication',
          'Keep It Simple, Stupid (KISS) - Prefer simple solutions',
          'Separation of Concerns - Separate different aspects of functionality',
          'Consistent Naming Conventions - Use clear, descriptive names'
        ],
        structure: [
          'Logical folder hierarchy based on functionality',
          'Consistent file naming conventions',
          'Clear separation between data and logic',
          'Reusable utility modules',
          'Configuration files for settings'
        ],
        examples: [
          'entities/ - All entity-related files',
          'blocks/ - Block definitions and behaviors',
          'utils/ - Shared utility functions',
          'config/ - Configuration and constants',
          'tests/ - Test files and test data'
        ]
      }
    },
    {
      id: 'testing-methodologies',
      title: 'Testing Methodologies',
      description: 'Comprehensive testing strategies for addon reliability',
      difficulty: 'intermediate' as const,
      estimatedTime: '2 hours',
      icon: TestTube,
      content: {
        overview: 'Testing ensures your addons work correctly across different scenarios and game versions.',
        testingTypes: [
          'Unit Testing - Test individual components in isolation',
          'Integration Testing - Test component interactions',
          'Performance Testing - Validate performance requirements',
          'User Acceptance Testing - Test real-world usage scenarios',
          'Regression Testing - Ensure changes don\'t break existing functionality'
        ],
        strategies: [
          'Test-Driven Development (TDD) approach',
          'Automated testing pipelines',
          'Mock objects for external dependencies',
          'Test data management',
          'Continuous integration testing'
        ],
        tools: [
          'Custom testing frameworks for Minecraft',
          'Automated testing scripts',
          'Performance monitoring tools',
          'Version compatibility testing',
          'Community feedback collection'
        ]
      }
    },
    {
      id: 'version-control',
      title: 'Version Control & Collaboration',
      description: 'Managing code changes and team collaboration',
      difficulty: 'beginner' as const,
      estimatedTime: '45 min',
      icon: GitBranch,
      content: {
        overview: 'Version control enables safe code changes, collaboration, and release management.',
        practices: [
          'Meaningful commit messages describing changes',
          'Feature branches for new development',
          'Regular commits with small, focused changes',
          'Code reviews before merging changes',
          'Tagged releases for stable versions'
        ],
        workflow: [
          'Clone repository and create feature branch',
          'Make changes and test thoroughly',
          'Commit changes with descriptive messages',
          'Submit pull request for review',
          'Merge after approval and testing'
        ],
        collaboration: [
          'Clear documentation for contributors',
          'Coding standards and style guides',
          'Issue tracking for bugs and features',
          'Regular team communication',
          'Knowledge sharing sessions'
        ]
      }
    },
    {
      id: 'deployment-strategies',
      title: 'Deployment & Distribution',
      description: 'Best practices for releasing and distributing addons',
      difficulty: 'intermediate' as const,
      estimatedTime: '1.5 hours',
      icon: Upload,
      content: {
        overview: 'Proper deployment ensures users can easily install and use your addons.',
        strategies: [
          'Semantic versioning for releases',
          'Automated build and packaging',
          'Beta testing with community',
          'Rollback plans for problematic releases',
          'Multi-platform compatibility testing'
        ],
        packaging: [
          'Clean build processes',
          'Asset optimization before packaging',
          'Manifest validation and testing',
          'Package size optimization',
          'Installation instructions and documentation'
        ],
        distribution: [
          'Multiple distribution channels',
          'Clear installation guides',
          'Version compatibility documentation',
          'Community support channels',
          'Update notification systems'
        ]
      }
    },
    {
      id: 'performance-optimization',
      title: 'Performance & Optimization',
      description: 'Ensuring addons run efficiently without impacting gameplay',
      difficulty: 'advanced' as const,
      estimatedTime: '2 hours',
      icon: TrendingUp,
      content: {
        overview: 'Performance optimization ensures addons enhance rather than degrade the Minecraft experience.',
        principles: [
          'Profile before optimizing - Measure actual performance',
          'Optimize the critical path first',
          'Cache expensive computations',
          'Use efficient algorithms and data structures',
          'Monitor resource usage continuously'
        ],
        techniques: [
          'Entity pooling for frequently spawned objects',
          'Lazy loading for large assets',
          'Batch operations where possible',
          'Efficient memory management',
          'Network optimization for multiplayer'
        ],
        monitoring: [
          'Frame rate impact measurement',
          'Memory usage tracking',
          'Entity count monitoring',
          'Script execution profiling',
          'User experience metrics'
        ]
      }
    },
    {
      id: 'community-guidelines',
      title: 'Community & Documentation',
      description: 'Building community and maintaining excellent documentation',
      difficulty: 'beginner' as const,
      estimatedTime: '1 hour',
      icon: Users,
      content: {
        overview: 'Strong community and documentation practices ensure long-term success of addon projects.',
        documentation: [
          'Clear README with installation instructions',
          'API documentation for developers',
          'User guides with examples',
          'Changelog for version updates',
          'Troubleshooting guides for common issues'
        ],
        community: [
          'Responsive support for user questions',
          'Regular communication about updates',
          'Community feedback collection',
          'Contribution guidelines for collaborators',
          'Recognition of community contributors'
        ],
        maintenance: [
          'Regular updates for game version compatibility',
          'Bug fix responsiveness',
          'Feature request evaluation process',
          'Security update procedures',
          'End-of-life planning for old versions'
        ]
      }
    }
  ];

  // Quality checklists
  const qualityChecklists = [
    {
      category: 'Code Quality',
      items: [
        { text: 'Code follows consistent naming conventions', critical: true },
        { text: 'Functions are focused and do one thing well', critical: true },
        { text: 'Code is properly commented and documented', critical: false },
        { text: 'No hardcoded values, use configuration files', critical: false },
        { text: 'Error handling is implemented where needed', critical: true },
        { text: 'Code is organized into logical modules', critical: false }
      ]
    },
    {
      category: 'Performance',
      items: [
        { text: 'Addon maintains stable frame rates', critical: true },
        { text: 'Memory usage is within reasonable limits', critical: true },
        { text: 'Entity counts are optimized', critical: true },
        { text: 'Scripts execute efficiently', critical: true },
        { text: 'Assets are optimized for size', critical: false },
        { text: 'Multiplayer performance is tested', critical: false }
      ]
    },
    {
      category: 'Testing',
      items: [
        { text: 'All major features have been tested', critical: true },
        { text: 'Edge cases and error conditions tested', critical: true },
        { text: 'Performance testing completed', critical: true },
        { text: 'Multiplayer functionality verified', critical: false },
        { text: 'Cross-platform compatibility checked', critical: false },
        { text: 'Automated tests implemented', critical: false }
      ]
    },
    {
      category: 'Documentation',
      items: [
        { text: 'Installation instructions are clear', critical: true },
        { text: 'Feature documentation is complete', critical: true },
        { text: 'API documentation is available', critical: false },
        { text: 'Troubleshooting guide provided', critical: false },
        { text: 'Changelog is maintained', critical: false },
        { text: 'Contributing guidelines exist', critical: false }
      ]
    }
  ];

  // Common anti-patterns to avoid
  const antiPatterns = [
    {
      title: 'God Objects',
      description: 'Single files or classes that do too many things',
      problems: ['Hard to maintain', 'Difficult to test', 'Poor reusability'],
      solution: 'Break into smaller, focused modules with single responsibilities'
    },
    {
      title: 'Magic Numbers',
      description: 'Hardcoded values without explanation',
      problems: ['Hard to modify', 'Unclear meaning', 'Error-prone'],
      solution: 'Use named constants and configuration files for all values'
    },
    {
      title: 'Copy-Paste Programming',
      description: 'Duplicating code instead of creating reusable functions',
      problems: ['Maintenance nightmare', 'Inconsistent behavior', 'Bug multiplication'],
      solution: 'Extract common functionality into reusable utilities'
    },
    {
      title: 'No Error Handling',
      description: 'Not handling potential failure cases',
      problems: ['Poor user experience', 'Crashes and instability', 'Difficult debugging'],
      solution: 'Implement comprehensive error handling and graceful degradation'
    }
  ];

  const copyToClipboard = async (code: string, title: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied to clipboard",
        description: `${title} has been copied to your clipboard.`,
      });
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6" data-testid="best-practices-tab">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Best Practices</h2>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Master the best practices for professional Minecraft Bedrock addon development. Learn code organization,
          testing methodologies, deployment strategies, and community management for successful projects.
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">🎯 Overview</TabsTrigger>
          <TabsTrigger value="practices" data-testid="tab-practices">📋 Practices</TabsTrigger>
          <TabsTrigger value="checklists" data-testid="tab-checklists">✅ Checklists</TabsTrigger>
          <TabsTrigger value="anti-patterns" data-testid="tab-anti-patterns">🚫 Anti-Patterns</TabsTrigger>
          <TabsTrigger value="resources" data-testid="tab-resources">📚 Resources</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Practice Areas</span>
                    <span className="font-medium">6+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Quality Checks</span>
                    <span className="font-medium">24+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Anti-Patterns</span>
                    <span className="font-medium">10+</span>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => onNavigate?.('validator')}
                  data-testid="open-validator"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open Validator
                </Button>
              </CardContent>
            </Card>

            {/* Key Areas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center">Code Quality</Badge>
                  <Badge variant="outline" className="w-full justify-center">Testing</Badge>
                  <Badge variant="outline" className="w-full justify-center">Performance</Badge>
                  <Badge variant="outline" className="w-full justify-center">Documentation</Badge>
                  <Badge variant="outline" className="w-full justify-center">Community</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Quality Checklist
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <TestTube className="h-4 w-4 mr-2" />
                  Testing Guide
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Version Control
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Performance Tips
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Development Principles */}
          <Card>
            <CardHeader>
              <CardTitle>Core Development Principles</CardTitle>
              <CardDescription>Fundamental principles that guide professional addon development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Quality First
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Prioritize code quality and user experience over speed of development
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Write clean, readable code</li>
                    <li>• Test thoroughly before release</li>
                    <li>• Document your work</li>
                    <li>• Consider edge cases</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    User-Centered Design
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Always consider the end user's experience and needs
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Clear installation processes</li>
                    <li>• Intuitive user interfaces</li>
                    <li>• Helpful error messages</li>
                    <li>• Responsive support</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Continuous Improvement
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Always look for ways to improve and optimize your work
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Regular performance reviews</li>
                    <li>• Community feedback integration</li>
                    <li>• Stay updated with best practices</li>
                    <li>• Refactor when necessary</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-purple-500" />
                    Security & Stability
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Ensure your addons are secure and don't compromise game stability
                  </p>
                  <ul className="text-sm space-y-1">
                    <li>• Validate all inputs</li>
                    <li>• Handle errors gracefully</li>
                    <li>• Test for edge cases</li>
                    <li>• Monitor performance impact</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Development Lifecycle */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Development Lifecycle</CardTitle>
              <CardDescription>The complete process for developing high-quality addons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                    <Lightbulb className="h-6 w-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Planning</h4>
                  <p className="text-xs text-muted-foreground">Define requirements and architecture</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
                    <Code className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Development</h4>
                  <p className="text-xs text-muted-foreground">Write clean, well-organized code</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mb-2">
                    <TestTube className="h-6 w-6 text-orange-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Testing</h4>
                  <p className="text-xs text-muted-foreground">Comprehensive testing and validation</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-2">
                    <Upload className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Deployment</h4>
                  <p className="text-xs text-muted-foreground">Release and distribution</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-2">
                    <Wrench className="h-6 w-6 text-red-600" />
                  </div>
                  <h4 className="font-semibold mb-1">Maintenance</h4>
                  <p className="text-xs text-muted-foreground">Updates and community support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practices Tab */}
        <TabsContent value="practices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {practiceCategories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <category.icon className="h-6 w-6" />
                      <div>
                        <CardTitle className="text-lg">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={category.difficulty === 'advanced' ? 'destructive' : category.difficulty === 'intermediate' ? 'secondary' : 'outline'}>
                        {category.difficulty}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">{category.estimatedTime}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{category.content.overview}</p>
                  
                  {category.content.principles && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Key Principles</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {category.content.principles.map((principle, index) => (
                          <li key={index}>• {principle}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {category.content.testingTypes && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Testing Types</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {category.content.testingTypes.map((type, index) => (
                          <li key={index}>• {type}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {category.content.practices && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Best Practices</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {category.content.practices.map((practice, index) => (
                          <li key={index}>• {practice}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {category.content.strategies && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Strategies</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {category.content.strategies.map((strategy, index) => (
                          <li key={index}>• {strategy}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {category.content.techniques && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Techniques</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {category.content.techniques.map((technique, index) => (
                          <li key={index}>• {technique}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {category.content.documentation && (
                    <div className="space-y-2">
                      <h5 className="font-medium">Documentation</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {category.content.documentation.map((doc, index) => (
                          <li key={index}>• {doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Checklists Tab */}
        <TabsContent value="checklists" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Assurance Checklists</CardTitle>
              <CardDescription>Comprehensive checklists to ensure addon quality before release</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {qualityChecklists.map((checklist) => (
                <div key={checklist.category} className="space-y-4">
                  <h4 className="text-lg font-semibold">{checklist.category}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {checklist.items.map((item, index) => (
                      <div key={index} className={`flex items-center gap-3 p-3 border rounded-lg ${item.critical ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950' : 'border-border'}`}>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4" 
                          data-testid={`checklist-${checklist.category.toLowerCase()}-${index}`}
                        />
                        <span className="text-sm flex-1">{item.text}</span>
                        {item.critical && (
                          <Badge variant="destructive" className="text-xs">Critical</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Release Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Pre-Release Checklist</CardTitle>
              <CardDescription>Final checks before releasing your addon to the community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="font-medium">Technical Validation</h5>
                  <div className="space-y-2">
                    {[
                      'All manifest files are valid',
                      'No syntax errors in JSON files',
                      'All assets are properly linked',
                      'Performance testing completed',
                      'Memory usage is within limits',
                      'Multiplayer functionality tested'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-medium">User Experience</h5>
                  <div className="space-y-2">
                    {[
                      'Installation instructions are clear',
                      'User documentation is complete',
                      'Error messages are helpful',
                      'UI is intuitive and responsive',
                      'Features work as expected',
                      'Community feedback addressed'
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input type="checkbox" className="h-4 w-4" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Anti-Patterns Tab */}
        <TabsContent value="anti-patterns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Anti-Patterns to Avoid</CardTitle>
              <CardDescription>Patterns that seem helpful but cause problems in the long run</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {antiPatterns.map((pattern, index) => (
                  <div key={index} className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-red-800 dark:text-red-200">{pattern.title}</h4>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-3">{pattern.description}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-sm text-red-800 dark:text-red-200 mb-1">Problems:</h5>
                        <ul className="text-xs text-red-600 dark:text-red-400 space-y-1">
                          {pattern.problems.map((problem, pIndex) => (
                            <li key={pIndex}>• {problem}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-sm text-green-800 dark:text-green-200 mb-1">Solution:</h5>
                        <p className="text-xs text-green-700 dark:text-green-300">{pattern.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Code Smells */}
          <Card>
            <CardHeader>
              <CardTitle>Code Smells & Warning Signs</CardTitle>
              <CardDescription>Early warning signs that your code might need refactoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Structure Smells</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Files over 1000 lines long</li>
                    <li>• Functions with 50+ lines</li>
                    <li>• Deeply nested code (6+ levels)</li>
                    <li>• Duplicate code in multiple places</li>
                    <li>• Unclear variable names</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Performance Smells</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Frame drops during gameplay</li>
                    <li>• Memory usage growing over time</li>
                    <li>• Slow startup times</li>
                    <li>• Laggy user interactions</li>
                    <li>• High CPU usage when idle</li>
                  </ul>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Maintenance Smells</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Fear of making changes</li>
                    <li>• Bugs that keep coming back</li>
                    <li>• Difficulty adding new features</li>
                    <li>• Tests that break frequently</li>
                    <li>• Complex deployment process</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources & Tools</CardTitle>
              <CardDescription>External resources to help improve your development practices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Development Tools</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Code Editors</h5>
                      <p className="text-sm text-muted-foreground">VS Code, Sublime Text, Atom</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Version Control</h5>
                      <p className="text-sm text-muted-foreground">Git, GitHub, GitLab</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Testing Tools</h5>
                      <p className="text-sm text-muted-foreground">Jest, Mocha, Custom test frameworks</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Learning Resources</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Documentation</h5>
                      <p className="text-sm text-muted-foreground">Official Minecraft docs, MDN Web Docs</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Community</h5>
                      <p className="text-sm text-muted-foreground">Discord servers, Reddit, Stack Overflow</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <h5 className="font-medium">Books</h5>
                      <p className="text-sm text-muted-foreground">Clean Code, Design Patterns, Refactoring</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Reference Commands</CardTitle>
              <CardDescription>Useful commands and shortcuts for addon development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium mb-2">Git Commands</h5>
                  <CodePreview
                    code={`# Create feature branch
git checkout -b feature/new-feature

# Stage and commit changes
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Merge back to main
git checkout main
git merge feature/new-feature`}
                    language="bash"
                    title="Git Workflow"
                  />
                </div>

                <div>
                  <h5 className="font-medium mb-2">Testing Commands</h5>
                  <CodePreview
                    code={`# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run performance tests
npm run test:performance

# Lint code
npm run lint

# Format code
npm run format`}
                    language="bash"
                    title="Testing & Quality"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}