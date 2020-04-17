if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
        localCoord = position.coords;
        objLocalCoord = {
            lat: localCoord.latitude,
            lng: localCoord.longitude
        }

        let platform = new H.service.Platform({
            'apikey': window.hereApiKey
        });

        let defaultLayers = platform.createDefaultLayers();

        let map = new H.Map(
            document.getElementById('mapContainer'),
            defaultLayers.vector.normal.map,
            {
                zoom: 10,
                center: objLocalCoord,
                pixelRatio: window.devicePixelRatio || 1
            });

        window.addEventListener('resize', () => map.getViewPort().resize());
        let ui = H.ui.UI.createDefault(map, defaultLayers);
        let mapEvents = new H.mapevents.MapEvents(map);
        let behavior = new H.mapevents.Behavior(mapEvents);

        // draggable Marker Funtion
        function addDragableMarker(map, behavior) {
            let inputLat = document.getElementById('lat');
            let inputLng = document.getElementById('lng');

            if (inputLat.value != '' && inputLng.value != '') {
                objLocalCoord = {
                    lat: inputLat.value,
                    lng: inputLng.value
                }
            }

            let marker = new H.map.Marker(objLocalCoord, {
                volatility: true
            })

            marker.draggable = true;
            map.addObject(marker);

            // disable the default draggability of the underliying map
            // and calculate the offset between mouse target's postition
            // when starting to drag a marker object:
            map.addEventListener('dragstart', function (event) {
                let target = event.target,
                    pointer = event.currentPointer;
                if (target instanceof H.map.Marker) {
                    let targetPosition = map.geoToScreen(target.getGeometry());
                    target['offset'] = new H.math.Point(pointer.viewportX - targetPosition.x, pointer.viewportY - targetPosition.y
                    );
                    behavior.disable();
                }
            }, false)

            // Listen to drag event and move the position of the marker
            // as necessary
            map.addEventListener('drag', function (event) {
                let target = event.target,
                    pointer = ecent.currentPointer;
                if (target instanceof H.map.Marker) {
                    target.setGeometry(
                        map.screenToGeo(
                            pointer.viewportX - target['offset'].x, pointer.viewportY - target['offset'].y
                        )
                    );
                }
            }, false)

            // re-enable the default draggabillity of the underlying map
            // when dragging has complated
            map.addEventListener('dragend', function (event) {       // => menghentikan pointer pas di click suatu map
                let target = event.target;
                if (target instanceof H.map.Marker) {
                    behavior.enable();
                    let resultCoord = map.screenToGeo(
                        event.currentPointer.viewportX,     // => dapatkan hasil value
                        event.currentPointer.viewportY
                    );
                    // consol.log(resultCoord)
                    inputLat.value = resultCoord.lat;
                    inputLng.value = resultCoord.lng;
                }
            }, false);
        }

        if (window.action == "submit") {
            addDragableMarker(map, behavior);
        }


    })
} else {
    console.error("Geolocation is not supported by this browser");
}
