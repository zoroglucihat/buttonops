#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.program = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const create_1 = require("./commands/create");
const init_1 = require("./commands/init");
const status_1 = require("./commands/status");
const deploy_1 = require("./commands/deploy");
const program = new commander_1.Command();
exports.program = program;
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
    .addCommand(create_1.CreateCommand);
// Initialize command
program
    .command('init')
    .description('Initialize ButtonOps in current directory')
    .addCommand(init_1.InitCommand);
// Status command
program
    .command('status')
    .description('Show status of projects and infrastructure')
    .addCommand(status_1.StatusCommand);
// Deploy command
program
    .command('deploy')
    .description('Deploy projects to environments')
    .addCommand(deploy_1.DeployCommand);
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
        console.log(chalk_1.default.blue.bold('\n🚀 ButtonOps - Internal Developer Platform\n'));
        await program.parseAsync(process.argv);
    }
    catch (error) {
        if (error.code === 'commander.unknownCommand') {
            console.error(chalk_1.default.red(`\n❌ Unknown command: ${error.message}\n`));
            program.help();
        }
        else if (error.code === 'commander.help') {
            // Help was displayed, exit normally
            process.exit(0);
        }
        else {
            console.error(chalk_1.default.red(`\n❌ Error: ${error.message}\n`));
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
//# sourceMappingURL=cli.js.map