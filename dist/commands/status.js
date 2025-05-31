"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusCommand = void 0;
const commander_1 = require("commander");
const statusCommand = new commander_1.Command('show');
exports.StatusCommand = statusCommand;
statusCommand
    .description('Show status of projects and infrastructure')
    .option('-p, --project <name>', 'Show status for specific project')
    .option('-e, --env <environment>', 'Show status for specific environment')
    .action(async (options) => {
    console.log('Showing status...');
    // Implementation will be added
});
//# sourceMappingURL=status.js.map