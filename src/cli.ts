#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { CreateCommand } from './commands/create';
import { InitCommand } from './commands/init';
import { StatusCommand } from './commands/status';
import { DeployCommand } from './commands/deploy';

const program = new Command();

// Global configuration
program
  .name('cht')
  .description('ButtonOps - Internal Developer Platform CLI')
  .version('1.0.0');

// Global options
program
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--dry-run', 'Show what would be done without executing')
  .option('--config <path>', 'Custom config file path');

// Create command
program
  .command('create')
  .description('Create new projects and resources')
  .addCommand(CreateCommand);

// Initialize command
program
  .command('init')
  .description('Initialize ButtonOps in current directory')
  .addCommand(InitCommand);

// Status command
program
  .command('status')
  .description('Show status of projects and infrastructure')
  .addCommand(StatusCommand);

// Deploy command
program
  .command('deploy')
  .description('Deploy projects to environments')
  .addCommand(DeployCommand);

// Error handling
program.exitOverride();

// Custom help
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name() + ' ' + cmd.usage(),
});

// Main execution
async function main() {
  try {
    console.log(chalk.blue.bold('\n🚀 ButtonOps - Internal Developer Platform\n'));
    await program.parseAsync(process.argv);
  } catch (error: any) {
    if (error.code === 'commander.unknownCommand') {
      console.error(chalk.red(`\n❌ Unknown command: ${error.message}\n`));
      program.help();
    } else if (error.code === 'commander.help') {
      // Help was displayed, exit normally
      process.exit(0);
    } else {
      console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
      if (program.getOptionValue('verbose')) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }
}

if (require.main === module) {
  main();
}

export { program }; 