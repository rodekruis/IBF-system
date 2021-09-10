# IBF-pipeline Floods

This is a series of scripts (which are running daily) which extracts all input data (static + dynamic), transforms them to create flood extents and calculated affected population, and loads the output to locations where they can be served to the dashoard.

## Prerequisites

For the GloFAS pipeline to work (to be able to get in daily forecast data)
  - The IBF-pipeline needs to be able to connect to an Azure Datalake instance, which needs to be set up
  - which in turn needs to be filled by a Databricks pipeline
  - Specifically this means that if this application is handed over to be hosted by someone other than 510
    - the Datalake and Databricks resources need to be handed-over / replicated as well
    - or the hoster needs to get access to the 510 Azure resources
    - See IBF Project Document for more info and specific links to the 510-instances of above mentioned resources.

## Stand-alone instalation

We keep here the (outdate) readme for stand-alone installation. This is still possible, but you would need to make sure that other components such as the database and the API-service are also running. The best way to do so, is by starting up the IBF-system alltogether > see root README.

### Prerequisites

1. Install Docker

### Installation

1. Clone this directory to `<your_local_directory>`/IBF-pipeline/
2. Change `/pipeline/secrets.py.template` to `secrets.py` and fill in the necessary passwords.
3. Find data.zip in https://rodekruis.sharepoint.com/sites/510-CRAVK-510/_layouts/15/guestaccess.aspx?folderid=0fa454e6dc0024dbdba7a178655bdc216&authkey=AcqhM85JHZY8cc6H7BTKgO0&expiration=2021-11-29T23%3A00%3A00.000Z&e=qkUx50 and unzip in /pipeline/data.

### Set up Data pipeline

1. Build Docker image (from the IBF-pipeline root folder) and run container with volume. ${PWD} should take automatically your Present Working Directory as the local folder to attach the volume though; if this fails, you can always replace it by the literal path (e.g. "C:/IBF-system/services/IBF-pipeline:/home/ibf" instead of "${PWD}:/home/ibf")

```
build image: docker build . -t ibf-pipeline-floods
create + start container: docker run --name=ibf-pipeline-floods -v ${PWD}:/home/ibf -it ibf-pipeline-floods
access container (if the previous command didn't get you in already): docker exec -it ibf-pipeline-floods bash
access container (if the container exists already): docker exec -it ibf-pipeline-floods bash
remove container (to be able to recreate with same name): docker rm -f ibf-pipeline-floods
```

2. All other scripts are summarized in runPipeline.py (as it will be run daily). Test it through:

```
python3 runPipeline.py
```

3. Cronjob: locally, you probably don't want to run this automatically every day. If you want to, copy the cron command in /docker-compose.yml and replace the last line of /services/IBF-pipeline/Dockerfile with it.

