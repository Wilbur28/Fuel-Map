var express = require('express');
var router = express.Router();
var GeoJSON = require('geojson');
var axios = require("axios");
var moment = require('moment');
const jsStringify = require('js-stringify');

/* API Axios Config */ 
var fuelIDConfig = {
  method: 'get',
  url: 'https://fppdirectapi-prod.fuelpricesqld.com.au/Subscriber/GetCountryFuelTypes?countryId=21',
  headers: { 
    'Authorization': 'FPDAPI SubscriberToken=f4fd3afd-99de-4a1b-ab47-b4f24fedc823', 
    'Content-Type': 'application/json'
  }
};

var pricesConfig = {
  method: 'get',
  url: 'https://fppdirectapi-prod.fuelpricesqld.com.au/Price/GetSitesPrices?countryId=21&geoRegionLevel=3&geoRegionId=1',
  headers: { 
    'Authorization': 'FPDAPI SubscriberToken=f4fd3afd-99de-4a1b-ab47-b4f24fedc823', 
    'Content-Type': 'application/json'
  }
};

var siteConfig = {
  method: 'get',
  url: 'https://fppdirectapi-prod.fuelpricesqld.com.au/Subscriber/GetFullSiteDetails?countryId=21&geoRegionLevel=3&geoRegionId=1',
  headers: { 
    'Authorization': 'FPDAPI SubscriberToken=f4fd3afd-99de-4a1b-ab47-b4f24fedc823', 
    'Content-Type': 'application/json'
  }
};

/* Each Axios Request */
const fuelRequest = axios(fuelIDConfig);
const pricesRequest = axios(pricesConfig);
const siteRequest = axios(siteConfig);

var data
var fuelID
var prices
var site

/* Axios Request */
axios
.all([fuelRequest, pricesRequest, siteRequest])
.then(
  axios.spread((...responses) => {
    const fuelRequest = responses[0];
    const pricesRequest = responses[1];
    const siteRequest = responses[2];
    fuelID = fuelRequest.data;
    prices = pricesRequest.data;
    site = siteRequest.data;
    //console.log(prices)
  })
)
.catch(errors => {
  console.error(errors);
});

/* Sorts and Maps JSON Data */
function sortData() {
  Object.keys(fuelID.Fuels).forEach(function (index) {
    fuelID.Fuels[index].Price = 999;
    fuelID.Fuels[index].TransactionDateUtc = "Unknown";
  });

  Object.keys(site.S).forEach(function (index) {
    site.S[index].fuel = fuelID.Fuels;
  });
  
  console.log(site.S[0].fuel[0].Price);
  console.log(site.S[1].fuel[0].Price);
  site["S"][0].fuel[0].Price = 0;
  //site["S"][0].fuel[0].Price = 0;
  console.log(site.S[0].fuel[0].Price);
  console.log(site.S[1].fuel[0].Price);

  Object.keys(prices.SitePrices).forEach(function (priceIndex) {
    Object.keys(site.S).forEach(function (siteIndex) {
      if (prices.SitePrices[priceIndex].SiteId == site.S[siteIndex].S) {
        Object.keys(fuelID.Fuels).forEach(function (fuelIndex) {
          if (prices.SitePrices[priceIndex].FuelId == site.S[siteIndex].fuel[fuelIndex].FuelId) {
            //if (site.S[siteIndex].S == 61290151) {
              var price = prices.SitePrices[priceIndex].Price;
              var date = moment.utc(prices.SitePrices[priceIndex].TransactionDateUtc);
              var toConvert = price.toString().length-3;
              var converted = price/Math.pow(10, toConvert);
              if (siteIndex == 0) {
                //console.log(date.format('LLL'))
                //console.log(priceIndex, siteIndex, fuelIndex, site.S[0].S, site.S[0].fuel[0].TransactionDateUtc)
              }
              
              site.S[siteIndex].fuel[fuelIndex].Price = converted;
              site.S[siteIndex].fuel[fuelIndex].TransactionDateUtc = date.local().format('LLL');
            //}
            if (siteIndex == 0) {
              //console.log(priceIndex, siteIndex, fuelIndex, site.S[0].S, site.S[0].fuel[0].TransactionDateUtc)
              //console.log(site.S[siteIndex].fuel[fuelIndex].TransactionDateUtc)
            }
            //console.log(site.S[0].S, site.S[0].fuel[0].Price)
          }
        });
        //console.log(prices.SitePrices[priceIndex].SiteId, site.S[siteIndex].S);
      }
    });
  });
  
  // Object.keys(site.S).forEach(function (siteIndex) {
  //   site.S[siteIndex].fuel = JSON.stringify(site.S[siteIndex].fuel);
  // });
  //site.S[0].fuel[0].Price = 999
  //console.log(site.S[1].fuel);
  data = GeoJSON.parse(site.S, {Point: ['Lat', 'Lng'], include: ['S', 'A', 'N', 'B', 'fuel']});
  //console.log(data.features[0].properties.fuel);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  sortData();
  res.render('index', { title: 'Fuel Map', jsStringify, data });
});



module.exports = router;
