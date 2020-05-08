import pandas as pd
pd.options.display.max_columns = 999
pd.options.display.max_rows = 999
import numpy as np


def perf_measure(y_actual, y_hat):
    """ compute true/false positive/negative rates
    """
    TP = 0
    FP = 0
    TN = 0
    FN = 0
    for i in range(len(y_hat)):
        if y_actual[i]==y_hat[i]==1:
           TP += 1
        if y_hat[i]==1 and y_actual[i]!=y_hat[i]:
           FP += 1
        if y_actual[i]==y_hat[i]==0:
           TN += 1
        if y_hat[i]==0 and y_actual[i]!=y_hat[i]:
           FN += 1
    return TP, FP, TN, FN


def crop_window_around_drought(df, drought_label, lower_bound=6, upper_bound=12):
    """ slice dataframe in time windows around certain events
    window size is [event_index-lower_bound, event_index+upper_bound]
    """
    idx = df.index.get_indexer_for(df[df[drought_label]].index)
    if len(idx) > 0:
        df_cropped = df.iloc[np.unique(np.concatenate([np.arange(max(i-lower_bound,0),
                                                                 min(i+upper_bound+1, len(df))) for i in idx]))]
    else:
        df_cropped = pd.DataFrame(columns=df.columns)
    return df_cropped


def extend_alarms_resolution(df, alarm_label, target_label, lower_bound=2, upper_bound=2):
    """ correct for limited time resolution of events: all alarms within +-X months
    from true events will be counted as true alarms
    """
    idxs = df.index.get_indexer_for(df[df[target_label]].index)
    for idx in idxs:
        df_cropped = df.iloc[np.arange(max(idx - lower_bound, 0), min(idx + upper_bound + 1, len(df)))]
        df_event = df.iloc[np.arange(max(idx, 0), min(idx + 1, len(df)))]
        if df_cropped[alarm_label].any():
            df.at[df_cropped.index, alarm_label] = False
            df.at[df_event.index, alarm_label] = True
    return df


def quantile_model(threshold_quantile=0.1):
    """ quantile model: compute thresholds at fixed quantile (e.g. 10%), for different variables
    """

    # load dataframe
    df = pd.read_csv('Droughts_satelite_data_events_1month_normalized_corrected.csv', index_col=[1, 2])
    df = df.drop(columns=['month', 'day', 'year', 'Unnamed: 0'])
    df['date'] = pd.to_datetime(df['date'])    # give meaningful names to different rainfall estimates
    df = df.rename(columns={'precipitation_per_hour_v1': 'rainfall_NASA_TRMM_3B43',
                            'precipitation_per_hour_v2': 'rainfall_JAXA_GSMaP',
                            'rainfall': 'rainfall_CHIRPS_FLDAS'})

    # define target
    target_label = 'drought_estimated'
    df[target_label] = df[target_label].astype(bool)
    df = df.drop(columns=['drought_reported', 'drought_news_article', 'drought_desinventar'])

    # initialize results dataframe
    df_results_per_district = pd.DataFrame()
    df_results_all = pd.DataFrame()

    # loop over countries
    for country in df.index.get_level_values('Country').unique():
        df_country = df.loc[country]

        # loop over districts
        for district in df_country.index.get_level_values('District').unique():
            df_district = df_country.loc[district].reset_index()
            # if len(df_district[df_district[target_label]]) < 3:
            #     continue

            # loop over indicators/variables
            for var in df_district.columns:
                if var != target_label and var != 'date' and var != 'District':
                    df_var = df_district[[var, target_label]]
                    df_var = df_var.dropna()

                    # compute threshold
                    threshold = df_var.quantile(.10)[0]

                    # take only dates around true events (<-- incomplete event dataset)
                    df_var = crop_window_around_drought(df_var, target_label, 10, 10)

                    # compute predicted alarms/warnings
                    df_var['alarms'] = df_var[var].apply(lambda x: True if x < threshold else False)

                    # take all alarms close to true events as true alarms (<-- limited time resolution)
                    df_var = extend_alarms_resolution(df_var, 'alarms', target_label, 2, 2)

                    # compute true/false positive/negative rates
                    TP, FP, TN, FN = perf_measure(df_var[target_label].values.tolist(), df_var['alarms'].values.tolist())
                    df_results_all = df_results_all.append({'country': country, 'indicator': var,
                                                            'TP': TP, 'FP': FP, 'TN': TN, 'FN': FN}, ignore_index=True)

                    # compute metrics and save in results dataframe
                    try:
                        metrics = {
                            'POD': TP / (TP + FN),
                            'FAR': FP / (TP + FP),
                            'CSI': TP / (TP + FP + FN)
                        }
                        df_results_per_district = df_results_per_district.append({'country': country,
                                                        'district': district,
                                                        'indicator': var,
                                                        'POD': metrics['POD'],
                                                        'FAR': metrics['FAR'],
                                                        'CSI': metrics['CSI'],
                                                        'n_events': TP + FN}, ignore_index=True)
                    except:
                        continue
    df_results_per_district = df_results_per_district.set_index(['country', 'district', 'indicator'])

    # print results per district and save
    print(df_results_per_district.head())
    df_results_per_district.to_csv('quantile_model_results_per_district.csv')

    # compute results per country
    df_results_per_country = df_results_all.groupby(['country', 'indicator'])[['TP', 'FP', 'TN', 'FN']].agg('sum')
    TP, FP, TN, FN = df_results_per_country.TP, df_results_per_country.FP, df_results_per_country.TN, df_results_per_country.FN
    df_results_per_country['POD'] = TP / (TP + FN)
    df_results_per_country['FAR'] = FP / (TP + FP)
    df_results_per_country['CSI'] = TP / (TP + FP + FN)
    df_results_per_country['n_events'] = TP + FN

    # print results per country and save
    print(df_results_per_country.head())
    df_results_per_country.to_csv('quantile_model_results_per_country.csv')

if __name__ == '__main__':
    import plac
    plac.call(quantile_model)


