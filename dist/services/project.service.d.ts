export interface ProjectOptions {
    name: string;
    type: string;
    env: string;
    repoUrl?: string;
    infrastructure: boolean;
    pipeline: boolean;
}
export declare class ProjectService {
    private templateService;
    constructor();
    createProject(options: ProjectOptions): Promise<void>;
    private generateProjectFiles;
    private createProjectStructure;
    private generateConfigFiles;
}
//# sourceMappingURL=project.service.d.ts.map