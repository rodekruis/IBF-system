# -*- coding: utf-8 -*-
"""
Created on Thu Mar 11 14:16:28 2021

@author: BOttow
"""
import cdsapi

year_start = 2000
year_end = 2018
months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
output = "c:/Users/BOttow/Rode Kruis/510 - Data preparedness and IBF - [RD] Impact-based forecasting/IBF - FLOOD/Glofas_Zambia"
    #"c:/Users/BOttow/Rode Kruis/510 - Data preparedness and IBF - [CTRY] Uganda/GIS Data/GloFAS"
# There are 2 Glofas products, historical re-analysis until 2018 and the new near-real-time product
# From November 2019. For both products there are two different variables, the control-run or the 
# ensemble runs. It works to request both together (control_run = None) but this is not yet tested for
# further usage.
historical = True
control_run = None
format_type = 'grib'
lead_time = 7 # in days
# Uganda: [5, 29, -2, 36,] in lat/long
area = [8, 21, 18, 34,]

def download_glofas_per_month(output, year, month, area, lead_time, format_type, control_run, historical):
    glofas_type = 'cems-glofas-reforecast' if historical else 'cems-glofas-forecast'
    if historical and control_run:
        product_type = 'control_reforecast' 
    elif not historical and control_run == None:
        product_type = ['control_forecast','ensemble_perturbed_forecasts']
    elif not historical and control_run:
        product_type ='control_forecast' 
    elif not historical and not control_run:
        product_type = 'ensemble_perturbed_forecasts' 
    elif historical and not control_run:
        product_type = 'ensemble_perturbed_reforecasts' 
    elif historical and control_run == None:
        product_type = ['control_reforecast','ensemble_perturbed_reforecasts']
    year_variable = 'hyear' if historical else 'year'
    month_variable = 'hmonth' if historical else 'month'
    month_value = months[month-1] if historical else str(month)
    day_variable = 'hday' if historical else 'day'
    
    d = {
        'format': format_type,
        'variable': 'river_discharge_in_the_last_24_hours',
        'product_type': product_type,
        year_variable: str(year),
        month_variable: month_value,
        day_variable: [
            '01', '02', '03',
            '04', '05', '06',
            '07', '08', '09',
            '10', '11', '12',
            '13', '14', '15',
            '16', '17', '18',
            '19', '20', '21',
            '22', '23', '24',
            '25', '26', '27',
            '28', '29', '30',
            '31',
            ],
        'leadtime_hour': str(lead_time * 24),
        'area': area,
        }
    if historical:
        d['system_version'] = 'version_2_2'
    c.retrieve(glofas_type, d,
        ("%s/%d%02d_%ddayLT.%s" % (output, year, month, lead_time, format_type)))
    
c = cdsapi.Client()

#download_glofas_per_month(output, 2010, 1)

if True:
    for year in range(year_start, year_end+1):
        for month in range(1,13):
            try:
                download_glofas_per_month(output, year, month, area, lead_time, format_type, control_run, historical)
            except:
                continue
#download_glofas_per_month(output, 2000, 9, area, lead_time, format_type, control_run, historical)
