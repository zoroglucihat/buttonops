import { Command } from 'commander';

const statusCommand = new Command('show');

statusCommand
  .description('Show status of projects and infrastructure')
  .option('-p, --project <name>', 'Show status for specific project')
  .option('-e, --env <environment>', 'Show status for specific environment')
  .action(async (options) => {
    console.log('Showing status...');
    // Implementation will be added
  });

export { statusCommand as StatusCommand }; 