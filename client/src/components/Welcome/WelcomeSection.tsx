import { Play, BookOpen, ArrowRight, MessageCircle, Globe, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEmojiWithFallback, type EmojiName } from "@/assets/emoji-mapping";

interface WelcomeSectionProps {
  onNavigate: (section: string) => void;
}

export default function WelcomeSection({ onNavigate }: WelcomeSectionProps) {
  const features = [
    {
      icon: "entityBuilder",
      title: "Entity Builder",
      description: "Create custom mobs with AI, components, and behaviors",
      section: "builder-entity",
      bgColor: "bg-primary"
    },
    {
      icon: "blockBuilder",
      title: "Block Builder", 
      description: "Design custom blocks with properties, states, and interactions",
      section: "builder-block",
      bgColor: "bg-accent"
    },
    {
      icon: "itemBuilder",
      title: "Item Builder",
      description: "Craft custom items with textures, durability, and functionality",
      section: "builder-item",
      bgColor: "bg-primary"
    },
    {
      icon: "recipeBuilder",
      title: "Recipe Builder",
      description: "Create crafting recipes for custom items and blocks",
      section: "builder-recipe",
      bgColor: "bg-accent"
    },
    {
      icon: "lootBuilder",
      title: "Loot Builder",
      description: "Configure loot tables for blocks, entities, and chests",
      section: "builder-loot",
      bgColor: "bg-primary"
    },
    {
      icon: "biomeBuilder",
      title: "Biome Builder",
      description: "Design custom biomes with terrain and spawn rules",
      section: "builder-biome",
      bgColor: "bg-accent"
    },
    {
      icon: "spawnBuilder",
      title: "Spawn Rules",
      description: "Control when and where entities spawn in your world",
      section: "builder-spawn",
      bgColor: "bg-primary"
    },
    {
      icon: "scriptStudio",
      title: "Script Studio",
      description: "Interactive script builder with full Minecraft API explorer",
      section: "script-studio",
      bgColor: "bg-accent"
    },
    {
      icon: "externalTools",
      title: "External Tools",
      description: "Professional suite of 7 external development tools",
      section: "external-tools",
      bgColor: "bg-primary"
    },
    {
      icon: "documentation",
      title: "Documentation",
      description: "Comprehensive guides and API references",
      section: "docs-concepts",
      bgColor: "bg-accent"
    },
    {
      icon: "addonPackager",
      title: "Addon Packager",
      description: "Export complete addon packs with proper structure",
      section: "addon-packager",
      bgColor: "bg-primary"
    },
    {
      icon: "validator",
      title: "JSON Validator",
      description: "Validate addon files and detect errors",
      section: "json-validator",
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
              onClick={() => {
                if (feature.section === 'external-tools') {
                  onNavigate(feature.section);
                } else {
                  onNavigate(feature.section);
                }
              }}
              data-testid={`feature-card-${feature.section}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className={`w-10 h-10 ${feature.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                    <span className="text-2xl text-primary-foreground">
                      {getEmojiWithFallback(feature.icon as EmojiName)}
                    </span>
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

        {/* Community Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-4 text-center">Join Our Community</h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Discord Card */}
            <Card className="bg-card border border-border hover:border-[#5865F2] transition-colors cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-[#5865F2] rounded-lg flex items-center justify-center mr-4">
                    <MessageCircle className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Discord Community</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Connect with other creators, get help with projects, and stay updated with the latest news from Omni-Science Game Studio.
                </p>
                <button 
                  className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open('https://discord.gg/xMy34mQCJ3', '_blank', 'noopener,noreferrer');
                  }}
                  data-testid="button-discord-external"
                >
                  <MessageCircle className="mr-2" size={18} />
                  Join Discord
                  <ExternalLink className="ml-2" size={16} />
                </button>
              </CardContent>
            </Card>

            {/* Omni-Science Card */}
            <Card className="bg-card border border-border hover:border-primary transition-colors cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                    <Globe className="text-primary-foreground" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Omni-Science Game Studio</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  Professional game design studio with 6 years of industry experience. Our team of 7 skilled developers creates innovative games and supports The Helping Guild charity.
                </p>
                <button 
                  className="w-full bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open('https://sites.google.com/view/omni-science-/home?authuser=0', '_blank', 'noopener,noreferrer');
                  }}
                  data-testid="button-omniscience-external"
                >
                  <Globe className="mr-2" size={18} />
                  Visit Omni-Science
                  <ExternalLink className="ml-2" size={16} />
                </button>
              </CardContent>
            </Card>
          </div>
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
