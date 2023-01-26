# Infrastructure

Details on how to configure a cloud environment to run the plugin, configure commercetools and import tests data.

## Commercetools

The commercetools terraform scripts create subscription and test data.
Check the section [Configuration of the pipelines in GitHub actions](#configuration-of-the-pipelines-in-gitHub-actions)
on how to configure the API client and run the terraform scripts

### Importing test data

Check the documentation
at [https://docs.commercetools.com/sdk/sunrise-data](https://docs.commercetools.com/sdk/sunrise-data)

## Google Cloud project

Run the bootstrap-gcp scripts to setup a new project in GCP (you need project creation rights)

```shell
cd insfrastructure/bootstrap-gcp
```

```shell
./bootstrap.sh <your-user-account>
```

The script will generate a new `terraform` service account. Create a service account key that will be used in GitHub.

## Configuration of the pipelines in GitHub actions

### GitHub configuration

* Create a commercetools API client with the following scopes:
    * manage_extensions
    * manage_orders
    * manage_products
    * manage_tax_categories
    * manage_stores
    * manage_project_settings
    * manage_shipping_methods
    * manage_subscriptions
    * manage_types
* Add the following GitHub repository secrets:
    * `CT_TF_CLIENT_ID`: commercetools client id
    * `CT_TF_SECRET`: commercetools secret
    * `GCP_CREDENTIALS`: google cloud service account key
    * `KLAVIYO_AUTH_KEY`: the klaviyo private key

* Add the following environment variables to GitHub:
    * `CT_API_URL`: commercetools API url
    * `CT_AUTH_URL`: commercetools AUTH url
    * `CT_PROJECT_ID`: commercetools project ID
    * `CT_SCOPE`: commercetools API client scopes

### Pipelines

The following pipelines are available in `.github/workflows`

- `terraform.yml`
    - Setup commercetools with:
        - subscriptions
        - test data: stores, project settings, shipping methods, taxes, product types
    - GCP setup:
        - CloudRun instance
        - Pub/Sub topic
        - Permissions
- `plugin-build-test.yml`
    - runs build, linting and tests
- `plugin-deploy`
    - build the plugin code in a docker container
    - deploy of the container to a cloud run instance