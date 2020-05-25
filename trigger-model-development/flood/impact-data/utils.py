import re
from xmlutils.xml2csv import xml2csv
import pandas as pd
import os
import calendar


def sum_cols(x, col1, col2):
    try:
        return x[col1]+x[col2]
    except:
        return x[col1]


def emdat_clean_transform(input, output, country_iso):
    """
    emdat_clean_transform

    Simple script that maps EM-DAT data (.xlsx) into IBF-system format

    Parameters
    ----------
    input : str
        name of input file (.xlsx)
    output : str
        name of output file (.csv)
    """

    # load EM-DAT data
    df = pd.read_excel(input, skiprows=6)

    # filter on country
    df = df[df['ISO'].str.lower() == country_iso]

    # change some column names
    dict_columns = {'Disaster Type': 'disaster_type',
                    'Disaster Subtype': 'comments',
                    'Location': 'location',
                    'Total Deaths': 'people_dead',
                    'No Injured': 'people_injured',
                    'No Affected': 'people_affected'}
    df = df.rename(columns=dict_columns)
    df['disaster_type'] = df['disaster_type'].str.lower()

    # parse start and end date
    df = df.rename(columns={'Start Year': 'year', 'Start Month': 'month', 'Start Day': 'day'})
    for ix, row in df.iterrows():
        if pd.isna(row['day']) and not pd.isna(row['month']):
            df.at[ix, 'day'] = 1
    df['start_date_event'] = pd.to_datetime(df[['year', 'month', 'day']], errors='coerce')
    df = df.drop(columns=['year', 'month', 'day'])
    df = df.rename(columns={'End Year': 'year', 'End Month': 'month', 'End Day': 'day'})
    for ix, row in df.iterrows():
        if pd.isna(row['day']) and not pd.isna(row['month']):
            try:
                df.at[ix, 'day'] = calendar.monthrange(int(row['year']), int(row['month']))[1]
            except:
                pass
        elif pd.isna(row['day']) and pd.isna(row['month']) and not pd.isna(row['start_date_event']):
            try:
                df.at[ix, 'month'] = row['start_date_event'].month
                df.at[ix, 'day'] = calendar.monthrange(int(row['start_date_event'].year),
                                                       int(row['start_date_event'].month))[1]
            except:
                pass
    df['end_date_event'] = pd.to_datetime(df[['year', 'month', 'day']], errors='coerce')
    df = df.drop(columns=['year', 'month', 'day'])
    df['date_event'] = df['start_date_event'] + (df['end_date_event'] - df['start_date_event'])/2

    for col in df.columns:
        if col not in dict_columns.values() and col not in ['start_date_event', 'end_date_event', 'date_event']:
            df = df.drop(columns=[col])

    df['data_source'] = 'EM-DAT'
    df['data_source_url'] = 'https://www.emdat.be/'
    df.to_csv(output)

    return df

def desinventar_clean_transform(input, output):
    """
    desinventar_clean_transform

    Simple script that maps desinventar databases (.xml) into IBF-system format

    Parameters
    ----------
    input : str
        name of input file (.xml)
    output : str
        name of output file (.csv)
    """

    # read DesInventar data and filter
    with open(input, 'r', encoding="utf8") as file:
        data = file.read()
    events = re.search('(?:<fichas>)[\s,\S]+(?:<\/fichas>)', data).group(0)
    with open('raw_data/xml_temp.xml', 'w', encoding='utf8') as file:
        file.write(events)

    # fix encoding and save as csv
    converter = xml2csv("raw_data/xml_temp.xml", "raw_data/{}.csv".format(input.split('/')[-1].split('.')[0]),
                        encoding="utf8")
    converter.convert(tag="TR")
    os.remove("raw_data/xml_temp.xml")

    # read DesInventar data as csv
    df = pd.read_csv("raw_data/{}.csv".format(input.split('/')[-1].split('.')[0]))

    # change some column names
    dict_columns = {'serial': 'x',
                    'level0': 'adm1_pcode',
                    'level1': 'adm2_pcode',
                    'level2': 'adm3_pcode',
                    'name0': 'adm1_name',
                    'name1': 'adm2_name',
                    'name2': 'adm3_name',
                    'evento': 'disaster_type',
                    'lugar': 'location',
                    'fechano': 'year',
                    'fechames': 'month',
                    'fechadia': 'day',
                    'muertos': 'people_dead',
                    'heridos': 'people_injured',
                    'desaparece': 'missing',
                    'afectados': 'people_affected',
                    'vivdest': 'house_destroyed',
                    'vivafec': 'house_damaged',
                    'fuentes': 'data_source_other',
                    'valorloc': 'x',
                    'valorus': 'x',
                    'fechapor': 'x',
                    'fechafec': 'date_recorded',
                    'hay_muertos': 'x',
                    'hay_heridos': 'x',
                    'hay_deasparece': 'x',
                    'hay_afectados': 'x',
                    'hay_vivdest': 'x',
                    'hay_vivafec': 'x',
                    'hay_otros': 'x',
                    'otros': 'x',
                    'socorro': 'x',
                    'salud': 'hospital_health_center',
                    'educacion': 'school',
                    'agropecuario': 'agriculture',
                    'industrias': 'industry',
                    'acueducto': 'aqueduct',
                    'alcantarillado': 'sewerage_latrine',
                    'energia': 'energy',
                    'comunicaciones': 'communication',
                    'causa': 'x',
                    'descausa': 'x',
                    'transporte': 'road',
                    'magnitud2': 'x',
                    'nhospitales': 'x',
                    'nescuelas': 'x',
                    'nhectareas': 'lost_crops_ha',
                    'cabezas': 'livestock_lost',
                    'kmvias': 'x',
                    'duracion': 'x',
                    'damnificados': 'x',
                    'evacuados': 'evacuated',
                    'hay_damnificados': 'x',
                    'hay_evacuados': 'x',
                    'hay_reubicados': 'x',
                    'reubicados': 'people_displaced',
                    'clave': 'x',
                    'glide': 'disaster_id',
                    'defaultab': 'x',
                    'approved': 'x',
                    'latitude': 'x',
                    'longitude': 'x',
                    'uu_id': 'x',
                    'di_comments': 'comments'}
    df = df.rename(columns=dict_columns)
    df['disaster_type'] = df['disaster_type'].str.lower()

    # convert some variables to to int
    var_to_int = ['adm1_pcode', 'adm2_pcode', 'adm3_pcode', 'evacuated', 'people_affected', 'people_dead', 'missing']
    df[var_to_int] = df[var_to_int].astype(int, errors='ignore')

    # merge some variables
    df['people_affected'] = df.apply(lambda x: sum_cols(x, 'people_affected', 'evacuated'), axis=1)
    df['people_dead'] = df.apply(lambda x: sum_cols(x, 'people_dead', 'missing'), axis=1)
    df = df.drop(columns=['x', 'evacuated', 'missing'])

    df['data_source'] = 'DesInventar'
    df['data_source_url'] = 'https://www.desinventar.net'
    df['date_event'] = pd.to_datetime(df[['year', 'month', 'day']], errors='coerce')
    df = df.drop(columns=['year', 'month', 'day'])
    df.to_csv(output)

    return df