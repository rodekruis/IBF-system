'''
First version of simple drought monitor web-app.
(Misha + Diewertje)


Displays normalized value of drought indicator (DMP) for selected region (adm lvl 1)
'''

import dash
import dash_core_components as dcc
import dash_html_components as html
import h5py
import pandas as pd
import matplotlib.pylab as plt
from io import BytesIO
import base64
import geopandas as gpd
import geoplot as gplt

# --- File with DMP data  (HDF5 file used here. Keys are 'name of admin (pcode)')---
path = '/Volumes/BigData/RK_IBF_drought/DMP_Ethiopia/'
data_by_area = path + 'Ethiopia_DMP_by_area_adm1.hdf5'
data_by_time = path + 'Ethiopia_DMP_by_date_adm1_geopandas.gjson'


# --- useful functions ---
def get_admins(filename):
    AvailableKeys = []
    with h5py.File(filename, 'r') as f:
        for key in f.keys():
            AvailableKeys.append(key)
    return AvailableKeys

def get_dates(filename):
    gdf = gpd.read_file(data_by_time)
    return list(gdf['date'].unique())

# ---- have some of my favourite style settings here ---
colors = {'background': 'white','text': 'black'}


# --- the individual components / children that enter the app ---
Title = html.H1(
    children='Dry Matter Production Monitor',
    style={'textAlign': 'center','color': colors['text']}
)

# dropdown: select region for graph
def select_region(key_list):
    dropdown_options = [ {'label':reg , 'value':reg } for reg in key_list  ]
    Dropdown = dcc.Dropdown(
        id='region-dropdown',
        options=dropdown_options,
        value=key_list[0]
    )
    return Dropdown

# graph (updates based on dropdown)
DMP_Graph = dcc.Graph(id='DMP-graph')




# dropdown: select date to show map
def select_date(key_list):
    dropdown_options = [ {'label':date , 'value':date } for date in key_list  ]
    Dropdown = dcc.Dropdown(
        id='date-dropdown',
        options=dropdown_options,
        value=key_list[-1]    # default to 'today'
    )
    return Dropdown

# Choroleth (Geographical color map)
GeoMap = html.Img(id='GeoMap',src='')


#--- Dash app layout ----
app = dash.Dash()
app.layout = html.Div( style={'backgroundColor': colors['background']},
                       children=[Title,
                                 select_region(get_admins(data_by_area)),
                                 select_date(get_dates(data_by_time)),
                                 DMP_Graph,
                                 GeoMap])



# --- Interactivity -----
@app.callback(
    dash.dependencies.Output('DMP-graph', 'figure'),
    [dash.dependencies.Input('region-dropdown', 'value')])
def update_output(value):
    selected_data = pd.read_hdf(data_by_area, key=value)

    fig = {}
    fig['data'] = [{'x': pd.to_datetime(selected_data.date), 'y': selected_data['DMP_avg_normed']}]
    return fig


@app.callback(
    dash.dependencies.Output('GeoMap', 'src'),
    [dash.dependencies.Input('date-dropdown', 'value')])
def update_choropleth(value):

    gdf = gpd.read_file(data_by_time)
    gdf_date = gdf[gdf['date']==value]
    gplt.choropleth(gdf_date, hue='DMP_avg_normed')

    img = fig_to_uri(plt.gcf())
    return img








def fig_to_uri(in_fig, close_all=True, **save_args):
    # type: (plt.Figure) -> str
    """
    Save a figure as a URI
    :param in_fig:
    :return:
    """
    out_img = BytesIO()
    in_fig.savefig(out_img, format='png', **save_args)
    if close_all:
        in_fig.clf()
        plt.close('all')
    out_img.seek(0)  # rewind file
    encoded = base64.b64encode(out_img.read()).decode("ascii").replace("\n", "")
    return "data:image/png;base64,{}".format(encoded)



if __name__ == '__main__':
    app.run_server(debug=True)