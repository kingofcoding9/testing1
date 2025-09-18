import { Play, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WelcomeSectionProps {
  onNavigate: (section: string) => void;
}

export default function WelcomeSection({ onNavigate }: WelcomeSectionProps) {
  const features = [
    {
      icon: "🐉",
      title: "Entity Builder",
      description: "Create custom mobs and NPCs with behaviors, animations, and AI components.",
      section: "builder-entity",
      bgColor: "bg-primary"
    },
    {
      icon: "🧱",
      title: "Block Builder", 
      description: "Design custom blocks with unique properties, textures, and behaviors.",
      section: "builder-block",
      bgColor: "bg-accent"
    },
    {
      icon: "🎨",
      title: "Texture Creator",
      description: "Advanced 2D texture editor with layers, custom brushes, and filters.",
      section: "texture-creator",
      bgColor: "bg-primary"
    },
    {
      icon: "💻",
      title: "Script Studio",
      description: "Interactive script builder with full Minecraft API explorer and code generation.",
      section: "script-studio",
      bgColor: "bg-accent"
    },
    {
      icon: "📚",
      title: "Documentation",
      description: "Comprehensive guides and references validated against official Minecraft docs.",
      section: "docs-concepts",
      bgColor: "bg-primary"
    },
    {
      icon: "📦",
      title: "Addon Packager",
      description: "Export complete addon packs with proper folder structure and manifests.",
      section: "addon-packager",
      bgColor: "bg-accent"
    }
  ];

  return (
    <section className="p-6" data-testid="welcome-section">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Minecraft Bedrock Creator Suite
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            The complete toolkit for creating custom content in Minecraft: Bedrock Edition
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              className="btn-primary px-6 py-3 rounded-lg font-medium"
              onClick={() => onNavigate('tutorial')}
              data-testid="button-start-tutorial"
            >
              <Play className="mr-2" size={20} />
              Start Interactive Tutorial
            </Button>
            <Button 
              variant="secondary"
              className="px-6 py-3 rounded-lg font-medium"
              onClick={() => onNavigate('docs-concepts')}
              data-testid="button-browse-docs"
            >
              <BookOpen className="mr-2" size={20} />
              Browse Documentation
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="bg-card border border-border hover:border-primary transition-colors cursor-pointer"
              onClick={() => onNavigate(feature.section)}
              data-testid={`feature-card-${feature.section}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 ${feature.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                    <span className="text-xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  {feature.description}
                </p>
                <button 
                  className="text-primary text-sm font-medium hover:underline flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(feature.section);
                  }}
                >
                  Get Started <ArrowRight className="ml-1" size={14} />
                </button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="bg-muted rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">What's Included</h3>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">12+</div>
              <div className="text-sm text-muted-foreground">Interactive Builders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Components Covered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">API Methods</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">Real-time</div>
              <div className="text-sm text-muted-foreground">JSON Validation</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
