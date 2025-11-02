import { InputParameter } from '@lumindigital/juno/dist/api/parameter.js';
import { simpleTag } from '@lumindigital/juno/dist/api/expression.js';
import { EnvironmentVariable } from '@lumindigital/juno/dist/api/environment-variable.js';
import { ImageTags } from '../utils/image-tags.js';
import { Template } from '@lumindigital/juno/dist/api/template.js';
import { Inputs } from '@lumindigital/juno/dist/api/inputs.js';
import { Container } from '@lumindigital/juno/dist/api/container.js';

export class BuildKitContainerTemplate {
    private static dockerMountPath = '/.docker';

    static volumeName = new InputParameter('volume-name');
    static repoName = new InputParameter('repo-name');
    static dockerfilePath = new InputParameter('dockerfile-path');
    static imageName = new InputParameter('image-name');

    static buildkitScriptTemplate = new Template('buildkit-script', {
        inputs: new Inputs({
            parameters: [this.volumeName, this.dockerfilePath, this.imageName, this.repoName],
        }),
        container: new Container({
            image: ImageTags.buildkitImage,
            resources: {
                requests: {
                    memory: '100Mi',
                    cpu: '100m',
                },
            },
            readinessProbe: {
                exec: {
                    command: ['sh', '-c', 'buildctl debug workers'],
                },
            },
            env: [
                new EnvironmentVariable('BUILDKITD_FLAGS', {
                    value: '--oci-worker-no-process-sandbox',
                }),
                new EnvironmentVariable('DOCKER_CONFIG', {
                    value: this.dockerMountPath,
                }),
            ],

            command: ['buildctl-daemonless.sh'],
            args: [
                'build',
                '--frontend',
                'dockerfile.v0',
                '--local',
                'context=.',
                '--local',
                'dockerfile=.',
                '--output',
                `type=image,name=${simpleTag(this.imageName)},push=false`,
            ],

            volumeMounts: [
                {
                    name: simpleTag(this.volumeName),
                    mountPath: '/mnt/src',
                },
                {
                    name: 'docker-config',
                    mountPath: '/.docker',
                },
            ],
            workingDir: `/mnt/src/${simpleTag(this.repoName)}`,
        }),
        volumes: [
            {
                name: 'docker-config',
                secret: {
                    secretName: 'docker-config',
                },
            },
        ],
    });
}
