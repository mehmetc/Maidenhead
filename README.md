# Maidenhead

The [Maidenhead Locator](https://en.wikipedia.org/wiki/Maidenhead_Locator_System) System is a geographic co-ordinate system used by amateur radio operators. 

Based on [Michael Graff's maidenhead gem](https://rubygems.org/gems/maidenhead)


```js
    var Maidenhead = require('maidenhead');

    var latitude  = 50.879087; //mandatory
    var longitude = 4.701169;  //mandatory
    var precision = 6;         //optional defaults to 5
 
    var townHall     = new Maidenhead(latitude, longitude, precision);
    var trainStation = new Maidenhead(50.881264, 4.715634, 6);
    var library      = new Maidenhead(); 
    
    library.locator  = 'JO20iu16ti';

    var maidenheadLocator = townHall.locator;
    console.log('has valid locator: ' + Maidenhead.valid(maidenheadLocator));
     
    console.log("latitude: %s, longitude: %s, Maidenhead: %s", townHall.lat, townHall.lon, maidenheadLocator);
    console.log("[lat, lon] = ", Maidenhead.toLatLon(maidenheadLocator));
    
    console.log("distance to train station in M from town hall: %s", townHall.distanceTo(trainStation, 'm'));
    console.log("bearing to library station from town hall: %s degrees", townHall.bearingTo(library));
    console.log("compass bearing to library station from town hall: %s ", townHall.bearingTo(library, true));
    
```    