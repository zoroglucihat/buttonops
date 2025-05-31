"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const ora_1 = __importDefault(require("ora"));
const project_service_1 = require("../services/project.service");
const infrastructure_service_1 = require("../services/infrastructure.service");
const pipeline_service_1 = require("../services/pipeline.service");
const createCommand = new commander_1.Command('project');
exports.CreateCommand = createCommand;
createCommand
    .description('Create a new microservice project with infrastructure')
    .option('-t, --type <type>', 'Project type (rest-api, graphql, worker, frontend)', 'rest-api')
    .option('-n, --name <name>', 'Project name')
    .option('-e, --env <environment>', 'Target environment (dev, qa, staging, prod)', 'dev')
    .option('--repo-url <url>', 'Git repository URL')
    .option('--no-infrastructure', 'Skip infrastructure creation')
    .option('--no-pipeline', 'Skip pipeline creation')
    .action(async (options) => {
    try {
        const spinner = (0, ora_1.default)('Initializing project creation...').start();
        // Validate inputs
        if (!options.name) {
            spinner.stop();
            const answers = await inquirer_1.default.prompt([
                {
                    type: 'input',
                    name: 'name',
                    message: 'What is the project name?',
                    validate: (input) => input.length > 0 || 'Project name is required',
                },
            ]);
            options.name = answers.name;
        }
        // Confirm project details
        spinner.stop();
        console.log(chalk_1.default.cyan('\n📋 Project Configuration:'));
        console.log(`   Name: ${chalk_1.default.white(options.name)}`);
        console.log(`   Type: ${chalk_1.default.white(options.type)}`);
        console.log(`   Environment: ${chalk_1.default.white(options.env)}`);
        console.log(`   Infrastructure: ${chalk_1.default.white(options.infrastructure ? 'Yes' : 'No')}`);
        console.log(`   Pipeline: ${chalk_1.default.white(options.pipeline ? 'Yes' : 'No')}\n`);
        const { confirmed } = await inquirer_1.default.prompt([
            {
                type: 'confirm',
                name: 'confirmed',
                message: 'Do you want to proceed with this configuration?',
                default: true,
            },
        ]);
        if (!confirmed) {
            console.log(chalk_1.default.yellow('❌ Operation cancelled by user'));
            return;
        }
        // Initialize services
        const projectService = new project_service_1.ProjectService();
        const infrastructureService = new infrastructure_service_1.InfrastructureService();
        const pipelineService = new pipeline_service_1.PipelineService();
        // Create project structure
        spinner.start('Creating project structure...');
        await projectService.createProject(options);
        spinner.succeed('Project structure created');
        // Create infrastructure
        if (options.infrastructure) {
            spinner.start('Provisioning infrastructure...');
            await infrastructureService.createInfrastructure(options);
            spinner.succeed('Infrastructure provisioned');
        }
        // Create pipeline
        if (options.pipeline) {
            spinner.start('Setting up CI/CD pipeline...');
            await pipelineService.createPipeline(options);
            spinner.succeed('CI/CD pipeline created');
        }
        console.log(chalk_1.default.green.bold(`\n🎉 Successfully created project "${options.name}"!`));
        console.log(chalk_1.default.cyan('\n📚 Next steps:'));
        console.log(`   1. cd ${options.name}`);
        console.log('   2. Review the generated code and configurations');
        console.log('   3. Commit and push your changes');
        console.log('   4. Monitor the pipeline execution\n');
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Failed to create project: ${error.message}`));
        process.exit(1);
    }
});
//# sourceMappingURL=create.js.map