define(['view'], function (View) {

    return class extends View {

        template = 'ibf-dashboard:admin/ibf'

        events = {
            'click [data-action="save"]': 'save',
            'click [data-action="cancel"]': 'cancel',
            'click [data-action="select-user"]': 'selectUser',
            'click [data-action="clear-user"]': 'clearUser'
        }

        setup() {
            console.log('IBF Settings: View setup started');
            
            // Check admin permissions before setting up the view
            if (!this.getUser().isAdmin()) {
                console.warn('IBF Settings: User is not admin, showing access denied');
                this.template = 'ibf-dashboard:admin/access-denied';
                return;
            }
            
            console.log('IBF Settings: User is admin, loading settings');
            this.loadIBFSettings();
            
            // Add debugging for event binding
            this.once('after:render', () => {
                console.log('IBF Settings: View rendered, checking save button');
                const saveButton = this.$el.find('[data-action="save"]');
                console.log('IBF Settings: Save button found:', saveButton.length > 0);
                if (saveButton.length > 0) {
                    console.log('IBF Settings: Save button element:', saveButton[0]);
                    
                    // Manually bind click event as backup
                    saveButton.on('click', (e) => {
                        console.log('IBF Settings: Manual click handler triggered');
                        e.preventDefault();
                        this.save();
                    });
                }
            });
        }

        loadIBFSettings() {
            const self = this;
            
            console.log('IBF Settings: Loading settings via GET request to IBFDashboard/action/getSettings');
            
            // Use EspoCRM's ajax helper correctly
            Espo.Ajax.getRequest('IBFDashboard/action/getSettings').then(function (response) {
                console.log('IBF Settings: GET request successful', response);
                if (response.settings) {
                    self.settings = response.settings;
                    console.log('IBF Settings: Loaded settings:', self.settings);
                }
                if (response.availableCountries) {
                    self.availableCountries = response.availableCountries;
                }
                if (response.availableDisasterTypes) {
                    self.availableDisasterTypes = response.availableDisasterTypes;
                }
                if (response.availableUsers) {
                    self.availableUsers = response.availableUsers;
                }
                if (response.ibfUserInfo) {
                    self.ibfUserInfo = response.ibfUserInfo;
                    console.log('IBF Settings: IBF User info:', self.ibfUserInfo);
                }
                self.reRender();
            }).catch(function (err) {
                console.error('IBF Settings: GET request failed', err);
                Espo.Ui.error(self.translate('Access denied'));
                console.error('Failed to load IBF settings:', err);
            });
        }

        data() {
            const settings = this.settings || {};
            
            // Prepare country options with selection status
            const countryOptions = [
                {code: 'ETH', name: 'Ethiopia', selected: (settings.ibfEnabledCountries || []).includes('ETH')},
                {code: 'UGA', name: 'Uganda', selected: (settings.ibfEnabledCountries || []).includes('UGA')},
                {code: 'ZMB', name: 'Zambia', selected: (settings.ibfEnabledCountries || []).includes('ZMB')},
                {code: 'KEN', name: 'Kenya', selected: (settings.ibfEnabledCountries || []).includes('KEN')},
                {code: 'MWI', name: 'Malawi', selected: (settings.ibfEnabledCountries || []).includes('MWI')},
                {code: 'SSD', name: 'South Sudan', selected: (settings.ibfEnabledCountries || []).includes('SSD')},
                {code: 'PHL', name: 'Philippines', selected: (settings.ibfEnabledCountries || []).includes('PHL')},
                {code: 'ZWE', name: 'Zimbabwe', selected: (settings.ibfEnabledCountries || []).includes('ZWE')},
                {code: 'LSO', name: 'Lesotho', selected: (settings.ibfEnabledCountries || []).includes('LSO')}
            ];
            
            // Prepare default country options
            const defaultCountryOptions = countryOptions.map(country => ({
                ...country,
                selected: settings.ibfDefaultCountry === country.code
            }));
            
            // Prepare disaster type options
            const disasterTypeOptions = [
                {code: 'drought', name: 'Drought', selected: (settings.ibfDisasterTypes || []).includes('drought')},
                {code: 'floods', name: 'Floods', selected: (settings.ibfDisasterTypes || []).includes('floods')},
                {code: 'heavy-rainfall', name: 'Heavy Rainfall', selected: (settings.ibfDisasterTypes || []).includes('heavy-rainfall')},
                {code: 'typhoon', name: 'Typhoon', selected: (settings.ibfDisasterTypes || []).includes('typhoon')},
                {code: 'malaria', name: 'Malaria', selected: (settings.ibfDisasterTypes || []).includes('malaria')},
                {code: 'flash-floods', name: 'Flash Floods', selected: (settings.ibfDisasterTypes || []).includes('flash-floods')}
            ];
            
            // Find admin user name if ID is set
            let adminUserName = '';
            if (settings.ibfAdminUserId && this.availableUsers) {
                const adminUser = this.availableUsers.find(user => user.id === settings.ibfAdminUserId);
                if (adminUser) {
                    adminUserName = adminUser.name;
                }
            }
            
            // Prepare IBF user information
            const ibfUserInfo = this.ibfUserInfo || {};
            
            return {
                settings: settings,
                countryOptions: countryOptions,
                defaultCountryOptions: defaultCountryOptions,
                disasterTypeOptions: disasterTypeOptions,
                availableCountries: this.availableCountries || [],
                availableDisasterTypes: this.availableDisasterTypes || [],
                adminUserName: adminUserName,
                ibfUserInfo: ibfUserInfo
            };
        }

        save() {
            console.log('IBF Settings: Save button clicked - START OF METHOD');
            
            const form = this.$el.find('form')[0];
            if (!form) {
                console.error('IBF Settings: Form not found');
                return;
            }
            
            if (!form.checkValidity()) {
                console.log('IBF Settings: Form validation failed');
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const settings = {};
            
            console.log('IBF Settings: Collecting form data...');
            for (let [key, value] of formData.entries()) {
                console.log(`IBF Settings: Form field ${key} = ${value}`);
                if (key.endsWith('[]')) {
                    // Handle multi-select fields
                    const realKey = key.slice(0, -2);
                    if (!settings[realKey]) settings[realKey] = [];
                    settings[realKey].push(value);
                } else {
                    settings[key] = value;
                }
            }
            
            // Handle checkboxes that might not be in FormData if unchecked
            const checkboxes = this.$el.find('input[type="checkbox"]');
            checkboxes.each((i, checkbox) => {
                if (!formData.has(checkbox.name)) {
                    settings[checkbox.name] = false;
                }
            });

            console.log('IBF Settings: Final settings object:', settings);
            console.log('IBF Settings: Sending POST request to IBFDashboard/action/saveSettings');

            Espo.Ajax.postRequest('IBFDashboard/action/saveSettings', {
                settings: settings
            }).then(() => {
                console.log('IBF Settings: Save successful');
                Espo.Ui.success(this.translate('Saved'));
            }).catch((err) => {
                console.error('IBF Settings: Save failed', err);
                if (err.status === 403) {
                    Espo.Ui.error(this.translate('Access denied'));
                } else {
                    Espo.Ui.error(this.translate('Error occurred'));
                }
                throw err;
            });
        }

        cancel() {
            this.getRouter().navigate('#Admin', {trigger: true});
        }

        getRecordTitle() {
            return this.translate('IBF Settings', 'labels', 'IBFDashboard');
        }

        selectUser() {
            console.log('IBF Settings: Opening user selection dialog');
            
            this.createView('selectUser', 'views/modals/select-records', {
                scope: 'User',
                multiple: false,
                primaryFilterName: 'active',
                filterList: ['active'],
                mandatorySelectAttributeList: ['id', 'userName', 'name'],
                forceSelectAllAttributes: false
            }, (selectView) => {
                selectView.render();
                
                this.listenTo(selectView, 'select', (model) => {
                    console.log('IBF Settings: User selected:', model);
                    this.setSelectedUser(model);
                    selectView.close();
                });
            });
        }

        setSelectedUser(model) {
            const userId = model.get('id');
            const userName = model.get('userName') || model.get('name');
            
            console.log('IBF Settings: Setting selected user:', userId, userName);
            
            this.$el.find('#ibf-admin-user-id').val(userId);
            this.$el.find('#ibf-admin-user-name').val(userName);
        }

        clearUser() {
            console.log('IBF Settings: Clearing selected user');
            this.$el.find('#ibf-admin-user-id').val('');
            this.$el.find('#ibf-admin-user-name').val('');
            
            // Clear IBF user info when user is cleared
            this.ibfUserInfo = {};
            this.reRender();
        }

        viewIBFUser() {
            const ibfUserInfo = this.ibfUserInfo || {};
            const ibfUserId = ibfUserInfo.id;
            
            if (!ibfUserId) {
                console.warn('IBF Settings: No IBF user ID available');
                Espo.Ui.warning(this.translate('No IBF user record found'));
                return;
            }
            
            console.log('IBF Settings: Opening IBF user record:', ibfUserId);
            
            // Navigate to IBF user detail view
            this.getRouter().navigate('#IBFUser/view/' + ibfUserId, {trigger: true});
        }

        createIBFUser() {
            const adminUserId = this.$el.find('#ibf-admin-user-id').val();
            
            if (!adminUserId) {
                Espo.Ui.warning(this.translate('Please select an admin user first'));
                return;
            }
            
            console.log('IBF Settings: Creating IBF user for admin user:', adminUserId);
            
            // Navigate to IBF user create view with pre-filled user link
            this.getRouter().navigate('#IBFUser/create', {trigger: true});
            
            // Note: We could enhance this to pre-fill the user field via URL parameters
            // but EspoCRM's standard routing doesn't support this directly
        }

        selectUser() {
            console.log('IBF Settings: Opening user selection dialog');
            
            this.createView('selectUser', 'views/modals/select-records', {
                scope: 'User',
                multiple: false,
                primaryFilterName: 'active',
                filterList: ['active'],
                mandatorySelectAttributeList: ['id', 'userName', 'name'],
                forceSelectAllAttributes: false
            }, (selectView) => {
                selectView.render();
                
                this.listenTo(selectView, 'select', (model) => {
                    console.log('IBF Settings: User selected:', model);
                    this.setSelectedUser(model);
                    selectView.close();
                });
            });
        }

        setSelectedUser(model) {
            const userId = model.get('id');
            const userName = model.get('userName') || model.get('name');
            
            console.log('IBF Settings: Setting selected user:', userId, userName);
            
            this.$el.find('#ibf-admin-user-id').val(userId);
            this.$el.find('#ibf-admin-user-name').val(userName);
            
            // Re-load settings to get IBF user info for the selected user
            this.loadIBFSettings();
        }

    };

});
