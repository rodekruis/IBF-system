import smtplib
import ssl

from settings import EMAIL_USERNAME, FROM_EMAIL
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from secrets import EMAIL_PASSWORD
from lib.logging.logglySetup import logger


# sender_email has to be a gmail adres for this script to work!
def createMessage(content):
        # Defining the message
    message = MIMEMultipart("alternative")
    message["Subject"] = "GloFAS data call failed"
    message["From"] = FROM_EMAIL
    

    html = """\
    <!DOCTYPE html>
    <html>
        <body>
            <p>
            Error email when GloFAS data call fails.
            </p>
        </body>
    </html>
    """

    message.attach(MIMEText(html, "html"))

    return message

def sendMail(receiver_email, message):
    #message["To"] = receiver_email
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