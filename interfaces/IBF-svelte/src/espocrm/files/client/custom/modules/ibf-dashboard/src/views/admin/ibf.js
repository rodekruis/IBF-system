define(['view'], function (View) {

    return class extends View {

        template = 'ibf-dashboard:admin/ibf'

        setup() {
            // Check admin permissions before setting up the view
            if (!this.getUser().isAdmin()) {
                this.template = 'ibf-dashboard:admin/access-denied';
                return;
            }
            
            this.loadIBFSettings();
        }

        loadIBFSettings() {
            const self = this;
            
            // Use EspoCRM's ajax helper correctly
            Espo.Ajax.getRequest('IBFDashboard/action/getSettings').then(function (response) {
                if (response.settings) {
                    self.settings = response.settings;
                }
                if (response.availableCountries) {
                    self.availableCountries = response.availableCountries;
                }
                if (response.availableDisasterTypes) {
                    self.availableDisasterTypes = response.availableDisasterTypes;
                }
                self.reRender();
            }).catch(function (err) {
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
            
            return {
                settings: settings,
                countryOptions: countryOptions,
                defaultCountryOptions: defaultCountryOptions,
                disasterTypeOptions: disasterTypeOptions,
                availableCountries: this.availableCountries || [],
                availableDisasterTypes: this.availableDisasterTypes || []
            };
        }

        events() {
            return {
                'click [data-action="save"]': 'save',
                'click [data-action="cancel"]': 'cancel'
            };
        }

        save() {
            const form = this.$el.find('form')[0];
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const settings = {};
            
            for (let [key, value] of formData.entries()) {
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

            Espo.Ajax.postRequest('IBFDashboard/action/saveSettings', {
                settings: settings
            }).then(() => {
                Espo.Ui.success(this.translate('Saved'));
            }).catch((err) => {
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

    };

});
