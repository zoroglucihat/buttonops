"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitCommand = void 0;
const commander_1 = require("commander");
const initCommand = new commander_1.Command('workspace');
exports.InitCommand = initCommand;
initCommand
    .description('Initialize ButtonOps workspace configuration')
    .option('--azure-subscription <id>', 'Azure subscription ID')
    .option('--azure-devops-org <org>', 'Azure DevOps organization')
    .option('--terraform-backend <backend>', 'Terraform backend configuration')
    .action(async (options) => {
    console.log('Initializing ButtonOps workspace...');
    // Implementation will be added
});
//# sourceMappingURL=init.js.map