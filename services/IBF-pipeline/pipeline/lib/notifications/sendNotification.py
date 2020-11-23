from mailchimp3 import MailChimp
import datetime
from secrets import LIST_ID, SEGMENT
from settings import FROM_EMAIL, FROM_EMAIL_NAME



class EmailClient(MailChimp):
 
    def sendNotification(self, emailContent, countryCode):
        self.countryCode = countryCode 
        title = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        campaign_data = self.populateCampaignData(LIST_ID, title, emailContent["subject"], "Flood")
        campaign = self.createCampaign(campaign_data)
        self.populateContent(campaign["id"], emailContent["html"])
        self.campaigns.actions.send(campaign["id"])


    def createCampaign(self, campaign_data):
        camp = self.campaigns.create(campaign_data)
        return camp

    
    def populateContent(self, campaign_id, body):
        data = { 
            "html" : body
        }
        result = self.campaigns.content.update(campaign_id=campaign_id, data=data)
        return result


    def populateCampaignData(self, list_id, title, subject, data, auto_tweet=False):
        campaign_data = {
            "settings": {
                "title": title,
                "subject_line": subject,
                "from_name": FROM_EMAIL_NAME,
                "reply_to": FROM_EMAIL,
                "data": data,
                "auto_tweet": auto_tweet
            },
            "recipients": {
                "list_id": list_id,
                "segment_opts": {
                    "saved_segment_id": SEGMENT[self.countryCode]
                }
            },
            "type": "regular"
        }
        return campaign_data