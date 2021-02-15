##########################################################################################
# Overview
##########################################################################################
"""
Date: July 2020
Authors: Lisanne van Brussel (lisanne.van.brussel@vodw.ey.com)

This script will import the class TransformDataConnectAreas(). 
This will read in all glofas data, do all transformations and analysis and 
saves the scripts (based on input of the configuration script).
"""

##################################################################
# Set workdirectory
##################################################################

# Set workdirectory to folder of scripts
workdirectory_scripts = 'C:\\Users\\nlbrus08\\Documents\\01 Klanten\\Rode Kruis\\floodcorrelation'

##################################################################
# Importers
##################################################################
import os

# Set workdirectory
os.chdir(workdirectory_scripts)

# Import class to transform and save data
tdca = __import__('02_cls_transform_data')

# Load class: this will take some time since it loads, transforms and saves the data
ca = tdca.TransformDataConnectAreas()

##################################################################
# Some insights of arguments
##################################################################

# Input dataframe for interactive map/selection tool
# Rows: selected cell ('lat_lon'), cols: neigbhours('lat_lon'), 
# items/values: percentage of overlapping extreme days
ca.perc_both_extremes.head()

# Discharge data
# Rows: dates, Cols: cells ('lat_lon'), values: discharge
ca.df_discharge.head()

# Numeric dataframe to identify extreme discharge days
# Rows: dates, Cols: cells ('lat_lon'), values: dummies (1=extreme discharge day)
ca.data_numeric.head()