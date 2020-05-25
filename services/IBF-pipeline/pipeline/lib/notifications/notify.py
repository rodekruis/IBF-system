from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from lib.notifications.sendNotification import EmailClient 
from lib.notifications.getFloodInfo import getFloodInfo 
from lib.notifications.formatInfo import formatInfo 
from lib.logging.logglySetup import logger
from secrets import MC_API
from secrets import MC_USER
from settings import EMAIL_NOTIFICATION, EMAIL_WITHOUT_TRIGGER, EMAIL_LIST_HARDCODE
from lib.sendMail.emailService import sendMail


def notify():
    if EMAIL_NOTIFICATION:
        the_client = EmailClient(MC_API, MC_USER)

        floodInfo = getFloodInfo()

        if floodInfo["flood"] or EMAIL_WITHOUT_TRIGGER:
            formattedInfo = formatInfo(floodInfo)
            the_client.sendNotification(formattedInfo)
            # msg = MIMEMultipart()
            # msg['Subject'] = formattedInfo['subject']
            # part = MIMEText(formattedInfo['html'], "html")
            # msg.attach(part)
            # sendMail(EMAIL_LIST_HARDCODE,msg.as_string())

    else:
        logger.info("Email notificatin are turned off")