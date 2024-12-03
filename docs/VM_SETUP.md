# Create VM

### In Azure

1. When creating VM, enable login using Azure Active Directory
2. Restrict SSH port to only the jumpbox-ip
3. Open ports 80 (http), 443 (https) and 3099 (webhook)
4. Set the DNS Name Label on the IP Address attached to the VM

### In VM

1. User Management

   1. Create user group - `sudo groupadd ibf-users`
   2. Create user `ibf-user` - `sudo adduser ibf-user` (with password also `ibf-user`)
   3. Add `ibf-user` to group - `sudo usermod -a -G ibf-users ibf-user`
   4. Add users to group - `sudo usermod -a -G ibf-users <username>`
      1. Command to verify group members - `grep ibf-users /etc/group`
   5. Change access of shared directory - `/home/ibf-user`
      1. `chgrp -Rf ibf-users /home/ibf-user`
      2. `sudo chown -R ibf-user:ibf-users /home/ibf-user`
      3. `sudo chmod -R 775 /home/ibf-user`
      4. Re-login to verify if you have access by running
         `touch /home/ibf-user`
   6. Open `/etc/sudoers` with `sudo nano /etc/sudoers` and add these lines

   ```console
   # Allow members of group ibf-users to execute systemctl daemon-reload
   %ibf-users ALL=NOPASSWD: /bin/systemctl daemon-reload

   # Allow members of group ibf-users to execute service webhook restart
   %ibf-users ALL=NOPASSWD: /usr/sbin/service webhook restart
   ```

2. Install Software

   1. [Install NodeJS](https://github.com/nodesource/distributions/blob/master/README.md#installation-instructions)
      - `node -v` to verify
   2. [Install Docker](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)
      - `docker -v` to verify
      - `sudo usermod -aG docker <username>` to allow users to access docker commands
      - `grep docker /etc/group` to verify group members
      - `sudo chmod 660 /var/run/docker.sock` to give group members access to docker socket
   3. [Install Nginx](https://nginx.org/en/linux_packages.html#Ubuntu)
      - `nginx -v` to verify

3. Setup IBF-system

   1. `cd /home/ibf-user`
   2. `git clone https://github.com/rodekruis/IBF-system.git`
   3. `cd /home/ibf-user/IBF-system`
   4. Set the repo config to allow group access -
      `git config core.sharedRepository group`
      [Source](https://stackoverflow.com/a/6448326/1753041)
   5. `sudo chgrp -R ibf-users /home/ibf-user/IBF-system`
      [Source](https://stackoverflow.com/a/6448326/1753041)
   6. `sudo chmod -R g+rwX /home/ibf-user/IBF-system`
      [Source](https://stackoverflow.com/a/6448326/1753041)
   7. Create build folder
      - `mkdir /home/ibf-user/IBF-system/interfaces/IBF-dashboard/www`
      - `chown azureuser:ibf-users /home/ibf-user/IBF-system/interfaces/IBF-dashboard/www`
      - `chmod 775 /home/ibf-user/IBF-system/interfaces/IBF-dashboard/www`
   8. Setup Environment Variables
      1. Create `/home/ibf-user/IBF-system/.env`
         1. `cp /home/ibf-user/IBF-system/example.env /home/ibf-user/IBF-system/.env`
         2. Set the appropriate values in the `.env` file
         3. Load the `.env` vars by `source /home/ibf-user/IBF-system/.env`
         4. Test if the vars were loaded correctly `echo $NODE_ENV`
   9. Load certificate: load `DigiCertGlobalRootCA.crt.pem` in `services/API-service/cert` for connection to Azure Postgres server (if applicable)
   10. Configure Nginx
       - `cp /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.backup`
       - `cp tools/nginx.conf /etc/nginx/conf.d/default.conf`
       - Change `root`, `server_name`, and `proxy_pass` values in `/etc/nginx/conf.d/default.conf`
       - Set `user` directive to `azureuser` in `/etc/nginx/nginx.conf`
       - `service nginx restart` to restart nginx with new configuration
       - `systemctl enable nginx` to start nginx on VM reboot
       - `service nginx status` to verify
       - Install SSL certificate using [certbot](https://certbot.eff.org/instructions?ws=nginx&os=ubuntufocal)
         - `snap install --classic certbot`
         - `ln -s /snap/bin/certbot /usr/bin/certbot`
         - `certbot --nginx`
   11. `source tools/deploy.sh`

4. Load base data

   1. Load Geoserver source data
      1. Download [raster-files.zip](https://510ibfsystem.blob.core.windows.net/rasters/raster-files.zip)
      2. Unzip the files using `apt install unzip` and `unzip raster-files.zip`, into `services/API-service/geoserver-volume/raster-files/`
   2. Seed database: `docker compose exec ibf-api-service npm run seed`
   3. Run all mock scenarios via Swagger: `api/scripts/mock-all`

5. Setup webhook

   1. On GitHub
      1. [Create webhook](https://github.com/rodekruis/IBF-system/settings/hooks) to
         listen on `http://ip-address:3099/`
      2. Set secret for webhook access
   2. On VM
      1. `sudo cp tools/webhook.service /etc/systemd/system/`
      2. Set `GITHUB_WEBHOOK_SECRET` value in `/etc/systemd/system/webhook.service` as same value set in GitHub Webhooks
      3. `ls /etc/systemd/system/` to verify
      4. In `/home/ibf-user/IBF-system` - `npm install github-webhook-handler`
      5. `systemctl enable webhook` to start webhook on VM reboot
      6. `service webhook start` to start webhook manually
      7. `service webhook status` to verify
