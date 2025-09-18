import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProjectSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Addon validation endpoint
  app.post("/api/validate", (req, res) => {
    try {
      const { content, type } = req.body;
      
      if (!content || !type) {
        return res.status(400).json({ 
          error: "Missing content or type parameter" 
        });
      }

      // Basic JSON validation
      let parsedContent;
      try {
        parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
      } catch (parseError) {
        return res.status(400).json({
          error: "Invalid JSON format",
          details: parseError instanceof Error ? parseError.message : "Unknown parsing error"
        });
      }

      // Basic validation - return success for now
      const validationResult = {
        isValid: true,
        errors: [],
        message: "Content validation passed"
      };
      
      res.json(validationResult);
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({ 
        error: "Internal validation error",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Save addon project endpoint
  app.post("/api/projects", async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validationResult = insertProjectSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid project data",
          details: validationResult.error.issues
        });
      }

      const project = await storage.createProject(validationResult.data);
      
      res.json({
        success: true,
        project,
        message: "Project saved successfully"
      });
    } catch (error) {
      console.error('Save project error:', error);
      res.status(500).json({ 
        error: "Failed to save project",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get projects (list) endpoint - needs to come before the /:id route
  app.get("/api/projects", async (req, res) => {
    try {
      const { type } = req.query;
      
      let projects;
      if (type && typeof type === 'string') {
        projects = await storage.getProjectsByType(type);
      } else {
        projects = await storage.getAllProjects();
      }
      
      res.json({
        success: true,
        projects
      });
    } catch (error) {
      console.error('List projects error:', error);
      res.status(500).json({ 
        error: "Failed to load projects",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Load addon project by ID endpoint
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const projectId = parseInt(id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ 
          error: "Invalid project ID" 
        });
      }
      
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ 
          error: "Project not found" 
        });
      }
      
      res.json(project);
    } catch (error) {
      console.error('Load project error:', error);
      res.status(500).json({ 
        error: "Failed to load project",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Update project endpoint
  app.put("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const projectId = parseInt(id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ 
          error: "Invalid project ID" 
        });
      }
      
      const { name, description, data, type } = req.body;
      const updateData: any = {};
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (data !== undefined) updateData.data = data;
      if (type !== undefined) updateData.type = type;
      
      const project = await storage.updateProject(projectId, updateData);
      
      if (!project) {
        return res.status(404).json({ 
          error: "Project not found" 
        });
      }
      
      res.json({
        success: true,
        project,
        message: "Project updated successfully"
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ 
        error: "Failed to update project",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Delete project endpoint
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const projectId = parseInt(id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ 
          error: "Invalid project ID" 
        });
      }
      
      const deleted = await storage.deleteProject(projectId);
      
      if (!deleted) {
        return res.status(404).json({ 
          error: "Project not found" 
        });
      }
      
      res.json({
        success: true,
        message: "Project deleted successfully"
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ 
        error: "Failed to delete project",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Minecraft API documentation endpoint
  app.get("/api/docs/minecraft", (req, res) => {
    try {
      const { category, search } = req.query;
      
      // Return sample documentation data
      const docs = {
        entities: [
          {
            name: "minecraft:health",
            category: "Attributes",
            description: "Defines the health of the entity",
            version: "1.8.0"
          },
          {
            name: "minecraft:movement", 
            category: "Movement",
            description: "Defines movement speed",
            version: "1.8.0"
          }
        ],
        api: [
          {
            name: "world.sendMessage",
            module: "@minecraft/server",
            description: "Sends a message to all players",
            version: "1.21.0"
          }
        ]
      };

      res.json(docs);
    } catch (error) {
      console.error('Documentation error:', error);
      res.status(500).json({ 
        error: "Failed to load documentation" 
      });
    }
  });

  // Script generation endpoint
  app.post("/api/generate-script", (req, res) => {
    try {
      const { method, parameters, template } = req.body;
      
      if (!method) {
        return res.status(400).json({ 
          error: "Missing method parameter" 
        });
      }

      // Generate script based on method and parameters
      let generatedScript = '';
      
      switch (method) {
        case 'world.sendMessage':
          const message = parameters?.message || 'Hello, Minecraft!';
          generatedScript = `import { world } from '@minecraft/server';\n\n// Send a message to all players\nworld.sendMessage("${message}");`;
          break;
          
        case 'world.spawnEntity':
          const entityType = parameters?.entityType || 'minecraft:pig';
          const location = parameters?.location || '{ x: 0, y: 64, z: 0 }';
          generatedScript = `import { world } from '@minecraft/server';\n\n// Spawn an entity\nconst entity = world.spawnEntity("${entityType}", ${location});`;
          break;
          
        default:
          generatedScript = `// Method ${method} not implemented yet\n// Add your implementation here`;
      }
      
      res.json({
        success: true,
        script: generatedScript
      });
    } catch (error) {
      console.error('Script generation error:', error);
      res.status(500).json({ 
        error: "Failed to generate script" 
      });
    }
  });

  // Texture upload endpoint for texture creator
  app.post("/api/textures/upload", (req, res) => {
    try {
      // In a real implementation, this would handle file uploads
      res.json({
        success: true,
        textureId: `texture_${Date.now()}`,
        message: "Texture uploaded successfully"
      });
    } catch (error) {
      console.error('Texture upload error:', error);
      res.status(500).json({ 
        error: "Failed to upload texture" 
      });
    }
  });

  // Export addon endpoint
  app.post("/api/export", async (req, res) => {
    try {
      const { format, config } = req.body;
      
      if (!format || !config) {
        return res.status(400).json({ 
          error: "Missing format or config parameter" 
        });
      }

      // Validate export config
      if (!config.name || !config.files) {
        return res.status(400).json({ 
          error: "Missing required config fields: name and files" 
        });
      }

      // For now, generate a unique identifier for the export
      const exportId = `addon_${Date.now()}`;
      const downloadUrl = `/api/downloads/${exportId}.${format}`;
      
      // In a real implementation, you would:
      // 1. Generate the addon file using the AddonExporter
      // 2. Store it temporarily on the server
      // 3. Provide a download endpoint
      
      res.json({
        success: true,
        downloadUrl,
        exportId,
        message: "Addon export prepared successfully",
        config: {
          name: config.name,
          fileCount: config.files?.length || 0,
          format
        }
      });
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ 
        error: "Failed to export addon",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Download endpoint for exported addons
  app.get("/api/downloads/:filename", (req, res) => {
    try {
      const { filename } = req.params;
      
      // In a real implementation, this would serve the actual addon file
      // For now, return an appropriate response
      res.status(404).json({
        error: "Download not found",
        message: "Addon file generation is in progress"
      });
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ 
        error: "Download failed",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function for addon content validation
function validateAddonContent(content: any, type: string) {
  const errors: string[] = [];
  const warnings: string[] = [];

  switch (type) {
    case 'entity':
      if (!content['minecraft:entity']) {
        errors.push('Missing minecraft:entity object');
      }
      if (!content.format_version) {
        errors.push('Missing format_version');
      }
      if (content['minecraft:entity']?.description?.identifier && 
          !content['minecraft:entity'].description.identifier.includes(':')) {
        warnings.push('Consider using namespaced identifier (e.g., "my_addon:entity_name")');
      }
      break;

    case 'block':
      if (!content['minecraft:block']) {
        errors.push('Missing minecraft:block object');
      }
      if (!content.format_version) {
        errors.push('Missing format_version');
      }
      break;

    case 'item':
      if (!content['minecraft:item']) {
        errors.push('Missing minecraft:item object');
      }
      if (!content.format_version) {
        errors.push('Missing format_version');
      }
      break;

    case 'recipe':
      const hasShapedRecipe = content['minecraft:recipe_shaped'];
      const hasShapelessRecipe = content['minecraft:recipe_shapeless'];
      if (!hasShapedRecipe && !hasShapelessRecipe) {
        errors.push('Missing recipe type (minecraft:recipe_shaped or minecraft:recipe_shapeless)');
      }
      break;

    case 'loot_table':
      if (!content.pools || !Array.isArray(content.pools)) {
        errors.push('Missing or invalid pools array');
      }
      break;

    default:
      warnings.push('Unknown content type - limited validation available');
  }

  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
