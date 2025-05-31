import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { ProjectService } from '../services/project.service';
import { InfrastructureService } from '../services/infrastructure.service';
import { PipelineService } from '../services/pipeline.service';

const createCommand = new Command('project');

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
      const spinner = ora('Initializing project creation...').start();
      
      // Validate inputs
      if (!options.name) {
        spinner.stop();
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'name',
            message: 'What is the project name?',
            validate: (input: string) => input.length > 0 || 'Project name is required',
          },
        ]);
        options.name = answers.name;
      }

      // Confirm project details
      spinner.stop();
      console.log(chalk.cyan('\n📋 Project Configuration:'));
      console.log(`   Name: ${chalk.white(options.name)}`);
      console.log(`   Type: ${chalk.white(options.type)}`);
      console.log(`   Environment: ${chalk.white(options.env)}`);
      console.log(`   Infrastructure: ${chalk.white(options.infrastructure ? 'Yes' : 'No')}`);
      console.log(`   Pipeline: ${chalk.white(options.pipeline ? 'Yes' : 'No')}\n`);

      const { confirmed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: 'Do you want to proceed with this configuration?',
          default: true,
        },
      ]);

      if (!confirmed) {
        console.log(chalk.yellow('❌ Operation cancelled by user'));
        return;
      }

      // Initialize services
      const projectService = new ProjectService();
      const infrastructureService = new InfrastructureService();
      const pipelineService = new PipelineService();

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

      console.log(chalk.green.bold(`\n🎉 Successfully created project "${options.name}"!`));
      console.log(chalk.cyan('\n📚 Next steps:'));
      console.log(`   1. cd ${options.name}`);
      console.log('   2. Review the generated code and configurations');
      console.log('   3. Commit and push your changes');
      console.log('   4. Monitor the pipeline execution\n');

    } catch (error: any) {
      console.error(chalk.red(`❌ Failed to create project: ${error.message}`));
      process.exit(1);
    }
  });

export { createCommand as CreateCommand }; 