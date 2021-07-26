from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib
import ssl

from lib.notifications.sendNotification import EmailClient
from lib.notifications.getFloodInfo import getFloodInfo
from lib.notifications.formatInfo import formatInfo
from lib.logging.logglySetup import logger
from secrets import MC_USER, MC_API, EMAIL_PASSWORD, SETTINGS_SECRET
from settings import EMAIL_WITHOUT_TRIGGER, EMAIL_HARDCODE, EMAIL_LIST_HARDCODE, EMAIL_USERNAME, FROM_EMAIL


def notify(countryCodeISO3):
    print(countryCodeISO3)
    if SETTINGS_SECRET[countryCodeISO3]["notify_email"]:
        floodInfo = getFloodInfo(countryCodeISO3)
        print(floodInfo)
        if floodInfo["flood"] or EMAIL_WITHOUT_TRIGGER:
            formattedInfo = formatInfo(floodInfo, countryCodeISO3)
            if not EMAIL_HARDCODE:
                mailchimpClient = EmailClient(MC_API, MC_USER)
                mailchimpClient.sendNotification(formattedInfo, countryCodeISO3)
            else:
                msg = MIMEMultipart()
                msg['Subject'] = formattedInfo['subject']
                part = MIMEText(formattedInfo['html'], "html")
                msg.attach(part)
                print(formattedInfo['html'])
                sendMailAlternative(EMAIL_LIST_HARDCODE, msg.as_string())

    else:
        logger.info("Email notificatin are turned off for this country")

def sendMailAlternative(receiver_email, message):
    # Requirements in order to send an email with smtp
    smtp_server = "smtp.office365.com"
    port = 587  # For starttls

    # Create a secure SSL context
    context = ssl.create_default_context()

    # Try to log in to server and send email
    try:
        server = smtplib.SMTP(smtp_server, port)
        server.ehlo() # Can be omitted
        server.starttls(context=context) # Secure the connection
        server.ehlo() # Can be omitted
        server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
        server.sendmail(FROM_EMAIL, receiver_email, message) #.as_string())
    except Exception as e:
        # Print any error messages to stdout
        print(e)
        logger.info(e)
    finally:
        server.quit()
