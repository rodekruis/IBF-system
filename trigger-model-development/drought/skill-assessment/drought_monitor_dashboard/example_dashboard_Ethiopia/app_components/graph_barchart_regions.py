import numpy as np
import plotly.graph_objects as go
import pandas as pd

def create_graph(fileName, indicator, date, trigger_lvl):

    # --- load in the correct dataset ---
    dataKey = '/'.join(['adm1',indicator])
    data = pd.read_hdf(fileName, key=dataKey)

    # --- select based on selected date ---
    selected_data = data[ data['date'] == date ]

    # --- determine if values are above or below trigger level ---
    selected_data['alarm_trigger'] = selected_data[str(indicator)+ '_normed'] < trigger_lvl

    # -- the bar chart ---
    ConditionalColors = {'True':'red', 'False':'green'}
    figure = go.Bar(x=selected_data['area'],
                    y=selected_data[str(indicator) + '_normed'],
                    marker_color = [ConditionalColors[str(i)] for i in selected_data['alarm_trigger']],
                   showlegend = False
                    )

    # --- line indicating trigger-level ---
    trigger_lvl_line_props = {
        'type':"line",
        'yref':'y', 'y0':trigger_lvl, 'y1':trigger_lvl,
        'xref':'x', 'x0':-1, 'x1':len(selected_data)+1,
        'line':dict(color="#ffeda0", width=3),
        'opacity':1.
    }

    # --- put together in the graph ---
    layout = {}
    layout['title']  = "Normalized {} on {}".format(indicator, date)
    layout['xaxis'] = {'title':'area name'}
    layout['yaxis'] = {'title': 'Normalised {}'.format(indicator)}
    layout['template'] = 'simple_white'
    layout['shapes'] = (trigger_lvl_line_props,)

    fig = go.Figure(figure, layout=layout)
    return fig
