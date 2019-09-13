# Check My Diary Helm Chart
## Introduction
This directory contains the relevant files to deploy the Check My Diary application to the MoJ Cloud Platform with Helm.

The application is split into two parts, each living in their own container. The check-my-diary frontend and the check-my-diary-notification-service: https://github.com/ministryofjustice/check-my-diary-notification-service

This helm chart bundles both the Check My Diary web frontend and the notification service & deploys them to the same namepsace on the Kubernetes cluster.

The check-my-diary web frontend is a containerised node.js app serving the application to MoJ staff. 
The check-my-diary-notification-service is ran using a polling cronjob (see templates/cron.yaml and values.yaml) This checks and notifies prison staff of any changes to their rotas. This works by creating a new pod on the kubernetes cluster using a specific container, at the times configured & then runs the command specified in vaules.yaml. Used pods are then removed. The application notifies the officers using Email or SMS & notification tab on the web frontend.

## Pre-Reqs
If you're installing to a new kubernetes namespace or new cluster, you must first apply the secrets to that namespace. 
Included in this repo is a template for that under: check-my-diary.git/kubectl_deploy/secrets.yaml_template

You must obtain and add the relevant secrets to the file and they must be encoded using base64. - Be sure not to accidentally include \n chars in your encoded strings. (Use `echo -n <secret_string> | base64 -b0` to encode)

You can then apply the secrets to the namespace with:

`kubectl apply -f secrets.yaml -n check-my-diary-dev ###or -n <your_namespace>`

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

| File  | Description     |
| ---------- | --------------- |
| `cron.yaml` | Contains code to execute the notifcation service job |
| `deployment.yaml` | Config to run the main web frontend container |
| `ingress.yaml` | Config for the default ingress to the application |
| `service.yaml` | Config to configure the service's ports |
| `variables.yaml` | Environment variables required by the application |

### templates/NOTES.txt
Output for the installation - not yet populated.

## Adding/Updating cronjobs

templates/cron.yaml loops over data provided in values.yaml. So within values.yaml you can add extra jobs or update the commands/params the container runs. To do this, edit the file then run a new deployment with `helm upgrade`
