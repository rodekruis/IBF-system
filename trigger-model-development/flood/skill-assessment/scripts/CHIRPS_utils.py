import urllib.request
import gzip
import shutil
from rasterstats import zonal_stats
import os
import geopandas as gpd
import pandas as pd
from datetime import date, timedelta
from tqdm import tqdm

def get_CHIRPS_data(country='Uganda',
         catchment_shapefile='../uganda/input/catchment/uga_catchment_districts.shp',
         year_start=2000,
         year_end=2019,
         output_dir='.'):

    if output_dir == '.':
        output_dir = '../' + country.lower() + '/input/rainfall'
    if not os.path.exists(output_dir):
        os.mkdir(output_dir)

    sdate = date(year_start, 1, 1)  # start date
    edate = date(year_end, 12, 31)  # end date
    delta = edate - sdate
    dates = []
    for i in range(delta.days + 1):
        day = sdate + timedelta(days=i)
        dates.append(day)

    if not os.path.exists(catchment_shapefile):
        print('error: catchment shapefile', catchment_shapefile, 'not found')
        return 0
    gdf = gpd.read_file(catchment_shapefile)
    if ('District' not in gdf.columns or 'PCODE' not in gdf.columns):
        print('error: district names and pcodes not found, looking for "District" and "PCODE" in columns')
        return 0
    district_names = gdf['District'].tolist()
    district_pcodes = gdf['PCODE'].tolist()

    output_file = pd.DataFrame()

    for day in tqdm(dates):
        filename_zipped = "chirps-v2.0.{}.{:02d}.{:02d}.tif.gz".format(day.year, day.month, day.day)
        filename = "chirps-v20-{}-{:02d}-{:02d}.tif".format(day.year, day.month, day.day)
        urllib.request.urlretrieve("https://data.chc.ucsb.edu/products/CHIRPS-2.0/africa_daily/tifs/p05/{}/{}".format(day.year, filename_zipped),
                                   filename_zipped)
        with gzip.open(filename_zipped, 'rb') as f_in:
            with open(filename, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)

        stats = zonal_stats(catchment_shapefile, filename, stats="max mean")
        for ix, stat in enumerate(stats):
            output_file = output_file.append(pd.Series({'Day': day.day,
                                                        'Month': day.month,
                                                        'Year': day.year,
                                                        'District': district_names[ix],
                                                        'PCODE': district_pcodes[ix],
                                                        'max': stat['max'],
                                                        'mean': stat['mean']}),
                                             ignore_index=True)
        os.remove(filename_zipped)
        os.remove(filename)
    output_file.to_csv(output_dir + '/' + 'CHIRPS_data_raw.csv', index=False)

if __name__ == "__main__":
    main()