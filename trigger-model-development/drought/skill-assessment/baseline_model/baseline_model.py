# import necessary modules
import pandas as pd
from tqdm import tqdm
import datetime
import calendar
from fbprophet import Prophet
from forecasting_metrics import evaluate

# load Google Earth Engine data
data_directory = '../GoogleEarthEngine/data/'
data_filename = 'KE_ndvi_adm1.csv'
df = pd.read_csv(data_directory + data_filename)

# add column with date
def extract_date(x):
    d = str(x['Year']) + '-' + str(x['Month'])
    d += '-' + str(calendar.monthrange(x['Year'], x['Month'])[1])
    r = datetime.datetime.strptime(d, "%Y-%m-%d")
    return r
df['date'] = df.apply(extract_date, axis=1)

# train & test baseline model (fbprophet) with cross-validation
# see documentation at https://facebook.github.io/prophet/docs

metrics = ('mae', 'mse', 'smape') # evaluation metrics
train_periods = 48  # number of months over which to fit the data
test_periods = 1  # number of months to predict

# prepare data for fbprophet
df = df.rename(columns={'date': 'ds', 'ndvi_mean': 'y'})

# initialize dataframe to store results (evaluation metrics)
df_results = pd.DataFrame()

# loop over districts
for adm in tqdm(df.ADM1_EN.unique()):
    # select data from one district
    df_adm = df[df['ADM1_EN'] == adm]

    # define start & end time of train & test sets
    TimeTotal = len(df_adm)
    StartTimeTrain = len(df_adm) - train_periods - 3 #0 # begin from the first entry
    EndTimeTrain = StartTimeTrain + train_periods
    StartTimeTest = EndTimeTrain
    EndTimeTest = StartTimeTest + test_periods

    while EndTimeTest < TimeTotal:

        # prepare train & test sets
        df_to_fit = df_adm.iloc[StartTimeTrain:EndTimeTrain]
        df_to_test = df_adm.iloc[StartTimeTest:EndTimeTest]

        # initialize model, train & predict
        m = Prophet(weekly_seasonality=False,
                    daily_seasonality=False,
                    uncertainty_samples=0)
        m.fit(df_to_fit)
        future = m.make_future_dataframe(periods=test_periods, freq='M')
        forecast = m.predict(future)

        # prepare dataframe with test data & predictions
        df_result = pd.merge(df_to_test, forecast.iloc[-test_periods:], on='ds')

        # compute results (evaluation metrics)
        results = evaluate(df_result['y'], df_result['yhat'], metrics=metrics)

        # add metadata to results
        results['adm'] = df_result['ADM1_EN'].values[0]
        results['train_periods'] = train_periods
        results['test_periods'] = test_periods
        results['test_dates'] = df_to_test.ds.tolist()

        # store results
        df_results = df_results.append(results, ignore_index=True)

        StartTimeTrain += 1
        EndTimeTrain += 1
        StartTimeTest += 1
        EndTimeTest += 1

df_results.to_csv('results/baseline_model_results_' + data_filename)

