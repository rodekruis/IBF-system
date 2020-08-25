from netCDF4 import Dataset
import scipy.stats
#from mpl_toolkits.basemap import Basemap
import matplotlib.pyplot as plt
import numpy as np
from netCDF4 import Dataset
import datetime as dtmod
import matplotlib.colors as mcolors
import os
#%%


#define path to data
 
fpath = os.path.join(os.path.dirname(__file__), 'data')


#%%



# define dates and period of interest
forecast_date = dtmod.datetime(2020,3,30)
forecast_ind = (dtmod.datetime(1972,forecast_date.month,forecast_date.day) - dtmod.datetime(1972,1,1)).days
datetitle=str(forecast_date.year)+str("-")+str(forecast_date.month)+str("-")+str(forecast_date.day)
poi_start_date = dtmod.datetime(2020,3,1) 
poi_end_date = dtmod.datetime(2020,5,31)
poi_start_ind = (dtmod.datetime(1972,poi_start_date.month,poi_start_date.day) - dtmod.datetime(1972,1,1)).days
poi_end_ind = (dtmod.datetime(1972,poi_end_date.month,poi_end_date.day) - dtmod.datetime(1972,1,1)).days

#%%
def wrapper_all():
  terciles()
  anomaly_maps()
  drought_prob_maps()
  probdist_plot()
  timeseries()
#%%  

def read_in_data():
    clim_mean = Dataset(os.path.join(fpath,"clim_mean.nc")).variables["soil_moisture"][:]
    clim_sd = Dataset(os.path.join(fpath,"clim_sd.nc")).variables["soil_moisture"][:]
    ens_mean=Dataset(os.path.join(fpath,"ens_mean.nc")).variables["soil_moisture"][:]
    ens_sd=Dataset(os.path.join(fpath,"ens_sd.nc")).variables["soil_moisture"][:]
    clim_mean_wrsi = Dataset(os.path.join(fpath,"clim_mean_wrsi.nc")).variables["soil_moisture"][:]
    clim_sd_wrsi = Dataset(os.path.join(fpath,"clim_sd_wrsi.nc")).variables["soil_moisture"][:]
    ens_mean_wrsi=Dataset(os.path.join(fpath,"ens_mean_wrsi.nc")).variables["soil_moisture"][:]
    ens_sd_wrsi=Dataset(os.path.join(fpath,"ens_sd_wrsi.nc")).variables["soil_moisture"][:]
    m_hist=Dataset(os.path.join(fpath,"sm_hist.nc")).variables["soil_moisture"][:]
    m_forecast=Dataset(os.path.join(fpath,"sm_forecast.nc")).variables["soil_moisture"][:]
    lons = Dataset(os.path.join(fpath,"clim_mean.nc")).variables["longitude"][:]
    lats = Dataset(os.path.join(fpath,"clim_mean.nc")).variables["latitude"][:]
    return clim_mean, clim_sd, ens_mean, ens_sd, clim_mean_wrsi, clim_sd_wrsi, ens_mean_wrsi, ens_sd_wrsi, lons, lats, m_hist, m_forecast

#%%

read_in_data()
#%%

def terciles():    
    # read in data
    clim_mean, clim_sd, ens_mean, ens_sd, clim_mean_wrsi, clim_sd_wrsi, ens_mean_wrsi, ens_sd_wrsi, lons, lats, m_hist, m_forecast = read_in_data()
    # calculate probability of lower tercile soil moisture
    a = scipy.stats.norm(clim_mean,clim_sd).ppf(0.33)
    b_lower = scipy.stats.norm(ens_mean,ens_sd).cdf(a)
    # calculate probability of mid tercile soil moisture
    a = scipy.stats.norm(clim_mean,clim_sd).ppf(0.67)
    b_upper = scipy.stats.norm(ens_mean,ens_sd).cdf(a)
    #calculate all terciles
    lower_terc=b_lower
    middle_terc=b_upper-b_lower
    upper_terc=1-b_upper
    # calculate mean of all terciles
    lower_terc=np.nanmean(lower_terc)
    middle_terc=np.nanmean(middle_terc)
    upper_terc=np.nanmean(upper_terc)
    # print out tercile probabilities
    print("Lower: "+str(round(lower_terc, 2))+", Middle: "+str(round(middle_terc, 2))+", Upper: "+str(round(upper_terc, 2)))
    

def anomaly_maps():
    # load shape to mask outside of kenya
    shape_mask = np.load("kenya_mask.npy")
    # read in data 
    clim_mean, clim_sd, ens_mean, ens_sd, clim_mean_wrsi, clim_sd_wrsi, ens_mean_wrsi, ens_sd_wrsi, lons, lats, m_hist, m_forecast = read_in_data()
    # calculate percent anomaly    
    percent_anom = (ens_mean / clim_mean) * 100
    # plot soil moisture percent anomaly map
    map_plots(percent_anom,lons,lats,str('MAM SM % climatology\nIssued: ')+str(datetitle),50,150,'BrBG',"% climatology","percent_anomaly.png",shape_mask)
    # plot soil moisture climatological mean map
    map_plots(clim_mean,lons,lats,'MAM SM climatology',50,100,'Greens',"Soil moisture kg m^-3","climatology.png",shape_mask)
    # plot soil moisture forecast ensemble mean map
    map_plots(ens_mean,lons,lats,'MAM SM forecast',50,100,'Greens',"Soil moisture kg m^-3","forecast.png",shape_mask)


def drought_prob_maps():
    # load shape to mask outside of kenya
    shape_mask = np.load("kenya_mask.npy")
    # define thresholds for terciles
    lower_thresh=0.33
    upper_thresh=0.67
    # read im data
    clim_mean, clim_sd, ens_mean, ens_sd, clim_mean_wrsi, clim_sd_wrsi, ens_mean_wrsi, ens_sd_wrsi, lons, lats, m_hist, m_forecast = read_in_data()
    # creat color palette
    c = mcolors.ColorConverter().to_rgb
    # calculate probability of lower tercile soil moisture
    a = scipy.stats.norm(clim_mean,clim_sd).ppf(lower_thresh)
    b_1 = scipy.stats.norm(ens_mean,ens_sd).cdf(a)
    #calculate probability of mid tercile soil moisture
    a = scipy.stats.norm(clim_mean,clim_sd).ppf(upper_thresh)
    b_2 = scipy.stats.norm(ens_mean,ens_sd).cdf(a)
    # plot probability of lower tercile soil moisture
    rvb = make_colormap([c('green'), c('palegreen'), lower_thresh-0.05, c('white'), c('white'), lower_thresh+0.05, c('yellow'), c('brown')])
    map_plots(b_1,lons,lats,str("MAM prob of below normal SM\nIssued: ")+str(datetitle),0,1,rvb,"Probability","well_below_average.png",shape_mask)
    # plot probability of mid tercile soil moisture
    rvb = make_colormap([c('green'), c('palegreen'), upper_thresh-0.05, c('white'), c('white'), upper_thresh+0.05, c('yellow'), c('brown')])
    map_plots(b_2,lons,lats,str("MAM prob of normal to below-normal SM\nIssued: ")+str(datetitle),0,1,rvb,"Probability","below_average.png",shape_mask)

#%%
def map_plots(varin,lons,lats,title1,vmin,vmax,cmap,legendtitle,fileout,shape_mask):
    # mask outside of kenya
    varin[(shape_mask==0)] = np.nan
    b1=varin
    # build map plots
    size1 =[9,6.5]
    fig = plt.figure(figsize=(size1[0],size1[1]))
    fig.add_axes([0.1, 0.1, 0.6, 1])
    lon_0 = lons[0]
    lat_0 = lats[0]
    plt.subplot(1,1,1)
    plt.title(title1)
    parallels=np.arange(np.floor(np.min(lats)),np.ceil(np.max(lats)),1)
    meridians=np.arange(np.floor(np.min(lons)),np.ceil(np.max(lons)),1)
    map = Basemap(projection='cyl',lon_0=lon_0,lat_0=lat_0,\
                llcrnrlat=lats[0],urcrnrlat=np.max(lats),\
                llcrnrlon=lons[0],urcrnrlon=np.max(lons),\
                resolution='i')
    map.drawcountries(linewidth = 1)
    map.drawmapboundary(fill_color='white')
    map.drawcoastlines(linewidth = 0.5)
    map.drawparallels(parallels,labels=[False,True,True,False])
    map.drawmeridians(meridians,labels=[True,False,False,True])
    map.readshapefile("./kenya_shapefile/Kenya","Kenya", linewidth = 1)
    x,y=map(*np.meshgrid(lons,lats))
    cs = map.pcolormesh(x,y,b1.T.squeeze(),cmap=cmap,vmin=vmin,vmax=vmax)
    cs.cmap.set_under('white')
    cbar_pos = [0.8, 0.23, 0.015, 0.5] #[left, bottom, width, height]
    cbar_ax = fig.add_axes(cbar_pos)
    cbar = fig.colorbar(cs,cax=cbar_ax,label=legendtitle,orientation='vertical')        
    fig.savefig(fileout)
    plt.show()
    plt.close()
#%%
def probdist_plot():
    # read in data
    clim_mean, clim_sd, ens_mean, ens_sd, clim_mean_wrsi, clim_sd_wrsi, ens_mean_wrsi, ens_sd_wrsi, lons, lats, m_hist, m_forecast = read_in_data()
    # define tercile boundaries
    lower_thresh = 0.33
    upper_thresh = 0.67
    # calculate probability distribution of climatology
    clim_dist=np.random.normal(loc=np.nanmean(clim_mean),scale=np.nanmean(clim_sd),size=10000)
    # calculate probability distribution of ensemble forecast
    ens_dist=np.random.normal(loc=np.nanmean(ens_mean),scale=np.nanmean(ens_sd),size=10000)
    # calculate threshold soil moisture values
    low_a = scipy.stats.norm(clim_mean,clim_sd).ppf(lower_thresh)
    up_a = scipy.stats.norm(clim_mean,clim_sd).ppf(upper_thresh)
    # build plot
    plt.clf()
    plt.hist(clim_dist, color = "black", label = "Climatology")
    plt.hist(ens_dist, color ="grey", alpha = 0.7, label = "Forecast")
    plt.axvline(np.nanmean(low_a), color = "red", linestyle = "--")
    plt.axvline(np.nanmean(up_a), color = "red", linestyle = "--")
    plt.yticks([])
    plt.xticks(fontsize = 14)
    plt.xlabel("Soil moisture (kg m^-3)", fontsize = 16)
    plt.legend(fontsize = 14)
    plt.savefig("probdist.png")
    plt.show()
    plt.close()


def timeseries():
    # read in data
    clim_mean, clim_sd, ens_mean, ens_sd, clim_mean_wrsi, clim_sd_wrsi, ens_mean_wrsi, ens_sd_wrsi, lons, lats, m_hist, m_forecast = read_in_data()
    # reshape soil moisture forecast data
    dims = m_forecast.shape
    m_forecast = m_forecast[~np.isnan(m_forecast)]
    m_forecast = m_forecast.reshape((dims[0],dims[1],len(m_forecast)/(dims[0]*dims[1]*dims[3]),dims[3]))
    # reshape soil moisture historic data
    m_hist_layer = np.sum(m_hist[:,:,0:2,:],axis = 2)
    m_hist_layer = reshape_hist_data(m_hist_layer, 1983)
    # build plot    
    plt.figure(figsize = (7,4))
    plt.plot(np.mean(m_hist_layer[:,:,:poi_end_ind+1,:36], axis = (0,1)), color = "grey", alpha = 0.5)
    plt.plot(np.mean(m_hist_layer[:,:,:poi_end_ind+1,15], axis = (0,1)), color = "red", label = "1998")
    plt.plot(np.mean(m_hist_layer[:,:,:,-1], axis = (0,1)), color = "black", label = "2020")
    plt.axvline(poi_start_ind, linewidth = 1, ls = "--", color = "black")
    plt.axvline(poi_end_ind, linewidth = 1, ls = "--", color = "black")
    plt.xlabel("Day of year")
    plt.ylabel("Soil moisture (kg m^-3)")
    plt.text(poi_start_ind, 90, "Season start", ha = "right", va = "bottom", color = "black", rotation = 90)
    plt.text(poi_end_ind, 90, "Season end" , ha = "right", va = "bottom", color = "black", rotation = 90)
    plt.legend(loc = "lower right")
    plt.savefig("timeseries.png")
    plt.show()
    plt.close()


def make_colormap(seq):
    """Return a LinearSegmentedColormap
    seq: a sequence of floats and RGB-tuples. The floats should be increasing
    and in the interval (0,1).
    """
    seq = [(None,) * 3, 0.0] + list(seq) + [1.0, (None,) * 3]
    cdict = {'red': [], 'green': [], 'blue': []}
    for i, item in enumerate(seq):
        if isinstance(item, float):
            r1, g1, b1 = seq[i - 1]
            r2, g2, b2 = seq[i + 1]
            cdict['red'].append([item, r1, r2])
            cdict['green'].append([item, g1, g2])
            cdict['blue'].append([item, b1, b2])
    return mcolors.LinearSegmentedColormap('CustomMap', cdict)    


def reshape_hist_data(datain,startyear):
    '''
    This function reorganises a historical daily time series (long,lat,time array) into an array with year per row. 
    It is assumed that the data start on January 1st. Leap days are removed.
    param datain: daily time series
    param startyear: first year in the daily time series
    param dataout: daily time series array reshaped as described above
    '''
    londimlen  = datain.shape[0]
    latdimlen  = datain.shape[1]
    datain = leap_remove_gridded(datain,1983,2)
    timedimlen = datain.shape[2]
    extra_date = timedimlen % 365    
    # add pseudo values to make the reshape work 
    # (i.e. add enough hours to make it an exact number of years worth of hours)
    sudovals = np.nan * np.ones((londimlen, latdimlen, (365 - extra_date)))
    datain = np.concatenate((datain,sudovals),axis=2)
    newtdim=int(datain.shape[2]//365)
    dataout = np.reshape(datain, (londimlen, latdimlen, newtdim, 365)).transpose((0,1,3,2))
    return dataout

def leap_remove_gridded(timeseries, datastartyear, timedim):
    """
    This function removes leap days from a time series 
    param timeseries: array containing daily time series
    param datastartyear: start year of the input data
    param timedim: time dimension location
    output data: time series with the leap days removed. 
    """
    data = timeseries
    leaplist=[]
    # system only takes 365 days in each year so we
    # remove leap year values from the long term time series
    if datastartyear % 4 == 1:  # if the start year is not a leap year (Matthew)
        for t in range(1154, data.shape[timedim], 1459):
            leaplist.append(t)
    elif datastartyear % 4 == 2:  # if the start year is not a leap year (Mark)
        for t in range(789, data.shape[timedim], 1459):
            leaplist.append(t)
    elif datastartyear % 4 == 3:  # if the start year is not a leap year (Luke  
        for t in range(424, data.shape[timedim], 1459):
            leaplist.append(t)        
    elif datastartyear % 4 == 0:  # if the start year is a leap year (John)
        for t in range(59, data.shape[timedim], 1459):
            leaplist.append(t)
    data=np.delete(data,leaplist,axis=2)
    return data
#%%    
    
if __name__ == "__main__":
    wrapper_all()
