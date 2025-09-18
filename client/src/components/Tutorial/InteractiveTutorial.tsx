import { useState } from "react";
import { Play, CheckCircle, ArrowRight, ArrowLeft, Target, Code, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface InteractiveTutorialProps {
  onNavigate: (section: string) => void;
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  task: string;
  completed: boolean;
  targetSection?: string;
  validation?: string;
}

export default function InteractiveTutorial({ onNavigate }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'create-entity',
      title: 'Create Your First Entity',
      description: 'Learn entity basics and components by creating a simple custom mob',
      icon: Target,
      task: 'Create an entity called "tutorial:friendly_cow" with 20 health points',
      completed: completedSteps.includes('create-entity'),
      targetSection: 'builder-entity',
      validation: 'Entity with correct identifier and health component'
    },
    {
      id: 'add-behaviors',
      title: 'Add Entity Behaviors',
      description: 'Make your entity move and interact with the world',
      icon: Code,
      task: 'Add movement, navigation, and random stroll behaviors to your entity',
      completed: completedSteps.includes('add-behaviors'),
      targetSection: 'builder-entity',
      validation: 'Entity with movement and behavior components'
    },
    {
      id: 'create-texture',
      title: 'Create Custom Textures',
      description: 'Design the visual appearance of your entity',
      icon: FileText,
      task: 'Create a 16x16 texture for your custom entity using the texture creator',
      completed: completedSteps.includes('create-texture'),
      targetSection: 'texture-creator',
      validation: 'Texture file exported as PNG'
    },
    {
      id: 'create-client-entity',
      title: 'Setup Client Entity',
      description: 'Define how your entity looks and animates in the game',
      icon: Target,
      task: 'Create a client entity file that references your custom texture',
      completed: completedSteps.includes('create-client-entity'),
      targetSection: 'builder-client-entity',
      validation: 'Client entity with texture reference'
    },
    {
      id: 'create-spawn-rule',
      title: 'Add Spawn Rules',
      description: 'Control where and when your entity appears in the world',
      icon: Code,
      task: 'Create spawn rules for your entity to appear in plains biomes',
      completed: completedSteps.includes('create-spawn-rule'),
      targetSection: 'builder-spawn',
      validation: 'Spawn rule with biome filter'
    },
    {
      id: 'test-addon',
      title: 'Test Your Addon',
      description: 'Package and test your complete custom entity addon',
      icon: FileText,
      task: 'Export your addon as a .mcaddon file and test in Minecraft',
      completed: completedSteps.includes('test-addon'),
      targetSection: 'addon-packager',
      validation: 'Successfully exported addon package'
    },
    {
      id: 'add-loot-table',
      title: 'Create Loot Tables',
      description: 'Define what items your entity drops when defeated',
      icon: Target,
      task: 'Create a loot table that drops leather and experience',
      completed: completedSteps.includes('add-loot-table'),
      targetSection: 'builder-loot',
      validation: 'Loot table with item drops'
    },
    {
      id: 'add-scripting',
      title: 'Add Script Behaviors',
      description: 'Use JavaScript to add advanced functionality',
      icon: Code,
      task: 'Create a script that makes your entity say hello when players approach',
      completed: completedSteps.includes('add-scripting'),
      targetSection: 'script-studio',
      validation: 'Working script with event handling'
    }
  ];

  const progressPercentage = (completedSteps.length / tutorialSteps.length) * 100;
  const step = tutorialSteps[currentStep];

  const markStepCompleted = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const goToNextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startTutorialStep = () => {
    if (step.targetSection) {
      onNavigate(step.targetSection);
    }
  };

  return (
    <section className="p-6" data-testid="interactive-tutorial">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Interactive Tutorial</h1>
          <p className="text-lg text-muted-foreground">
            Learn by doing - create your first addon step by step
          </p>
        </div>

        {/* Tutorial Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Your Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {tutorialSteps.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="mb-4" />
            <div className="grid grid-cols-8 gap-2">
              {tutorialSteps.map((s, index) => (
                <div
                  key={s.id}
                  className={`h-2 rounded-full ${
                    completedSteps.includes(s.id)
                      ? 'bg-primary'
                      : index === currentStep
                      ? 'bg-accent'
                      : 'bg-muted'
                  }`}
                  data-testid={`progress-step-${index}`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{completedSteps.length} completed</span>
              <span>{tutorialSteps.length - completedSteps.length} remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* Current Step */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <span className="text-xl font-bold text-primary-foreground">{currentStep + 1}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h3 className="text-xl font-semibold text-foreground mr-3">{step.title}</h3>
                  {step.completed && (
                    <Badge variant="default" className="flex items-center">
                      <CheckCircle className="mr-1" size={14} />
                      Completed
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                
                <div className="bg-muted rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-foreground mb-2">🎯 Your Task</h4>
                  <p className="text-muted-foreground text-sm mb-3">{step.task}</p>
                  
                  {step.validation && (
                    <div className="text-xs text-muted-foreground">
                      <strong>Success criteria:</strong> {step.validation}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <Button 
                    onClick={startTutorialStep}
                    disabled={!step.targetSection}
                    data-testid={`button-start-step-${currentStep}`}
                  >
                    <Play className="mr-2" size={16} />
                    {step.targetSection ? 'Start Task' : 'Coming Soon'}
                  </Button>
                  
                  {!step.completed && (
                    <Button
                      variant="outline"
                      onClick={() => markStepCompleted(step.id)}
                      data-testid={`button-complete-step-${currentStep}`}
                    >
                      <CheckCircle className="mr-2" size={16} />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tutorial Steps Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tutorial Overview</CardTitle>
            <CardDescription>
              All steps in this comprehensive addon creation tutorial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tutorialSteps.map((tutStep, index) => {
                const StepIcon = tutStep.icon;
                return (
                  <div
                    key={tutStep.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      index === currentStep
                        ? 'border-primary bg-primary/10'
                        : tutStep.completed
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-border hover:bg-muted'
                    }`}
                    onClick={() => setCurrentStep(index)}
                    data-testid={`step-overview-${index}`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                      tutStep.completed 
                        ? 'bg-green-500' 
                        : index === currentStep 
                        ? 'bg-primary' 
                        : 'bg-muted-foreground'
                    }`}>
                      {tutStep.completed ? (
                        <CheckCircle className="text-white" size={14} />
                      ) : (
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">{tutStep.title}</div>
                      <div className="text-sm text-muted-foreground">{tutStep.description}</div>
                    </div>
                    <StepIcon size={20} className="text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button 
            variant="secondary" 
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
            data-testid="button-previous-step"
          >
            <ArrowLeft className="mr-2" size={16} />
            Previous Step
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Need help? Check the <button 
              className="text-primary hover:underline" 
              onClick={() => onNavigate('docs-concepts')}
            >
              documentation
            </button>
          </div>
          
          <Button 
            onClick={goToNextStep}
            disabled={currentStep === tutorialSteps.length - 1}
            data-testid="button-next-step"
          >
            Next Step <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>
      </div>
    </section>
  );
}
