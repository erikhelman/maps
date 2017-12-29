// These are the locations that will be shown to the user.
var locations = [
  {title: 'Tokyo Skytree', location: {lat: 35.7100627, lng: 139.8107004}, venue_id: '4b569977f964a520551628e3'},
  {title: 'Tokyo Disneyland', location: {lat: 35.6328964, lng: 139.8803943}, venue_id: '4b59ebdaf964a52002a128e3'},
  {title: 'Odaiba', location: {lat: 35.6247918, lng: 139.77671}, venue_id: '4c3848f10a71c9b6ff6440c9'},
  {title: 'Tokyo Imperial Palace', location: {lat: 35.685175, lng: 139.7527995}, venue_id: '4b566b84f964a5209e0f28e3'},
  {title: 'Takeshita Street', location: {lat: 35.6715659, lng: 139.7031469}, venue_id: '4b63f221f964a5203d982ae3'},
  {title: 'Shinjuku Golden Gai', location: {lat: 35.6937775, lng: 139.7046129}, venue_id: '4beac2d861aca593f61c8400'},
  {title: 'Tokyo Sea Life Park', location: {lat: 35.640094, lng: 139.862165}, venue_id: '4b9a6494f964a52072b135e3'},
  {title: 'Rainbow Bridge', location: {lat: 35.6365639, lng: 139.7631443}, venue_id: '4b56d7f0f964a520c21c28e3'},
  {title: 'Yoyogi Park', location: {lat: 35.671736, lng: 139.6949447}, venue_id: '4b5a3a54f964a520cdb528e3'},
  {title: 'Tsukiji Fish Market', location: {lat: 35.6654861, lng: 139.7706668}, venue_id: '4b5ece32f964a5204e9929e3'}
];

var map;

// Create a new array for all the location markers
var markers = [];

// Create placemarkers array to use in multiple functions to have control
// over the number of places that show.
var placeMarkers = [];

function initMap() {

  // Create the new map instance
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 35.6894875, lng: 139.6917064},
    zoom: 11,
    mapTypeControl: false
  });

  // Create a new infowindow
  var largeInfowindow = new google.maps.InfoWindow();

  // Style the marker icon.
  var defaultIcon = makeMarkerIcon('0091ff');

  // Create a "highlighted location" marker color for when the user
  // mouses over the marker.
  var highlightedIcon = makeMarkerIcon('FFFF24');

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });
    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open the large infowindow at each marker.
    marker.addListener('click', function() {
      populateInfoWindow(this, largeInfowindow);
    });
    // Two event listeners - one for mouseover, one for mouseout,
    // to change the colors back and forth.
    marker.addListener('mouseover', function() {
      this.setIcon(highlightedIcon);
    });
    marker.addListener('mouseout', function() {
      this.setIcon(defaultIcon);
    });

    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }

}
// This function populates the infowindow when the marker is clicked. Only allow
// one infowindow which will open at the marker that is clicked and populate based
// on that marker's position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    // Clear the infowindow content to give the streetview time to load.
    infowindow.setContent('');
    infowindow.marker = marker;
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
    });

    // Open the infowindow on the correct marker.
    infowindow.open(map, marker);
  }
}
// This function will loop through the listings and hide them all.
function hideMarkers(markers) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}
// This function takes in a COLOR, and then creates a new marker
// icon of that color. The icon will be 21 px wide by 34 high, have an origin
// of 0, 0 and be anchored at 10, 34).
function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

// This function creates markers for each place found in either places search.
function createMarkersForPlaces(places) {
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < places.length; i++) {
    var place = places[i];
    var icon = {
      url: place.icon,
      size: new google.maps.Size(35, 35),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 34),
      scaledSize: new google.maps.Size(25, 25)
    };
    // Create a marker for each place.
    var marker = new google.maps.Marker({
      map: map,
      icon: icon,
      title: place.name,
      position: place.geometry.location,
      id: place.place_id
    });
    // Create a single infowindow to be used with the place details information
    // so that only one is open at once.
    var placeInfoWindow = new google.maps.InfoWindow();
    // If a marker is clicked, do a place details search on it in the next function.
    marker.addListener('click', function() {
      if (placeInfoWindow.marker == this) {
        console.log("This infowindow already is on this marker!");
      } else {
        getPlacesDetails(this, placeInfoWindow);
      }
    });
    placeMarkers.push(marker);
    if (place.geometry.viewport) {
      // Only geocodes have viewport.
      bounds.union(place.geometry.viewport);
    } else {
      bounds.extend(place.geometry.location);
    }
  }
  map.fitBounds(bounds);
}
// This is the PLACE DETAILS search - it's the most detailed so it's only
// executed when a marker is selected, indicating the user wants more
// details about that place.
function getPlacesDetails(marker, infowindow) {
  var service = new google.maps.places.PlacesService(map);
  service.getDetails({
    placeId: marker.id
    }, function(place, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Set the marker property on this infowindow so it isn't created again.
      infowindow.marker = marker;
      var innerHTML = '<div>';
      if (place.name) {
        innerHTML += '<strong>' + place.name + '</strong>';
      }
      if (place.formatted_address) {
        innerHTML += '<br>' + place.formatted_address;
      }
      if (place.formatted_phone_number) {
        innerHTML += '<br>' + place.formatted_phone_number;
      }
      if (place.opening_hours) {
        innerHTML += '<br><br><strong>Hours:</strong><br>' +
            place.opening_hours.weekday_text[0] + '<br>' +
            place.opening_hours.weekday_text[1] + '<br>' +
            place.opening_hours.weekday_text[2] + '<br>' +
            place.opening_hours.weekday_text[3] + '<br>' +
            place.opening_hours.weekday_text[4] + '<br>' +
            place.opening_hours.weekday_text[5] + '<br>' +
            place.opening_hours.weekday_text[6];
      }
      if (place.photos) {
        innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
            {maxHeight: 100, maxWidth: 200}) + '">';
      }
      innerHTML += '</div>';
      infowindow.setContent(innerHTML);
      infowindow.open(map, marker);
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    }
  });
}

// Knockout view model
var viewModel = function() {

  var self = this;

  self.filter = ko.observable();

    // Filter the locations based on the filter text
  self.filteredLocations = ko.pureComputed(function() {
    var filter = self.filter();

    if (!filter) {
      // If no filter entered, return all locations
      return locations;
    }

    var filterLocations = function(location) {
            return location.title.toLowerCase().includes(filter.toLowerCase());
    };

    return locations.filter(filterLocations);
  });
};

ko.applyBindings(new viewModel());
