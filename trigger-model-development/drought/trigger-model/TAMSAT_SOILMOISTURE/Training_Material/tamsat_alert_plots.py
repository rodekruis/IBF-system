"""
Functions for plotting the TAMSAT alert graphs.

This is only slightly modified from the original code,
it just adds an output path and allows the functions
to accept a pandas DataFrame, rather than a filename.

All modified sections are commented with GG.  All other
code is untouched.
"""

import os
import warnings
import matplotlib.pyplot as plt
import scipy.stats as sps
from statsmodels.distributions.empirical_distribution import ECDF
import seaborn as sns
import matplotlib.mlab as mlab
import numpy as np
import datetime as dt
import calendar
def risk_prob_plot(climastartyear, climaendyear,
                   datastartyear, dataendyear,
                   forecastyear, forecastmonth,forecastday,
                   poi_start_month,poi_start_day,poi_end_month,poi_end_day,
                   stat, sta_name, weights,
                   climatology, forecast_vals, weightings, outdir = './'):
    """
    This function plot the probability estimates for a given risk metric for a single date
    forecast given in the configuration file.

    :param climastartyear: the year climatology value start.
    :param climaendyear: the year climatology value end.
    :param datastartyear: the year the data set start
    :param dataendyear: the the year the data set end
    :param forecastyear: the year for which we are going to forecast the metric
                         from historical climatic weather.
    :param forecastmonth: the month for which we are going to forecast the metric
                         from historical climatic weather.
    :param forecastday: the day forecast start.(The last day for which
                        the forecast year has a data)
    :param poi_start_month: The month of the year of the start of the period of interest
    :param poi_start_day:   The day of the month of the start of the period of interest
    :param poi_end_month:   The month of the year of the end of the period of interest
    :param poi_end_day:     The day of the month of the end of the period of interest
    :param stat: statistical method to be used for probability distribution comparison (ecdf or norm)
    :param sta_name: name of station or location
    :param wth_path: the file path where the .wth files are present (as string)
    :param weights: tercile forecast probabilities of the weighting metric used
    :param climatology: pandas DataFrame containg a climatology (i.e. historical time series) of the metric under investigation.
    :param forecast_vals: pandas DataFrame containg ensembles forecast values of the metric under investigation (i.e. each value is the ensemble member associated with the weather future for the year in column 1).
    :param weightings: pandas DataFrame containg the values of the metric being used for weighting.
    """

    #------------------------------------------------------------------#
    # creating folders to put output data and plot
    #------------------------------------------------------------------#
    # GG - Added outdir to paths

    #ECB getting rid of directory struction
    if not os.path.isdir(outdir):
        os.makedirs(outdir)
    #if not os.path.isdir(outdir+"/plot_output"):
    #    os.makedirs(outdir+"/plot_output")
    #if not os.path.isdir(outdir+"/plot_output/gaussian"):
    #    os.makedirs(outdir+"/plot_output/gaussian")
    #if not os.path.isdir(outdir+"/plot_output/ecdf"):
    #    os.makedirs(outdir+"/plot_output/ecdf")
    #if not os.path.isdir(outdir+"/data_output"):
    #os.makedirs(outdir+"/data_output")

    # set up actual dates for the x axis representation
    date = dt.date(forecastyear, forecastmonth, forecastday)
    f_date = date.strftime('%d-%b-%Y')
    poi_start_date = str(poi_start_day).zfill(2)+'-'+calendar.month_name[poi_start_month][0:3]
    poi_end_date = str(poi_end_day).zfill(2)+'-'+calendar.month_name[poi_end_month][0:3]

    climayears = np.arange(climastartyear, climaendyear + 1)

    # GG These were previously np.genfromtxt methods
    # They have been replaced to extract the values from the
    # pandas DataFrames in the exact form they were previously in.
    # This allows us to not touch any more of the code
    climametric = climatology.values.T[0]
    forecametric = forecast_vals.values.T[0]
    Wmetric = weightings.values.T[0]

    #----------------------------------------------------------------#
    # calculating probability distribution
    #----------------------------------------------------------------#
    # threshold probability
    thresholds = np.arange(0.01, 1.01, 0.01)

    # calculate the mean and sd of the climatology
    climamean = np.mean(climametric)
    climasd = np.std(climametric)

    # calcualte the mean and sd of the the projected
    # metric based on climatology weather data
    # we need the weighted metric frorecast

    fdate = f_date
    yr = forecastyear
    # print(forecastfile,weightfile)

    # GG Changed the arguments here - they were previously links to the files
    # which got read in exactly the same way as above (again)
    projmean, projsd = weight_forecast(
        forecametric, Wmetric, weights, climastartyear, climaendyear)
    projsd = np.maximum(projsd, 0.001)  # avoid division by zero

    if stat == 'normal':
        # calculate the normal distribution
        probabilitymetric = []
        probabilityclim = []
        for z in range(0, len(thresholds)):
            thres = sps.norm.ppf(thresholds[z], climamean, climasd)
            # print(thres)
            # (climamean,climasd)
            # print(projmean,projsd)
            #probmetric = sps.norm.cdf(thres,climamean,climasd)
            # print(probmetric)
            probclim = sps.norm.cdf(thres, climamean, climasd)
            probmetric = sps.norm.cdf(thres, projmean, projsd)
            # print(probmetric)
            probabilitymetric = np.append(probabilitymetric, probmetric)
            probabilityclim = np.append(probabilityclim, probclim)

            del probmetric

        out = np.vstack((probabilityclim, probabilitymetric))
        # GG - Added output dir
        np.savetxt(outdir+'/prob_normal.txt', out.T, fmt='%0.2f')

    elif stat == 'ecdf':
        # calculate the emperical distribution
        ecdf_clima = ECDF(climametric)
        probabilitymetric = []
        probabilityclim = []

        for z in range(0, len(ecdf_clima.x)):
            thres = ecdf_clima.x[z]  # (thresholds[z])
            ecdf_proj = ECDF(forecametric)
            probclim = ecdf_clima(thres)
            probmetric = ecdf_proj(thres)
            probabilitymetric = np.append(probabilitymetric, probmetric)
            probabilityclim = np.append(probabilityclim, probclim)

            del probmetric

        out = np.vstack((probabilityclim, probabilitymetric))

        # GG - Added output dir
        np.savetxt(outdir+'/prob_ecdf.txt', out.T, fmt='%0.2f')
    else:
        raise ValueError('Please use only "normal" or "ecdf" stat method')

    #-------------------------------------------------------------------#
    # Plots of results
    #-------------------------------------------------------------------#
    # # Risk probability plot (origional format ECB)
    # sns.set_style("ticks")
    # fig = plt.figure(figsize=(7,6))
    # ax = plt.subplot(111)
    # if stat == 'normal':
    #     # Plot using normal distribution
    #     plt.plot(thresholds * 100, thresholds,
    #              '--k', lw=1, label='Climatology')
    #     line = plt.plot(thresholds * 100, probabilitymetric,
    #                     'k', lw=1, label='Projected')
    #     # indicating critical points
    #     # below average
    #     highlight_point(ax, line[0], [thresholds[79]
    #                                   * 100, probabilitymetric[79]], 'g')
    #     # below average
    #     highlight_point(ax, line[0], [thresholds[59]
    #                                   * 100, probabilitymetric[59]], 'y')
    #     # below average
    #     highlight_point(ax, line[0], [thresholds[39]
    #                                   * 100, probabilitymetric[39]], 'm')
    #     # well below average
    #     highlight_point(ax, line[0], [thresholds[19]
    #                                   * 100, probabilitymetric[19]], 'r')
    #
    # elif stat == 'ecdf':
    #     # Plot using emperical cumulative distribution
    #
    #     plt.plot(ecdf_clima.y * 100, ecdf_clima.y,
    #              '--k', lw=1, label='Climatology')
    #     line = plt.plot(ecdf_clima.y * 100, probabilitymetric,
    #                     'k', lw=1, label='Projected')
    #     # identifying the index for the critical points
    #     nn = int(round(len(climayears) / 5., 0))  # this should be an intiger
    #     wba_i = nn
    #     ba_i = (nn * 2)
    #     a_i = (nn * 3)
    #     av_i = (nn * 4)
    #     # indicating critical points
    #     highlight_point(ax, line[0], [
    #                     ecdf_clima.y[av_i] * 100, probabilitymetric[av_i]], 'g')  # below average
    #     highlight_point(ax, line[0], [
    #                     ecdf_clima.y[a_i] * 100, probabilitymetric[a_i]], 'y')  # below average
    #     highlight_point(ax, line[0], [
    #                     ecdf_clima.y[ba_i] * 100, probabilitymetric[ba_i]], 'm')  # below average
    #     highlight_point(ax, line[0], [
    #                     ecdf_clima.y[wba_i] * 100, probabilitymetric[wba_i]], 'r')  # well below average
    #
    # else:
    #     raise ValueError('Please use only "normal" or "ecdf" stat method')
    #
    # plt.title('Theme: Probability of metric estimate (against ' + str(climastartyear) + '-' + str(climaendyear) +
    #           ' climatology)\nLocation: ' + sta_name + '\nForecast date: ' + f_date, loc='left', fontsize=14)
    # plt.xlabel('Climatological percentile (%)', fontsize=14)
    # plt.ylabel('Probability of metric '+'$\leq$'+' Climatological percentile', fontsize=14)
    #
    # plt.yticks(fontsize=14)
    # plt.xticks(fontsize=14)
    # plt.legend()
    # plt.tight_layout()
    # if stat == 'normal':
    #     # GG - Added output dir
    #     path = outdir + '/plot_output/gaussian/'
    # elif stat == 'ecdf':
    #     # GG - Added output dir
    #     path = outdir + '/plot_output/ecdf/'
    # else:
    #     raise ValueError('Please use only "normal" or "ecdf" stat method')
    # plt.savefig(path + sta_name + '_' + f_date + '_metricprob.png', dpi=300)
    # plt.close()

    #-------------------------------------------------------------------------#
    # Risk probability plot (Pentile bar plot format DA)
    pp = []
    sns.set_style("ticks")
    fig = plt.figure(figsize=(5,5))
    if stat == 'normal':
        verylow = probabilitymetric[19]
        low = probabilitymetric[39] - verylow
        average = probabilitymetric[59] - (verylow + low)
        high = probabilitymetric[79] - (verylow + low + average)
        veryhigh = 1 - (verylow + low + average + high)
    elif stat == 'ecdf':
        # identifying the index for the critical points
        nn = int(round(len(climayears) / 5., 0))  # this should be an intiger
        wba_i = nn
        ba_i = (nn * 2)
        a_i = (nn * 3)
        av_i = (nn * 4)

        verylow = probabilitymetric[wba_i]
        low = probabilitymetric[ba_i] - probabilitymetric[wba_i]  # verylow
        average = probabilitymetric[a_i] - \
            probabilitymetric[ba_i]  # (verylow+low)
        high = probabilitymetric[av_i] - \
            probabilitymetric[a_i]  # (verylow+low+average)
        veryhigh = 1 - probabilitymetric[av_i]  # (verylow+low+average+high)
    else:
        raise ValueError('Please use only "normal" or "ecdf" stat method')

    val = [verylow, low, average, high, veryhigh]   # the bar lengths
    pos = np.arange(5) + .5        # the bar centers on the y axis

    for ptl in np.arange(0,5):
      plt.barh(pos[ptl], val[ptl] * 100, align='center',
               color='grey',edgecolor='black',linewidth=3)
      plt.annotate(str(round(val[ptl] * 100, 1)) + '%', ((val[ptl] * 100) + 1,
                   pos[ptl]), xytext=(0, 1), textcoords='offset points', fontsize=20)

    plt.yticks(pos, ('Very low\n(0-20%)', 'Low\n(20-40%)', 'Average\n(40-60%)',
                     'High\n(60-80%)', 'Very high\n(80-100%)'), fontsize=14)
    plt.xticks(fontsize=14)
    plt.xlabel('Probability (%)', fontsize=14)
    plt.ylabel('Quintile category',fontsize=14)
    plt.title('Forecast date: ' + f_date + '\nPeriod of interest: '+poi_start_date+' to '+poi_end_date, loc='left', fontsize=14)
    plt.xlim(0, 101)
    #plt.legend()
    plt.tight_layout()
    if stat == 'normal':
        # GG - Added outdir
        #ECB - got rid of directory structure
        path = outdir
    elif stat == 'ecdf':
        # GG - Added outdir
        path = outdir
    else:
        raise ValueError('Please use only "normal" or "ecdf" stat method')

    # append the probabilities to pp
    pp = np.append(pp, round(val[0] * 100, 1))
    pp = np.append(pp, round(val[1] * 100, 1))
    pp = np.append(pp, round(val[2] * 100, 1))
    pp = np.append(pp, round(val[3] * 100, 1))
    pp = np.append(pp, round(val[4] * 100, 1))

    plt.savefig(path +str('/') +'pentile_' + f_date + '.png', dpi=300)
    plt.close()

    # save the probabilities of each category on a text file
    headval = '1 = Very low(0-20%)  2 = Low(20-40%)   3 = Average(40-60%)  4 = High(60-80%)  5 = Very high(80-100%)\n\
Category    RiskProbability'
    category = [1, 2, 3, 4, 5]
    rp = np.array([category, pp])
    rp = rp.T
    # GG - Added outdir
    #ECB - got rid of directory structure
    np.savetxt(outdir +str("/") +str("quintiles.txt") , rp,
               delimiter='     ', header=headval, fmt='%i  %0.2f')

    # #-------------------------------------------------------------------------#
    # # probability density plot
    # sns.set_style("ticks")
    # fig = plt.figure(figsize=(7,6))
    #
    # if stat == 'normal':
    #     # Plot using normal distribution
    #     sns.kdeplot(climametric, bw=10, shade=True,
    #                 label='Climatology', cumulative=False)
    #     sns.kdeplot(forecametric, bw=10, shade=False, color='g',
    #                 label='Projected', cumulative=False)
    #
    # elif stat == 'ecdf':
    #     # Plot using emperical cumulative distribution
    #     sns.kdeplot(climametric, bw=10, shade=True,
    #                 label='Climatology', cumulative=False)
    #     sns.kdeplot(forecametric, bw=10, shade=False,
    #                 label='Projected', cumulative=False)
    #
    # else:
    #     raise ValueError('Please use only "normal" or "ecdf" stat method')
    # plt.title('Theme: Probability of metric estimate (against ' + str(climastartyear) + '-' + str(climaendyear) +
    #           ' climatology)\nLocation: ' + sta_name + '\nForecast date: ' + f_date, loc='left', fontsize=14)
    # plt.xlabel('Metric value', fontsize=14)
    # plt.ylabel('Probability density', fontsize=14)
    #
    # plt.yticks(fontsize=14)
    # plt.xticks(fontsize=14)
    # plt.legend()
    # plt.tight_layout()
    # if stat == 'normal':
    #     # GG - Added outdir
    #     path = outdir + '/plot_output/gaussian/'
    # elif stat == 'ecdf':
    #     # GG - Added outdir
    #     path = outdir + '/plot_output/ecdf/'
    # else:
    #     raise ValueError('Please use only "normal" or "ecdf" stat method')
    # plt.savefig(path + sta_name + '_' + f_date + '_ked_plot.png', dpi=300)
    # plt.close()

    fig2 = plt.figure(figsize=(6,6))

    alldata = np.append(climametric, forecametric)
    #binBoundaries = np.linspace(min(forecametric), max(forecametric),10)

    binBoundaries = np.linspace(min(alldata), max(alldata), 10)

    thres = np.zeros(len(binBoundaries))
    probclim = np.zeros(len(binBoundaries))
    modfreqclim = np.zeros(len(binBoundaries))
    probclim[0] = sps.norm.cdf(binBoundaries[0], climamean, climasd)
    for z in range(1, len(binBoundaries)):
        thres[z] = binBoundaries[z]

        probclim[z] = sps.norm.cdf(thres[z], climamean, climasd)
        modfreqclim[z] = (probclim[z] - probclim[z - 1])

        #probmetric = sps.norm.cdf(thres,projmean,projsd)
        #probabilitymetric = np.append(probabilitymetric,probmetric)
        #probabilityclim = np.append(probabilityclim,probclim)

    #plt.hist(forecametric, bins=binBoundaries, color = 'b',lw=3)
    n, bins, patches = plt.hist((climametric, forecametric), bins=binBoundaries, lw=3, color=[
                                 "blue", "green"], label=["Climatology", "Ensemble"], normed=True,alpha=0.9)
    plt.clf() # clears bars but keeps plt.hist output
    # plt.plot(binBoundaries,modfreqclim)
    # https://plot.ly/matplotlib/histograms/
    y = mlab.normpdf(bins, climamean, climasd)
    plt.plot(bins, y, color="black",linewidth=3,label="Climatological distribution")
    plt.fill_between(bins,y,np.zeros(len(y)),color="grey",alpha=0.8)
    #forecamean = np.mean(forecametric)
    #forecasigma = np.std(forecametric)
    # y2 = mlab.normpdf(bins, np.mean(forecametric), np.std(forecametric))
    # plt.plot(bins, y2, color="black",ls='-',linewidth=3,marker="s",markersize=10,label="Current distribution (without meteorological forecast)")

    y3 = mlab.normpdf(bins, projmean, projsd)
    plt.plot(bins, y3, color="black",ls="-",linewidth=3,marker="o",markersize=10,
             label="Predicted distribution",alpha=0.9)

    plt.xlabel('Metric value', fontsize=14)
    plt.ylabel('Probability density', fontsize=14)
    plt.title('Comparison of prediction against \n' + str(climastartyear) + '-' + str(climaendyear) +
              ' climatology'+'\nForecast date: ' + f_date+'\nPeriod of interest: '+poi_start_date+' to '+poi_end_date, loc='left', fontsize=14)
    plt.xticks(fontsize=14)
    plt.yticks(fontsize=14)
    plt.xlim(min(alldata), max(alldata))
    plt.gca().set_ylim(bottom=0)
    plt.legend(loc=8,fontsize=12,framealpha=0.5)
    plt.tight_layout()

    plt.savefig(path + str("/")+ 'hist_plot'+ '_' + f_date + '.png', dpi=300)
    plt.close()

    return pp

#--------------------------------------------------------------------------------#


def highlight_point(ax, line, point, c, linestyle=':'):
    """
    This is an extra function to highlight three of the probability
    points on the plot. It is part of the main plotting function.
    """
    label = ['well below average = ', 'Below average = ',
             'Average = ', 'Above average = ']
    c = c
    xmin = 0  # ax.get_xlim()[0]
    ymin = 0  # ax.get_ylim()[0]
    if c == 'r':
        label = label[0]
    elif c == 'm':
        label = label[1]
    elif c == 'y':
        label = label[2]
    elif c == 'g':
        label = label[3]
    else:
        raise ValueError('Only chosse colors green,yellow or red')
    ax.plot([xmin, point[0]], [point[1], point[1]], color=c,
            linestyle=linestyle, label=label + str(round(point[1], 2)))
    ax.plot([point[0], point[0]], [ymin, point[1]],
            color=c, linestyle=linestyle)
    return None

#-------------------------------------------------------------------------------#


# GG - Modified to take the data, rather than rereading the files
def weight_forecast(forecametric, Wmetric, weights, climastartyear, climaendyear):
    # Need to implement weights for ecdf. https://stackoverflow.com/questions/21844024/weighted-percentile-using-numpy

    fy_wmean = []

    # GG - Code calling np.genfromtxt again was removed, since it is unnecessary.

    # the metric for ordering the true metric(forecametric)
    # is total precipitation of JJA.

    # ECB: Note that if we have fewer years for the weighting metric, which can happen if we go over the year boundary, zip will cut out the end of the ensembles time series. This should be sorted out now. The onus is on the user to specify the correct years.
    # ECB: Note that when we cross the year boundary in either ensemble period of interest or weighting metric period of interest, we reference the FIRST year in the period. So if we are using a DJF weighting metric period of interest, for a MAM ensemble period of interest, we will be weighting a using a metric AFTER the period of interest.  This needs to be resolved. The user needs to specify whether our forecast period starts in the same year, the year before or the year after.
    climayears = np.arange(climastartyear, climaendyear + 1)

    #----------------------------------------------------------------#
    # warning that certain number of years have been removed from the
    # climatology to make the length divisioble by len(weight)
    #-----------------------------------------------------------------#
    ny_del = len(climayears) % len(weights)
    # print(len(climayears))
    if ny_del != 0:
        climayears = climayears[:(len(climayears) - ny_del)]
        # warnings.warn("The last%s ,"year of climatology years has been removed!" % ny_del)
        # print "Only", %s, "ensembles are used!" % len(climayears)
    else:
        climayears = climayears

    forecametric = forecametric[0:len(climayears)]
    Wmetric = Wmetric[0:len(climayears)]

    # put the metric with true metric (forecametric)
    out = zip(Wmetric, forecametric)

    out = sorted(out)  # sort in  ascending order based on the metric
    out = np.array(out)  # convert it to array
    # print(out)
    # weighting forecast metric with the weighting metric
    n_reps = np.shape(out)[0] / len(weights)
    allweights = []

    for j in range(0, len(weights)):
        allweights = np.append(allweights, np.repeat(weights[j], n_reps))
    allweights = (allweights / sum(allweights))

    # weighted average of forecasted metric after being sorted by the metric

    # print(allweights)
    # print(zip(out[:,1],allweights))
    a = np.average(out[:, 1], weights=allweights)

    fy_wmean = np.append(fy_wmean, a)  # projected weighted mean

    # projected weighted standard deviation
    variance = np.average((forecametric - fy_wmean)**2, weights=allweights)
    fy_wsd = np.sqrt(variance)

    del allweights
    return fy_wmean, fy_wsd
