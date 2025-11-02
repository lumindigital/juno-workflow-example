import { Arguments, WorkflowArguments } from '@lumindigital/juno/dist/api/arguments.js';
import { WorkflowSpec } from '@lumindigital/juno/dist/api/workflow-spec.js';
import { WorkflowTemplate } from '@lumindigital/juno/dist/api/workflow-template.js';
import { BuildDockerImageEntrypointDagTemplate } from './build-docker-image-dag-template.js';
import { IoArgoprojWorkflowV1Alpha1WorkflowTemplate } from '@lumindigital/juno/dist/workflow-interfaces/data-contracts.js';
import { BuildDockerImageWorkflowParameters } from './build-docker-image-workflow-parameters.js';
import { Template } from '@lumindigital/juno/dist/api/template.js';
import { DagTemplate } from '@lumindigital/juno/dist/api/dag-template.js';
import { DagTask } from '@lumindigital/juno/dist/api/dag-task.js';

export async function generateTemplate(): Promise<IoArgoprojWorkflowV1Alpha1WorkflowTemplate> {
    const workflowName = 'build-docker-image';

    // The entrypoint template's only purpose is to pass in the workflow parameters as inputs instead of using the workflow parameters directly.
    const entrypointTemplate = new Template('entrypoint-dag', {
        dag: new DagTemplate({
            tasks: [
                new DagTask('build-docker-image', {
                    template: BuildDockerImageEntrypointDagTemplate.entrypointDagTemplate,
                    arguments: new Arguments({
                        parameters: [
                            BuildDockerImageEntrypointDagTemplate.gitRepoName.toArgumentParameter({
                                valueFromWorkflowParameter: BuildDockerImageWorkflowParameters.gitRepoName,
                            }),
                            BuildDockerImageEntrypointDagTemplate.gitPath.toArgumentParameter({
                                valueFromWorkflowParameter: BuildDockerImageWorkflowParameters.gitPath,
                            }),
                            BuildDockerImageEntrypointDagTemplate.gitVolumeName.toArgumentParameter({ value: 'src' }),
                            BuildDockerImageEntrypointDagTemplate.image.toArgumentParameter({
                                valueFromWorkflowParameter: BuildDockerImageWorkflowParameters.image,
                            }),
                        ],
                    }),
                }),
            ],
        }),
    });

    return new WorkflowTemplate({
        metadata: {
            name: workflowName,
        },
        spec: new WorkflowSpec({
            arguments: new WorkflowArguments({
                parameters: [
                    BuildDockerImageWorkflowParameters.gitPath,
                    BuildDockerImageWorkflowParameters.gitRepoName,
                    BuildDockerImageWorkflowParameters.image,
                ],
            }),
            entrypoint: entrypointTemplate,
            volumeClaimTemplates: [
                {
                    metadata: {
                        name: 'src',
                    },
                    spec: {
                        accessModes: ['ReadWriteOnce'],
                        resources: {
                            requests: {
                                storage: '1Gi',
                            },
                        },
                    },
                },
            ],
            workflowMetadata: {
                labels: {
                    template: workflowName,
                },
            },
        }),
    }).toWorkflowTemplate();
}
