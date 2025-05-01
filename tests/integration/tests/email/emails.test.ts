import emailUgaDroughtTests from './drought/email-uga-drought.test';
import emailMwiFlashFloodTests from './flash-flood/email-mwi-flash-flood.test';
import emailSsdFloodsTests from './floods/email-ssd-floods.test';
import emailUgaFloodsTests from './floods/email-uga-floods.test';
import emailEthMalariaTests from './malaria/email-eth-malaria.test';
import emailPhlTyphoonTests from './typhoon/email-phl-typhoon.test';

export default function emailTests() {
  describe('emails', () => {
    emailUgaDroughtTests();
    emailEthMalariaTests();
    emailMwiFlashFloodTests();
    emailPhlTyphoonTests();
    emailSsdFloodsTests();
    emailUgaFloodsTests();
  });
}
