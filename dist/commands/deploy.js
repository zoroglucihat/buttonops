"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployCommand = void 0;
const commander_1 = require("commander");
const deployCommand = new commander_1.Command('project');
exports.DeployCommand = deployCommand;
deployCommand
    .description('Deploy project to specified environment')
    .option('-p, --project <name>', 'Project name to deploy')
    .option('-e, --env <environment>', 'Target environment')
    .option('--force', 'Force deployment even if checks fail')
    .action(async (options) => {
    console.log('Deploying project...');
    // Implementation will be added
});
//# sourceMappingURL=deploy.js.map