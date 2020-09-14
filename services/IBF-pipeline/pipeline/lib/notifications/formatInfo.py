import codecs
from datetime import date


def formatInfo(info, countryCode):

    today = str(date.today())

    if countryCode == "UGA":
        logo = "https://mcusercontent.com/e71f3b134823403aa6fe0c6dc/images/aca24765-1e55-44ce-b534-aa9e1b596a40.jpg"
        triggerStatement = "URCS will activate this EAP when GloFAS issues a forecast of at least <b>60% probability</b> (based on the different ensemble runs) <b>of a 5-year return period</b> flood occurring in flood prone districts, which will be anticipated to affect <b>more than 1,000hh</b>. The EAP will be triggered with a <b>lead time of 7 days</b> and a FAR of <b>not more than 0.5.</b>"
        linkDashboard = "http://ibf-system.westeurope.cloudapp.azure.com/overview"
        linkEAPSOP = "https://rodekruis.sharepoint.com/sites/510-CRAVK-510/_layouts/15/Doc.aspx?OR=teams&action=edit&sourcedoc={0FFAA5EF-423C-4F81-A51E-BEA98D06E91C}"
        linkWhatsApp = "https://web.whatsapp.com/"
    elif countryCode == "ZMB":
        logo = "https://mcusercontent.com/acdf2ad027e3073babce9067d/images/2d20901d-901d-4678-b32a-8facdb16bd82.png"
        triggerStatement = ""
        linkDashboard = "http://ibf-system.westeurope.cloudapp.azure.com/overview"
        linkEAPSOP = "https://docs.google.com/document/d/18SG6UklAYsY5EkVAINnZUH6D_tvry3Jh479mpVTehRU/edit?ts=5da1dba5#heading=h.gjdgxs"
        linkWhatsApp = "https://web.whatsapp.com/"
    else:
        logo = "https://mcusercontent.com/acdf2ad027e3073babce9067d/images/2d20901d-901d-4678-b32a-8facdb16bd82.png"
        triggerStatement = ""
        linkDashboard = "http://ibf-system.westeurope.cloudapp.azure.com/overview"
        linkEAPSOP = "https://google.com/"
        linkWhatsApp = "https://web.whatsapp.com/"

    leadTime = ""
    stringList = []
    totalPopAffected3day = 0
    table3Day = '<div> \
            <strong>Forecast 3 days from today:</strong> \
        </div> \
        <table class="notification-alerts-table"> \
            <thead> \
                <tr> \
                    <th>District</th> \
                    <th>Potentially Exposed Population</th> \
                    <th>Alert Level</th> \
                </tr> \
            </thead> \
            <tbody>'
    subject3day = ""
    for districtInfo in info["data"]:
        if districtInfo[2] == "3-day":
            leadTime = "3 days from today"
            affectedPopStr = str("{0:,.0f}".format(round(districtInfo[1])))
            stringDistrict = districtInfo[0]
            stringList.append(stringDistrict)
            table3Day += (
                "<tr><td>"
                + districtInfo[0]
                + "</td><td>"
                + affectedPopStr
                + "</td><td>"
                + districtInfo[3]
                + "</td></tr>"
            )
            totalPopAffected3day = totalPopAffected3day + districtInfo[1]
            subject3day = (
                "Estimate of exposed population: "
                + str("{0:,.0f}".format(round(totalPopAffected3day)))
                + " (3-day). "
            )
    table3Day += "</tbody></table>"
    if stringList == []:
        table3Day = ""

    totalPopAffected7day = 0
    stringList = []
    table7Day = '<div> \
            <strong>Forecast 7 days from today:</strong> \
        </div> \
        <table class="notification-alerts-table"> \
            <thead> \
                <tr> \
                    <th>District</th> \
                    <th>Potentially Exposed Population</th> \
                    <th>Alert Level</th> \
                </tr> \
            </thead> \
            <tbody>'
    subject7day = ""
    for districtInfo in info["data"]:
        if districtInfo[2] == "7-day":
            if leadTime == "3 days from today":
                leadTime = "3 and 7 days from today"
            else:
                leadTime = "7 days from today"
            affectedPopStr = str("{0:,.0f}".format(round(districtInfo[1])))
            stringDistrict = districtInfo[0]
            stringList.append(stringDistrict)
            table7Day += (
                "<tr><td>"
                + districtInfo[0]
                + "</td><td>"
                + affectedPopStr
                + "</td><td>"
                + districtInfo[3]
                + "</td></tr>"
            )
            totalPopAffected7day = totalPopAffected7day + districtInfo[1]
            subject7day = (
                "Estimate of exposed population: "
                + str("{0:,.0f}".format(round(totalPopAffected7day)))
                + " (7-day). "
            )
    table7Day += "</tbody></table>"
    if stringList == []:
        table7Day = ""

    file = codecs.open("lib/notifications/flood-trigger-notification.html", "r")
    htmlTemplate = file.read()

    placeholderToday = "(TODAY)"
    placeholderLeadTime = "(LEAD-DATE)"
    placeholderLogo = "(IMG-LOGO)"
    placeholderTable3Day = "(TABLE-3-DAYS)"
    placeholderTable7Day = "(TABLE-7-DAYS)"
    placeholderTriggerStatement = "(TRIGGER-STATEMENT)"
    placeholderLinkDashboard = "(LINK-DASHBOARD)"
    placeholderLinkEAPSOP = "(LINK-EAP-SOP)"
    placeholderLinkWhatsApp = "(LINK-WHATSAPP)"

    htmlEmail = (
        htmlTemplate.replace(placeholderToday, today)
        .replace(placeholderLeadTime, leadTime)
        .replace(placeholderLogo, logo)
        .replace(placeholderTable3Day, table3Day)
        .replace(placeholderTable7Day, table7Day)
        .replace(placeholderTriggerStatement, triggerStatement)
        .replace(placeholderLinkDashboard, linkDashboard)
        .replace(placeholderLinkEAPSOP, linkEAPSOP)
        .replace(placeholderLinkWhatsApp, linkWhatsApp)
    )

    subject = "Flood Warning: " + subject3day + subject7day

    emailContent = {"subject": subject, "html": htmlEmail}
    return emailContent
