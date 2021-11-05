# Set up IBF-System on Server / Virtual Machine

## Prerequisites
- Virtual Machine that runs Ubuntu (preferably 18.04)
- Postgres database (preferably on separate server)


## 1. Fork repository in GitHub

1. Start with forking the main [IBF-system repository](https://github.com/rodekruis/IBF-system)
    1. This requires setting up a Github account first if not already 

## 2. Set up Mailchimp

1. Create account: https://mailchimp.com/help/create-an-account/
2. Create maillist: https://mailchimp.com/help/create-audience/ and create users
    1. Best is to start with only adding one test email address to test the entire setup below.
    2. Only after testing the whole IBF-system correctly, add the other users
3. Find MC_LIST_ID to fill in in `.env` (below) through https://mailchimp.com/help/find-audience-id/
4. Create MC_API to fill in in `.env` (below) through https://mailchimp.com/help/about-api-keys/#Find-or-Generate-Your-API-Key
5. Create one or more segments. Assuming your set up is just for one country:
    1. Give all members the same tag, e.g. `Zambia`
    2. Create a segment defined by all members with the tag `Zambia`. Save it and also name it `Zambia`
    3. Go to https://us18.admin.mailchimp.com/lists/segments/
    4. Right-click your segment and press 'copy link address'
    5. Paste the address somewhere and copy the `segment_id` part 
    6. Fill this in as instructed in `.env` (below)

### 3. Set up VM

1. User Management

    1. Create user group - `sudo groupadd ibf-users`
    2. Add `ibf-user` to group - `sudo usermod -a -G ibf-users ibf-user`
        1. Command to verify group members - `grep ibf-users /etc/group`
    3. Create `ibf-user` group if not already present
        1. `mkdir /home/ibf-user`
    4. Change access of shared directory - `/home/ibf-user`
        1. `chgrp -Rf ibf-users /home/ibf-user`
        2. `sudo chown -R ibf-user:ibf-users /home/ibf-user`
        3. `sudo chmod -R 775 /home/ibf-user`
        4. Re-login to verify if you have access by running
           `touch /home/ibf-user`
    5. Add the following lines to `/etc/sudoers`

    ```jsx
    # Allow members of group ibf-users to execute systemctl daemon-reload
    %ibf-users ALL=NOPASSWD: /bin/systemctl daemon-reload

    # Allow members of group ibf-users to execute service webhook restart
    %ibf-users ALL=NOPASSWD: /usr/sbin/service webhook restart
    ```

2. Install Software
    1. NodeJS
       [Source](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)
        1. Follow the instructions in the source-link.
        2. Allow users to access docker commands
            1. `sudo usermod -aG docker ibf-user`
            2. Verification - `grep docker /etc/group`
        3. Verification - `docker -v`
    3. Docker Compose
       [Source](https://docs.docker.com/compose/install/#install-compose-on-linux-systems)
        1. Follow the instructions in the source-link.
        2. `sudo chmod +x /usr/local/bin/docker-compose`
        3. Verification - `docker-compose -v`

3. Setup IBF-system
    1. Setup GIT
        1. `cd /home/ibf-user`
        2. `git clone https://github.com/<your-fork>/IBF-system.git`
        3. `cd IBF-system`
        4. Set the repo config to allow group access -
           `git config core.sharedRepository group`
           [Source](https://stackoverflow.com/a/6448326/1753041)
        5. `sudo chgrp -R ibf-users /home/ibf-user/IBF-system`
           [Source](https://stackoverflow.com/a/6448326/1753041)
        6. `sudo chmod -R g+rwX /home/ibf-user/IBF-system`
           [Source](https://stackoverflow.com/a/6448326/1753041)
    2. Setup Environment Variables
        1. Create `/home/ibf-user/IBF-system/.env` through `cp /home/ibf-user/IBF-system/handover.example.env /home/ibf-user/IBF-system/.env`
        2. Set the appropriate values in the `.env` file
            1. Follow the instructions in the `.env` file on how to fill all variables
            2. Use the credentials of your Postgres database to fill in the `DB_`-variables
            3. Use the mailchimp credentials retrieved above to fill in the `MC_`-variables
            4. Where unclear, ask assistance from the IBF-system development team
        3. Load the `.env` vars by `source /home/ibf-user/IBF-system/.env`
        4. Test if the vars were loaded correctly `echo $NODE_ENV`
    4. `. tools/deploy.sh`
    5. Verify that all containers work correctly
        1. `docker container ls` should show 3 running containers
            - `ibf-api-service`
            - `ibf-geoserver`
            - `nginx`
            - (`ibf-dashboard` is only started up temporarily, but is closed again once the production build is done)
        2. Check running dashboard at `https://<ip>/login`
        3. Check running API service at `https://<ip>/docs`
        4. Check running Geoserver at `https://<ip>/geoserver`

4. Load initial data
    1. Download
       [raster-files.zip](https://rodekruis.sharepoint.com/sites/510-CRAVK-510/_layouts/15/guestaccess.aspx?folderid=0fa454e6dc0024dbdba7a178655bdc216&authkey=AcqhM85JHZY8cc6H7BTKgO0&expiration=2021-08-27T22%3A00%3A00.000Z&e=MnocDf)
    2. Unzip the files using `apt install unzip` and `unzip raster-files.zip`, into  `services/API-service/geoserver-volume/raster-files/` such that that folder now has subfolders `input`, `mock-output` and `output`.
    3. Run seed script through `docker-compose exec ibf-api-service npm run seed`

5. Connect external pipeline
    1. There should be an external pipeline able to upload impact forecast data to this VM. Please check this together with the pipeline owner or the applicable disaster-types.
    2. For example the Glofas floods pipeline can be found at: https://github.com/rodekruis/IBF_FLOOD_PIPELINE
    3. Follow the README there on how to set it up.
    4. Roughly:
        1. Fork that repository as well to your own Github account
        2. The repository includes a `workflow.yml` file, which can be run through Github Actions
        3. If not already the case, change this file to run on a daily schedule (8AM UTC), using:
            `
            on: 
                schedule:
                    - cron: "0 8 * * *"
            `
        4. Set up the necessary secrets in Settings > Secrets section of Github-repository (see https://github.com/rodekruis/IBF_FLOOD_PIPELINE/settings/secrets/actions to see which ones)
        5. Run the workflow manually once to fill the database with a first batch of data, which is needed for a working dashboard

6. Test
    1. Open the dashboard at `https://<ip>/login `
    2. Log in with the admin-account
        - dunant@redcross.nl
        - ADMIN_PASSWORD set in `.env`
    3. Check that the dashboard loads as expected
    4. Note that the dashboard is probably showing in non-trigger mode, as most days of the year no trigger is predicted. If you want to check also the trigger-mode, you need upload mock trigger data in some way. Check with IBF-development team for assistance.

7. Create users
    1. Open `https://<ip>/docs`
    2. Follow the instructions to log in with the admin-user
    3. Use the 'Sign up new user' endpoint to create new users
    4. Send each created user an e-mail with the password you just created 
    5. Make sure that you add each user you create here also in Mailchimp (same email address)


