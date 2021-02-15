import logging.config
import loggly.handlers

from settings import EMAIL_USERNAME, FROM_EMAIL
from settings import LOGGING_TO_EMAIL_ADDRRESSES
from settings import LOGGING
from settings import LOGGLY_LINK
from secrets import EMAIL_PASSWORD
import logging

logging.getLogger().setLevel(logging.INFO)
logging.basicConfig(filename='cron.log', level=logging.INFO)
# logging.config.fileConfig('python.conf')
# logger = logging.getLogger('myLogger')
if LOGGING:    
    logging.config.fileConfig('python.conf')
    logger = logging.getLogger('myLogger')
    smtp_handler = logging.handlers.SMTPHandler(mailhost=("smtp.office365.com", 587),
                                                fromaddr=FROM_EMAIL,
                                                toaddrs=LOGGING_TO_EMAIL_ADDRRESSES,
                                                subject=u"Critical error! Check: " + LOGGLY_LINK,
                                                credentials=(EMAIL_USERNAME, EMAIL_PASSWORD),
                                                secure=())

    smtp_handler.setLevel(logging.ERROR)
    logger.addHandler(smtp_handler)
else: 
    logger = logging.getLogger('myLogger')
