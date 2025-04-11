# Data model migrations

When making changes to the data model of the API-service (creating/editing any \*.entity.ts files), you need to create a migration script to take these changes into affect.

## How to change the data model?

1. Make the changes in the \*.entity.ts file
2. Generate a migration-script with "docker-compose exec ibf-api-service npm run migration:generate <name-for-migration-script>"
3. Restart the ibf-api-service >> this will always run any new migration-scripts, so in this case the just generated migration-script
4. If more change required, then follow the above process as often as needed.

### Reference

[TypeORM migration documentation](https://github.com/typeorm/typeorm/blob/master/docs/migrations.md)
