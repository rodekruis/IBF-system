import os

# Set workdirectory
workdirectory_scripts = 'C:\\Users\\nlbrus08\\Documents\\01 Klanten\\Rode Kruis\\floodcorrelation'
os.chdir(workdirectory_scripts)

# Import class
tdca = __import__('02_cls_transform_data')

# Load class; this will take some time (loads/transforms/saves data)
ca = tdca.TransformDataConnectAreas()