// REFACTOR: We will need to set this up differently going forward, not using enums for this.
export enum NoTriggerDataSet {
  NoTriggerScenario = 'no-trigger',
  DisasterType = 'floods', // Only 'floods' works for now
  CountryCode = 'UGA',
  CountryName = 'Uganda',
  UserMail = 'uganda@redcross.nl',
  UserPassword = 'password',
  firstName = 'Uganda',
  lastName = 'Manager',
}

export enum TriggerDataSet {
  TriggerScenario = 'trigger',
  DisasterType = 'floods', // Only 'floods' works for now
  CountryCode = 'UGA',
  CountryName = 'Uganda',
  UserMail = 'uganda@redcross.nl',
  UserPassword = 'password',
  firstName = 'Uganda',
  lastName = 'Manager',
}
// For now there are only floods
export const disasterTypeWithInactiveTimeline = ['floods'];

// NOTE: this is a first starting point of starting to work more with statically defined test data. Move this to separate const file.
export const ACTIVE_LAYERS: Record<string, string[]> = {
  floods: [
    'Glofas stations',
    // 'Community notifications', // This active layer does not come with any default (mock) data, so therefore ignore here
  ],
  drought: [
    // 'Community notifications', // This active layer does not come with any default (mock) data, so therefore ignore here
  ],
};
