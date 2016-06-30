# Bluemix Status

## Configuration
Required environment variables:
* `CLDSTS_BXD_USER` - The Username of a Bluemix Administrator
* `CLDSTS_BXD_PASS` - The Password of a Bluemix Administrator
* `CLDSTS_BXD_URL` - The API endpoint of a Bluemix deployment

## Running

### Local Development
```
npm install && \
CLDSTS_BXD_USER=bluxmix_admin@ibm.com \
CLDSTS_BXD_PASS=********** \
CLDSTS_BXD_URL=https://api.w3ibm.bluemix.net \
DEBUG=BluemixStatus:* \
nodemon
```

***NOTE***: `nodemon` can be installed by `npm install -g nodemon`

### Bluemix

To be continued...
