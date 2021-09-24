# IBF-pipeline Rainfall

This is a series of scripts (which will be run daily) which extracts all input data (static + dynamic), transforms them to create rainfall extents and calculated affected population, and loads the output to locations where they can be served to the dashoard.

### Prerequisites

1. Install Docker

### Installation

1. Clone this directory to `<your_local_directory>`/IBF-pipeline/
2. Change `/pipeline/secrets.py.template` to `secrets.py` and fill in the necessary secrets.
3. Find `data-rainfall.zip` in https://rodekruis.sharepoint.com/sites/510-CRAVK-510/_layouts/15/guestaccess.aspx?folderid=0fa454e6dc0024dbdba7a178655bdc216&authkey=AcqhM85JHZY8cc6H7BTKgO0&expiration=2021-11-29T23%3A00%3A00.000Z&e=qkUx50 and unzip in /pipeline/data, such that it now has subfolders /raster and /other.

### Set up Data pipeline

1. Build Docker image (from the IBF-pipeline root folder) and run container with volume. ${PWD} should take automatically your Present Working Directory as the local folder to attach the volume though; if this fails, you can always replace it by the literal path (e.g. "C:/IBF-system/services/IBF-pipeline:/home/ibf" instead of "${PWD}:/home/ibf")

```
build image: docker build . -t ibf-pipeline-rainfall
create + start container: docker run --name=ibf-pipeline-rainfall -v ${PWD}:/home/ibf -it ibf-pipeline-rainfall
access container (if the previous command didn't get you in already): docker exec -it ibf-pipeline-rainfall bash
access container (if the container exists already): docker exec -it ibf-pipeline-rainfall bash
remove container (to be able to recreate with same name): docker rm -f ibf-pipeline-rainfall
```

2. All other scripts are summarized in runPipeline.py (as it will be run daily). Test it (from within Docker container) through:

```
python3 runPipeline.py
```
