import { EventsProcessDto } from '../../helpers/API-service/dto/events-process.dto';
import { DisasterType } from '../../helpers/API-service/enum/disaster-type.enum';
import { api } from '../../helpers/utility.helper';

export function getEvents(
  countryCodeISO3: string,
  disasterType: DisasterType,
  token: string,
) {
  return api(token).get(`/event/${countryCodeISO3}/${disasterType}`);
}

export function postSetTrigger(
  eventPlaceCodeIds: string[],
  countryCodeISO3: string,
  disasterType: DisasterType,
  noNotifications = true,
  token: string,
) {
  return api(token)
    .post(`/events/set-trigger`)
    .send({
      eventPlaceCodeIds,
      countryCodeISO3,
      disasterType,
      noNotifications,
    });
}

export function postEventsProcess(
  eventsProcessDto: EventsProcessDto,
  noNotifications: boolean,
  token: string,
) {
  return api(token)
    .post(`/events/process`)
    .query({ noNotifications })
    .send(eventsProcessDto);
}
