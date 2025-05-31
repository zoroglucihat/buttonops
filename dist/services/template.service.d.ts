export interface ProjectTemplate {
    name: string;
    description: string;
    files: Record<string, string>;
}
export declare class TemplateService {
    private templates;
    constructor();
    getTemplate(type: string): Promise<ProjectTemplate>;
    getAvailableTemplates(): string[];
    private initializeTemplates;
    private getRestApiPackageJson;
    private getRestApiApp;
    private getHealthRoute;
    private getCorsMiddleware;
    private getDockerfile;
    private getDockerCompose;
    private getK8sDeployment;
    private getK8sService;
    private getK8sIngress;
    private getHelmChart;
    private getHelmValues;
    private getHelmValuesDev;
    private getHelmValuesQa;
    private getHelmValuesProd;
    private getHelmDeploymentTemplate;
    private getHelmServiceTemplate;
    private getHelmIngressTemplate;
    private getGraphQLPackageJson;
    private getGraphQLApp;
    private getGraphQLSchema;
    private getGraphQLResolvers;
    private getWorkerPackageJson;
    private getWorkerApp;
    private getEmailJob;
    private getProjectReadme;
    private getGitignore;
    private getDockerignore;
}
//# sourceMappingURL=template.service.d.ts.map