import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Minus, Info, AlertCircle, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export interface ComponentProperty {
  name: string;
  type: 'number' | 'boolean' | 'string' | 'array' | 'object' | 'range' | 'vector3' | 'material' | 'filter' | 'condition' | 'effect';
  description: string;
  required?: boolean;
  default?: any;
  min?: number;
  max?: number;
  options?: string[];
  example?: any;
}

export interface ComponentDefinition {
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  version: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  properties: ComponentProperty[];
  example: string;
  keywords: string[];
  stability: 'stable' | 'experimental' | 'beta';
  dependencies?: string[];
  conflicts?: string[];
}

interface ComponentFormProps {
  component: ComponentDefinition;
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  showExample?: boolean;
  className?: string;
}

export default function ComponentForm({
  component,
  initialValues = {},
  onSubmit,
  onCancel,
  isEditing = false,
  showExample = true,
  className = ""
}: ComponentFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Generate Zod schema from component properties
  const generateSchema = (properties: ComponentProperty[]) => {
    const schemaFields: Record<string, z.ZodTypeAny> = {};
    
    properties.forEach(prop => {
      let fieldSchema: z.ZodTypeAny;
      
      switch (prop.type) {
        case 'number':
          fieldSchema = z.number();
          if (prop.min !== undefined) fieldSchema = fieldSchema.min(prop.min);
          if (prop.max !== undefined) fieldSchema = fieldSchema.max(prop.max);
          break;
          
        case 'boolean':
          fieldSchema = z.boolean();
          break;
          
        case 'string':
          fieldSchema = z.string();
          if (prop.options) {
            fieldSchema = z.enum(prop.options as [string, ...string[]]);
          }
          break;
          
        case 'range':
          fieldSchema = z.object({
            min: z.number(),
            max: z.number()
          });
          break;
          
        case 'vector3':
          fieldSchema = z.object({
            x: z.number(),
            y: z.number(),
            z: z.number()
          });
          break;
          
        case 'array':
          fieldSchema = z.array(z.any());
          break;
          
        case 'object':
          fieldSchema = z.record(z.any());
          break;
          
        default:
          fieldSchema = z.any();
      }
      
      if (!prop.required) {
        fieldSchema = fieldSchema.optional();
      }
      
      schemaFields[prop.name] = fieldSchema;
    });
    
    return z.object(schemaFields);
  };

  const schema = generateSchema(component.properties);
  
  // Generate default values from component properties
  const getDefaultValues = () => {
    const defaults: Record<string, any> = { ...initialValues };
    
    component.properties.forEach(prop => {
      if (defaults[prop.name] === undefined && prop.default !== undefined) {
        defaults[prop.name] = prop.default;
      } else if (defaults[prop.name] === undefined) {
        switch (prop.type) {
          case 'number':
            defaults[prop.name] = prop.min ?? 0;
            break;
          case 'boolean':
            defaults[prop.name] = false;
            break;
          case 'string':
            defaults[prop.name] = prop.options?.[0] ?? '';
            break;
          case 'range':
            defaults[prop.name] = { min: prop.min ?? 0, max: prop.max ?? 1 };
            break;
          case 'vector3':
            defaults[prop.name] = { x: 0, y: 0, z: 0 };
            break;
          case 'array':
            defaults[prop.name] = [];
            break;
          case 'object':
            defaults[prop.name] = {};
            break;
        }
      }
    });
    
    return defaults;
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues()
  });

  const handleSubmit = (values: Record<string, any>) => {
    // Clean up undefined and empty values
    const cleanedValues = Object.entries(values).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    onSubmit(cleanedValues);
  };

  const renderPropertyField = (property: ComponentProperty) => {
    const isAdvanced = property.name.startsWith('_') || 
                      component.difficulty === 'advanced' && 
                      !['name', 'value', 'enabled', 'priority'].includes(property.name);

    if (isAdvanced && !showAdvanced) return null;

    return (
      <FormField
        key={property.name}
        control={form.control}
        name={property.name}
        render={({ field }) => (
          <FormItem className="space-y-2" data-testid={`form-field-${property.name}`}>
            <FormLabel className="flex items-center gap-2">
              {property.name}
              {property.required && <span className="text-red-500">*</span>}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    <p><strong>Description:</strong> {property.description}</p>
                    <p><strong>Type:</strong> {property.type}</p>
                    {property.min !== undefined && <p><strong>Min:</strong> {property.min}</p>}
                    {property.max !== undefined && <p><strong>Max:</strong> {property.max}</p>}
                    {property.example !== undefined && (
                      <p><strong>Example:</strong> {JSON.stringify(property.example)}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </FormLabel>
            
            <FormControl>
              {renderFieldInput(property, field)}
            </FormControl>
            
            {property.description && (
              <FormDescription className="text-xs">{property.description}</FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  const renderFieldInput = (property: ComponentProperty, field: any) => {
    switch (property.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              data-testid={`switch-${property.name}`}
            />
            <Label className="text-sm">{field.value ? 'Enabled' : 'Disabled'}</Label>
          </div>
        );

      case 'number':
        if (property.min !== undefined && property.max !== undefined && (property.max - property.min) <= 100) {
          // Use slider for small ranges
          return (
            <div className="space-y-2">
              <Slider
                value={[field.value]}
                onValueChange={(values) => field.onChange(values[0])}
                min={property.min}
                max={property.max}
                step={1}
                className="w-full"
                data-testid={`slider-${property.name}`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{property.min}</span>
                <span className="font-medium">{field.value}</span>
                <span>{property.max}</span>
              </div>
            </div>
          );
        } else {
          return (
            <Input
              type="number"
              {...field}
              min={property.min}
              max={property.max}
              placeholder={property.example?.toString() || '0'}
              data-testid={`input-${property.name}`}
            />
          );
        }

      case 'string':
        if (property.options && property.options.length > 0) {
          return (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger data-testid={`select-${property.name}`}>
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent>
                {property.options.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        } else if (property.description.includes('multiline') || property.name.includes('description')) {
          return (
            <Textarea
              {...field}
              placeholder={property.example?.toString() || ''}
              rows={3}
              data-testid={`textarea-${property.name}`}
            />
          );
        } else {
          return (
            <Input
              {...field}
              placeholder={property.example?.toString() || ''}
              data-testid={`input-${property.name}`}
            />
          );
        }

      case 'range':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Min</Label>
                <Input
                  type="number"
                  value={field.value?.min || 0}
                  onChange={(e) => field.onChange({ ...field.value, min: parseFloat(e.target.value) })}
                  data-testid={`input-${property.name}-min`}
                />
              </div>
              <div>
                <Label className="text-xs">Max</Label>
                <Input
                  type="number"
                  value={field.value?.max || 1}
                  onChange={(e) => field.onChange({ ...field.value, max: parseFloat(e.target.value) })}
                  data-testid={`input-${property.name}-max`}
                />
              </div>
            </div>
          </div>
        );

      case 'vector3':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">X</Label>
                <Input
                  type="number"
                  value={field.value?.x || 0}
                  onChange={(e) => field.onChange({ ...field.value, x: parseFloat(e.target.value) })}
                  data-testid={`input-${property.name}-x`}
                />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  value={field.value?.y || 0}
                  onChange={(e) => field.onChange({ ...field.value, y: parseFloat(e.target.value) })}
                  data-testid={`input-${property.name}-y`}
                />
              </div>
              <div>
                <Label className="text-xs">Z</Label>
                <Input
                  type="number"
                  value={field.value?.z || 0}
                  onChange={(e) => field.onChange({ ...field.value, z: parseFloat(e.target.value) })}
                  data-testid={`input-${property.name}-z`}
                />
              </div>
            </div>
          </div>
        );

      case 'array':
        return <ArrayFieldEditor property={property} field={field} />;

      case 'object':
        return <ObjectFieldEditor property={property} field={field} />;

      default:
        return (
          <Input
            {...field}
            placeholder={property.example?.toString() || ''}
            data-testid={`input-${property.name}`}
          />
        );
    }
  };

  // Separate components for complex field types
  const ArrayFieldEditor = ({ property, field }: { property: ComponentProperty; field: any }) => {
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: property.name
    });

    return (
      <div className="space-y-2">
        {fields.map((item, index) => (
          <div key={item.id} className="flex items-center gap-2">
            <Input
              value={field.value?.[index] || ''}
              onChange={(e) => {
                const newArray = [...(field.value || [])];
                newArray[index] = e.target.value;
                field.onChange(newArray);
              }}
              placeholder={`Item ${index + 1}`}
              data-testid={`input-${property.name}-${index}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => remove(index)}
              data-testid={`button-remove-${property.name}-${index}`}
            >
              <Minus className="w-3 h-3" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append('')}
          data-testid={`button-add-${property.name}`}
        >
          <Plus className="w-3 h-3 mr-1" />
          Add Item
        </Button>
      </div>
    );
  };

  const ObjectFieldEditor = ({ property, field }: { property: ComponentProperty; field: any }) => {
    const [newKey, setNewKey] = useState('');
    const [newValue, setNewValue] = useState('');
    
    const addProperty = () => {
      if (newKey && newValue) {
        field.onChange({
          ...field.value,
          [newKey]: newValue
        });
        setNewKey('');
        setNewValue('');
      }
    };

    const removeProperty = (key: string) => {
      const newObj = { ...field.value };
      delete newObj[key];
      field.onChange(newObj);
    };

    return (
      <div className="space-y-2">
        {Object.entries(field.value || {}).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <Input value={key} disabled className="flex-1" />
            <Input
              value={value as string}
              onChange={(e) => field.onChange({ ...field.value, [key]: e.target.value })}
              className="flex-1"
              data-testid={`input-${property.name}-${key}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeProperty(key)}
              data-testid={`button-remove-${property.name}-${key}`}
            >
              <Minus className="w-3 h-3" />
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <Input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Property name"
            className="flex-1"
            data-testid={`input-${property.name}-new-key`}
          />
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value"
            className="flex-1"
            data-testid={`input-${property.name}-new-value`}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addProperty}
            disabled={!newKey || !newValue}
            data-testid={`button-add-${property.name}-property`}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  };

  const basicProperties = component.properties.filter(prop => 
    !prop.name.startsWith('_') && 
    (component.difficulty !== 'advanced' || ['name', 'value', 'enabled', 'priority'].includes(prop.name))
  );
  
  const advancedProperties = component.properties.filter(prop =>
    prop.name.startsWith('_') || 
    (component.difficulty === 'advanced' && !['name', 'value', 'enabled', 'priority'].includes(prop.name))
  );

  return (
    <TooltipProvider>
      <Card className={`component-form ${className}`} data-testid={`component-form-${component.name}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-base">{component.name}</span>
            <Badge className={`text-xs ${
              component.stability === 'stable' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
              component.stability === 'beta' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
              {component.stability}
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm">{component.description}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Basic Properties */}
              {basicProperties.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Basic Settings</h4>
                  {basicProperties.map(renderPropertyField)}
                </div>
              )}

              {/* Advanced Properties */}
              {advancedProperties.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Advanced Settings</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      data-testid="button-toggle-advanced"
                    >
                      {showAdvanced ? 'Hide' : 'Show'} Advanced ({advancedProperties.length})
                    </Button>
                  </div>
                  {showAdvanced && advancedProperties.map(renderPropertyField)}
                </div>
              )}

              {/* Example */}
              {showExample && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="example">
                    <AccordionTrigger className="text-sm" data-testid="accordion-example">
                      View Example JSON
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                        {component.example}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/* Form Actions */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button type="submit" data-testid="button-save-component">
                  <Check className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Component' : 'Add Component'}
                </Button>
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel-component">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}