import pandas as pd
import plotly.graph_objects as go

def create_graph(fileName, indicator, region, trigger_lvl):
    # --- load in the correct dataset ---
    dataKey = '/'.join(['adm1',indicator])
    data = pd.read_hdf(fileName, key=dataKey)

    # --- select based on selected region ---
    selected_data = data[ data['area'] == region ]

    # --- the time-series ---
    figure = go.Scatter(x=pd.to_datetime(selected_data['date']),
                        y=selected_data[str(indicator)+'_normed'],
                        mode='lines',
                        marker={'color':"black"},
                        showlegend=False)

    # --- line indicating trigger-level ---
    first_date = list(pd.to_datetime(selected_data['date']))[0]
    last_date  = list(pd.to_datetime(selected_data['date']))[-1]

    trigger_lvl_line_props = {
        'type':"line",
        'yref':'y', 'y0':trigger_lvl, 'y1':trigger_lvl,
        'xref':'x', 'x0':first_date, 'x1':last_date,
        'line':dict(color="#ffeda0", width=3),
        'opacity':1.
    }

    # --- put together in the graph ---
    layout = {}
    layout['title'] = "Normalised {} over time for {}".format(indicator, region)
    layout['xaxis'] = {'title': ''}
    layout['yaxis'] = {'title': 'Normalised {}'.format(indicator)}
    layout['template'] = 'simple_white'
    layout['shapes'] = (trigger_lvl_line_props,)

    fig=go.Figure(figure, layout=layout)
    return fig









    pass
