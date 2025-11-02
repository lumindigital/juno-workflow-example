import { WorkflowParameter } from '@lumindigital/juno/dist/api/parameter.js';

export class BuildDockerImageWorkflowParameters {
    static gitPath = new WorkflowParameter('git-path', {
        value: 'https://github.com/dockersamples',
    });
    static gitRepoName = new WorkflowParameter('git-repo-name', {
        value: 'helloworld-demo-node',
    });
    static image = new WorkflowParameter('image', {
        value: 'localhost:5000/helloworld-demo-node:v1.0.0',
    });
}
