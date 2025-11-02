import { InputParameter } from '@lumindigital/juno/dist/api/parameter.js';
import { simpleTag } from '@lumindigital/juno/dist/api/expression.js';
import { EnvironmentVariable } from '@lumindigital/juno/dist/api/environment-variable.js';
import { ImageTags } from '../utils/image-tags.js';
import { Template } from '@lumindigital/juno/dist/api/template.js';
import { Inputs } from '@lumindigital/juno/dist/api/inputs.js';
import { Container } from '@lumindigital/juno/dist/api/container.js';

export class GitPullContainerTemplate {
    static gitRepoName = new InputParameter('git-repo-name');
    static gitPath = new InputParameter('git-path');
    static gitVolumeName = new InputParameter('git-volume-name');

    static gitPullScriptTemplate = new Template('git-pull-script', {
        inputs: new Inputs({
            parameters: [this.gitRepoName, this.gitPath, this.gitVolumeName],
        }),
        container: new Container({
            image: ImageTags.gitImage,
            resources: {
                requests: {
                    memory: '100Mi',
                    cpu: '100m',
                },
            },
            env: [
                new EnvironmentVariable('GIT_REPOSITORY_URL', {
                    value: `${simpleTag(this.gitPath)}/${simpleTag(this.gitRepoName)}.git`,
                }),
            ],
            command: ['git'],
            args: ['clone', '--depth=1', '$(GIT_REPOSITORY_URL)'],
            volumeMounts: [
                {
                    name: simpleTag(this.gitVolumeName),
                    mountPath: '/mnt/src',
                },
            ],
            workingDir: '/mnt/src',
        }),
    });
}
