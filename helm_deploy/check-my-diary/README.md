# Check My Diary Helm Chart
## Introduction
This directory contains the relevant files to deploy the Check My Diary application to the MoJ Cloud Platform with Helm.


## Installing the Chart
To install the chart:
```
helm install --name check-my-diary-dev ./helm_deploy/check-my-diary/. --tiller-namespace=check-my-diary-dev --namespace=check-my-diary-dev --set image.repository="926803513772.dkr.ecr.eu-west-1.amazonaws.com/check-my-diary/check-my-diary-dev" --set image.tag='latest' --set deploy.host="check-my-diary-dev.apps.cloud-platform-live-0.k8s.integration.dsd.io" --set replicaCount=1 --set applicationName=check-my-diary-dev --set appEnvironment=dev --debug
```
The ```app-name``` will be the name of your deployment. For example `check-my-diary-dev`.

The ```env-name``` here is the environment name (namespace) you've created in the [Creating a Cloud Platform Environment](https://ministryofjustice.github.io/cloud-platform-user-docs/cloud-platform/env-create/#creating-a-cloud-platform-environment) guide.

The ```URL``` argument is the address your application will be served. An example of this is: `check-my-diary-dev.apps.cloud-platform-live-0.k8s.integration.dsd.io`.

There are a number of install switches available. Please visit the [Helm docs](https://docs.helm.sh/helm/#helm-install) for more information.

## Deleting the Chart
To delete the installation from your cluster:
```
helm del --purge check-my-diary-dev --tiller-namespace=check-my-diary-dev
```
## Configuration
| Parameter  | Description     | Default |
| ---------- | --------------- | ------- |
| `replicaCount` | Used to set the number of replica pods used. | `1` |
| `image.repository` | The image repository location. | `926803513772.dkr.ecr.eu-west-1.amazonaws.com/check-my-diary/check-my-diary-dev`|
| `image.tag` | The image tag. | `latest` |
| `deploy.host` | The URL of your application | `""` |
| `applicationName` | Name of application & tillerNamespace | `check-my-diary-dev` |
| `appEnvironment` | Environment | `dev` |
| `--debug` | Enable debug output | `On` |
| `--dry-run` | Do a dry run of the deployment | `off`
|

## Chart Structure
### Chart.yaml
The YAML for our chart. This contains our API version, chart description, name and version.

### requirements.yaml
A YAML file listing dependencies for the chart.

### values.yaml
The default configuration values for this chart.

### charts/
A directory containing any charts upon which this chart depends.

### templates/
A directory of templates that, when combined with values, will generate valid Kubernetes manifest files.

### templates/NOTES.txt
