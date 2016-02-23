# Maidenhead

The [Maidenhead Locator](https://en.wikipedia.org/wiki/Maidenhead_Locator_System) System is a geographic co-ordinate system used by amateur radio operators. 

Based on [Michael Graff's maidenhead gem](https://rubygems.org/gems/maidenhead)


```js
    var Maidenhead = require('maidenhead');

    var latitude  = 50.879087; //mandatory
    var longitude = 4.701169;  //mandatory
    var precision = 6;         //optional defaults to 5
 
    var townhall     = new Maidenhead(latitude, longitude, precision);
    var trainStation = new Maidenhead(50.881264, 4.715634, 6);

    var maidenheadLocator = townhall.locator;
    console.log('has valid locator: ' + Maidenhead.valid(maidenheadLocator));
     
    console.log("latitude: %s, longitude: %s, Maidenhead: %s", townhall.lat, townhall.lon, maidenheadLocator);
    console.log("[lat, lon] = ", Maidenhead.toLatLon(maidenheadLocator));
    
    console.log("distance to train station in M: %s", townhall.distanceTo(trainStation, 'm'));
    
```    