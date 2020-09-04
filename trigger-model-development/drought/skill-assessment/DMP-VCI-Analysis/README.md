# AstroCast

The original astrocast training with a lot of documentation can be found here: https://sites.google.com/view/astrocast-training/training-materials?authuser=0

Some small adjustments were made to the original astrocast notebooks to make it easier to download and preprocess new data and to make it easier to hindcast in a loop for a longer period.
Data needed for preprocessing is very large (mainly the .tiff files) so it is not in the repo. It can be downloaded by following the steps in the original astrocast training.
Be sure to at least get the data from the trainings `\AstroCastTraining\Reports_Forecasts_Errors\Data` folder to reproduce results. To reproduce data pre processing be sure to get the data in the trainings `DataPreProc` folder or follow steps to download new data.

# DMP vs VCI
DMP was extracted from tiff files provided by Aki. The script for this is `extract_dmp.R` but a better DMP extraction pipeline is being build so you might as well wait on that. The extracted DMP is commited to the repo as `results/all_dmp.csv`.
The file `VCI_values.csv` has the extracted VCI for Kenya between 2000 and 2020 on Admin1 level, extracted via the AstroCast procedure.
The file `all_vci3m_Kitui_pred.csv` has the hindcasted VCI3M for Kenya between 2011 and 2015 for Kitui (the time range and region was a bit arbitrary, it is just to show the procedure).

In `compare_vci_and_dmp.R` the VCI and DMP are then compared on admin1 level. A result of this can be found in the image `dmp_vs_vci.png`. As you can see the DMP and VCI are better in line for some regions than others. Also the VCI1W often seems to be better in line with DMP than the VCI3M. Unfortunately the Astrocast model only provides a 3 month (VCI3M) forcast and hindcast as far as I could see. It may be possible to adjust the forecasting model to make 1 week predictions, this needs more research.

The real VCI3M was then compared against the hindcasted VCI3M. This can be done for different horizons, forecasting e.g. 1 week in advance or 10 weeks in advance. The closer the forecast horizon is to the week up to which data is used the better the forecast of course. In general forecasting 1 week ahead gives really accurate result. Forecasting 10 weeks ahead does capture the general pattern but the forecasts will often be more extreme giving higher peaks and deeper lows. Both are illustrated on the Kitui region in the images `1weekVCI.png` and `10weekVCI.png`.

So a bit more research can be done using the created scripts but my general feeling to the question: "can VCI be forecasted accurately with the Astrocast model?" Is "Yes!" but depending strongly on the forecasting horizon that is acceptable in the application. If this is just a few weeks I think the model will do fine. This could be further quantified than just visual analysis by setting a forecasting horizon, forecasting for every region and calculating model scores per region.