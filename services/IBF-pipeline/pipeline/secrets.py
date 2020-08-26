# DB Settings
DB_SETTINGS_LOCAL = {
    "password": 'postgres',
    "host": 'host.docker.internal',
    "db": "geonode",
    "user": "postgres",
    "port": "5432"
}
DB_SETTINGS_REMOTE = {
    "password": 'g2mvc7z48z8p5eoy!',
    "host": 'geonode-database.postgres.database.azure.com',
    "db": "geonode",
    "user": "geonodeadmin@geonode-database",
    "port": "5432",
}
DB_SETTINGS = DB_SETTINGS_REMOTE # DB_SETTINGS_LOCAL / DB_SETTINGS_REMOTE

# MailChimp credentials
MC_API = "251cc2dcaa4b18a9b5100840af013b89-us18"
MC_USER = "IbfSystem"
LIST_ID = "e6cb95c6a4"

# Logging 
EMAIL_PASSWORD = "Room101!Chimp!"

# Glofas FTP
GLOFAS_USER = 'safer'
GLOFAS_PW = 'neo2008'

# Lizard (NOT USED CURRENTLY)
LIZARD_USER = ''
LIZARD_PW = ''

# Twilio (NOT USED CURRENTLY)
AUTH_TOKEN_TWILLIO = "your_authToken"
ACCOUNT_SID_TWILLIO = ""

