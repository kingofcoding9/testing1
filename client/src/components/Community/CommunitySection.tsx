import { MessageCircle, ExternalLink, Globe, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CommunitySection() {
  const handleDiscordClick = () => {
    window.open('https://discord.gg/xMy34mQCJ3', '_blank', 'noopener,noreferrer');
  };

  const handleOmniScienceClick = () => {
    window.open('https://sites.google.com/view/omni-science-/home?authuser=0', '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="p-6" data-testid="community-section">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center">
            <Users className="mr-3" size={36} />
            Community & Resources
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Connect with the Omni-Science Game Studio community and explore our professional tools and community support
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Discord Community Card */}
          <Card className="bg-card border border-border hover:border-primary transition-colors group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-foreground">
                <div className="w-12 h-12 bg-[#5865F2] rounded-lg flex items-center justify-center mr-4">
                  <MessageCircle className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Join Our Discord</h3>
                  <p className="text-sm text-muted-foreground font-normal">Community Hub</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                From a parasitic apocalypse Minecraft server to developing Steam games of the future, join the fun and support us in our journey!
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Get instant help from experienced creators
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Share your addon creations and get feedback
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Access exclusive tutorials and resources
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Participate in community events and challenges
                </div>
              </div>

              <Button 
                onClick={handleDiscordClick}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
                data-testid="button-join-discord"
              >
                <MessageCircle className="mr-2" size={20} />
                Join Discord Community
                <ExternalLink className="ml-2" size={16} />
              </Button>
            </CardContent>
          </Card>

          {/* Omni-Science Website Card */}
          <Card className="bg-card border border-border hover:border-primary transition-colors group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-foreground">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
                  <Globe className="text-primary-foreground" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Omni-Science Game Studio</h3>
                  <p className="text-sm text-muted-foreground font-normal">Game Design Studio</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Discover Omni-Science, a professional game design studio with 6 years of industry experience. 
                Our team of 7 skilled developers creates innovative games while supporting The Helping Guild charity 
                to make a positive impact in our community.
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Professional game design and development expertise
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Team of 7 experienced developers and designers
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  6 years of proven industry experience
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                  Proudly supporting The Helping Guild charity
                </div>
              </div>

              <Button 
                onClick={handleOmniScienceClick}
                variant="secondary"
                className="w-full"
                data-testid="button-visit-omniscience"
              >
                <Globe className="mr-2" size={20} />
                Visit Omni-Science Game Studio
                <ExternalLink className="ml-2" size={16} />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Community Stats */}
        <div className="bg-muted rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Heart className="mr-2 text-primary" size={20} />
            Join the Community
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">Active</div>
              <div className="text-sm text-muted-foreground">Community Support</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">Game Studio</div>
              <div className="text-sm text-muted-foreground">Professional Development</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">Open Source</div>
              <div className="text-sm text-muted-foreground">Creator Tools</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}