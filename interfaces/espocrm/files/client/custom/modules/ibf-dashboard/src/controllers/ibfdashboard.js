define(['controller'], (Controller) => {

    return class extends Controller {

        defaultAction = 'index'

        actionIndex() {
            // This renders the main IBF Dashboard page
            this.main('ibf-dashboard:views/ibfdashboard', {
                title: 'IBF Dashboard'
            });
        }

        actionAdmin() {
            // This renders the admin settings page
            this.main('ibf-dashboard:views/admin/ibf', {
                title: 'IBF Settings'
            });
        }
    }
});
