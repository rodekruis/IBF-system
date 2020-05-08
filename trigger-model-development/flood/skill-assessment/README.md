# Flood skill assessment

Framework to assess if and which meterological data (river discharge, rainfall, etc.) is of sufficient quality to be included in the trigger model. The assessment is based on how well a model which uses metereological data can predict past floods. The model performance is measured by several indicators: False Alarm Rate (FAR), Probability Of Detection (POD), Critical Success Index (CSI).

Current version uses historical river discharge (source: Glofas) and rainfall data (source: CHIRPS).

## Directory Structure
-   `scripts` model and visualization scripts
-   `africa` global input data for all Africa (Glofas virtual station, Hydroshed, etc.)
-   `uganda`, `kenya`... input and output data per country

## Setup

#### Requirements:
-   [Python 3.7.4](https://www.python.org/downloads/)

to install necessary modules, execute
```bash
pip install -r requirements.txt
```
## Model

### What does it do?

1. extract discharge data from Glofas

1. extract CHIRPS rainfall data from Google Earth Engine

1. train and test a model to predict floods

1. save model performance in a .CSV 

### How do I execute it?

to run the model, execute
```
python scripts/V12_glofas_analysis.py
```
`V12_glofas_analysis.py` accepts the command line arguments described below,

```
usage: V12_glofas_analysis.py [-h] [country] [ct_code] [model] [loss]

positional arguments:
  country     [Uganda]
  ct_code     [uga]
  model       [bdt_discharge_rainfall]
  loss        [far]

optional arguments:
  -h, --help  show this help message and exit
```
### Which models are implemented?
- `quantile_discharge` based on thresholds with quantiles, using only glofas discharge data (best GloFAS station and threshold is computed per district)
- `bdt_discharge` based on decision trees, using only glofas discharge data
- `bdt_discharge_rainfall` based on decision trees, using glofas discharge data and rainfall

## Visualization

### How do I visualize model performance?
to visualize performance, execute 
```
python scripts/IBF_flood_model_performance_visual.py
```
this will create maps of the performance or the model per district, by plotting FAR, POD, POFD, CSI and the number of available events per district. 
