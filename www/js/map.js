var venues = [];

var load = function() {
	var map = null;
	
    getMyLocation();
}

var getMyLocation = function() {
	
    var showMyPositionInMap = function(position) {
        // TODO: Bytt ut <breddegrad> og <lengdegrad> med din breddegrad og lengdegrad
        var myLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        
        map = new google.maps.Map(document.getElementById('map_canvas'), {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: myLocation,
            zoom: 17
        }); 
        
        var marker = new google.maps.Marker({
            position: myLocation,
            map: map,
            title: "Du er her!"
        });

        marker.setMap(map);
    };

    var suc = function(position) {
        // TODO: Oppgave 2b: Vis kartet og din posisjon i kartet.
        // showMyPositionInMap(position);

        // TODO: Oppgave 2c: Lag en notification.alert 
        var alertDismissed = function() {
            showMyPositionInMap(position);
            
            // 4a
            getVenues(position.coords.latitude, position.coords.longitude);
        };
        navigator.notification.alert(
            'Latitude: '          + position.coords.latitude          + '\n' +
            'Longitude: '         + position.coords.longitude,  // message
            alertDismissed,         // callback
            'Din posisjon',            // title
            'Vis i kart'                  // buttonName
        );
    };

    var locFail = function() {
        alert("Fant ikke din lokasjon");

    };
    navigator.geolocation.getCurrentPosition(suc, locFail);
};

// 4a)
var getVenues = function(latitude, longitude) {
	var latLong = latitude + ',' + longitude;
	var url = 'https://api.foursquare.com/v2/venues/search?client_id=RY0OBEAXNHYC53X210PSEDDWW4FM5MR3U31XW2WHSKZTNACU&client_secret=JK2TFSOXPBEAJCLJ0S4KLY3UTN1U4CYXEG4RV3WL41SKGJWC&v=20130513&radius=1000&ll=' + latLong;
	
	$.getJSON(url, function(data) {
		
		// 4a) II)
		$.each(data.response.venues, function(index, venue) {
			venues.push(venue);
			
			var marker = new google.maps.Marker({
	            position: new google.maps.LatLng(venue.location.lat, venue.location.lng),
	            map: map,
	            title: venue.name
	        });
			
			marker.setMap(map);
			
			// 4a) III)
			var infowindow = new google.maps.InfoWindow();
			google.maps.event.addListener(marker, 'click', function () {
				//var content = '<div><p>' + marker.title + '</p></div>'
				
				var favoriteVenue = JSON.parse(window.localStorage.getItem(venue.id));
				
				// 4b) I) og II)
				var favoriteContent = '<p>';
				if (favoriteVenue == null) {
					favoriteContent += '<a href="#" onclick="markAsFavorite(' + index + ');return false;">Marker som favoritt</a>';
				} else {
					favoriteContent += 'Favoritt!<br /><a href="#" onclick="takePicture(\'' + venue.id + '\');return false;">Ta bilde</a>';
					if (favoriteVenue.image != null) {
						favoriteContent += '<img src="' + favoriteVenue.image + '" height="100px" width="100px" />';
					}
				}
				
				favoriteContent += '</p>';
				
				var content = '<script type="text/javascript" src="js/map.js"></script>' +
								'<div>' +
								  '<p>' + marker.title + '</p>' + 
								  favoriteContent + 
							    '</div>';
				infowindow.setContent(content);
				infowindow.open(map, marker);
			});
		});
	});
}

// 4b) II) 
var markAsFavorite = function(index) {
	var venue = venues[index];
	//alert(venue.name + ' markert som favoritt!');
	var venueInfo = new Object();
	venueInfo.id = venue.id;
	venueInfo.name = venue.name;
	venueInfo.lat = venue.location.lat;
	venueInfo.lng = venue.location.lng;
	
	window.localStorage.setItem(venue.id, JSON.stringify(venueInfo));
}

// 4c)
var takePicture = function(id) {
	
	var cameraSuccess = function(image) {
		
		var favVenue = JSON.parse(window.localStorage.getItem(id));
		favVenue.image = image;

		window.localStorage.setItem(favVenue.id, JSON.stringify(favVenue));
	}
	
	var cameraError = function(message) {
		alert("Noe gikk galt: " + message);
	}
	
	navigator.camera.getPicture( cameraSuccess, cameraError);
}