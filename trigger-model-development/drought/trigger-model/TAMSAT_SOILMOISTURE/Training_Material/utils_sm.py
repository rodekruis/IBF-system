import numpy as np
import math
import datetime as dt
import warnings
import matplotlib.pyplot as plt
import pandas as pd
import scipy.stats as sps

def richa_num(P_val, p_val, T_val, u_val, q1_val, qsat, h, fa_val, gs, e_psi, LAI, dt_val):

    # 4K temperature is added to account higher surface temperature
    # compare to the air temperature.
    deltaT = dt_val * 10.0
    deltaT = np.maximum(deltaT, 2.5)

    u_val = np.maximum(abs(u_val),0.001) # minimum wind speed is 0.001 m/s

    e = 0.5 # surface emissivity
    g = 9.80665 # gravitational constant (m/s)
    cp = 1005.0 # specific heat capacity of air (J/KgK)

    h = np.maximum(h,0.001) # h cannot be less than 1 mm

    d = (2.0 / 3.0) * h  #  zero plane displacement height [m]

    zom = h / 10.0  #  roughness length governing momentum transfer [m]

    #---------------------------------------------------#
    if LAI == 0.0:
        zo = 3.0 * 10.0**-4.0 # surface roughness length (m)
    else:
        zo = h / 10.0

    zoh = zo / 10.0 # roughness length governing transfer of heat and vapour [m]
    #--------------------------------------------------#

#    zoh = zom / 10.0 # roughness length governing transfer of heat and vapour [m]

    z1 = zo + d # lowest atmospheric height where exchange between surface occur

    Rbi = ((g * z1) / ((abs(u_val))**2.0)) \
          * (((1.0 / T_val)*((T_val - (T_val + deltaT))+((g / cp)*(z1 + zom - zoh))))\
             + (e_psi * ((qsat - q1_val)/(q1_val + (e / (1.0 - e))))))

    return Rbi

def qsat_ra_rc(P_val, p_val, T_val, dt_val):
    """
    This function calculate the parameters requiered to estimate
    evapotranspiration.
    :param: p: pressure in (Pa)
    :param: T: temperature in (K)
    :param: h: plant height in (m)
    :param: u: wind speed in (m/s)
    :param: LAI: leaf area index in (-)

    :return: qsat, ra, rc
    """
    # 4K temperature is added to account higher surface temperature
    # compare to the air temperature.
    # when there is more rain the surface cools reducing evaporaation
    deltaT = dt_val * 10.0
    deltaT = np.maximum(deltaT, 2.5)

    # qsat is evaluated with surface temperature so add the temperature
    # difference to the air temperature.
    T_val = T_val + deltaT

    # saturated specific humidity (kg/Kg)
    log_es = ((10.79574 * (1.0 - (273.16 / T_val))) \
              - (5.028 * (math.log10( T_val / 273.16))) \
              + (1.50475 * (10.0**-4.0) * (1.0-(10.0**(-8.2969*((T_val / 273.16)-1.0))))) \
              + (0.42873 * (10.0**-3.0) * ((10.0**(-4.76955*(1.0-(273.16 / T_val))))-1.0)) \
              + (0.78614 + 2.0))

    es = 10.0 ** log_es
    qsat = (0.62198 * es) / p_val

    return qsat


def calc_ch(LAI,h,Rib,u_val):
    """
    This function calculate the CH value(A surface
    exchange coefficent for sensible and latent heat
    fluxs between the surface and the lowest
    atmospheric level at height 2m)

    :param: LAI: leaf area index
    :param: h: plant height in meter

    :return Ch: surface
        exchange coefficent for sensible and latent heat
        fluxs between the surface and the lowest
        atmospheric level at height 2m
    """
    h = np.maximum(h,0.001) # h cannot be less than 1 mm
    u_val = np.maximum(abs(u_val),0.001) # minimum wind speed is 0.001 m/s

    # Von Karman's constant
    vkman = 0.4

    d = (2.0 / 3.0) * h  #  zero plane displacement height [m]

    zom = h / 10.0  #  roughness length governing momentum transfer [m]

    if LAI == 0.0:
        zo = 3.0 * 10.0**-4.0 # surface roughness length (m)
    else:
        zo = h / 10.0 # 0.001 is added to avoid division by zero

    zoh = zo / 10.0 # scalar roughness length (m)

    z1 = zo + d # lowest atmospheric height where exchange between surface occur

    # Neutral drag coefficient.
    chn = (vkman**2.0) * (((math.log((z1 + zo)/zo)) *\
                    (math.log((z1 + zo)/ zoh)))**-1.0)

    fz = (1.0/4.0)*((zo/(z1+zo))**0.5)

    # Prandtl number
    Pr = (math.log((z1 + zo)/zo)) *\
         ((math.log((z1 + zo)/ zoh))**-1.0)

    # Stability coefficient
    bh = 10.0 * chn * 4.0 * (np.sqrt(z1 / zoh))

    # positive Rbi represent stable air
    # Negative Rbi represent unstable air
    # fh : neutral satbility coefficient
    if Rib >= 0.0:
        fh = (1.0 + (10.0*(Rib/Pr)))**-1.0
##        fh = (1.0 + (10.0*Rib))**-1
    else:
        fh = 1.0 - (10.0 * Rib * ((1.0 + (10.0*chn* (np.sqrt(-Rib))/fz))**-1.0))
##        fh = 1.0 - (10.0 * Rib / (1 + bh * (np.sqrt(-Rib))))

    ch = fh * chn

    ra = (fh * chn * (abs(u_val)))**-1.0

    return ch, ra


def climayears_pdates(datastartyear, dataendyear, climastartyear, climaendyear,
                      forecastyear,forecastmonth, forecastday, pyear, pmonth, pday,
                      leadtime, weights, periodstart_year, periodstart_month,
                      periodstart_day, periodend_year, periodend_month, periodend_day):
    #-------------------------------------#
    # set up actual dates for the x axis representation
    pdate = dt.datetime(pyear, pmonth, pday).date()
    p_date = pdate.strftime('%d-%b-%Y')
    # identify the Julian day of year of the forecast date
    pdoy = dt.datetime.strptime(p_date, '%d-%b-%Y')
    pdoy = pdoy.timetuple().tm_yday

    # The following will forecast the CWR for each planting date
    # given below.
    #-------------------------------------#
    # set up actual dates for the x axis representation
    date = dt.datetime(forecastyear, forecastmonth, forecastday).date()
    f_date = date.strftime('%d-%b-%Y')
    # identify the Julian day of year of the forecast date
    fdoy = dt.datetime.strptime(f_date, '%d-%b-%Y')
    fdoy = fdoy.timetuple().tm_yday
    # -------------------------------------#
    # interest period for SM analysis
    # set up actual dates for the x axis representation
    initstart = dt.datetime(periodstart_year, periodstart_month, periodstart_day).date()
    initstart_date = initstart.strftime('%d-%b-%Y')
    # identify the Julian day of year of the forecast date
    initstart_date = dt.datetime.strptime(initstart_date, '%d-%b-%Y')
    initstart_doy = initstart_date.timetuple().tm_yday

    # interest period for SM analysis
    # set up actual dates for the x axis representation
    initend = dt.datetime(periodend_year, periodend_month, periodend_day).date()
    initend_date = initend.strftime('%d-%b-%Y')
    # identify the Julian day of year of the forecast date
    initend_date = dt.datetime.strptime(initend_date, '%d-%b-%Y')
    initend_doy = initend_date.timetuple().tm_yday

    # planting date start in the begning of the season
    # and it will be assumend to end at the end of the lead time
    # identified by the user.
    plantdatestart = 0  # 32 #fdoy - 10
    plantdateend = 729  # fdoy + leadtime
    #------------------------------------#
    # climatological years
    climayears = np.arange(climastartyear, climaendyear+1)
    #----------------------------------------#
    # warning that certain number of years have been removed from the climatology
    # to make the length divisioble by len(weight)
    ny_del = len(climayears) % len(weights)
    if ny_del != 0:
         climayears = climayears[:(len(climayears) - ny_del)]
         warnings.warn("The last %s year of climatology years has been removed!" % ny_del)
    else:
        climayears = climayears
    #----------------------------------------#
    plantingdates = np.arange(plantdatestart, plantdateend+1)

    # the index of the forecast date from the list of plantingdates
    # this is used in other modules (sm_model_v9.py, decision_making.py)
	# interest period
    init_start = sorted(plantingdates).index(initstart_doy)
    init_end = sorted(plantingdates).index(initend_doy)

	# planting date index
	# This value is not used in tamsat-alert-sm!!!
    if forecastyear % 4 == 0: # leap year removal
        ind = sorted(plantingdates).index(fdoy-1)
        pd_ind = sorted(plantingdates).index(pdoy-1)
    else:
        ind = sorted(plantingdates).index(fdoy)
        pd_ind = sorted(plantingdates).index(pdoy)

    # exception handlling interest period start and interest period end
    # init_end should always be  greather than init_start.
    # this part is required for tamsat-alert-sm.py (in sm_wrapper.py these dates are
    # used to weight historical and forecasted part).
    if init_end < init_start:
        init_end = init_end + 365
    else:
        init_end = init_end
    # more exception handlling for interest period start previous year and forecast date
    # date start in the next year ????
    # ??????????????????????????
    #
    # total years in the model and extracting the forecast year index
    years = np.arange(datastartyear, dataendyear + 1)
    fy_ind = sorted(years).index(forecastyear)

    return climayears, plantingdates, years, ind, fy_ind, pd_ind, init_start, init_end


def extract_initial_cond(smcl_histdata, Su_histdata, years, fy_ind, ind):
    """
    This function extract the initial soil moisture fraction for the forecast date
    to start the ensemble forecast for soil moisture.
    :param smcl_histdata: historical soil moisture data
    :param Su_histdata: historical soil moisture fraction data
    :param years: the arry of years from start data to end data
    :param fy_ind: index of the forecast year from the years array
    :param ind: index of the forecast date from the plantingdate array (it is just 0-364 anyways)
    :return: initial soil moisture fraction at each soil layer
    """

    # reshape the historical soil moisture for extracting the initial soil moisture
    extra_date = len(smcl_histdata[0]) % 365

    sudovals = np.repeat(-99., ((365 - extra_date) * 4))

    sudovals = np.reshape(sudovals, (4, int(len(sudovals) / 4)))

    smcl_histdata = np.hstack([smcl_histdata, sudovals])

    Su_histdata = np.hstack([Su_histdata, sudovals])
    smcl_histdata = np.reshape(smcl_histdata, (4, len(years), 365))
    Su_histdata = np.reshape(Su_histdata, (4, len(years), 365))

    # extract the initial soil moisture fraction for the forecast run
    initi_su = Su_histdata[:, fy_ind, ind]

    return initi_su


def reshape_drive_data(P, p, u, q1, T, years):
    """
    This function reshape the driving data helping to extract any climatological year
    chosen to run the ensemble forecasts.
    :param P: precipitation
    :param p: pressure
    :param u: wind speed
    :param q1: humidity
    :param T: mean temperature
    :param years: array of years from start data to end data
    :return: reshaped values of the driving data
    """
    # make 10 years average for all the variables
    Pmean = np.mean(np.reshape(P[:10*365*24],(10,365*24)), axis=0)
    pmean = np.mean(np.reshape(p[:10*365*24],(10,365*24)), axis=0)
    umean = np.mean(np.reshape(u[:10*365*24],(10,365*24)), axis=0)
    q1mean = np.mean(np.reshape(q1[:10*365*24],(10,365*24)), axis=0)
    Tmean = np.mean(np.reshape(T[:10*365*24],(10,365*24)), axis=0)

    extra_date = len(p) % (365 * 24)
    # add pseudo values to make the reshape work
    P = np.hstack([P, Pmean[extra_date:]])
    p = np.hstack([p, pmean[extra_date:]])
    u = np.hstack([u, umean[extra_date:]])
    q1 = np.hstack([q1, q1mean[extra_date:]])
    T = np.hstack([T, Tmean[extra_date:]])

    P = np.reshape(P, (len(years), (365*24))).T
    p = np.reshape(p, (len(years), (365 * 24))).T
    u = np.reshape(u, (len(years), (365 * 24))).T
    q1 = np.reshape(q1, (len(years), (365 * 24))).T
    T = np.reshape(T, (len(years), (365 * 24))).T

    return P, p, u, q1, T

def tf_runoff_inf(P_val, LAI , model_t_step, er, Ks, I_v, Ec):
    """
    Calculate the throughfall, surface runoff and
    surface infliteration.

    :param: P: precipitation
    :param  LAI: leaf area index
    :param: t: timestep (86400 sec.)
    :param: er: the fraction of grid on which rain fall
    :param: Ks: saturated hydraulic conductivity
    :param: I_v: enhansement factor

    :return throughfall (Tf) and surface runoff (Y)
            and surface infliteration (Wo)
    """
    #Cmin = 0.5 #(minimum canopy water capacity 0.5)
    C = 0.0 # intial canopy water content

    Cm = 0.5 + (0.05 * LAI) # calculate the max canopy water (Cm)

    K = I_v * Ks # calculate the hydraulic conductivity of the soil

    Y = []
    Tf = []
    #c = [] # updated canopy water
    fa_vals = []

    if P_val == 0:
        tf = 0.0
        Tf = np.append(Tf, tf)
        y = 0.0
        Y = np.append(Y, y)
        C = C - (Ec * model_t_step) # to change the units to similar
        if C < 0.:
            C = 0.0
            #c = np.append(c, C)
        else:
            C = C
            #c = np.append(c, C)
    else:
        if C < Cm:
            tf = (P_val * (1.0 -(C / Cm)) * math.exp(((- er * Cm)/(P_val * model_t_step)))) + \
                 (P_val * (C / Cm))
            Tf = np.append(Tf, tf)
#            print tf * 86400
            if (K * model_t_step) <= C:
                y = ((P_val * (C / Cm)) * math.exp(((- er * K* Cm)/(P_val * C)))) + \
                   (P_val * (1.0 -(C / Cm)) * math.exp(((- er * Cm)/(P_val * model_t_step))))
                Y = np.append(Y, y)
                C = C + ((P_val - tf)* model_t_step)# C need to be updated
                #c = np.append(c, C)
            else:
                y = P_val * math.exp((-er *((K * model_t_step)+ Cm - C))/ (P_val * model_t_step))
                Y = np.append(Y, y)
#                print 'ok'
                C = C + ((P_val - tf)* model_t_step) # C need to be updated
                #c = np.append(c, C)
        else:
            tf = (P_val * (1.0 -(C / Cm)) * math.exp(((- er * Cm)/(P_val * model_t_step)))) + \
                 (P_val * (C / Cm))
            Tf = np.append(Tf, tf)
            if (K * model_t_step) <= C:
                y = ((P_val * (C / Cm)) * math.exp(((- er * K* Cm)/(P_val * C)))) + \
                   (P_val * (1.0 -(C / Cm)) * math.exp(((- er * Cm)/(P_val * model_t_step))))
                Y = np.append(Y, y)
                C = Cm
                #c = np.append(c, Cm)
            else:
                y = P_val * math.exp((-er *((K*model_t_step)+ Cm - C))/ (P_val * model_t_step))
                Y = np.append(Y, y)
                #c = np.append(c, Cm)
                C = Cm

    # wet fraction of vegetation (fa) needed to calculate
    # evaporation later. It follows a linear increase with
    # canopy water and become 1 at Cm.

    if C < Cm:
        fa = C / Cm
        fa_vals = np.append(fa_vals, fa)
    else:
        fa = 1.0
        fa_vals = np.append(fa_vals, fa)

    # amount of water infliterating to the soil
    if LAI == 0.0:
        Wo = P_val - Y # if no vegetation throuhfall = Precipitation
        # controling negative values
        if Wo < 0.0:
            Wo = 0.0
        else:
            Wo = Wo
    else:
        Wo = Tf - Y
        # controling negative values
        if Wo < 0.0:
            Wo = 0.0
        else:
            Wo = Wo

    return Tf, Y, Wo, fa_vals, C

def calc_smcl(main_run_init, psi_s, theta_s, theta_c, theta_w, b, Ks, dz,
            dr,q1, p, T, h, u, dt, LAI, model_t_step, data_period,P,
            er,I_v,gl):
    """
    This function is to calculate the total soil moisture content
    at each soil depth over the time period.
            #ECB removed filename as a function argument.
    """

    fa_val = main_run_init[1]
    C = 0.0
    Ec = 0.0
    e_psi = 1.0
    dMdt = np.zeros((len(dz), len(P)))
    su_vals = np.zeros((len(dz), len(P)))
    # initial Su values
    su_vals[0,0] = main_run_init[0][0]
    su_vals[1,0] = main_run_init[0][1]
    su_vals[2,0] = main_run_init[0][2]
    su_vals[3,0] = main_run_init[0][3]

    # total soil moisture (M)
    M = su_vals.copy()
    M[0,0] = 1000.* dz[0]* theta_s * su_vals[0,0]
    M[1,0] = 1000.* dz[1]* theta_s * su_vals[1,0]
    M[2,0] = 1000.* dz[2]* theta_s * su_vals[2,0]
    M[3,0] = 1000.* dz[3]* theta_s * su_vals[3,0]
    # --------- added for WRSI --------------#
    # Es evaporation from surface
    # Ek fraction of soil moisture from each layer
    runoff = []
    ae = [] # Es
    aet = su_vals.copy() # ek
    # ----- end ----------------------------#
    for t in range(1,len(dMdt[0])):

        # use the updated su
        su = su_vals[:,t-1]

        # calculate the w_flux
        psi,K,W = calc_psi_k_wflux(psi_s, su, dz, b, Ks)

        # calculate theta initial
        theta = su * theta_s

        # calcualte the beta initial
        beta = cal_beta(theta_c, theta_w, theta)

        # root fraction at each soil layer
        rk = root_frac(dr,dz)

        # calculate the ek ...factor of extraction
        ek,gs = calc_ek(rk, theta_c, theta_w, beta, LAI, gl, theta)

        # calculate the extraction (evapotranspiration)
        P_val = P[t]
        p_val = p[t]
        T_val = T[t]
        u_val = u[t]
        q1_val = q1[t]
        dt_val = dt[t]

        # seting the maximum temperature allowed to be 65 celsius
        # minimum temperature allowed to be -90 celsius
        if T_val >= 338.15:
            T_val = 338.15
        elif T_val <= 183.15:
            T_val = 183.15
        else:
            T_val = T_val

        # seting the maximum windspeed allowed to be 30 m/s
        # minimum windspeed (just the direction!!!) allowed to be -30 m/s
        if u_val >= 30.0:
            u_val = 30.0
        elif u_val <= -30.0:
            u_val = -30.0
        else:
            u_val = u_val

        qsat = qsat_ra_rc(P_val, p_val, T_val, dt_val)

        # Richardson number
        Rib = richa_num(P_val, p_val, T_val, u_val, q1_val, qsat, h, fa_val, gs, e_psi, LAI, dt_val)

        # surface exchange coefficient
        ch, ra = calc_ch(LAI,h,Rib,u_val)

        # calculate the infliteration at the top of the soil
        Tf, Y, wo, fa_val, C = tf_runoff_inf(P_val, LAI, model_t_step, er, Ks, I_v, Ec)

        # Evaporation
        Ec,Es,E,e_psi = evapo_flux(fa_val,ra, q1_val, qsat, beta, C, ch, u_val, gs, model_t_step)

        # calculate the moisture change
        dMdt[0,t] = wo   - W[0]  - (ek[0]*Es)
        dMdt[1,t] = W[0] - W[1]  - (ek[1]*Es)
        dMdt[2,t] = W[1] - W[2]  - (ek[2]*Es)
        dMdt[3,t] = W[2] - W[3]  - (ek[3]*Es)

        # calculate the soil moisture at the time
        M[0,t] = (dMdt[0,t] * model_t_step) + M[0,t-1]
        M[1,t] = (dMdt[1,t] * model_t_step) + M[1,t-1]
        M[2,t] = (dMdt[2,t] * model_t_step) + M[2,t-1]
        M[3,t] = (dMdt[3,t] * model_t_step) + M[3,t-1]

        # each soil layer can not holed more than its max. value
        # we restrict the amount with in the limit.
        # excess soil moisture is added to the upper layer
        # when it reach the surface just left out since we do not have
        # other method to use that excess water.
        M_0_max = 1000.* dz[0]* theta_s
        M_1_max = 1000.* dz[1]* theta_s
        M_2_max = 1000.* dz[2]* theta_s
        M_3_max = 1000.* dz[3]* theta_s

        # layer 4
        if M[3,t] < (0.03*M_3_max):
            M[3,t] = 0.03*M_3_max # minimum soil moisture is set to 3% of saturation
        elif M[3,t] > M_3_max:
            M[2,t] = M[2,t] + (M[3,t] - M_3_max) # add the extra water to the upper layer
            M[3,t] = M_3_max # maintain the maximum soil moisture
        else:
            M[3,t] = M[3,t]

        # layer 3
        if M[2,t] < (0.03*M_2_max):
            M[2,t] = 0.03*M_2_max
        elif M[2,t] > M_2_max:
            M[1,t] = M[1,t] + (M[2,t] - M_2_max)
            M[2,t] = M_2_max
        else:
            M[2,t] = M[2,t]

        # layer 2
        if M[1,t] < (0.03*M_1_max):
            M[1,t] = 0.03*M_1_max
        elif M[1,t] > M_1_max:
            M[0,t] = M[0,t] + (M[1,t] - M_1_max)
            M[1,t] = M_1_max
        else:
            M[1,t] = M[1,t]

        # layer 1
        if M[0,t] < (0.03*M_0_max):
            M[0,t] = 0.03*M_0_max
        elif M[0,t] > M_0_max:
            Y = Y + (M[0,t] - M_0_max) ## execss water could be runoff
            M[0,t] = M_0_max
        else:
            M[0,t] = M[0,t]

        # calculate the new su (updating)
        su_vals[0,t] = M[0,t] / (1000.*dz[0]*theta_s)
        su_vals[1,t] = M[1,t] / (1000.*dz[1]*theta_s)
        su_vals[2,t] = M[2,t] / (1000.*dz[2]*theta_s)
        su_vals[3,t] = M[3,t] / (1000.*dz[3]*theta_s)

        # -------- added for WRSI -------#
        ae = np.append(ae, Es)

        aet[0,t] = ek[0]
        aet[1,t] = ek[1]
        aet[2,t] = ek[2]
        aet[3,t] = ek[3]
        # -----end-----------------------#
        # --------add the runoff --------#
        runoff = np.append(runoff, Y)

    # the final data is averaged to the data period time
    num_rep = int(data_period / model_t_step) #* 24
    M_av = []
    su_av = []
    for i in range(0,len(M)):
        for j in range(0,len(M[0]),num_rep):
            m = np.nanmean(M[i, j:j+num_rep])
            M_av = np.append(M_av, m)
            s = np.nanmean(su_vals[i, j:j+num_rep])
            su_av = np.append(su_av, s)
    M_av = np.reshape(M_av, (len(dz),int(len(P)/num_rep)))
    su_av = np.reshape(su_av, (len(dz),int(len(P)/num_rep)))

    # -------- added for WRSI --------#
    del i
    del j
    ae_av = []
    for k in range(0,len(ae),num_rep):
        kk = np.nanmean(ae[k:k+num_rep])
        ae_av = np.append(ae_av, kk)

    aet_av = []
    for i in range(0,len(aet)):
        for j in range(0,len(aet[0]),num_rep):
            mm = np.nanmean(aet[i, j:j+num_rep])
            aet_av = np.append(aet_av, mm)
    aet_av = np.reshape(aet_av, (len(dz),int(len(P)/num_rep)))
    # ------- end --------------------------#
    # --------- runoff ---------------------#
    roff_av = []
    for rr in range(0,len(runoff),num_rep):
        rval = np.nanmean(runoff[rr:rr+num_rep])
        roff_av = np.append(roff_av, rval)

    return su_av, M_av, ae_av, aet_av, roff_av


# ---------------------------------------------------------------------------#
def cal_av_beta(theta_s, theta_c, theta_w, Su, rk):
    """ This function calculate the soil moisture avilability
    factor beta of a given soil moisture.

    :param: theta_c: critical soil moisture
    :param: theta_w: wilting soil moisture
    :param: M: Su which is the ratio of soil moisture of the
                soil layer to saturted soil moisture (Su = theta / theta_s)

    :return soil moisture availability factor (beta)"""

    beta_vals = Su.copy()
    beta_weighted = Su.copy()
    beta_av = []
    theta = Su * theta_s # change Su to soil moisture

    for z in range(0,len(Su)):
        for t in range(0,len(Su[0])):
            if theta[z,t] > theta_c:
                beta = 1.0
                beta_vals[z,t] = beta
            elif theta[z,t] <= theta_w:
                beta = 0.0
                beta_vals[z,t] = beta
            else:
                beta = (theta[z,t] - theta_w) / (theta_c - theta_w)
                beta_vals[z,t] = beta
    # beta value of each layer is weighted by root fraction
    for i in range(0,len(beta_vals)):
        beta_weighted[i,:] = beta_vals[i,:] * rk[i]
    # mean of the weighted beta values for total soil column
    for j in range(0,len(beta_weighted[0])):
        beta = np.sum(beta_weighted[:,j])
        beta_av = np.append(beta_av, beta)
    return beta_av, beta_vals
#----------------------------------------------------------------------#
# The function below was writen while doing the planting date decision
# making in order to use field capacity as the highest value since beta
# from the JULES will be too dry for seedlings. Therefore, if runing just
# a bare soil moisture model use the above function. If working with
# seedlings use the function below.
#----------------------------------------------------------------------#
def cal_av_beta_fc(theta_s, theta_c, theta_w, Su, rk):
    """ This function calculate the soil moisture avilability
    factor beta of a given soil moisture using the field capacity.

    :param: theta_c: critical soil moisture
    :param: theta_w: wilting soil moisture
    :param: M: Su which is the ratio of soil moisture of the
                soil layer to saturted soil moisture (Su = theta / theta_s)

    :return soil moisture availability factor (beta)"""

    beta_vals = Su.copy()
    beta_weighted = Su.copy()
    pfc_vals = Su.copy()
    beta_av = []
    theta = Su * theta_s # change Su to soil moisture
    theta_fc = 0.8 * theta_s # field capacity is 80% of saturation moisture
    for z in range(0,len(Su)):
        for t in range(0,len(Su[0])):
            if theta[z,t] > theta_fc:
                beta = 1.0
                beta_vals[z,t] = beta
                pfc_vals[z,t] = 1.0 # percentage field capacity
            elif theta[z,t] <= theta_c:
                beta = 0.0
                beta_vals[z,t] = beta
            else:
                beta = (theta[z,t] - theta_c) / (theta_fc - theta_c)
                beta_vals[z,t] = beta
    # beta value of each layer is weighted by root fraction
    for i in range(0,len(beta_vals)):
        beta_weighted[i,:] = beta_vals[i,:] * rk[i]
    # mean of the weighted beta values for total soil column
    for j in range(0,len(beta_weighted[0])):
        beta = np.sum(beta_weighted[:,j])
        beta_av = np.append(beta_av, beta)
    #------------------------------------------------#
    del z
    del t
    # percentage field capacity (PFC)
    # This is calculated for the decision making in planting date
    for z in range(0,len(Su)):
        for t in range(0,len(Su[0])):
            if theta[z,t] > theta_fc:
                pfc_vals[z,t] = 1.0 # above FC 100%
            elif theta[z,t] <= theta_w:
                pfc_vals[z,t] = 0.0 # below PWP 0%
            else:
                pfc_vals[z,t] = theta[z,t] / theta_fc # Available water content(AWC)

    return beta_av, beta_vals, pfc_vals

#-----------------------------------------------------------------------#
def nc_write(M, Su, beta, none_weigh_beta, pfc, model_t_step, Evap, EvapT, runoff, filename):
    """
    this function write the soil moisture and the beta values
    on a netCDF file.

    :param: M: soil moisture at each soil layer (soillayer, time)
    :param: beta: the mean soil moisture avilability weighted by
                    root fraction at each layer.
    :param: model_t_step: the model time step used to run the model

    :return:  produce a netCDF file in the same directory.
    """
    # ------------------------------------------------------#
    # create netcdf file and write the smcl and beta values
    #-------------------------------------------------------#
    ds = Dataset(filename, 'w',format='NETCDF4_CLASSIC')
    s_layer = ds.createDimension('s_layer',4)
    time = ds.createDimension('time', None)
    s_layer = ds.createVariable('s_layer', 'i4', ('s_layer',))
    time = ds.createVariable('time', 'f4', ('time',))
    smcl = ds.createVariable('smcl', 'f4', ('s_layer','time'))
    su_value = ds.createVariable('su', 'f4', ('s_layer','time'))
    nw_betas = ds.createVariable('nw_beta', 'f4', ('s_layer','time'))
    pfc_value = ds.createVariable('pfc', 'f4', ('s_layer','time'))
    betas = ds.createVariable('beta', 'f4', ('time',))
    # --- added for WRSI ---------#
    ekval = ds.createVariable('etp', 'f4', ('s_layer','time'))
    esval = ds.createVariable('evap', 'f4', ('time',))
    roffval = ds.createVariable('runoff', 'f4', ('time',))
    # ------ end ----------------#
    time.units = 'days since 1981-01-01'
    time.calendar = 'proleptic_gregorian'
    s_layer[:] = np.arange(4)
    time[:] = np.arange(len(M[0]))
    smcl[:,:] = M
    su_value[:,:] = Su
    betas [:] = beta
    nw_betas[:,:] = none_weigh_beta
    pfc_value[:,:] = pfc
    ekval[:,:] = EvapT
    esval [:] = Evap
    roffval [:] = runoff
    ds.close()
    return None

def interp_data(P, p, u, q1, T, dt, data_period, model_t_step):
    # ------------------------------------------------------------#
    # Driving data interpolation to the model time step
    # ------------------------------------------------------------#
    # Data need to be at the model time scale
    # to do that linear interpolation is used on instantanous
    # variables and data is kept similar at all the
    # model time step for flux variables.

    # flux variables (precipitation and wind speed)
    P = np.repeat(P, (data_period / model_t_step)).values
    u = np.repeat(u, (data_period / model_t_step)).values

    # instantaneous variables (pressure, temperature, humidity)
    xp = np.arange(0, len(p))
    xvals = np.linspace(0, len(p), (len(p) * (data_period / model_t_step)))
    p = np.interp(xvals, xp, p)
    q1 = np.interp(xvals, xp, q1)
    # ---------------------------------------------------------------#
    # interpolation of temperature for 24 hours
    temp = []
    for k in range(0, len(T)):
        tval = T[k]
        dtval = dt[k]
        vv = temp_interp(tval, dtval)
        temp.append(vv)
        # ---------------------------------------------------------------#
    temp = np.array(temp)
    T = temp.flatten()

    # normalize temperature change
    dt = (dt - min(dt)) / (max(dt) - min(dt))

    # temperature range dissagregation to be used in qsat calc.

    dt = np.repeat(dt, (data_period / model_t_step))

    return P, p, u, q1, T, dt


def temp_interp(daily_T, daily_dtr):

    # calculating MINIMUM TEMPERATURE
    T_min = ((2.0 * daily_T) - daily_dtr) / 2.0

    # calculating MAXIMUM TEMPERATURE
    T_max = (2.0 * daily_T) - T_min

    x = daily_dtr / 11.0

    f1 = np.arange(T_min, T_max, x)

    f2 = np.arange(T_max, T_min, -x)

    f = np.hstack([f1, T_max, T_max, f2])

    f = f[:24]  # only 24 hours

    return f


def radiation_interp(sw, lw):
    swr = []
    lwr = []
    for i in range(len(sw)):
        s = sw[i]
        l = lw[i]
        # short wave
        ss = swrad_interp(s)
        swr.append(ss)
        # long wave
        ll = lwrad_interp(l)
        lwr.append(ll)

    swr = np.array(swr)
    swr = swr.flatten()

    lwr = np.array(lwr)
    lwr = lwr.flatten()
    # shift lwr by 12 hours to mach max in mid night
    tmp = lwr[12:24]
    lwr = np.hstack([tmp,lwr[:-12]])
    return swr, lwr


def swrad_interp(mu):
    sigma = mu * 0.5 # 50% standard deviation
    x = np.linspace(sps.norm.ppf(0.01, mu, sigma), sps.norm.ppf(0.99, mu, sigma), 24)
    oldmean =  np.mean(x)
    y = sps.norm.pdf(x, mu, sigma)
    f = []
    for i in range(len(y)):
        p = sps.norm.ppf(y[i], mu, sigma)
        f.append(p)
    newmean = np.mean(f)
    diff = oldmean - newmean
    f = f + diff
    return f


def lwrad_interp(mu):
    sigma = mu * 0.1 # 10% standard deviation
    x = np.linspace(sps.norm.ppf(0.01, mu, sigma), sps.norm.ppf(0.99, mu, sigma), 24)
    oldmean =  np.mean(x)
    y = sps.norm.pdf(x, mu, sigma)
    f = []
    for i in range(len(y)):
        p = sps.norm.ppf(y[i], mu, sigma)
        f.append(p)
    newmean = np.mean(f)
    diff = oldmean - newmean
    f = f + diff
    return f

def spinup(fa_init, num_spin_year, spin_cyc, su_init, psi_s, theta_s, theta_c, theta_w, b, Ks, dz,
           dr,q1, p, T, h, u, dt, LAI, model_t_step, data_period,P,er,I_v, gl):
    """
    This function is to calculate the total soil moisture content
    at each soil depth over the time period by runing the model
    for the selected cycle. It only returns the last day soil moisture
    fraction and wet fraction of vegetation. These two values will be
    used in the main run as an initial condition.
    """
    num_rep = int(data_period / model_t_step) #* 24
    fa_val = fa_init
    spin_len = int(num_spin_year * 365 * num_rep)
    C = 0.0
    Ec = 0.0
    e_psi = 1.0
    dMdt = np.zeros((len(dz),spin_len))
    su_vals = np.zeros((len(dz),spin_len))
    # initial Su values
    su_vals[0,0] = su_init[0]
    su_vals[1,0] = su_init[1]
    su_vals[2,0] = su_init[2]
    su_vals[3,0] = su_init[3]
    # total soil moisture (M)
    M = su_vals.copy()
    M[0,0] = 1000.* dz[0]* theta_s * su_vals[0,0]
    M[1,0] = 1000.* dz[1]* theta_s * su_vals[1,0]
    M[2,0] = 1000.* dz[2]* theta_s * su_vals[2,0]
    M[3,0] = 1000.* dz[3]* theta_s * su_vals[3,0]

    for s in range(0,int(spin_cyc)):
        if s == 0:
            su_vals[:,0] = su_vals[:,0]
        else:
            su_vals[:,0] = su_vals[:,-1] # use the last timestep moisture as initial for next spinup

        for t in range(1,len(dMdt[0])):
            # use the updated su
            su = su_vals[:,t-1]
            # calculate the w_flux
            psi,K,W = calc_psi_k_wflux(psi_s, su, dz, b, Ks)
            # calculate theta initial
            theta = su * theta_s
            # calcualte the beta initial
            beta = cal_beta(theta_c, theta_w, theta)
            # root fraction at each soil layer
            rk = root_frac(dr,dz)
            #print rk
            # calculate the ek ...factor of extraction
            ek,gs = calc_ek(rk, theta_c, theta_w, beta, LAI, gl,theta)
            # calculate the extraction (evapotranspiration)
            P_val = P[t]
            p_val = p[t]
            T_val = T[t]
            u_val = u[t]
            q1_val = q1[t]
            dt_val = dt[t]

            # seting the maximum temperature allowed to be 65 celsius
            # minimum temperature allowed to be -90 celsius
            if T_val >= 338.15:
                T_val = 338.15
            elif T_val <= 183.15:
                T_val = 183.15
            else:
                T_val = T_val

            # seting the maximum windspeed allowed to be 30 m/s
            # minimum windspeed (just the direction!!!) allowed to be -30 m/s celsius
            if u_val >= 30.0:
                u_val = 30.0
            elif u_val <= -30.0:
                u_val = -30.0
            else:
                u_val = u_val

            qsat = qsat_ra_rc(P_val, p_val, T_val, dt_val)

            # Richardson number
            Rib = richa_num(P_val, p_val, T_val, u_val, q1_val, qsat, h, fa_val, gs, e_psi, LAI, dt_val)

            # surface exchange coefficient
            ch, ra = calc_ch(LAI,h,Rib,u_val) #ch = calc_ch(LAI,h,Rib,u_val)

            # calculate the infliteration at the top of the soil
            Tf, Y, wo, fa_val,C = tf_runoff_inf(P_val, LAI, model_t_step, er,Ks, I_v,Ec)

            # Evaporation
            Ec,Es,E,e_psi = evapo_flux(fa_val,ra, q1_val, qsat, beta, C, ch, u_val, gs, model_t_step)

            # calculate the moisture change
            dMdt[0,t] = wo   - W[0]  - (ek[0]*Es)
            dMdt[1,t] = W[0] - W[1]  - (ek[1]*Es)
            dMdt[2,t] = W[1] - W[2]  - (ek[2]*Es)
            dMdt[3,t] = W[2] - W[3]  - (ek[3]*Es)
            # calcualate the soil moisture amount at the time step
            M[0,t] = (dMdt[0,t] * model_t_step) + M[0,t-1]
            M[1,t] = (dMdt[1,t] * model_t_step) + M[1,t-1]
            M[2,t] = (dMdt[2,t] * model_t_step) + M[2,t-1]
            M[3,t] = (dMdt[3,t] * model_t_step) + M[3,t-1]
            # each soil layer can not holed more than its max. value
            # we restrict the amount with in the limit.
            M_0_max = 1000.* dz[0]* theta_s
            M_1_max = 1000.* dz[1]* theta_s
            M_2_max = 1000.* dz[2]* theta_s
            M_3_max = 1000.* dz[3]* theta_s

            # layer 4
            if M[3,t] < (0.03*M_3_max):
                M[3,t] = 0.03*M_3_max # minimum soil moisture is set to 3% of saturation
            elif M[3,t] > M_3_max:
                M[2,t] = M[2,t] + (M[3,t] - M_3_max) # add the extra water to the upper layer
                M[3,t] = M_3_max # maintain the maximum soil moisture
            else:
                M[3,t] = M[3,t]

            # layer 3
            if M[2,t] < (0.03*M_2_max):
                M[2,t] = 0.03*M_2_max
            elif M[2,t] > M_2_max:
                M[1,t] = M[1,t] + (M[2,t] - M_2_max)
                M[2,t] = M_2_max
            else:
                M[2,t] = M[2,t]

            # layer 2
            if M[1,t] < (0.03*M_1_max):
                M[1,t] = 0.03*M_1_max
            elif M[1,t] > M_1_max:
                M[0,t] = M[0,t] + (M[1,t] - M_1_max)
                M[1,t] = M_1_max
            else:
                M[1,t] = M[1,t]

            # layer 1
            if M[0,t] < (0.03*M_0_max):
                M[0,t] = 0.03*M_0_max
            elif M[0,t] > M_0_max:
                Y = Y + (M[0,t] - M_0_max) ## execss water could be runoff
                M[0,t] = M_0_max
            else:
                M[0,t] = M[0,t]

            # calculate the new su (updating)
            su_vals[0,t] = M[0,t] / (1000.*dz[0]*theta_s)
            su_vals[1,t] = M[1,t] / (1000.*dz[1]*theta_s)
            su_vals[2,t] = M[2,t] / (1000.*dz[2]*theta_s)
            su_vals[3,t] = M[3,t] / (1000.*dz[3]*theta_s)

    # the final data is averaged to the data period time
    M_av = []
    su_av = []
    for i in range(0,len(M)):
        for j in range(0,len(M[0]),num_rep):# average over every 24
            m = np.nanmean(M[i, j:j+num_rep])
            M_av = np.append(M_av, m)
            s = np.nanmean(su_vals[i, j:j+num_rep])
            su_av = np.append(su_av, s)
    M_av = np.reshape(M_av, (len(dz),int(spin_len/num_rep)))
    su_av = np.reshape(su_av, (len(dz),int(spin_len/num_rep)))
    return su_av[:, 0], fa_val

def calc_psi_k_wflux(psi_s, su, dz, b, Ks):
    """
    calculate the suction, hydro. conductivity
    and water flux at each soil layer.

    :param: psi_s: the water suction at saturation (m)
    :param: su: the ratio of soil moisture to saturation (-)
            N.B. this value is given as list as layer [1, 2,3,4]
    :param: dz: soil layer depth give as a list (m)
    :param: b: constant soil parameter (-)
    :param: Ks: satration hydraulic conductivity (mm/s)

    :return psi,K,W (all in list as layer [1,2,3,4])
    """
    psi = []
    dpsi_dsu = []
    dsu_dz = []
    dpsi_dz = []
    K = []
    W = []
    # psi and K calculation
    # Su at the lower boundary
    # lower boundary is considered as the weighted average
    # between the top and bottom layer. The weights are based
    # on the depth of the soil.
    # for the bottom layer we do not need to average because it
    # will be set to the free flow based on the hydraulic conductivity
    # of the layer.
    su_bound = []
    for j in range(0, len(dz)):
        if j < 3:

            # limiting the soil moisture saturation ratio with 1%
            if su[j] <= 0.01:
                su[j] = 0.01
            else:
                su[j] = su[j]

            if su[j+1] <= 0.01:
                su[j+1] = 0.01
            else:
                su[j+1] = su[j+1]

            su_w = ((su[j] * dz[j+1]) + (su[j+1] * dz[j])) / (dz[j+1] + dz[j])
            su_bound = np.append(su_bound, su_w)
        else:
            if su[j] <= 0.01:
                su[j] = 0.01
            else:
                su[j] = su[j]
            su_w =  su[j]
            su_bound = np.append(su_bound, su_w)
    del j

    # psi and K calculation
    for i in range(0, len(su)):
        if su_bound[i] <= 0.01: # to avoid error incase of dry soil
            psi_val = psi_s * (0.01**-b)
            psi = np.append(psi, psi_val)
            d_psi = 0.0
            dpsi_dsu = np.append(dpsi_dsu, d_psi)
            k = 0.0
            K = np.append(K, k)
        elif su_bound[i] > 1.0: # to avoid over saturation
            psi_val = psi_s * (1.0**-b)
            psi = np.append(psi, psi_val)
            d_psi = 0.0
            dpsi_dsu = np.append(dpsi_dsu, d_psi)
            k = Ks
            K = np.append(K, k)
        else:
            psi_val = psi_s * (su_bound[i]**-b)
            psi = np.append(psi, psi_val)
            d_psi = -b * psi_val * (su_bound[i]**-1)
            dpsi_dsu = np.append(dpsi_dsu, d_psi)
            k = Ks * (su_bound[i]**((2*b) + 3))
            K = np.append(K, k)

    # dpsi_dz
    for j in range(0, len(dz)):
        if j < 3:
            if su_bound[j] > 1.0: # if soil is saturated flow will be set to saturated flow
                dpsi_dz_val = 0.0
                dpsi_dz = np.append(dpsi_dz, dpsi_dz_val)
            else: # include upflux too
                dpsi_dz_val = ((psi_s * -b * (su_bound[j]**(-b - 1)) *((su[j+1] - su[j]) * 2.0 / (dz[j+1] + dz[j]))))
                dpsi_dz = np.append(dpsi_dz, dpsi_dz_val)
        else:
            dpsi_dz_val = 0.0  # lower boundary flux is set to the hydraulic conductivity of the layer
            dpsi_dz = np.append(dpsi_dz, dpsi_dz_val)
    del j

    # W flux calculation
    W_flux = []
    for j in range(0, len(dz)):
        if j < 3:
            pd = (dpsi_dz[j]+1)
            wflux = K[j]* pd
            W_flux = np.append(W_flux, wflux)
        else:
            wflux = K[j] # lower boundary condition
            W_flux = np.append(W_flux, wflux)

    return dpsi_dz, K, W_flux
#----------------------------------------------------------------------

def root_frac(dr,dz):
    """
    This function calculate the fraction of root
    at ech soil layer which follows an exponetial
    distributon.

    :param: dr: rooting depth of the plant

    :return rk: rooting fraction
    """
    dr = np.maximum(dr, 0.1) # maximum of 0.1 m rooting depth is taken
    p = 1.0 # power describing depth dependance of root density profile

    # z: soil layer depth for the 4 soil layers (not the thickness !!)
    z = []
    for d in range(0,len(dz)):
        z_val = np.sum(dz[:d+1])
        z = np.append(z, z_val)

    tot_soil_z = z[-1]
    r_frac = []
    for k in range(0, len(z)):
        # k start at 0 and k-1 will be dz[-1]
        # to avoid the issue for the first value
        # we set dz = 0 (surface)
##        if dr <= 0.0: # this will swich off plants and become bare soil
##            rk = 0.0
##            r_frac = np.append(r_frac, rk)
##        else:
        if k == 0:
            z[-1] = 0.0
        else:
            z[-1] = tot_soil_z

        rk = ((math.exp((-p*z[k-1])/dr)) - (math.exp((-p*z[k])/dr))) / \
             (1 - math.exp((-p*tot_soil_z)/dr))
        r_frac = np.append(r_frac, rk)

    return r_frac
#------------------------------------------------------------------------------#
# for transpiration E' from each layer is ek * E'
# ek is calculated as follows

def calc_ek(rk, theta_c, theta_w, beta, LAI, gl, theta):
    """
    Calculate the factor that help to calculate
    the portion of transpiration from each soil
    layer

    :param: rk: root fraction at each layer as an array
    :param: theta_c: critical soil moisture
    :param: theta_w: wilting soil moisture
    :param: beta: soil moisture avilability
                  factor of the soil layers as array

    :return factor for transpiration calculation (ek)
    """
    LAI = np.maximum(LAI, 0.006) # small LAI is used if no plant is available

    tmp = []
    eko = []
    # calculate the ek value for each layer
    for j in range(0,len(rk)):
        tmp_val = rk[j] * beta[j]
        tmp = np.append(tmp, tmp_val)
    tmp_sum = np.maximum(np.sum(tmp),0.001) # to avoid dvision by zero

    for k in range(0,len(tmp)):
        eko_val = (rk[k] * beta[k]) / tmp_sum
        eko = np.append(eko, eko_val)
    del tmp

    # calculate soil evaporation

    thetaval = theta[0] # top layer soil moisture

    g_soil = 0.01 * ((thetaval / theta_c)**2.0) # bare soil evaporation

    fr = 1.0 - (math.exp( - LAI / 2.0)) # radiative fraction

    fpar = (1.0 - (math.exp(- 0.5 * LAI))) / 0.5 # factor influencing canopy conductance

    gc = gl * fpar # canopy conductance (m/s)

    gs = gc + ((1.0 - fr) * g_soil) # surface conductance (m/s)

    # calculating the fraction of the soil moisture extracted from
    # each layer

    ek = []
    for i in range(0,len(rk)):
        if i == 0:
            ek_val = ((gc * eko[i]) + ((1 - fr) * g_soil)) / gs
            ek = np.append(ek, ek_val)
        else:
            ek_val = (gc * eko[i]) / gs
            ek = np.append(ek, ek_val)

    return ek,gs

#--------------------------------------------------------------------#
# soil moisture availability factor (beta)
def cal_beta(theta_c, theta_w, theta):
    """ This function calculate the soil moisture avilability
    factor beta of a given soil moisture.

    :param: theta_c: critical soil moisture
    :param: theta_w: wilting soil moisture
    :param: theta: soil moisture of the soil layer

    :return soil moisture availability factor (beta)"""
    beta_vals = []
    for z in range(0,len(theta)):
        if theta[z] > theta_c:
            beta = 1.0
            beta_vals = np.append(beta_vals, beta)
        elif theta[z] <= theta_w:
            beta = 0.0
            beta_vals = np.append(beta_vals, beta)
        else:
            beta = (theta[z] - theta_w) / (theta_c - theta_w)
            beta_vals = np.append(beta_vals, beta)
    return beta_vals

#------------------------------------------------------------------------#
# evaporation fluxes
def evapo_flux(fa_val, ra, q1_val, qsat, beta, C, ch, u_val, gs, model_t_step):
    """
    This function calculate the three evaporation losses
    and total evaporatin loss from the grid.

    :param: fa_val: fraction of the grid box with wet canopy
    :param: rho: surface air density = 1.2 kg/m3
    :param: ra: aerodynamic resistance
    :param: q1: atmosperic specific humidity
    :param: qsat: saturated specific humidity at surface temperature
    :param: v: vegetated fraction of the grid
    :param: rc: canopy resistance
    :param: beta: soil moisture availability factor of layer 1 soil moisture
    :param: rss: surface resistance = 100 s/m

    :return canopy evaporation (Ec), transpiration by vegetation(Ev),
            bare soil evaporation(Es), total evaporation(E)
    """
    u_val = np.maximum(abs(u_val),0.001) # minimum wind speed is 0.001 m/s

    e_psi_s = gs / (gs + (ch * (abs(u_val))))

    e_psi = fa_val + ((1.0 - fa_val) * e_psi_s)

    Eo = (1.20 / ra) * (qsat - q1_val) # potential evaporation

    E = e_psi * Eo # total actual evaporation (Ec + Es)

    Ec = fa_val * Eo # canopy evaporation

    # limiting canopy evaporation to a minimum of zero
    if Ec < 0.0:
        Ec = 0.0
    else:
        Ec = Ec

    # evaporation from soil moisture store (actual)
    if (Ec * model_t_step) > C:
        Es = e_psi_s * (1.0 - ((fa_val * C) / (Ec * model_t_step))) * Eo
#        print '>C: ',Es
    else:
        Es = (1.0 - fa_val)* e_psi_s * Eo


    # limiting soil evaporation to a minimum of zero
    if Es < 0.0:
        Es = 0.0
    else:
        Es = Es
    return Ec, Es, E, e_psi
#---------------------------------------------------------------------------#

def pedoclass(soiltex):
    """
    This function takes the name of the soil textural class and
    calculate the input variables for JULES soil parameter.
    :param soiltex: the name of one of the 12 soil textural classes as string.
    :return the file for JULES input of soil properties.
    """
    # the 12 textural classes according to USDA.
    texture = ['clay', 'silty clay', 'sandy clay', 'silty clay loam',
               'clay loam', 'sandy clay loam', 'loam', 'silt loam',
           'sandy loam', 'silt', 'loamy sand', 'sand']
    # based on the soil textural triangle the central value of each
    # polygon was chosen to determine the percentage of sand-silt-clay.
    if soiltex == texture[0]:
        sand = 20.0; silt = 20.0; clay = 60.0
    elif soiltex == texture[1]:
        sand = 10.0; silt = 45.0; clay = 45.0
    elif soiltex == texture[2]:
        sand = 50.0; silt = 10.0; clay = 40.0
    elif soiltex == texture[3]:
        sand = 10.0; silt = 55.0; clay = 35.0
    elif soiltex == texture[4]:
        sand = 33.0; silt = 33.0; clay = 34.0
    elif soiltex == texture[5]:
        sand = 60.0; silt = 10.0; clay = 30.0
    elif soiltex == texture[6]:
        sand = 40.0; silt = 40.0; clay = 20.0
    elif soiltex == texture[7]:
        sand = 20.0; silt = 65.0; clay = 15.0
    elif soiltex == texture[8]:
        sand = 65.0; silt = 25.0; clay = 10.0
    elif soiltex == texture[9]:
        sand = 5.0; silt = 90.0; clay = 5.0
    elif soiltex == texture[10]:
        sand = 80.0; silt = 15.0; clay = 5.0
    elif soiltex == texture[11]:
        sand = 90.0; silt = 5.0; clay = 5.0
    else:
        raise ValueError('The soil texture name you enter is not correct \
please enter all values in small letter and with space if it is two or \
more word. eg. sandy clay loam')
    # each values os sand silt clay gives a specific values of
    # soil property parameter for the JULES in order to account
    # the possible combinations of sand-silt-clay at each textural
    # class an average was taken. The average of the parameters was
    # calculated using +/- 1%, +/- 2%, +/- 3% of sand-silt-clay
    # and realocating the values to the sand silt and clay accordingly.
    soilpropval = []
    for i in range(1,4):
        if i == 1:
            x1 = np.array(pedo(sand, silt, clay))
            x2 = np.array(pedo(sand + i, silt - i, clay))
            x3 = np.array(pedo(sand - i, silt + i, clay))
            x4 = np.array(pedo(sand + i, silt, clay - i))
            x5 = np.array(pedo(sand - i, silt, clay + i))
            x6 = np.array(pedo(sand, silt + i, clay - i))
            x7 = np.array(pedo(sand, silt - i, clay + i))
            xav = (x1 + x2 + x3 + x4 + x5 +x6 + x7) / 7.0
            soilpropval = np.append(soilpropval, xav)
        elif i == 2:
            x1 = np.array(pedo(sand, silt, clay))
            x2 = np.array(pedo(sand + i, silt - i, clay))
            x3 = np.array(pedo(sand - i, silt + i, clay))
            x4 = np.array(pedo(sand + i, silt, clay - i))
            x5 = np.array(pedo(sand - i, silt, clay + i))
            x6 = np.array(pedo(sand, silt + i, clay - i))
            x7 = np.array(pedo(sand, silt - i, clay + i))
            x8 = np.array(pedo(sand + i, silt - (i-1), clay - (i-1)))
            x9 = np.array(pedo(sand - i, silt + (i-1), clay + (i-1)))
            x10 = np.array(pedo(sand - (i-1), silt + i, clay - (i-1)))
            x11 = np.array(pedo(sand + (i-1), silt - i, clay + (i-1)))
            x12 = np.array(pedo(sand - (i-1), silt - (i-1), clay + i))
            x13 = np.array(pedo(sand + (i-1), silt + (i-1), clay - i))
            xav = (x1+x2+x3+x4+x5+x6+x7+x8+x9+x10+x11+x12+x13) / 13.0
            soilpropval = np.append(soilpropval, xav)
        elif i == 3:
            x1 = np.array(pedo(sand, silt, clay))
            x2 = np.array(pedo(sand + i, silt - i, clay))
            x3 = np.array(pedo(sand - i, silt + i, clay))
            x4 = np.array(pedo(sand + i, silt, clay - i))
            x5 = np.array(pedo(sand - i, silt, clay + i))
            x6 = np.array(pedo(sand, silt + i, clay - i))
            x7 = np.array(pedo(sand, silt - i, clay + i))
            x8 = np.array(pedo(sand + i, silt - (i-2), clay - (i-1)))
            x9 = np.array(pedo(sand + i, silt - (i-1), clay - (i-2)))
            x10 = np.array(pedo(sand - i, silt + (i-2), clay + (i-1)))
            x11 = np.array(pedo(sand - i, silt + (i-1), clay + (i-2)))
            x12 = np.array(pedo(sand - (i-2), silt + i, clay - (i-1)))
            x13 = np.array(pedo(sand - (i-1), silt + i, clay - (i-2)))
            x14 = np.array(pedo(sand + (i-2), silt - i, clay + (i-1)))
            x15 = np.array(pedo(sand + (i-1), silt - i, clay + (i-2)))
            x16 = np.array(pedo(sand - (i-2), silt - (i-1), clay + i))
            x17 = np.array(pedo(sand - (i-1), silt - (i-2), clay + i))
            x18 = np.array(pedo(sand + (i-2), silt + (i-1), clay - i))
            x19 = np.array(pedo(sand + (i-1), silt + (i-2), clay - i))
            xav = (x1+x2+x3+x4+x5+x6+x7+x8+x9+x10+x11+x12+
                   x13+x14+x15+x16+x17+x18+x19) / 19.0
            soilpropval = np.append(soilpropval, xav)
        else:
            raise ValueError('Problem with average soil parameter calculation!!!')
    soilpropval = np.reshape(soilpropval,(3,len(xav)))
    soilpropval = np.mean(soilpropval,axis=0)
    #np.savetxt('soilprops.dat',soilpropval,fmt='%4.6e',newline=" ")
    return soilpropval



def pedo(sand,silt,clay):
    # Air entry potential (in m)
    psis = 0.01*(10.0**(1.54-0.0095*sand+0.0063*silt))
    
    # Saturated volumetric water content (VMC) in m3 m-3
    thetas = (50.5-0.142*sand-0.037*clay)/100.0
    
    # Brooks & Corey, Clapp & Hornberger and Cosby et al b-parameter
    b = 3.1+0.157*clay-0.003*sand
    
    # Saturated hydraulic conductivity in inches/hour
    ksat_inch_hour = 10.0**(-0.6-0.0064*clay+0.0126*sand)
    
    # Saturated hydraulic conductivity in m/s
    ksat_metre_sec = (0.0254/3600.0)*ksat_inch_hour
    
    # Field capacity VMC (called critical point in JULES), in m3 m-3
    fc = thetas*(3.3/psis)**(-1.0/b)
    
    # Wilting point VMC, in m3 m-3
    wp =thetas*(150.0/psis)**(-1.0/b)
    
    #Heat capacity for dry soil in J m-3 K
    hcap = (1.0-thetas)*1942000.0
    
    # Saturated thermal conductivity??? where does this come from? NOT CORRECT
    satcon = fc*1000.0
    
    # Dry thermal conductivity, where does this come from? NOT CORRECT, see below
    #hcon = -1*(-0.51+(b*0.56))
    
    # Dry thermal conductivity, Lu et al., 2007
    hcon = -0.56*thetas + 0.51
    
    #f = open('soilprops.dat','w')
    #output = b,psis,ksat_metre_sec*1000,thetas,fc,wp
    
    #np.savetxt('soilprops.dat',output,fmt='%4.6e',newline=" ")
    return  b,psis,ksat_metre_sec*1000.0,thetas,fc,wp
