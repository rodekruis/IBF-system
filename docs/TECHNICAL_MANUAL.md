# Technical manual

## Admin actions

This describes actions to be (potentially) done by an admin after handing over.

1. Create new users

   1. Open `https://<ip>/docs`
   2. Follow the instructions to log in with the admin-user
   3. Use the 'Sign up new user' endpoint to create new users
   4. Send each created user an e-mail with the password you just created
   5. Make sure that you add each user you create here also in Mailchimp (same email address)

2. Update password of existing user > TO ADD

3. Updating static data

   1. Admin-area static data

   - This is for now not ready to be handed over
   - can be updated using the `POST /api/admin-area-data/upload/csv` endpoint, from a CSV-file with column names
     - countryCodeISO3
     - adminLevel
     - indicator
     - placeCode
     - value

   2. Point static data

   - This is for now not ready to be handed over
   - can be updated using the `POST /api/point-data/upload-csv/{pointDataCategory}/{countryCodeISO3}` endpoint, from a CSV-file with column names
     - lat
     - lon
     - additional column names depending on the `pointDataCategory`

   3. Admin area boundaries
      - This is for now not intended to be handed over
      - can be updated using the `POST /api/admin-areas/geojson/{countryCodeISO3}/{adminLevel}` endpoint, from a geosjon file.
      - NOTE: it is currently not possible to update the admin-boundaries from the `defaultAdminLevel` if there are existing event records in the database already. (510 internal: See DevOps #19785 for work-around)
