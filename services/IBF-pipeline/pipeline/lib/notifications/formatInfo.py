import codecs


def formatInfo(info):
    affectedPopString = ": Estimate of exposed population: "
    
    totalPopAffected3day = 0
    stringList = []
    for districtInfo in info['data']:
        if districtInfo[2] == '3-day':
            affectedPopStr = str("{0:,.0f}".format(round(districtInfo[1])))
            # glofasProb = ' (' + str(round(districtInfo[3]*100)) + '%)'
            glofasProb = ' (' + districtInfo[3] + ')'
            stringDistrict = districtInfo[0] + affectedPopString + affectedPopStr + glofasProb
            stringList.append(stringDistrict)
            totalPopAffected3day = totalPopAffected3day + districtInfo[1]
    htmlList3 = '<br>'.join(x for x in stringList)
    if stringList == []:
        htmlList3 = 'No flood warning'

    totalPopAffected7day = 0
    stringList = []
    for districtInfo in info['data']:
        if districtInfo[2] == '7-day':
            affectedPopStr = str("{0:,.0f}".format(round(districtInfo[1])))
            # glofasProb = ' (' + str(round(districtInfo[3]*100)) + '%)'
            glofasProb = ' (' + districtInfo[3] + ')'
            stringDistrict = districtInfo[0] + affectedPopString + affectedPopStr + glofasProb
            stringList.append(stringDistrict)
            totalPopAffected7day = totalPopAffected7day + districtInfo[1]
    htmlList7 = '<br>'.join(x for x in stringList)
    if stringList == []:
        htmlList7 = 'No flood warning'
    
    file = codecs.open("lib/notifications/floodRisk.html", "r")
    theHtml = file.read()
    replacablePart3day = "Section to replace 3-day"
    replacablePart7day = "Section to replace 7-day"
    replacablePartWhatsapp = "Section to replace Whatsapp"
    replacablePartGlofas = "Section to replace GLOFAS"
    replacablePartGlofas3 = "(replace-GLOFAS3)"
    replacablePartGlofas7 = "(replace-GLOFAS7)"
    
    if totalPopAffected3day>0 or totalPopAffected7day>0:
        htmlWhatsapp="<br>You can join a WhatsApp group to communicate with others about the potential flood by clicking this link on your phone: https://chat.whatsapp.com/FH2hls1iOeNJF844L4cOjr"
        htmlGlofas="<br><br>* The alert class is based on the GLOFAS probability. GLOFAS produces 51 forecasts runs per stations daily. This probability is the percentage of these runs that exceeds the trigger level. Respective levels of 60%, 70% and 80% have been chosen as minimum, medium and maximum threshold."
    else:
        htmlWhatsapp=""
        htmlGlofas=""
    if totalPopAffected3day>0:
        htmlGlofasProb3="(Alert class* in brackets)"
    else:
        htmlGlofasProb3=""
    if totalPopAffected7day>0:
        htmlGlofasProb7="(Alert class* in brackets)"
    else:
        htmlGlofasProb7=""
    newHtml = theHtml.replace(replacablePart3day, htmlList3) \
                    .replace(replacablePart7day, htmlList7) \
                    .replace(replacablePartWhatsapp, htmlWhatsapp) \
                    .replace(replacablePartGlofas, htmlGlofas) \
                    .replace(replacablePartGlofas3, htmlGlofasProb3) \
                    .replace(replacablePartGlofas7, htmlGlofasProb7)

    subject = "Flood warning: Estimate of exposed population: " + str("{0:,.0f}".format(round(totalPopAffected3day))) + " (3-day) / " + str("{0:,.0f}".format(round(totalPopAffected7day))) + " (7-day)"

    emailContent = {"subject": subject, "html": newHtml}
    return emailContent