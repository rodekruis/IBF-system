<div class="page-header">
    <h3>{{translate 'IBF Settings' category='labels' scope='IBFDashboard'}}</h3>
</div>

<div class="record-container">
    <form class="form-horizontal">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">{{translate 'Connection Settings'}}</h4>
            </div>
            <div class="panel-body">
                <div class="form-group">
                    <label class="col-sm-3 control-label">{{translate 'IBF Dashboard URL'}}</label>
                    <div class="col-sm-9">
                        <input type="url" name="ibfDashboardUrl" class="form-control" value="{{settings.ibfDashboardUrl}}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">{{translate 'IBF API URL'}}</label>
                    <div class="col-sm-9">
                        <input type="url" name="ibfApiUrl" class="form-control" value="{{settings.ibfApiUrl}}" readonly>
                        <small class="form-text text-muted">Automatically detected from current EspoCRM instance ({{settings.ibfApiUrl}})</small>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">{{translate 'IBF Backend API URL'}}</label>
                    <div class="col-sm-9">
                        <input type="url" name="ibfBackendApiUrl" class="form-control" value="{{settings.ibfBackendApiUrl}}">
                        <small class="form-text text-muted">IBF Backend API URL
                        for user operations (e.g., https://ibf-pivot.510.global/api)</small>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">{{translate 'Geoserver URL'}}</label>
                    <div class="col-sm-9">
                        <input type="url" name="ibfGeoserverUrl" class="form-control" value="{{settings.ibfGeoserverUrl}}">
                        <small class="form-text text-muted">Geoserver WMS URL for map layer services (e.g., https://ibf.510.global/geoserver/ibf-system/wms)</small>
                    </div>
                </div>
            </div>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">{{translate 'Configuration'}}</h4>
            </div>
            <div class="panel-body">
                <div class="form-group">
                    <label class="col-sm-3 control-label">{{translate 'Enabled Countries'}}</label>
                    <div class="col-sm-9">
                        <select name="ibfEnabledCountries[]" class="form-control" multiple size="5">
                            {{#each countryOptions}}
                            <option value="{{code}}" {{#if selected}}selected{{/if}}>{{name}}</option>
                            {{/each}}
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="col-sm-3 control-label">{{translate 'Default Country'}}</label>
                    <div class="col-sm-9">
                        <select name="ibfDefaultCountry" class="form-control">
                            {{#each defaultCountryOptions}}
                            <option value="{{code}}" {{#if selected}}selected{{/if}}>{{name}}</option>
                            {{/each}}
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="col-sm-3 control-label">{{translate 'Disaster Types'}}</label>
                    <div class="col-sm-9">
                        <select name="ibfDisasterTypes[]" class="form-control" multiple size="4">
                            {{#each disasterTypeOptions}}
                            <option value="{{code}}" {{#if selected}}selected{{/if}}>{{name}}</option>
                            {{/each}}
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="panel panel-default">
            <div class="panel-heading">
                <h4 class="panel-title">{{translate 'User Management'}}</h4>
            </div>
            <div class="panel-body">
                <div class="form-group">
                    <div class="col-sm-offset-3 col-sm-9">
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="ibfAutoCreateUsers" value="1" {{#if settings.ibfAutoCreateUsers}}checked{{/if}}>
                                {{translate 'Auto-create IBF users'}}
                            </label>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <div class="col-sm-offset-3 col-sm-9">
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="ibfRequireUserMapping" value="1" {{#if settings.ibfRequireUserMapping}}checked{{/if}}>
                                {{translate 'Require user mapping'}}
                            </label>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="col-sm-3 control-label">{{translate 'IBF Admin User'}}</label>
                    <div class="col-sm-9">
                        <div class="user-select-container">
                            <div class="input-group">
                                <input type="text" class="form-control" id="ibf-admin-user-name" value="{{adminUserName}}" readonly placeholder="{{translate 'Select User'}}">
                                <input type="hidden" name="ibfAdminUserId" id="ibf-admin-user-id" value="{{settings.ibfAdminUserId}}">
                                <div class="input-group-btn">
                                    <button type="button" class="btn btn-default" data-action="select-user">
                                        <i class="fas fa-angle-up"></i>
                                    </button>
                                    <button type="button" class="btn btn-default" data-action="clear-user">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <small class="form-text text-muted">Select the user that will be used for IBF system administration</small>

                        {{#if settings.ibfAdminUserId}}
                        <div class="ibf-user-status" style="margin-top: 10px;">
                            {{#if ibfUserInfo.exists}}
                                <div class="alert alert-info">
                                    <strong>IBF User:</strong> Found
                                    {{#if ibfUserInfo.hasPassword}}
                                        (Password set)
                                    {{else}}
                                        <span class="text-warning">(No password set)</span>
                                    {{/if}}
                                    <br>
                                    <a href="#IBFUser/view/{{ibfUserInfo.id}}" class="btn btn-sm btn-info" style="margin-top: 5px;">
                                        View IBF User Record
                                    </a>
                                </div>
                            {{else}}
                                <div class="alert alert-warning">
                                    <strong>IBF User:</strong> Not found
                                    <br>
                                    <a href="#IBFUser/create" class="btn btn-sm btn-warning" style="margin-top: 5px;">
                                        Create IBF User
                                    </a>
                                </div>
                            {{/if}}
                        </div>
                        {{/if}}
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-sm-12">
                <div class="button-container">
                    <button type="button" class="btn btn-primary" data-action="save">{{translate 'Save'}}</button>
                    <button type="button" class="btn btn-default" data-action="cancel">{{translate 'Cancel'}}</button>
                </div>
            </div>
        </div>
    </form>
</div>
