import codecs
import os
from datetime import date
from settings import SETTINGS


def formatInfo(info, countryCode):

    today = str(date.today())

    email_settings = SETTINGS[countryCode]['email']
    logo = email_settings['logo']
    triggerStatement = email_settings['triggerStatement']
    linkDashboard = email_settings['linkDashboard']
    linkEAPSOP = email_settings['linkEAPSOP']
    linkSocialMedia = email_settings['linkSocialMedia']
    adminAreaLabel = email_settings['adminAreaLabel']
    if SETTINGS[countryCode]['model'] == 'glofas':
        disasterType = 'Flood'
    elif SETTINGS[countryCode]['model'] == 'rainfall':
        disasterType = 'Heavy Rainfall'

    leadTimes = ['1-day','2-day','3-day','4-day','5-day','6-day','7-day','8-day','9-day','10-day']

    totalPopAffected = {}
    table = {}
    subject = {}
    for leadTime in leadTimes:

        leadTimeValue = leadTime[0]
        stringList = []
        totalPopAffected[leadTime] = 0
        table[leadTime] = '<div> \
                <strong>Forecast '+leadTimeValue+' days from today:</strong> \
            </div> \
            <table class="notification-alerts-table"> \
                <caption class="notification-alerts-table-caption">The following table lists all the exposed '+adminAreaLabel[1].lower()+' in order of exposed population,</caption> \
                <thead> \
                    <tr> \
                        <th align="left">'+adminAreaLabel[0]+'</th> \
                        <th align="center">Potentially Exposed Population</th> \
                        <th align="center">Alert Level</th> \
                    </tr> \
                </thead> \
                <tbody>'
        subject[leadTime] = ""
        
        for districtInfo in info["data"]:
            if districtInfo[2] == leadTime:
                affectedPopStr = str("{0:,.0f}".format(round(districtInfo[1])))
                stringDistrict = districtInfo[0]
                stringList.append(stringDistrict)
                table[leadTime] += (
                    "<tr><td align='left'>"
                    + districtInfo[0]
                    + "</td><td align='center'>"
                    + affectedPopStr
                    + "</td><td align='center'>"
                    + districtInfo[3]
                    + "</td></tr>"
                )
                totalPopAffected[leadTime] = totalPopAffected[leadTime] + districtInfo[1]
                subject[leadTime] = (
                    "Estimate of exposed population: "
                    + str("{0:,.0f}".format(round(totalPopAffected[leadTime])))
                    + " ("+leadTime+"). "
                )
        table[leadTime] += "</tbody></table>"
        if stringList == []:
            table[leadTime] = ""

    tables = ""
    mainSubject = ""
    leadTimeString = ""
    for leadTime in leadTimes:
        if table[leadTime] != "":
            tables = tables + table[leadTime]+'<br>'
            mainSubject = mainSubject + subject[leadTime]
            if leadTimeString == "":
                leadTimeString = leadTime[0]
            else:
                leadTimeString = leadTimeString + ' and ' + leadTime[0]

    file = codecs.open("lib/notifications/flood-trigger-notification.html", "r")
    htmlTemplate = file.read()

    placeholderToday = "(TODAY)"
    placeholderLeadTime = "(LEAD-DATE)"
    placeholderLogo = "(IMG-LOGO)"
    placeholderTablesStacked = "(TABLES-stacked)"
    placeholderTriggerStatement = "(TRIGGER-STATEMENT)"
    placeholderLinkDashboard = "(LINK-DASHBOARD)"
    placeholderLinkEAPSOP = "(LINK-EAP-SOP)"
    placeholderLinkSocialMedia = "(SOCIAL-MEDIA-LINK)"
    placeholderTypeSocialMedia = "(SOCIAL-MEDIA-TYPE)"
    placeholderAdminAreaPlural = "(ADMIN-AREA-PLURAL)"
    placeholderAdminAreaSingular = "(ADMIN-AREA-SINGULAR)"
    placeholderDisasterType = "(DISASTER-TYPE)"

    htmlEmail = (
        htmlTemplate.replace(placeholderToday, today)
        .replace(placeholderLeadTime, leadTimeString + ' days from today')
        .replace(placeholderLogo, logo)
        .replace(placeholderTablesStacked, tables)
        .replace(placeholderTriggerStatement, triggerStatement)
        .replace(placeholderLinkDashboard, linkDashboard)
        .replace(placeholderLinkEAPSOP, linkEAPSOP)
        .replace(placeholderLinkSocialMedia, linkSocialMedia['url'])
        .replace(placeholderTypeSocialMedia, linkSocialMedia['type'])
        .replace(placeholderAdminAreaSingular, adminAreaLabel[0].lower())
        .replace(placeholderAdminAreaPlural, adminAreaLabel[1].lower())
        .replace(placeholderDisasterType, disasterType)
    )

    emailContent = {"subject": disasterType + " Warning: " + mainSubject, "html": htmlEmail}
    return emailContent
