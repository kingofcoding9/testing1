import { useState } from "react";
import Sidebar from "@/components/Layout/Sidebar";
import Header from "@/components/Layout/Header";
import EntityBuilder from "@/components/Builders/EntityBuilder";
import BlockBuilder from "@/components/Builders/BlockBuilder";
import ItemBuilder from "@/components/Builders/ItemBuilder";
import RecipeBuilder from "@/components/Builders/RecipeBuilder";
import LootTableBuilder from "@/components/Builders/LootTableBuilder";
import BiomeBuilder from "@/components/Builders/BiomeBuilder";
import SpawnRuleBuilder from "@/components/Builders/SpawnRuleBuilder";
import ClientEntityBuilder from "@/components/Builders/ClientEntityBuilder";
import TextureCreator from "@/components/Tools/TextureCreator";
import ScriptStudio from "@/components/Tools/ScriptStudio";
import AddonPackager from "@/components/Tools/AddonPackager";
import JSONValidator from "@/components/Tools/JSONValidator";
import ExternalTools from "@/components/Tools/ExternalTools";
import CoreConcepts from "@/components/Documentation/CoreConcepts";
import EntityDocs from "@/components/Documentation/EntityDocs";
import BlockDocs from "@/components/Documentation/BlockDocs";
import ItemDocs from "@/components/Documentation/ItemDocs";
import ScriptingDocs from "@/components/Documentation/ScriptingDocs";
import InteractiveTutorial from "@/components/Tutorial/InteractiveTutorial";
import QuickStart from "@/components/Tutorial/QuickStart";
import WelcomeSection from "@/components/Welcome/WelcomeSection";
import CommunitySection from "@/components/Community/CommunitySection";

type Section = 
  | 'welcome'
  | 'tutorial'
  | 'quick-start'
  | 'docs-concepts'
  | 'docs-entities'
  | 'docs-blocks'
  | 'docs-items'
  | 'docs-scripting'
  | 'builder-entity'
  | 'builder-client-entity'
  | 'builder-block'
  | 'builder-item'
  | 'builder-recipe'
  | 'builder-loot'
  | 'builder-biome'
  | 'builder-spawn'
  | 'texture-creator'
  | 'script-studio'
  | 'addon-packager'
  | 'validator'
  | 'external-tools'
  | 'community'
  | 'omni-science';

export default function Home() {
  const [currentSection, setCurrentSection] = useState<Section>('welcome');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigate = (section: string) => {
    setCurrentSection(section as Section);
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'welcome':
        return <WelcomeSection onNavigate={handleNavigate} />;
      case 'tutorial':
        return <InteractiveTutorial onNavigate={handleNavigate} />;
      case 'quick-start':
        return <QuickStart onNavigate={handleNavigate} />;
      case 'docs-concepts':
        return <CoreConcepts onNavigate={handleNavigate} />;
      case 'docs-entities':
        return <EntityDocs />;
      case 'docs-blocks':
        return <BlockDocs />;
      case 'docs-items':
        return <ItemDocs />;
      case 'docs-scripting':
        return <ScriptingDocs />;
      case 'builder-entity':
        return <EntityBuilder />;
      case 'builder-client-entity':
        return <ClientEntityBuilder />;
      case 'builder-block':
        return <BlockBuilder />;
      case 'builder-item':
        return <ItemBuilder />;
      case 'builder-recipe':
        return <RecipeBuilder />;
      case 'builder-loot':
        return <LootTableBuilder />;
      case 'builder-biome':
        return <BiomeBuilder />;
      case 'builder-spawn':
        return <SpawnRuleBuilder />;
      case 'texture-creator':
        return <TextureCreator />;
      case 'script-studio':
        return <ScriptStudio />;
      case 'addon-packager':
        return <AddonPackager />;
      case 'validator':
        return <JSONValidator />;
      case 'external-tools':
        return <ExternalTools />;
      case 'community':
        return <CommunitySection />;
      case 'omni-science':
        return <CommunitySection />;
      default:
        return <WelcomeSection onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar 
        currentSection={currentSection}
        onSectionChange={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header currentSection={currentSection} />
        <div className="flex-1 overflow-y-auto">
          <div className="fadeIn">
            {renderSection()}
          </div>
        </div>
      </main>
    </div>
  );
}
