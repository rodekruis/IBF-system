# Drought skill assessment
Various code to assess if and which meterological data (NDVI, SPEI, etc.) is of sufficient quality to be included in the trigger model. The assessment is based on how well a statistical model which uses metereological data can predict past droughts. The model performance is measured by several indicators: False Alarm Rate (FAR), Probability Of Detection (POD), Critical Success Index (CSI).

Directory structure:
* GoogleEarthEngine: access and download satellite data from Google Earth Engine
* baseline_model: baseline model to predict satellite data
* drought_analysis_marijke_thesis: code of [marijkepanis](https://github.com/marijkepanis)'s thesis 
