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
                        <input type="url" name="ibfApiUrl" class="form-control" value="{{settings.ibfApiUrl}}">
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
