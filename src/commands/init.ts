import { Command } from 'commander';

const initCommand = new Command('workspace');

initCommand
  .description('Initialize ButtonOps workspace configuration')
  .option('--azure-subscription <id>', 'Azure subscription ID')
  .option('--azure-devops-org <org>', 'Azure DevOps organization')
  .option('--terraform-backend <backend>', 'Terraform backend configuration')
  .action(async (options) => {
    console.log('Initializing ButtonOps workspace...');
    // Implementation will be added
  });

export { initCommand as InitCommand }; 