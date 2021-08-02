import codecs
import os
from datetime import date
from settings import SETTINGS


def formatInfo(info, countryCodeISO3):

    today = str(date.today())

    placeholderToday = "(TODAY)"
    placeholderLeadTimeList = "(LEAD-DATE-LIST)"
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
    placeholderLinks = "(VIDEO-PDF-LINKS)"

    email_settings = SETTINGS[countryCodeISO3]['email']
    logo = email_settings['logo']
    triggerStatement = email_settings['triggerStatement']
    linkDashboard = email_settings['linkDashboard']
    linkEAPSOP = email_settings['linkEAPSOP']
    linkVideo = email_settings['linkVideo']
    linkPdf = email_settings['linkPdf']

    linkSocialMedia = email_settings['linkSocialMedia']
    adminAreaLabel = email_settings['adminAreaLabel']
    if SETTINGS[countryCodeISO3]['model'] == 'glofas':
        disasterType = 'Flood'
    elif SETTINGS[countryCodeISO3]['model'] == 'rainfall':
        disasterType = 'Heavy Rain'

    leadTimes = ['1-day','2-day','3-day','4-day','5-day','6-day','7-day','8-day','9-day','10-day']

    totalPopAffected = {}
    table = {}
    subject = {}
    for leadTime in leadTimes:

        leadTimeValue = leadTime[0]
        stringList = []
        totalPopAffected[leadTime] = 0
        table[leadTime] = '<div> \
                <strong>Forecast ' + leadTimeValue + ' days from today (' + placeholderToday + '):</strong> \
            </div> \
            <table class="notification-alerts-table"> \
                <caption class="notification-alerts-table-caption">The following table lists all the exposed '+adminAreaLabel[1].lower()+' in order of exposed population,</caption> \
                <thead> \
                    <tr> \
                        <th align="center">Potentially Exposed Population</th> \
                        <th align="left">'+adminAreaLabel[0]+'</th> \
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
                    "<tr class='notification-alerts-table-row'>"
                    + "<td align='center'>" + affectedPopStr + "</td>"
                    + "<td align='left'>" + districtInfo[0] + "</td>"
                    + "<td align='center'>" + districtInfo[3] + "</td>"
                    + "</tr>"
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
    leadTimeListHTML = ""
    for leadTime in leadTimes:
        if table[leadTime] != "":
            tables = tables + table[leadTime]+'<br>'
            mainSubject = mainSubject + subject[leadTime]
            leadTimeListHTML = leadTimeListHTML + "<li>" + leadTime[0] + " days from today</li>"

    if len(leadTimeListHTML) < 1:
        leadTimeListHTML = "<li>No days from today</li>"


    linkVideoHTML = f"""
                    <a
                        href="{linkVideo}"
                        title="Video instructions"
                        target="_blank"
                        style="
                        font-size: 14px;
                        font-family: Helvetica,
                            Arial,
                            sans-serif;
                        font-weight: bold;
                        color: #0c0c0c;
                        display: inline-block;
                    " >
                        here
                    </a>
    """
    linkPdfHTML = f"""
                     <a href="{linkPdf}"
                        target="_blank"
                        title="PDF instructions"
                        style="
                        font-size: 14px;
                        font-family: Helvetica,
                            Arial,
                            sans-serif;
                        font-weight: bold;
                        color: #0c0c0c;
                        display: inline-block;
                        "  >
                        here
                    </a>
    """
    videoStr = ""
    if len(linkVideo) > 0:
        videoStr = 'Video' + linkVideoHTML

    pdfStr = ""
    if len(linkPdf) > 0:
        pdfStr = 'PDF' + linkPdfHTML

    andStr = ""
    pdfAndVideoLinks = ""
    if len(linkPdf) > 0 and len(linkVideo) > 0:
        andStr = 'and'

    if len(linkPdf) > 0 or len(linkVideo) > 0:
        pdfAndVideoLinks = f"""
                        See instructions for the dashboard in the form of a
                        {videoStr}
                        {andStr}
                        {pdfStr}
        """

    file = codecs.open("lib/notifications/flood-trigger-notification.html", "r")
    htmlTemplate = file.read()

    htmlEmail = (
        htmlTemplate
        .replace(placeholderLeadTimeList, leadTimeListHTML)
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
        .replace(placeholderToday, today)
        .replace(placeholderLinks, pdfAndVideoLinks)
    )

    emailContent = {"subject": disasterType + " Warning: " + mainSubject, "html": htmlEmail}
    return emailContent
