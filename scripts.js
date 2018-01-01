// Create variables for map and location array
var map;

function mapError() {
  var alert = document.getElementById('map');
  alert.innerHTML += '<div class="alert alert-danger" role="alert">Error loading Google Maps. Please refresh the page.</div>';
}

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

  // Create an instance of infoWindow to display infomration when a marker is clicked
  var infowindow = new google.maps.InfoWindow();

  // Define location object
  var Location = function(locationData) {
    var self = this;
    this.title = locationData.title;
    this.position = locationData.location;
    this.venue_id = locationData.venue_id;
    this.visible = ko.observable(false);

    // Create a marker for the location
    this.marker = new google.maps.Marker({
      map: map,
      title: locationData.title,
      position: locationData.location,
      animation: google.maps.Animation.DROP,
      venue_id: locationData.venue_id
    });

    // Add the event handler for when the user clicks on the marker
    // Bounce the marker and populate the window with data
    this.marker.addListener('click', function() {
       var self = this;
      this.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout( function() {
        self.setAnimation(null);
      }, 1500);
      populateInfoWindow(this, infowindow);
    });

    // Update the visibility of the markers on the map based on filter criteria
    this.showMarker = ko.computed(function() {
      if (this.visible()) {
        this.marker.setMap(map);
      } else {
        this.marker.setMap(null);
      }
    }, this);

    // Populate the infowindow when the user selects a location
    function populateInfoWindow(marker, infowindow) {

      // Check to make sure the infowindow is not already opened on this marker.
      if (infowindow.marker != marker) {
        var client_id = 'QOSPDAY14A50TPUT13HFBTFUWXWHBQP5QFBK2GSSJTXV0Z3U';
        var client_secret = 'OOO5SVHYZMBN0F10E4TDQHALRNGPADJBYDZGBGXUU2ZZVPKN';
        var version = '20171231';
        var url = 'https://api.foursquare.com/v2/venues/' + marker.venue_id + '/photos';
        var data = { client_id: client_id, client_secret: client_secret, v: version, limit: 5};

        infowindow.marker = marker;

        // Perform a request to Foursquare for a photo of the currently selected marker
        var jqxhr = $.getJSON( url, data, function() {
        })
        .done(function() {
          if (jqxhr.status === 200) {
            photo = jqxhr.responseJSON.response.photos.items[0].prefix + 'cap200' + jqxhr.responseJSON.response.photos.items[0].suffix;
            infowindow.setContent('<div><b>' + marker.title + '</b></div><div><img src= ' + photo + ' alt="Venue photo"></img></div>');

          } else {
            infowindow.setContent('<div><b>' + marker.title + '</b></div><div>Unable to retrieve photo data</div>');
          }
        })
        .fail(function() {
          infowindow.setContent('<div><b>' + marker.title + '</b></div><div>Unable to retrieve photo data</div>');
        })

        // Open the infowindow and pan to the currently selected marker
        infowindow.open(map, marker);
        map.panTo(marker.getPosition());

        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick',function() {

          infowindow.setMarker = null;
          infowindow.setContent('');
        });
      }
    };

    // Select a marker when a link from the nav is clicked
    this.selectMarker = function(location) {
      google.maps.event.trigger(self.marker, 'click');
    }

  }

  // Knockout view model
  var viewModel = function() {

    var self = this;
    this.filter = ko.observable();
    this.locations = ko.observableArray([]);

    // Clear the filter text when the button is clicked
    this.clearFilter = function(data, event) {
        self.filter("");
    };

    // Create an array of locations based on the initial data
    pointsOfInterest.forEach(function(locationData){
		    self.locations.push(new Location(locationData));
	     });

    // Filter the locations based on the filter text
  	this.filteredLocations = ko.computed(function() {
       var filter = self.filter();

  		   if (!filter) {
  			      self.locations().forEach(function(location){
  				          location.visible(true);
  			   });
  			   return self.locations();
  		   } else {
  			   return ko.utils.arrayFilter(self.locations(), function(location) {
                    visibility = (location.title.toLowerCase().search(filter.toLowerCase()) >= 0);
                    location.visible(visibility);
  				          return visibility;
  			       });
  		   }
  	 }, self);
  };

  ko.applyBindings(new viewModel());

}
