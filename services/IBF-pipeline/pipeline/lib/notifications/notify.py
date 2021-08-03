from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import ssl

from lib.notifications.sendNotification import EmailClient
from lib.notifications.getFloodInfo import getFloodInfo
from lib.notifications.formatInfo import formatInfo
from lib.logging.logglySetup import logger
from secrets import MC_USER, MC_API, SETTINGS_SECRET
from settings import EMAIL_WITHOUT_TRIGGER


def notify(countryCodeISO3):
    if SETTINGS_SECRET[countryCodeISO3]["notify_email"]:
        floodInfo = getFloodInfo(countryCodeISO3)
        if floodInfo["flood"] or EMAIL_WITHOUT_TRIGGER:
            formattedInfo = formatInfo(floodInfo, countryCodeISO3)
            mailchimpClient = EmailClient(MC_API, MC_USER)
            mailchimpClient.sendNotification(formattedInfo, countryCodeISO3)

    else:
        logger.info("Email notifications are turned off for this country")
