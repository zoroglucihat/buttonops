import * as fs from 'fs-extra';
import * as path from 'path';
import * as mustache from 'mustache';
import { TemplateService } from './template.service';

export interface ProjectOptions {
  name: string;
  type: string;
  env: string;
  repoUrl?: string;
  infrastructure: boolean;
  pipeline: boolean;
}

export class ProjectService {
  private templateService: TemplateService;

  constructor() {
    this.templateService = new TemplateService();
  }

  async createProject(options: ProjectOptions): Promise<void> {
    const projectPath = path.join(process.cwd(), options.name);

    // Create project directory
    await fs.ensureDir(projectPath);

    // Generate project files based on type
    await this.generateProjectFiles(projectPath, options);

    // Create basic project structure
    await this.createProjectStructure(projectPath, options);

    // Generate configuration files
    await this.generateConfigFiles(projectPath, options);
  }

  private async generateProjectFiles(projectPath: string, options: ProjectOptions): Promise<void> {
    const templateData = {
      projectName: options.name,
      projectType: options.type,
      environment: options.env,
      timestamp: new Date().toISOString(),
    };

    // Get template based on project type
    const template = await this.templateService.getTemplate(options.type);
    
    // Generate files from template
    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = path.join(projectPath, filePath);
      await fs.ensureDir(path.dirname(fullPath));
      
      const renderedContent = mustache.render(content as string, templateData);
      await fs.writeFile(fullPath, renderedContent);
    }
  }

  private async createProjectStructure(projectPath: string, options: ProjectOptions): Promise<void> {
    const directories = [
      'src',
      'tests',
      'docs',
      'deploy',
      'scripts',
      '.github/workflows',
    ];

    for (const dir of directories) {
      await fs.ensureDir(path.join(projectPath, dir));
    }
  }

  private async generateConfigFiles(projectPath: string, options: ProjectOptions): Promise<void> {
    // Generate buttonops.yaml configuration
    const config = {
      name: options.name,
      type: options.type,
      version: '1.0.0',
      environments: {
        [options.env]: {
          enabled: true,
          infrastructure: options.infrastructure,
          pipeline: options.pipeline,
        },
      },
      infrastructure: {
        provider: 'azure',
        region: 'westeurope',
        kubernetes: {
          enabled: true,
          cluster: `${options.name}-${options.env}-aks`,
        },
        redis: {
          enabled: true,
          sku: 'Basic',
        },
        monitoring: {
          enabled: true,
        },
      },
    };

    await fs.writeFile(
      path.join(projectPath, 'buttonops.yaml'),
      JSON.stringify(config, null, 2)
    );
  }
} 