import matplotlib.pylab as plt
import numpy as np
import pandas as pd
import seaborn as sns
import sklearn.metrics as sklm
import sklearn.model_selection as ms
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from datetime import date
import geopandas as gpd
import geoplot
import matplotlib.colors as colors



'''
Main Functions
'''

def plot_droughts_per_district(data, label_col='drought reported', district_col='District', path='../', country='Uganda',
                               admin_level=1):
    droughts_per_district = data[[district_col, label_col]].groupby(district_col).sum().reset_index()
    gdf_country = gpd.read_file(get_country_shapefile(path=path, country=country, admin_level=admin_level), crs='')

    gdf_country.rename(columns={'ADM1_EN': district_col}, inplace=True)
    gdf_country['centroid'] = gdf_country.centroid

    droughts_per_district = gdf_country[[district_col, 'geometry', 'centroid']].merge(droughts_per_district,
                                                                                      on=district_col)
    droughts_per_district.set_geometry('centroid', drop=True, inplace=True)
    droughts_per_district = droughts_per_district[droughts_per_district[label_col] > 0]

    geoplot.polyplot(gdf_country)
    ax = plt.gca()
    geoplot.pointplot(droughts_per_district, scale=label_col, color='darkred', marker='o',
                      limits=(2, 14), legend=True, legend_values=[1, 3, 6, 9, 12],
                      ax=ax)
    return

def prepare_Uganda_data(phath='./datasets/',
                        filename='Droughts_satelite_and_events.csv',
                        output_filename='Uganda_seasonal_normalized.csv',
                        save=False,
                        first_harvest=[6, 7],
                        second_harvest=[11, 12],
                        first_planting=[3, 4, 5],
                        second_planting=[8, 9, 10],
                        label_col='drought reported'):
    full_data = pd.read_csv(phath + filename, index_col=False)
    Uganda_data = full_data[full_data.Country == 'Uganda'].copy()

    first_id = '_'.join(str(x) for x in first_harvest)
    second_id = '_'.join(str(x) for x in second_harvest)

    label_list = ['drought reported', 'drought news article', 'drought desinventar']
    feature_list = list(Uganda_data.drop(labels=['Country', 'District',
                                                 'year', 'month', 'day',
                                                 'date', ] + label_list,
                                         axis=1).columns)

    raw_features_noSPEI = Uganda_data[['District', 'year', 'month'] + feature_list[0:18]].copy()
    raw_features_noSPEI = raw_features_noSPEI[
        raw_features_noSPEI.month.apply(lambda x: x in (first_planting + second_planting))]
    raw_features_noSPEI['Season'] = raw_features_noSPEI['month'].apply(
        lambda x: first_id if x in first_planting else second_id)
    raw_features_noSPEI.drop(labels='month', axis=1, inplace=True)
    features_noSPEI = raw_features_noSPEI.groupby(['year', 'District', 'Season']).mean().reset_index()

    normal_features = normalize_data(features_noSPEI, ids_list=['year', 'District', 'Season'],
                                     grouping=['District', 'Season'])

    spei_lag = np.min([len(first_planting), len(second_planting)])
    spei_col = 'SPEI ' + str(spei_lag) + 'month'
    spei = Uganda_data[['year', 'District', 'month'] + [spei_col]].copy()
    spei = spei[spei['month'].apply(lambda x: x in ([first_planting[-1]] + [second_planting[-1]]))]
    spei['Season'] = spei['month'].apply(lambda x: first_id if x == first_planting[-1] else second_id)
    spei.drop(labels='month', axis=1, inplace=True)
    spei.reset_index(drop=True, inplace=True)
    normal_features = normal_features.merge(spei, on=['year', 'District', 'Season'])

    new_feature_list = sorted(list(normal_features.drop(labels=['year', 'District', 'Season'], axis=1).columns))
    normal_features = normal_features[['year', 'District', 'Season'] + new_feature_list]
    normal_features.sort_values(by=['year', 'District', 'Season'], inplace=True)

    labels = Uganda_data[['District', 'year', 'month'] + [label_col]].copy()
    labels = labels[labels.month.apply(lambda x: x in (first_harvest + second_harvest))]
    labels['Season'] = labels['month'].apply(lambda x: first_id if x in first_harvest else second_id)
    labels.drop(labels='month', axis=1, inplace=True)
    sum_labels = labels.groupby(by=['year', 'District', 'Season']).sum().reset_index()
    sum_labels.rename(columns={label_col: 'number_drought_reported'}, inplace=True)
    sum_labels[label_col] = sum_labels['number_drought_reported'] > 0

    normal_data = normal_features.merge(sum_labels, on=['year', 'District', 'Season'])
    normal_data.drop(labels='number_drought_reported', axis=1, inplace=True)
    normal_data.dropna(inplace=True)
    if save:
        normal_data.to_csv(phath + output_filename, index=False)

    return normal_data




def optimize_Logreg_model(data, selected_features, label_name, C_array,
                          train_years = [2000,2012],
                          val_years = [2012,2016]):

    reduced_data = reduce_data(data, label_name)

    X = reduced_data[selected_features]

    y = reduced_data[label_name]

    train_ind = np.array(reduced_data[(reduced_data.year >= train_years[0]) & ((reduced_data.year < train_years[1]))].index)
    val_ind = np.array(reduced_data[(reduced_data.year >= val_years[0]) & ((reduced_data.year < val_years[1]))].index)

    y_train = reduced_data[(reduced_data.year >= train_years[0]) & ((reduced_data.year < train_years[1]))][label_name]

    n_pos = len(y_train[y_train == True])
    n_neg = len(y_train[y_train == False])

    W_neg = (1.0 / n_neg)
    W_pos = (1.0 / n_pos)

    Weights = {True: W_pos, False: W_neg}

    opt_model = LogisticRegression(C=1.0,
                                   class_weight=Weights,
                                   penalty='l1',
                                   fit_intercept=True,
                                   solver='liblinear',
                                   random_state=0)

    param_grid = {'C': C_array}

    scoring = sklm.make_scorer(positive_fscore)

    cv = ((train_ind, val_ind),)

    GS = ms.GridSearchCV(estimator=opt_model,
                         param_grid=param_grid,
                         cv=cv,
                         scoring=scoring,
                         return_train_score=False,
                         n_jobs=4)
    GS.fit(X, y);

    best_param = GS.best_params_['C']

    opt_model.C = best_param

    test_scores = GS.cv_results_['mean_test_score']

    return opt_model, test_scores

def predict_Logreg_model(data, selected_features, label_name, C, confusion_matrix=True,drop_zero_coefs=True):

    reduced_data = reduce_data(data, label_name)

    X = reduced_data[selected_features]

    y = reduced_data[label_name]

    n_pos = len(y[y == True])
    n_neg = len(y[y == False])

    W_neg = (1.0 / n_neg)
    W_pos = (1.0 / n_pos)

    Weights = {True: W_pos, False: W_neg}

    model = LogisticRegression(C=C,class_weight=Weights,
                               penalty='l1',fit_intercept=True,
                               solver='liblinear',
                               random_state=0)

    model.fit(X, y)
    y_pred = model.predict(X)

    coefs = pd.DataFrame()
    coefs['feature'] = X.columns
    coefs['coef'] = model.coef_.ravel()

    if drop_zero_coefs:
        coefs = coefs[coefs.coef.abs() >= 10**(-2)]
        coefs['abs_coef'] = coefs['coef'].abs()
        coefs.sort_values('abs_coef', ascending=False, inplace=True, axis=0)
        coefs = coefs[['feature', 'coef']]

    coefs.rename(columns={'coef':'coefficients'},inplace=True)

    predictions = pd.DataFrame()
    predictions[label_name] = y
    predictions['logit_scores'] = (X.values.dot(model.coef_.T)).ravel() + model.intercept_
    predictions['predictions'] = y_pred

    pr = sklm.precision_recall_curve(y, predictions['logit_scores'],
                                           pos_label=True)

    roc = sklm.roc_curve(y, predictions['logit_scores'],
                                     pos_label=True)

    auc = sklm.auc(roc[0],roc[1])

    if confusion_matrix:
        print_metrics(y, y_pred)

    return coefs, predictions, pr, roc, auc, model

def predict_Logreg_model_split(data, year_split, selected_features, label_name, C, confusion_matrix=True):

    reduced_data = reduce_data(data, label_name)

    train = reduced_data[reduced_data.year < year_split]
    test = reduced_data[reduced_data.year >= year_split]

    X_train = train[selected_features]
    y_train = train[label_name]

    X_test = test[selected_features]
    y_test = test[label_name]

    n_pos = len(y_train[y_train == True])
    n_neg = len(y_train[y_train == False])

    W_neg = (1.0 / n_neg)
    W_pos = (1.0 / n_pos)

    Weights = {True: W_pos, False: W_neg}

    model = LogisticRegression(C=C, class_weight=Weights,
                               penalty='l1', fit_intercept=True,
                               solver='liblinear',
                               random_state=0)

    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    coefs = pd.DataFrame()
    coefs['feature'] = X_train.columns
    coefs['coef'] = model.coef_.ravel()
    coefs['abs_coef'] = coefs['coef'].abs()
    coefs.sort_values('abs_coef', ascending=False, inplace=True, axis=0)
    coefs = coefs[['feature', 'coef']]
    coefs = coefs[coefs.coef.abs() >= 10**(-2)]
    coefs.rename(columns={'coef':'coefficients'},inplace=True)

    predictions = pd.DataFrame()
    predictions[label_name] = y_test
    predictions['logit_scores'] = (X_test.values.dot(model.coef_.T)).ravel() + model.intercept_
    predictions['predictions'] = y_pred

    pr = sklm.precision_recall_curve(y_test, predictions['logit_scores'],
                                           pos_label=True)

    roc = sklm.roc_curve(y_test, predictions['logit_scores'],
                                     pos_label=True)

    auc = sklm.auc(roc[0],roc[1])

    if confusion_matrix:
        print_metrics(y_test, y_pred)

    return coefs, predictions, pr, roc, auc

def print_metrics(labels, scores):
    metrics = sklm.precision_recall_fscore_support(labels, scores, labels=[True,False])
    conf = sklm.confusion_matrix(labels, scores, labels=[True,False])
    print('                 Confusion matrix')
    print('                 Score positive    Score negative')
    print('Actual positive    %6d' % conf[0,0] + '             %5d' % conf[0,1])
    print('Actual negative    %6d' % conf[1,0] + '             %5d' % conf[1,1])
    print('')
    print('Accuracy  %0.2f' % sklm.accuracy_score(labels, scores))
    #print('Average F-score  %0.2f' % sklm.f1_score(labels, scores, labels=[True,False], average='macro'))
    print(' ')
    print('           Positive      Negative')
    print('Num case   %6d' % metrics[3][0] + '        %6d' % metrics[3][1])
    print('Precision  %6.2f' % metrics[0][0] + '        %6.2f' % metrics[0][1])
    print('Recall     %6.2f' % metrics[1][0] + '        %6.2f' % metrics[1][1])
    print('F-score    %6.2f' % metrics[2][0] + '        %6.2f' % metrics[2][1])

def plot_dist(data,target,drought_var):
    plt.figure()
    plt.subplot(1,2,1)
    sns.boxenplot(y=target,x=drought_var,data=data)
    plt.subplot(1,2,2)
    bins = np.arange(data[target].min(),data[target].max(),0.05*(data[target].max()-data[target].min()))
    ax=sns.distplot((data[(data[drought_var].notna())&(data[drought_var]==False)][target]).dropna()
                 ,bins=bins,label='False')
    sns.distplot(data[(data[drought_var].notna())&(data[drought_var]==True)][target].dropna(),
                bins=bins,label='True')
    ax.yaxis.set_label_position("right")
    plt.ylabel('distribution')
    ax.yaxis.tick_right()
    plt.legend(loc="best")
    return


def visualize_droughts_uganda(data, model, year, season, selected_features,
                              label_name, path_to_shapefile='../', cmap='jet'):

    gdf_country = gpd.read_file(get_country_shapefile(path=path_to_shapefile,
                                                      country='Uganda',
                                                      admin_level=1), crs='')

    gdf_country.rename(columns={'ADM1_EN': 'District'}, inplace=True)
    gdf_country_points = gdf_country.copy()
    gdf_country_points['geometry'] = gdf_country_points.centroid

    part_data = data[(data.year == year) & (data.Season == season)].copy()
    part_data['score'] = (part_data[selected_features].values.dot(model.coef_.T)).ravel() + model.intercept_

    temp_1 = gdf_country[['District', 'geometry']].merge(part_data[['District',
                                                                    'score']],
                                                         on='District')
    temp_2 = gdf_country_points[['District', 'geometry']].merge(part_data[['District',
                                                                           label_name]],
                                                                on='District')
    temp_2 = temp_2[temp_2[label_name]]

    norm = colors.Normalize(vmin=-0.6, vmax=0.6)

    if not temp_2.empty:
        temp_2.plot(marker='*', color='white', markersize=200,
                    edgecolor="black", figsize=(6, 6))
        ax = plt.gca()
        geoplot.choropleth(temp_1, hue=temp_1['score'],
                           cmap=cmap, norm=norm, legend=True, ax=ax, zorder=0);
    else:
        geoplot.choropleth(temp_1, hue=temp_1['score'],
                           cmap=cmap, norm=norm, legend=True, zorder=0,
                           figsize=(6, 6));
    if season == '6_7':
        title = 'June-July ' + str(year)
    if season == '11_12':
        title = 'November-December ' + str(year)
    plt.title(title);

    return


def make_monitor_model(training_data, selected_features, label_name, C):
    reduced_data = reduce_data(training_data, label_name)

    X = reduced_data[selected_features]

    y = reduced_data[label_name]

    n_pos = len(y[y == True])
    n_neg = len(y[y == False])

    W_neg = (1.0 / n_neg)
    W_pos = (1.0 / n_pos)

    Weights = {True: W_pos, False: W_neg}

    monitor_model = LogisticRegression(C=C,
                                       class_weight=Weights,
                                       penalty='l1',
                                       fit_intercept=True,
                                       solver='liblinear',
                                       random_state=0)

    monitor_model.fit(X, y);

    return monitor_model

def prepare_dmp_data(path_to_DMP='./datasets/Uganda_DMP_data.csv'):

    dmp_data = pd.read_csv(path_to_DMP, index_col=False)
    dmp_data.date = pd.to_datetime(dmp_data.date, infer_datetime_format=True)
    dmp_data.rename(columns={'district': 'District'}, inplace=True)
    dmp_data['delta DMP'] = dmp_data.DMP.max() - dmp_data.DMP

    averaged_data = pd.DataFrame()
    groups = dmp_data.groupby('District')
    for name, group in groups:
        sorted_group = group[['date', 'delta DMP']].sort_values('date').reset_index(drop=True)
        averaged_group = sorted_group[['delta DMP']].rolling(window=3).mean()
        averaged_group['date'] = sorted_group['date']
        averaged_group['District'] = name
        averaged_group = averaged_group[['District', 'date', 'delta DMP']]
        averaged_group.dropna(inplace=True)
        averaged_data = pd.concat([averaged_data, averaged_group], axis=0)
    averaged_data.reset_index(inplace=True, drop=True)
    averaged_data['month'] = averaged_data['date'].dt.month
    averaged_data['year'] = averaged_data['date'].dt.year

    normal_dmp_data = normalize_data(dmp_data,
                                     ids_list=['District', 'year', 'month', 'date'],
                                     grouping=['District', 'month'])
    normal_dmp_data = normal_dmp_data[['District', 'year', 'month', 'date', 'delta DMP']]

    normal_dmp_data.sort_values(['District', 'year'], inplace=True)
    month_shift = 1
    normal_dmp_data = normal_dmp_data[['District', 'date', 'delta DMP']]
    normal_dmp_data['date'] = normal_dmp_data['date'] + pd.DateOffset(months=month_shift)

    return normal_dmp_data

def prepare_monitor_data(data, monitor_features, monitor_model,
                         date_col='date', district_col='District',
                         label_col=None,path_to_DMP=None,
                         path_to_shapefile='../'):

    data[date_col] = pd.to_datetime(data[date_col],
                                    infer_datetime_format=True)
    raw_data = data.copy()
    raw_data = raw_data[[date_col, district_col] + monitor_features]

    averaged_data = pd.DataFrame()
    groups = raw_data.groupby(district_col)
    for name, group in groups:
        sorted_group = group[[date_col] + monitor_features].sort_values('date').reset_index(drop=True)
        averaged_group = sorted_group[monitor_features].rolling(window=3).mean()
        averaged_group[date_col] = sorted_group[date_col]
        averaged_group[district_col] = name
        averaged_group = averaged_group[[district_col] + [date_col] + monitor_features]
        averaged_group.dropna(inplace=True)
        averaged_data = pd.concat([averaged_data, averaged_group], axis=0)

    averaged_data.reset_index(inplace=True, drop=True)
    averaged_data['month'] = averaged_data[date_col].dt.month
    averaged_data['year'] = averaged_data[date_col].dt.year

    normal_data = normalize_data(averaged_data,
                                     ids_list=[district_col, 'year', 'month', date_col],
                                     grouping=[district_col, 'month'])
    normal_data.sort_values([district_col, date_col], inplace=True)
    month_shift = 1
    normal_data = normal_data[[district_col] + [date_col] + monitor_features]
    normal_data['score'] = (normal_data[monitor_features].values.dot(
        monitor_model.coef_.T)).ravel() + monitor_model.intercept_
    normal_data['drought_predicted'] = normal_data['score'] > 0
    normal_data[date_col] = normal_data[date_col] + pd.DateOffset(months=month_shift)

    if label_col is not None:
        normal_data = normal_data.merge(data[[date_col,district_col, label_col]],
                                        on=[date_col,district_col])
    if path_to_DMP is not None:
        normal_dmp_data = prepare_dmp_data(path_to_DMP)
        normal_data = normal_data.merge(normal_dmp_data, on=[date_col,district_col], how='outer')

    gdf_country = gpd.read_file(get_country_shapefile(path=path_to_shapefile,
                                                      country='Uganda',
                                                      admin_level=1), crs='')
    gdf_country.rename(columns={'ADM1_EN': district_col}, inplace=True)
    gdf_country = gdf_country[[district_col,'geometry']]
    gdf_country['centroid'] = gdf_country.centroid

    normal_data = gdf_country.merge(normal_data,on=district_col)

    return normal_data



def monitor_plot(monitor_data, monitor_date,date_col='date',
                 label_col=None,cmap='jet'):

    month = monitor_date.month

    year = monitor_date.year

    select_date = date(year, month, 1).strftime("%Y-%m-%d")

    temp_1 = monitor_data[monitor_data[date_col] == select_date].copy()

    if (temp_1['score'].isna().sum() > 0) | (temp_1.empty):
        print('Data is not available.')
        return

    temp_2 = pd.DataFrame()

    if label_col is not None:
        temp_2 = temp_1.copy()
        temp_2['geometry'] = temp_2.centroid
        temp_2 = temp_2[temp_2[label_col]]

    norm = colors.Normalize(vmin=-0.6, vmax=0.6)

    if not temp_2.empty:
        temp_2.plot(marker='*', color='white', markersize=200,
                    edgecolor="black", figsize=(6, 6))
        ax = plt.gca()
        geoplot.choropleth(temp_1, hue=temp_1['score'],
                           cmap=cmap, norm=norm, legend=True, ax=ax, zorder=0);
    else:
        geoplot.choropleth(temp_1, hue=temp_1['score'],
                           cmap=cmap, norm=norm, legend=True, zorder=0,
                           figsize=(6, 6));

    plt.title(monitor_date.strftime("%B %Y"));

    return


def plot_score_DMP_correlation(monitor_data, district_col='District', cmap='jet'):

    corrs = []
    districts = []

    grouped = monitor_data[[district_col, 'score', 'delta DMP']].dropna().groupby(district_col)

    for name, group in grouped:
        corrs.append(group[['score', 'delta DMP']].corr().values[0, 1])
        districts.append(name)

    corr_data = pd.DataFrame()
    corr_data[district_col] = districts
    corr_data['Correlation'] = corrs

    corr_data = monitor_data[[district_col, 'geometry']].drop_duplicates().merge(corr_data, on=district_col)

    geoplot.choropleth(corr_data, hue=corr_data['Correlation'], cmap=cmap, legend=True)
    plt.title(r'Correlation between the drought score and normalized $\Delta$DMP')

    return corr_data

def monitor_plot_dmp(monitor_data, monitor_date, date_col='date', cmap='jet'):
    month = monitor_date.month

    year = monitor_date.year

    select_date = date(year, month, 1).strftime("%Y-%m-%d")

    temp = monitor_data[monitor_data[date_col] == select_date].copy()

    temp = temp[['geometry', 'score', 'delta DMP']].dropna()

    if (temp.empty):
        print('Data is not available.')
        return
    f, axs = plt.subplots(1, 2, figsize=(13, 6))

    norm1 = colors.Normalize(vmin=-0.6, vmax=0.6)
    geoplot.choropleth(temp, hue=temp['score'], cmap=cmap, norm=norm1, legend=True,ax=axs[0])
    axs[0].title.set_text('score (' + monitor_date.strftime("%B %Y") + ')')

    norm2 = colors.Normalize(vmin=-0.6, vmax=0.6)
    geoplot.choropleth(temp, hue=temp['delta DMP'], cmap=cmap, norm=norm2, legend=True,ax=axs[1])
    axs[1].title.set_text(r'normalized $\Delta$DMP (' + monitor_date.strftime("%B %Y") + ')')

    return


def plot_timeseries(data, district_name, variables=['score', 'delta DMP'], date_col='date', district_col='District'):
    data[data[district_col] == district_name].dropna().set_index(date_col)[variables].plot()
    cor = data[data[district_col] == district_name].dropna().set_index(date_col)[variables].corr().values[1,0]
    plt.title(district_name + ' - correlation: %' + str(int(round(cor, 2) * 100)));
    plt.legend(['score', r'normalized $\Delta$DMP'], bbox_to_anchor=(1.01, 1));
    return

def fit_random_model(y, p=0.5):
    Precision_Positive = []
    Precision_Negative = []
    Recall_Positive = []
    Recall_Negative = []
    F_score_Positive = []
    F_score_Negative = []

    for n in range(1000):
        scores = np.random.rand(len(y)) < p
        metrics = sklm.precision_recall_fscore_support(y, scores, labels=[True, False])
        Precision_Positive.append(metrics[0][0])
        Precision_Negative.append(metrics[0][1])
        Recall_Positive.append(metrics[1][0])
        Recall_Negative.append(metrics[1][1])
        F_score_Positive.append(metrics[2][0])
        F_score_Negative.append(metrics[2][1])

    metric_data = pd.DataFrame()
    metric_data['Precision_Positive'] = Precision_Positive
    metric_data['Precision_Negative'] = Precision_Negative
    metric_data['Recall_Positive'] = Recall_Positive
    metric_data['Recall_Negative'] = Recall_Negative
    metric_data['F_score_Positive'] = F_score_Positive
    metric_data['F_score_Negative'] = F_score_Negative

    metric_mean = metric_data.mean().round(2)
    metric_std = metric_data.std().round(2)

    cols = ['Precision', 'Recall', 'F_score']
    print('           Positive      Negative')
    for col in cols:
        sapace = ' ' * (9 - len(col))
        print(col + sapace + '  %6.2f' % metric_mean[col + '_Positive'] + '        %6.2f' % metric_mean[
            col + '_Negative'])

    return metric_mean, metric_std

'''
Helper Functions 
'''

def normalize_data(data, ids_list, grouping):
    grouped = data.groupby(grouping)
    normed_data = pd.DataFrame()
    Znorm = StandardScaler()
    colnames = list(data.drop(labels=ids_list, axis=1).columns)

    for name, group in grouped:
        group.reset_index(inplace=True, drop=True)
        temp = pd.DataFrame(Znorm.fit_transform(group[colnames]), columns=colnames)
        temp[ids_list] = group[ids_list]
        temp = temp[ids_list + colnames]
        normed_data = pd.concat([normed_data, temp])

    normed_data.reset_index(inplace=True, drop=True)

    return normed_data

def reduce_data(data, label_name):
    reduced_data = pd.DataFrame()

    for name, group in data.groupby('District'):
        drought_years = np.array(group[group[label_name]]['year'])
        keep_years = np.sort(np.unique(np.append(drought_years, [drought_years - 1, drought_years + 1])))
        temp = group[group.year.apply(lambda x: x in keep_years)].sort_values(by=['year', 'Season']).copy()
        reduced_data = pd.concat([reduced_data, temp])

    reduced_data.sort_values('year', inplace=True)
    reduced_data.reset_index(drop=True, inplace=True)

    return reduced_data

def weighted_fscore(y, y_pred):
    n_pos = len(y[y == True])
    n_neg = len(y[y == False])
    W_neg = (1.0 / n_neg) / (1.0 / n_pos + 1.0 / n_neg)
    W_pos = (1.0 / n_pos) / (1.0 / n_pos + 1.0 / n_neg)

    f_pos = sklm.f1_score(y, y_pred, pos_label=True, average='binary')
    f_neg = sklm.f1_score(y, y_pred, pos_label=False, average='binary')

    f_ave = W_pos * f_pos + W_neg * f_neg

    return f_ave


def positive_fscore(y, y_pred):
    f_pos = sklm.f1_score(y, y_pred, pos_label=True, average='binary')

    return f_pos

def get_country_shapefile(path='../', country='Uganda', admin_level=1):
    """
    get shapefile of given country
    """
    country_shapefile = {
            'Uganda': 'uga_admbnda_adm'+str(admin_level)+'_UBOS_v2.shp'
            }
    return str(path+'shapefiles/'+country+'/'+country_shapefile[country])