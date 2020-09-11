import codecs
from datetime import date


def formatInfo(info):

    htmlToday = str(date.today())
    htmlLeadTime = ''
    # affectedPopString = ": Estimate of exposed population: "
    stringList = []
    totalPopAffected3day = 0
    htmlList3 = \
        '<div> \
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
    subject3day = ''
    for districtInfo in info['data']:
        if districtInfo[2] == '3-day':
            htmlLeadTime = '3 days from today'
            affectedPopStr = str("{0:,.0f}".format(round(districtInfo[1])))
            stringDistrict = districtInfo[0]
            stringList.append(stringDistrict)
            htmlList3 += '<tr><td>' + districtInfo[0] + '</td><td>' + affectedPopStr + '</td><td>' + districtInfo[3] + '</td></tr>'
            totalPopAffected3day = totalPopAffected3day + districtInfo[1]
            subject3day = "Estimate of exposed population: " + str("{0:,.0f}".format(round(totalPopAffected3day))) + " (3-day). "
    htmlList3 += '</tbody></table>'
    if stringList == []:
        htmlList3 = ''

    totalPopAffected7day = 0
    stringList = []
    htmlList7 = \
        '<div> \
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
    subject7day = ''
    for districtInfo in info['data']:
        if districtInfo[2] == '7-day':
            if htmlLeadTime == '3 days from today':
                htmlLeadTime = '3 and 7 days from today'
            else:
                htmlLeadTime = '7 days from today'
            affectedPopStr = str("{0:,.0f}".format(round(districtInfo[1])))
            stringDistrict = districtInfo[0]
            stringList.append(stringDistrict)
            htmlList7 += '<tr><td>' + districtInfo[0] + '</td><td>' + affectedPopStr + '</td><td>' + districtInfo[3] + '</td></tr>'
            totalPopAffected7day = totalPopAffected7day + districtInfo[1]            
            subject7day = "Estimate of exposed population: " + str("{0:,.0f}".format(round(totalPopAffected7day))) + " (7-day). "
    htmlList7 += '</tbody></table>'
    if stringList == []:
        htmlList7 = ''
    
    file = codecs.open("lib/notifications/flood-trigger-notification.html", "r")
    theHtml = file.read()

    replacablePartToday = '(TODAY)'
    replacablePartLeadTime = '(LEAD-DATE)'
    replacablePart3day = '(TABLE-3-DAYS)'
    replacablePart7day = '(TABLE-7-DAYS)'

    
    # if totalPopAffected3day>0 or totalPopAffected7day>0:
    #     htmlWhatsapp="<br>You can join a WhatsApp group to communicate with others about the potential flood by clicking this link on your phone: https://chat.whatsapp.com/FH2hls1iOeNJF844L4cOjr"
    #     htmlGlofas="<br><br>* The alert class is based on the GLOFAS probability. GLOFAS produces 51 forecasts runs per stations daily. This probability is the percentage of these runs that exceeds the trigger level. Respective levels of 60%, 70% and 80% have been chosen as minimum, medium and maximum threshold."
    # else:
    #     htmlWhatsapp=""
    #     htmlGlofas=""
    # if totalPopAffected3day>0:
    #     htmlGlofasProb3="(Alert class* in brackets)"
    # else:
    #     htmlGlofasProb3=""
    # if totalPopAffected7day>0:
    #     htmlGlofasProb7="(Alert class* in brackets)"
    # else:
    #     htmlGlofasProb7=""

    newHtml = theHtml.replace(replacablePartToday, htmlToday) \
                    .replace(replacablePartLeadTime, htmlLeadTime) \
                    .replace(replacablePart3day, htmlList3) \
                    .replace(replacablePart7day, htmlList7)
                    # .replace(replacablePartWhatsapp, htmlWhatsapp) \
                    # .replace(replacablePartGlofas, htmlGlofas) \
                    # .replace(replacablePartGlofas3, htmlGlofasProb3) \
                    # .replace(replacablePartGlofas7, htmlGlofasProb7)

    subject = "Flood warning: " + subject3day + subject7day

    emailContent = {"subject": subject, "html": newHtml}
    return emailContent