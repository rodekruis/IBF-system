import { AreaOfFocus } from 'src/app/types/area-of-focus';

// ##TODO: exact same const as in back-end. Is this good practice? Better than via endpoint.
export const AREAS_OF_FOCUS: AreaOfFocus[] = [
  {
    id: 'drr',
    label: 'Disaster Risk Reduction',
    description:
      '(DRR) is a systematic approach to identifying, assessing and reducing the risks of disaster.<br><br>It aims to reduce socio-economic vulnerabilities to disaster as well as dealing with the environmental and other hazards that trigger them.',
    icon: 'Disaster risk reduction.svg',
  },
  {
    id: 'shelter',
    label: 'Shelter',
    description:
      'Shelter and Non-Food Items includes provision of shelter materials and non-food household item packages.<br><br>The theme also covers Camp Coordination and Camp Management.<br><br>Long-term/permanent reconstruction/rebuilding of housing is not covered by this area of focus.',
    icon: 'Shelter.svg',
  },
  {
    id: 'livelihood',
    label: 'Livelihoods & Basic Needs',
    description:
      "Disasters can take a devastating toll on people's food security livelihoods and their basic needs.<br><br>They can increase people's socio-economic vulnerability and seriously impact their ability to recover, which in turn affects their ability to cope with future shocks and stresses.<br><br>These actions are aimed at protecting these needs as preparation for forecasted hazards.",
    icon: 'Livelihood.svg',
  },
  {
    id: 'health',
    label: 'Health',
    description:
      'Health includes emergency medical services, equipment and supplies; reproductive health; psycho-social support; mobile medical clinics; and disease control and surveillance.',
    icon: 'Health.svg',
  },
  {
    id: 'wash',
    label: 'WASH',
    description:
      'Water, Sanitation, and Hygiene includes emergency provision of safe drinking water, hygiene and sanitation services, environmental sanitation and water supply, as well as hygiene promotion campaigns.',
    icon: 'Water-Sanitation-and-Hygiene.svg',
  },
  {
    id: 'inclusion',
    label: 'Protection, Gender and Inclusion',
    description:
      "People affected by disasters can have very different experiences.<br>A person's sex, gender identity, age, physical ability, race, nationality and many other factors can influence how they are vulnerable to, and affected by disasters, conflicts and crises. They can also affect how they respond and recover.<br><br>Emergencies can also make existing inequalities worse. This can be seen in the increase in incidences of sexual and gender-based violence (SGBV), violence against children and trafficking in human beings during and after emergencies.<br><ul><li><strong>Protection</strong> - addressing violence and keeping people safe from harm</li><li><strong>Gender and diversity</strong> - addressing discrimination and understanding people's different needs, risks and capacities</li><li><strong>Inclusion</strong> - actively addressing exclusion by meaningfully involving and engaging excluded people in our work</li></ul>",
    icon: 'Gender.svg',
  },
  {
    id: 'migration',
    label: 'Migration',
    description:
      'Migration and displacement pose some of the biggest humanitarian challenges of our time.<br><br>These actions are aimed at supporting people on the move with saving lives and preventing suffering, help people cope with the risks and challenges of migration and work to protect and restore their dignity.',
    icon: 'Internally-displaced.svg',
  },
];
