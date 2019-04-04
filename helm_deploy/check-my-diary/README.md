# Check My Diary Helm Chart
## Introduction
This directory contains the relevant files to deploy the Check My Diary application to the MoJ Cloud Platform with Helm.


## Installing the Chart
To install the chart:
```
helm install helm_deploy/check-my-diary/. \
  --name <app-name> \
  --namespace <env-name> \
  --set deploy.host=<URL>
```
The ```app-name``` will be the name of your deployment. For example our reference Django reference app would be: `django-application`.

The ```env-name``` here is the environment name (namespace) you've created in the [Creating a Cloud Platform Environment](https://ministryofjustice.github.io/cloud-platform-user-docs/cloud-platform/env-create/#creating-a-cloud-platform-environment) guide.

The ```URL``` argument is the address your application will be served. An example of this is: `django-app.apps.cloud-platforms-test.k8s.integration.dsd.io`.

There are a number of install switches available. Please visit the [Helm docs](https://docs.helm.sh/helm/#helm-install) for more information. 

## Deleting the Chart
To delete the installation from your cluster:
```
helm del --purge <app-name>
```
## Configuration
| Parameter  | Description     | Default |
| ---------- | --------------- | ------- |
| `replicaCount` | Used to set the number of replica pods used. | `1` |
| `image.repository` | The image repository location. | `926803513772.dkr.ecr.eu-west-1.amazonaws.com/cloud-platform-demo-app`|
| `image.tag` | The image tag. | `latest` |
| `deploy.host` | The URL of your application | `""` |

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
