import MalawiFlashFloodsTrigger from 'testData/MalawiFlashFloodsTrigger.json';
import { Dataset } from 'testData/types';
import UgandaDroughtWarning from 'testData/UgandaDroughtWarning.json';
import UgandaFloodsNoTrigger from 'testData/UgandaFloodsNoTrigger.json';
import UgandaFloodsTrigger from 'testData/UgandaFloodsTrigger.json';

export const datasets: Dataset[] = [
  UgandaFloodsNoTrigger,
  UgandaFloodsTrigger,
  // UgandaDroughtNoTrigger, // Disable until deemed valuable, as it is very similar to floods no-trigger
  UgandaDroughtWarning,
  // MalawiFlashFloodsNoTrigger, // Disable until deemed valuable, as it is very similar to floods no-trigger
  MalawiFlashFloodsTrigger,
];
