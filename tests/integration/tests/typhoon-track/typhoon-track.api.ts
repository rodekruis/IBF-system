import { UploadTyphoonTrackDto } from '../../helpers/API-service/dto/upload-typhoon-track.dto';
import { api } from '../../helpers/utility.helper';

export function getTyphoonTrack(
  countryCodeISO3: string,
  eventName: string,
  token: string,
) {
  let query = {};

  if (eventName) {
    query = { eventName };
  }

  return api(token).get(`/typhoon-track/${countryCodeISO3}`).query(query);
}

export function postTyphoonTrack(
  uploadTyphoonTrackDto: UploadTyphoonTrackDto,
  token: string,
) {
  return api(token).post(`/typhoon-track`).send(uploadTyphoonTrackDto);
}
