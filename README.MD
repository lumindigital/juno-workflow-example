# Juno Workflow Example
This project is an example of a juno workflow project. It contains a simple workflow template that pulls a git repo and the builds an image.
This project is structured in a similar way to our our own internal workflows. This project is representative of that even though it is a very simple project with a single workflow. Feel free to ignore any of the design decisions you disagree with. If you think there are better alternatives we would love to hear your feedback with examples.

Some of the design decisions we made
* Verbose naming to make it clear the type of template the file contains
* Use of a single location for all image tags in src/utils/image-tags.ts
* All parameters passed to dags/templates, global paramters passed into entrypoint dag.

# Requirements
You will need to install nodejs in order to generate manifests


# Kubernetes Setup
You will need a config.json file added to your argo workflow namespace
```shell
echo '{}' > /tmp/config.json
kubectl -n YOUR_ARGO_WF_NAMESPACE create secret generic docker-config --from-file=~/.docker/config.json
```

# Generating Manifest
Run the following commands from the root of the project
```shell
npm i
npm run generate
kubectl apply ./output/workflow-templates/build-docker-image/build-docker-image-workflow-template.yaml -n YOUR_ARGO_WF_NAMESPACE
```

The project is not configured to push the docker image it builds to a repository. If you wish to enable that you will need to set push=true on this line
```js
`type=image,name=${simpleTag(this.imageName)},push=false`,
```
in src/shared-templates/buildkit-container-template.ts. You will also need to modify the docker.config file created previously to include credentials to the repository you wish to push to.