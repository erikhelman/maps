// Create variables for map and location array
var map;
var locations = [];

// Initialize map
function initMap() {

  // These are the locations that will be shown to the user.
  var pointsOfInterest = [
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

  // Call Google API for new map object
  map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 35.6894888, lng: 139.691706},
      zoom: 11,
      mapTypeControl: false
    });

  // Define location object
  var Location = function(locationData) {

    this.title = locationData.title;
    this.position = locationData.location;
    this.venue_id = locationData.venue_id;
    this.hidden = ko.observable(false);
    this.infoWindow = new google.maps.InfoWindow();

    this.marker = new google.maps.Marker({
      map: map,
      title: locationData.title,
      position: locationData.location
    });

    this.hideMarker = ko.pureComputed(function() {
      if (self.hidden()) {
        this.marker.setMap(null);
      } else {
        this.marker.setMap(map);
      }
      return true;
    }, this);

    this.infoWindow.setContent(locationData.title);
  }

  // Create an object for each point of interest
  pointsOfInterest.forEach(function(info) {
    locations.push(new Location(info));
  });

  // Knockout view model
  var viewModel = function() {

    var self = this;
    this.filter = ko.observable();

    // Filter the locations based on the filter text
    this.filteredLocations = ko.pureComputed(function() {
      var filter = self.filter();

      if (!filter) {
        // If no filter entered, return all locations
        locations.forEach(function(location) {
          location.hidden(false);
        });
        return locations;
      }

      // Convert to lower case and compare filter to location titles
      var filterLocations = function(location) {
              return location.title.toLowerCase().includes(filter.toLowerCase());
      };

      return locations.filter(filterLocations);
    });

  };

  ko.applyBindings(new viewModel());

}
