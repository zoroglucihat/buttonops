"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const mustache = __importStar(require("mustache"));
const template_service_1 = require("./template.service");
class ProjectService {
    constructor() {
        this.templateService = new template_service_1.TemplateService();
    }
    async createProject(options) {
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
    async generateProjectFiles(projectPath, options) {
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
            const renderedContent = mustache.render(content, templateData);
            await fs.writeFile(fullPath, renderedContent);
        }
    }
    async createProjectStructure(projectPath, options) {
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
    async generateConfigFiles(projectPath, options) {
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
        await fs.writeFile(path.join(projectPath, 'buttonops.yaml'), JSON.stringify(config, null, 2));
    }
}
exports.ProjectService = ProjectService;
//# sourceMappingURL=project.service.js.map