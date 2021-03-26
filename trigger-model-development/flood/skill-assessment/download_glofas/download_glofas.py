# -*- coding: utf-8 -*-
"""
Created on Thu Mar 11 14:16:28 2021

@author: BOttow
"""
import cdsapi

year_start = 2003
year_end = 2004
months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
output = "c:/Users/BOttow/Rode Kruis/510 - Data preparedness and IBF - [CTRY] Uganda/GIS Data/GloFAS"
# choose 'ensemble_perturbed_reforecasts' for ensemble runs and 'control_reforecast' for the control run
product_type = 'control_reforecast'
format_type = 'grib'

def download_glofas_per_month(output, year, month, format_type, product_type):
    c.retrieve(
        'cems-glofas-reforecast',
        {
            'format': format_type,
            'variable': 'river_discharge_in_the_last_24_hours',
            'product_type': product_type,
            'system_version': 'version_2_2',
            'hyear': str(year),
            'hmonth': months[month-1],
            'hday': [
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
            'leadtime_hour': '120',
            'area': [
                5, 29, -2,
                36,
                ],
            },
        ("%s/%d%02d_5dayLT_%s.%s" % (output, year, month, product_type, format_type)))
    
def download_glofas_per_year(output, year, format_type, product_type):
    c.retrieve(
        'cems-glofas-reforecast',
        {
            'format': format_type,
            'variable': 'river_discharge_in_the_last_24_hours',
            'product_type': product_type,
            'system_version': 'version_2_2',
            'hyear': str(year),
            'hmonth': months,
            'hday': [
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
            'leadtime_hour': '120',
            'area': [
                5, 29, -2,
                36,
                ],
            },
        (output + '/' + str(year) + '_5dayLT_%s.%s' % (product_type, format_type)))
    
c = cdsapi.Client()

#download_glofas_per_month(output, 2010, 1)

if True:
    for year in range(year_start, year_end+1):
        for month in range(1,13):
            try:
                download_glofas_per_month(output, year, month, format_type, product_type)
            except:
                continue

