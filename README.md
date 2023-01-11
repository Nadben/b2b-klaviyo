# klaviyo-ct-plugin

## TODO
* list libraries that can be removed when adapter is not required


## Setup
### GitHub actions
* Create commercetools API client
* Create GCP project with service account key
* Add the following GitHub repository secrets: 
  * `CT_TF_CLIENT_ID`: commercetools client id
  * `CT_TF_SECRET`: commercetools secret
  * `GCP_CREDENTIALS`: google cloud service account key
  * `PROJECT_ID`: google cloud project id
  * `KLAVIYO_AUTH_KEY`: the klaviyo private key

## Local development

### Running terraform locally
```shell
cd infrastructure
```
```shell
./terraform.sh apply
```

### Build and deployment to cloud run 
```shell
#run only once
gcloud auth application-default login
```
```shell
#run only once
gcloud auth configure-docker us-central1-docker.pkg.dev
```
```shell
docker build -t klaviyo-ct-plugin .
```  
```shell
docker tag klaviyo-ct-plugin us-central1-docker.pkg.dev/klaviyo-test-roberto/klaviyo-ct-plugin/klaviyo-ct-plugin
```    
```shell
docker push us-central1-docker.pkg.dev/klaviyo-test-roberto/klaviyo-ct-plugin/klaviyo-ct-plugin
```  
```shell
gcloud run services update app \
--image us-central1-docker.pkg.dev/klaviyo-test-roberto/klaviyo-ct-plugin/klaviyo-ct-plugin \
--region=us-central1 \
--port 6789 \
--max-instances=1
```
