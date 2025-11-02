import { DagTask } from '@lumindigital/juno/dist/api/dag-task.js';
import { DagTemplate } from '@lumindigital/juno/dist/api/dag-template.js';
import { Template } from '@lumindigital/juno/dist/api/template.js';
import { GitPullContainerTemplate as GitPullContainerTemplate } from '../../shared-templates/git-pull-container-template.js';
import { Arguments } from '@lumindigital/juno/dist/api/arguments.js';
import { Inputs } from '@lumindigital/juno/dist/api/inputs.js';
import { InputParameter } from '@lumindigital/juno/dist/api/parameter.js';
import { BuildKitContainerTemplate } from '../../shared-templates/buildkit-container-template.js';

export class BuildDockerImageEntrypointDagTemplate {
    static gitPath = new InputParameter('git-path');
    static gitVolumeName = new InputParameter('git-volume-name');
    static gitRepoName = new InputParameter('git-repo-name');
    static image = new InputParameter('image');

    private static getDockerRepository = new DagTask('get-docker-repository', {
        template: GitPullContainerTemplate.gitPullScriptTemplate,
        arguments: new Arguments({
            parameters: [
                GitPullContainerTemplate.gitPath.toArgumentParameter({ valueFromInputParameter: this.gitPath }),
                GitPullContainerTemplate.gitRepoName.toArgumentParameter({ valueFromInputParameter: this.gitRepoName }),
                GitPullContainerTemplate.gitVolumeName.toArgumentParameter({
                    valueFromInputParameter: this.gitVolumeName,
                }),
            ],
        }),
    });

    private static buildDockerImage = new DagTask('build-docker-image', {
        template: BuildKitContainerTemplate.buildkitScriptTemplate,
        arguments: new Arguments({
            parameters: [
                BuildKitContainerTemplate.volumeName.toArgumentParameter({ value: 'src' }),
                BuildKitContainerTemplate.repoName.toArgumentParameter({ valueFromInputParameter: this.gitRepoName }),
                BuildKitContainerTemplate.dockerfilePath.toArgumentParameter({ value: '.' }),
                BuildKitContainerTemplate.imageName.toArgumentParameter({
                    valueFromInputParameter: this.image,
                }),
            ],
        }),
        dependencies: [this.getDockerRepository],
    });

    private static buildDockerImageDag = new DagTemplate({
        tasks: [this.getDockerRepository, this.buildDockerImage],
    });

    static readonly entrypointDagTemplate = new Template('build-docker-image-entrypoint-dag', {
        inputs: new Inputs({
            parameters: [this.gitPath, this.gitRepoName, this.gitVolumeName, this.image],
        }),
        dag: this.buildDockerImageDag,
    });
}
