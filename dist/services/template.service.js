"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
class TemplateService {
    constructor() {
        this.templates = new Map();
        this.initializeTemplates();
    }
    async getTemplate(type) {
        const template = this.templates.get(type);
        if (!template) {
            throw new Error(`Template type '${type}' not found`);
        }
        return template;
    }
    getAvailableTemplates() {
        return Array.from(this.templates.keys());
    }
    initializeTemplates() {
        // REST API Template
        this.templates.set('rest-api', {
            name: 'REST API',
            description: 'Node.js REST API with Express and TypeScript',
            files: {
                'package.json': this.getRestApiPackageJson(),
                'src/app.ts': this.getRestApiApp(),
                'src/routes/health.ts': this.getHealthRoute(),
                'src/middleware/cors.ts': this.getCorsMiddleware(),
                'Dockerfile': this.getDockerfile(),
                'docker-compose.yml': this.getDockerCompose(),
                'deploy/k8s/deployment.yaml': this.getK8sDeployment(),
                'deploy/k8s/service.yaml': this.getK8sService(),
                'deploy/k8s/ingress.yaml': this.getK8sIngress(),
                'deploy/helm/Chart.yaml': this.getHelmChart(),
                'deploy/helm/values.yaml': this.getHelmValues(),
                'deploy/helm/values-dev.yaml': this.getHelmValuesDev(),
                'deploy/helm/values-qa.yaml': this.getHelmValuesQa(),
                'deploy/helm/values-prod.yaml': this.getHelmValuesProd(),
                'deploy/helm/templates/deployment.yaml': this.getHelmDeploymentTemplate(),
                'deploy/helm/templates/service.yaml': this.getHelmServiceTemplate(),
                'deploy/helm/templates/ingress.yaml': this.getHelmIngressTemplate(),
                'README.md': this.getProjectReadme(),
                '.gitignore': this.getGitignore(),
                '.dockerignore': this.getDockerignore(),
            },
        });
        // GraphQL API Template
        this.templates.set('graphql', {
            name: 'GraphQL API',
            description: 'Node.js GraphQL API with Apollo Server',
            files: {
                'package.json': this.getGraphQLPackageJson(),
                'src/app.ts': this.getGraphQLApp(),
                'src/schema/index.ts': this.getGraphQLSchema(),
                'src/resolvers/index.ts': this.getGraphQLResolvers(),
                'Dockerfile': this.getDockerfile(),
                'docker-compose.yml': this.getDockerCompose(),
                // ... similar k8s and helm files
                'README.md': this.getProjectReadme(),
                '.gitignore': this.getGitignore(),
            },
        });
        // Worker Template
        this.templates.set('worker', {
            name: 'Background Worker',
            description: 'Node.js background worker with Bull Queue',
            files: {
                'package.json': this.getWorkerPackageJson(),
                'src/worker.ts': this.getWorkerApp(),
                'src/jobs/email.ts': this.getEmailJob(),
                'Dockerfile': this.getDockerfile(),
                // ... similar files
                'README.md': this.getProjectReadme(),
                '.gitignore': this.getGitignore(),
            },
        });
    }
    getRestApiPackageJson() {
        return `{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "description": "{{projectName}} REST API",
  "main": "dist/app.js",
  "scripts": {
    "start": "node dist/app.js",
    "dev": "ts-node-dev --respawn --transpile-only src/app.ts",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "redis": "^4.6.10",
    "winston": "^3.11.0",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/node": "^20.8.0",
    "typescript": "^5.2.2",
    "ts-node-dev": "^2.0.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8",
    "eslint": "^8.50.0",
    "@typescript-eslint/eslint-plugin": "^6.7.4",
    "@typescript-eslint/parser": "^6.7.4"
  }
}`;
    }
    getRestApiApp() {
        return `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { healthRouter } from './routes/health';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/health', healthRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(\`{{projectName}} API server is running on port \${port}\`);
});

export default app;`;
    }
    getHealthRoute() {
        return `import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: '{{projectName}}',
    version: '1.0.0'
  });
});

router.get('/ready', (req, res) => {
  // Add readiness checks here (database, external services, etc.)
  res.json({
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

export { router as healthRouter };`;
    }
    getCorsMiddleware() {
        return `import cors from 'cors';

export const corsConfig = cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});`;
    }
    getDockerfile() {
        return `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]`;
    }
    getDockerCompose() {
        return `version: '3.8'

services:
  {{projectName}}:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    volumes:
      - .:/app
      - /app/node_modules

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:`;
    }
    getK8sDeployment() {
        return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{projectName}}
  labels:
    app: {{projectName}}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: {{projectName}}
  template:
    metadata:
      labels:
        app: {{projectName}}
    spec:
      containers:
      - name: {{projectName}}
        image: buttonops.azurecr.io/{{projectName}}:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "{{environment}}"
        - name: REDIS_URL
          value: "redis://{{projectName}}-{{environment}}-redis:6379"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"`;
    }
    getK8sService() {
        return `apiVersion: v1
kind: Service
metadata:
  name: {{projectName}}
  labels:
    app: {{projectName}}
spec:
  selector:
    app: {{projectName}}
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP`;
    }
    getK8sIngress() {
        return `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{projectName}}
  annotations:
    kubernetes.io/ingress.class: "azure/application-gateway"
spec:
  rules:
  - host: {{projectName}}-{{environment}}.buttonops.dev
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: {{projectName}}
            port:
              number: 80`;
    }
    getHelmChart() {
        return `apiVersion: v2
name: {{projectName}}
description: A Helm chart for {{projectName}}
type: application
version: 0.1.0
appVersion: "1.0.0"`;
    }
    getHelmValues() {
        return `replicaCount: 2

image:
  repository: buttonops.azurecr.io/{{projectName}}
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: "azure/application-gateway"
  annotations: {}
  hosts:
    - host: {{projectName}}.buttonops.dev
      paths:
        - path: /
          pathType: Prefix
  tls: []

resources:
  limits:
    cpu: 100m
    memory: 128Mi
  requests:
    cpu: 50m
    memory: 64Mi

autoscaling:
  enabled: false
  minReplicas: 1
  maxReplicas: 100
  targetCPUUtilizationPercentage: 80

nodeSelector: {}

tolerations: []

affinity: {}`;
    }
    getHelmValuesDev() {
        return `replicaCount: 1

image:
  tag: "dev"

ingress:
  hosts:
    - host: {{projectName}}-dev.buttonops.dev
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 50m
    memory: 64Mi
  requests:
    cpu: 25m
    memory: 32Mi`;
    }
    getHelmValuesQa() {
        return `replicaCount: 1

image:
  tag: "qa"

ingress:
  hosts:
    - host: {{projectName}}-qa.buttonops.dev
      paths:
        - path: /
          pathType: Prefix`;
    }
    getHelmValuesProd() {
        return `replicaCount: 3

image:
  tag: "prod"

ingress:
  hosts:
    - host: {{projectName}}.buttonops.dev
      paths:
        - path: /
          pathType: Prefix

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70`;
    }
    getHelmDeploymentTemplate() {
        return `{{- include "{{projectName}}.deployment" . -}}`;
    }
    getHelmServiceTemplate() {
        return `{{- include "{{projectName}}.service" . -}}`;
    }
    getHelmIngressTemplate() {
        return `{{- include "{{projectName}}.ingress" . -}}`;
    }
    getGraphQLPackageJson() {
        return `{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "description": "{{projectName}} GraphQL API",
  "main": "dist/app.js",
  "dependencies": {
    "apollo-server-express": "^3.12.1",
    "graphql": "^16.8.1",
    "express": "^4.18.2"
  }
}`;
    }
    getGraphQLApp() {
        return `import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';

async function startServer() {
  const app = express();
  
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(\`{{projectName}} GraphQL server running at http://localhost:\${port}\${server.graphqlPath}\`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});`;
    }
    getGraphQLSchema() {
        return `import { gql } from 'apollo-server-express';

export const typeDefs = gql\`
  type Query {
    hello: String
  }
\`;`;
    }
    getGraphQLResolvers() {
        return `export const resolvers = {
  Query: {
    hello: () => 'Hello from {{projectName}} GraphQL API!',
  },
};`;
    }
    getWorkerPackageJson() {
        return `{
  "name": "{{projectName}}",
  "version": "1.0.0",
  "description": "{{projectName}} Background Worker",
  "main": "dist/worker.js",
  "dependencies": {
    "bull": "^4.12.2",
    "redis": "^4.6.10"
  }
}`;
    }
    getWorkerApp() {
        return `import Queue from 'bull';
import { emailJob } from './jobs/email';

const emailQueue = new Queue('email', process.env.REDIS_URL || 'redis://localhost:6379');

emailQueue.process(emailJob);

console.log('{{projectName}} worker started');`;
    }
    getEmailJob() {
        return `export const emailJob = async (job: any) => {
  console.log('Processing email job:', job.data);
  // Add email processing logic here
  return { success: true };
};`;
    }
    getProjectReadme() {
        return `# {{projectName}}

A {{projectType}} service created with ButtonOps.

## Getting Started

### Prerequisites
- Node.js 18+
- Docker
- Kubernetes cluster (for deployment)

### Development
\`\`\`bash
npm install
npm run dev
\`\`\`

### Docker
\`\`\`bash
docker build -t {{projectName}} .
docker run -p 3000:3000 {{projectName}}
\`\`\`

### Deployment
\`\`\`bash
# Deploy to {{environment}}
./scripts/deploy.sh
\`\`\`

## API Documentation

Health check: \`GET /health\`

## Environment Variables

- \`NODE_ENV\`: Environment (development, qa, production)
- \`PORT\`: Server port (default: 3000)
- \`REDIS_URL\`: Redis connection URL

## Monitoring

- Health check: \`/health\`
- Readiness check: \`/health/ready\`
- Metrics: \`/metrics\`

Generated by ButtonOps on {{timestamp}}`;
    }
    getGitignore() {
        return `node_modules/
dist/
.env
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
.vscode/
.idea/
*.log`;
    }
    getDockerignore() {
        return `node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.vscode`;
    }
}
exports.TemplateService = TemplateService;
//# sourceMappingURL=template.service.js.map