import h5py
import pandas as pd
import dash_core_components as dcc


# -- user selections ---
def create_dropdown(key_list, id):
    dropdown_options = [{'label': key, 'value': key} for key in key_list]
    Dropdown = dcc.Dropdown(
        id=id,
        options=dropdown_options,
        value=key_list[-1]     # the 'initial' or 'default' at startup
    )
    return Dropdown


def slider_trigger_lvl(id):
    slider=dcc.Slider(
            min=-2,
            max=2,
            step=0.1,
            marks={ -2: '-2',
                    -1: '-1',
                    0: '0',
                    1: '1',
                    2: '2'},
            value=0,     # the 'initial' or 'default' at startup
            id=id)
    return slider




# --- utils ---
def get_available_regions_dates(fileName, indicator):
    dataKey = '/'.join(['adm1', indicator])
    df = pd.read_hdf(fileName, key=dataKey)
    dateList = list(df['date'].unique())
    regionList = list(df['area'].unique())
    return  dateList, regionList


def get_available_indicators(fileName):
    indicatorList = []
    with h5py.File(fileName, 'r') as f:
        for ind in f['adm1'].keys():
            indicatorList.append(ind)
    return indicatorList

