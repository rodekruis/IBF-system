import codecs
import os
from datetime import date


def formatInfo(info, countryCode):

    today = str(date.today())

    if countryCode == "UGA":
        logo = "https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/dc5401e1-26e4-494e-88dc-2fae4bd50c1f.png"
        triggerStatement = "URCS will activate this EAP when GloFAS issues a forecast of at least <b>60% probability</b> (based on the different ensemble runs) <b>of a 5-year return period</b> flood occurring in flood prone districts, which will be anticipated to affect <b>more than 1,000hh</b>. The EAP will be triggered with a <b>lead time of 7 days</b> and a FAR of <b>not more than 0.5.</b>"
        linkDashboard = os.getenv('DASHBOARD_URL')
        linkEAPSOP = "https://rodekruis.sharepoint.com/sites/510-CRAVK-510/_layouts/15/Doc.aspx?OR=teams&action=edit&sourcedoc={0FFAA5EF-423C-4F81-A51E-BEA98D06E91C}"
        linkWhatsApp = "https://chat.whatsapp.com/Jt7jMX3BydCD07MFExLUUs"
        adminAreaLabel = ['District','Districts']
    elif countryCode == "ZMB":
        logo = "https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/6d54577d-8f22-4a95-bc30-b86453f5188c.png"
        triggerStatement = "TBD"
        linkDashboard = os.getenv('DASHBOARD_URL')
        linkEAPSOP = "https://docs.google.com/document/d/18SG6UklAYsY5EkVAINnZUH6D_tvry3Jh479mpVTehRU/edit?ts=5da1dba5#heading=h.gjdgxs"
        linkWhatsApp = "https://chat.whatsapp.com/Ca2QYoYjKhyKm6zaZxOnin"
        adminAreaLabel = ['District','Districts']
    elif countryCode == "KEN":
        logo = "https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/905748b3-7aaf-4b5e-b5b9-516ad6f4105a.png"
        triggerStatement = "TBD"
        linkDashboard = os.getenv('DASHBOARD_URL')
        linkEAPSOP = "https://docs.google.com/document/d/1nEfCDx0aV0yBebIjeGHalXMAVUNM8XgR/"        
        linkWhatsApp = "https://chat.whatsapp.com/EbJ5kjSNlK018vkYwt5v5K/"
        adminAreaLabel = ['County','Counties']
    elif countryCode == "ETH":
        logo = "https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/eedbd97e-52c1-4a16-8155-9b607ad05ad2.png"
        triggerStatement = "TBD"
        linkDashboard = os.getenv('DASHBOARD_URL')
        linkEAPSOP = "https://docs.google.com/document/d/1IQy_1pWvoT50o0ykjJTUclVrAedlHnkwj6QC7gXvk98/"
        linkWhatsApp = "https://chat.whatsapp.com/Ibj8FcZwFxQLBcuMGUkrms/"
        adminAreaLabel = ['Zone','Zones']
    elif countryCode == "EGY":
        logo = "https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/899e677e-b673-4ab6-bcd2-8d51f996658d.png"
        triggerStatement = "TBD"
        linkDashboard = os.getenv('DASHBOARD_URL')
        linkEAPSOP = "https://google.com/"
        linkWhatsApp = "https://web.whatsapp.com/"
        adminAreaLabel = ['Governorate','Governorates']
    else:
        logo = "https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/c860a014-3405-48a1-ae68-25b8eb1b68e3.png"
        triggerStatement = "TBD"
        linkDashboard = os.getenv('DASHBOARD_URL')
        linkEAPSOP = "https://google.com/"
        linkWhatsApp = "https://web.whatsapp.com/"
        adminAreaLabel = ['District','Districts']

    leadTimes = ['3-day','5-day','7-day']
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
    placeholderLinkWhatsApp = "(LINK-WHATSAPP)"
    placeholderAdminAreaPlural = "(ADMIN-AREA-PLURAL)"
    placeholderAdminAreaSingular = "(ADMIN-AREA-SINGULAR)"

    htmlEmail = (
        htmlTemplate.replace(placeholderToday, today)
        .replace(placeholderLeadTime, leadTimeString + ' days from today')
        .replace(placeholderLogo, logo)
        .replace(placeholderTablesStacked, tables)
        .replace(placeholderTriggerStatement, triggerStatement)
        .replace(placeholderLinkDashboard, linkDashboard)
        .replace(placeholderLinkEAPSOP, linkEAPSOP)
        .replace(placeholderLinkWhatsApp, linkWhatsApp)
        .replace(placeholderAdminAreaSingular, adminAreaLabel[0].lower())
        .replace(placeholderAdminAreaPlural, adminAreaLabel[1].lower())
    )

    emailContent = {"subject": "Flood Warning: " + mainSubject, "html": htmlEmail}
    return emailContent
