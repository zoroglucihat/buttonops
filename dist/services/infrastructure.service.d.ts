import { ProjectOptions } from './project.service';
export declare class InfrastructureService {
    createInfrastructure(options: ProjectOptions): Promise<void>;
    private generateTerraformConfig;
    private generateMainTerraform;
    private generateVariablesTerraform;
    private generateOutputsTerraform;
    private executeTerraform;
}
//# sourceMappingURL=infrastructure.service.d.ts.map