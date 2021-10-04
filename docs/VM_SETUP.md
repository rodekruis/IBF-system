# Create VM

### In Azure

1. When creating VM, enable login using Azure Active Directory
2. Restrict SSH port to only the jumpbox-ip
3. Open ports 80 (http), 443 (https) and 3099 (webhook)
4. Set the DNS Name Label on the IP Address attached to the VM

### In GitHub

1. [Create web-hook](https://github.com/rodekruis/IBF-system/settings/hooks) to
   listen on `http://ip-address:3099/`
2. Set secret for web-hook access (for [this]() step)

### In VM

1. User Management

    1. Create user group - `sudo groupadd ibf-users`
    2. Add `ibf-user` to group - `sudo usermod -a -G ibf-users ibf-user`
    3. Add users to group - `sudo usermod -a -G ibf-users grahman@rodekruis.nl`
        1. Command to verify group members - `grep ibf-users /etc/group`
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
        1. `curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -`
        2. `sudo apt-get install -y nodejs`
        3. Verification - `node -v`
    2. Docker [Source](https://docs.docker.com/engine/install/ubuntu/)
        1. `sudo apt-get remove docker docker-engine docker.io containerd runc`
        2. `sudo apt-get update`
        3. `sudo apt-get install apt-transport-https ca-certificates curl gnupg-agent software-properties-common`
        4. `curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -`
        5. `sudo apt-key fingerprint 0EBFCD88`
        6. `sudo add-apt-repository \ "deb [arch=amd64] https://download.docker.com/linux/ubuntu \ $(lsb_release -cs) \ stable"`
        7. `sudo apt-get update`
        8. `sudo apt-get install docker-ce docker-ce-cli containerd.io`
        9. Allow users to access docker commands
            1. `sudo usermod -aG docker grahman@rodekruis.nl`
            2. Verification - `grep docker /etc/group`
        10. Verification - `docker -v`
    3. Docker Compose
       [Source](https://docs.docker.com/compose/install/#install-compose-on-linux-systems)
        1. `sudo curl -L "[https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$](https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$)(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose`
        2. `sudo chmod +x /usr/local/bin/docker-compose`
        3. Verification - `docker-compose -v`
    4. Webhook Related
        1. `sudo apt install postgresql-client-common postgresql-client`
3. Setup IBF-system
    1. Setup GIT
        1. `git clone https://github.com/rodekruis/IBF-system.git`
        2. Set the repo config to allow group access -
           `git config core.sharedRepository group`
           [Source](https://stackoverflow.com/a/6448326/1753041)
        3. `sudo chgrp -R ibf-users /home/ibf-user/IBF-system`
           [Source](https://stackoverflow.com/a/6448326/1753041)
        4. `sudo chmod -R g+rwX /home/ibf-user/IBF-system`
           [Source](https://stackoverflow.com/a/6448326/1753041)
    2. Setup Environment Variables
        1. [OLD - PIPELINE DECOUPLED NOW]: Create `services/IBF-pipeline/pipeline/secrets.py`
            1. `cp /home/ibf-user/IBF-system/services/IBF-pipeline/pipeline/secrets.py.template /home/ibf-user/IBF-system/services/IBF-pipeline/pipeline/secrets.py`
            2. Set the appropriate values in the
               `/home/ibf-user/IBF-system/services/IBF-pipeline/pipeline/secrets.py`
               file
        2. Create `/home/ibf-user/IBF-system/.env`
            1. `cp /home/ibf-user/IBF-system/example.env /home/ibf-user/IBF-system/.env`
            2. Set the appropriate values in the `.env` file
            3. Load the `.env` vars by `source /home/ibf-user/IBF-system/.env`
            4. Test if the vars were loaded correctly `echo $NODE_ENV`
    3. Setup web-hook
        1. `sudo cp webhook.service /etc/systemd/system/`
        2. Set `GITHUB_WEBHOOK_SECRET` value in
           `/etc/systemd/system/webhook.service`
        3. Verification - `ls /etc/systemd/system/`
        4. In `/home/ibf-user/IBF-system` - `npm install github-webhook-handler`
        5. `sudo service webhook start`
        6. Verification - `sudo service webhook status`
    4. `. tools/deploy.sh`
4. Set up geoserver
    1. Download
       [raster-files.zip](https://rodekruis.sharepoint.com/sites/510-CRAVK-510/_layouts/15/guestaccess.aspx?folderid=0fa454e6dc0024dbdba7a178655bdc216&authkey=AcqhM85JHZY8cc6H7BTKgO0&expiration=2021-08-27T22%3A00%3A00.000Z&e=MnocDf)
    2. Unzip the files using `apt install unzip` and `unzip raster-files.zip`, into  `services/API-service/geoserver-volume/raster-files/`
    3. Check if the [Geoserver](http://ibf.510.global/geoserver/web) contains
       necessary layers.
5. Verify that external pipeline works correctly
    1. There should be an external pipeline able to upload impact forecast data to this VM. Please check this together with the pipeline owner or the applicable disaster-types.
        - Pipeline runs without error
        - Dashboard shows correct data (including disaster-extent raster)
        - Email is received if applicable

### Useful Commands / Tools

1. Delete user from group? `sudo gpasswd -d grahman@rodekruis.nl ibf-users`
2. [Secret Generator](https://passwordsgenerator.net/)
