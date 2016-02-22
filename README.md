# Maidenhead
```js
    var Maidenhead = require('maidenhead');

    var lattitude = 50.937658; //mandatory
    var longitude = 4.678045;  //mandatory
    var precision = 6;         //optional defaults to 5

    var m = new Maidenhead(lattitude, longitude, precision);
    var maidenheadLocator = m.locator;
     
    console.log(m.lat, m.lon, maidenheadLocator);
    console.log(Maidenhead.toLatLon(maidenheadLocator));
```    