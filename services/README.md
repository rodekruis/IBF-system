# Services

Backend services of the IBF-system.
- The `trigger script` output from `trigger model development` is automated here through (e.g. daily running) services.
- Results (as well as other related data) are stored in a database
- Database content is returned through API-calls to some interface

## Setup

The `FbF-Date-pipeline`-folder is the backend that was built and used for the FBF Zambia product. (copied from repository: https://github.com/rodekruis/FbF-Data-pipeline)

It will need to be improved and made more generic for other countries, disaster-types. But this will be the starting point.
