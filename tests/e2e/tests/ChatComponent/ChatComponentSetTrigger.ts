import test from '@playwright/test';
import { Dataset } from 'testData/types';

import { UserRole } from '../../helpers/enum/user-role.enum';
import { Components, Pages } from '../../helpers/interfaces';
import { getAccessToken, updateUser } from '../../helpers/utility.helper';

export default (
  pages: Partial<Pages>,
  components: Partial<Components>,
  dataset: Dataset,
  date: Date,
) => {
  test('[34458] Set trigger (from warning)', async () => {
    const accessToken = await getAccessToken();
    const { dashboard, login } = pages;
    const { chat, userState, aggregates } = components;

    if (!dashboard || !chat || !userState || !aggregates || !login) {
      throw new Error('pages and components not found');
    }
    const localAdminRole = UserRole.LocalAdmin;
    const updatedData = { userRole: localAdminRole };

    const userUpdate = await updateUser(
      dataset.user.email,
      updatedData,
      accessToken,
    );
    console.log(userUpdate.body);

    await userState.logOut();
    await login.login(dataset.user.email, dataset.user.password);

    // Navigate to disaster type the data was mocked for
    await dashboard.navigateToDisasterType(dataset.disasterType.name);
    // Assertions
    await userState.headerComponentIsVisible(dataset);
    await dashboard.waitForLoaderToDisappear();
    await chat.chatColumnIsVisibleForTriggerState({
      user: dataset.user,
      date,
    });
    await chat.allDefaultButtonsArePresent();
    // Set trigger
    await chat.setTrigger('Warning');
  });
};
