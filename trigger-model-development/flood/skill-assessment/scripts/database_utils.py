import sqlalchemy as db
import pandas as pd
import configparser
config = configparser.ConfigParser()
import datetime


def get_credentials(credentials_file='credentials.cfg'):
    """ get credentials (username, password) and database url from a config file
    """
    config.read(credentials_file)
    if 'credentials' not in config.keys():
        raise Exception('Config file (settings.cfg) wrongly formatted, need credentials')
    elif config['credentials']['username'] == '':
        raise Exception('Config file does not contain credentials to access database, '
                        'please obtain them on Bitwarden --> 510 - Azure - Postgresql Production Server '
                        'and add them to the config file (settings.cfg)')
    else:
        return config['credentials']['username'], config['credentials']['password'], config['credentials']['url']


def get_glofas_data(country='uganda',
                    return_type='csv',
                    credentials_file='credentials.cfg'):
    """ get glofas data of a country from database, return csv or xarray
    """

    username, password, url = get_credentials(credentials_file)

    engine = db.create_engine('postgresql://' + username
                              + ':' + password
                              + '@' + url.replace('http://', '') + '/cradatabase_staging')
    connection = engine.connect()

    metadata = db.MetaData()
    metadata.reflect(engine)

    country_lowercase = country.lower()

    if 'glofas_'+country_lowercase not in metadata.tables.keys():
        print('error: country not in database')
        return 0

    table = db.Table('glofas_'+country_lowercase, metadata, autoload=True, autoload_with=engine)
    query = db.select([table]).where(table.columns.time.between(datetime.date(2000, 1, 1), datetime.date(2019, 12, 1)))
    df = pd.DataFrame(connection.execute(query))

    df = df.rename(columns={0: 'lat', 1: 'lon', 2: 'time', 3: 'dis24'})
    df.set_index(['lat', 'lon', 'time'], inplace=True)

    if return_type == 'csv':
        return df
    elif return_type == 'xarray':
        return df.to_xarray()
    else:
        print('error: return_type is not known, valid types: csv, xarray')