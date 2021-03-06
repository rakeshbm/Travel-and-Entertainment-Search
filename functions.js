$(document).ready(function (){
  
  var app = angular.module("myApp", ['ngAnimate']);
  detailLoc = "";
  text_store = [];
  data_final = [];
  curr_favor_page = 0;
  curr_list_page = 0;
  curr_list_row = 0;
  curr_list_mode = true;//true: result list, false: favorite list
  curr_id = "";
  curr_place = {};
  reviews = [[],[]]; // [google reviews, yelp reviews];
  reviewMode = true;//true: google, false: yelp
  curr_reviews = [];
  default_reviews = [];
  travelMode = 'DRIVING';
  orderMode = ""; // 0: default, 1: highest rating, 2: lowest rating, 3: most latest, 4: least latest
  app.controller('myCtrl', function($scope, $http, $compile) {
    $scope.loading = false;
    $scope.listing = true;
    $scope.infoShow = true;
    $scope.photosShow = false;
    $scope.mapShow = false;
    $scope.reviewsShow = false;
    $scope.disabled = true;
    $http.get("http://ip-api.com/json?callback=")
    .then(function(response) {
      $scope.lat = parseFloat(response.data.lat);
      $scope.lon = parseFloat(response.data.lon);
    }).catch(angular.noop);
    $scope.reset = function() {
      detailLoc = "";
      $scope.formData = {};
      $scope.myForm.$setPristine();
      $scope.keyword = "";
      $scope.category = $scope.categories[0];
      $scope.distance = "";
      document.getElementById("loc3").value = "";
      $scope.loc1 = "true";
      $scope.loc3 = "true";
      $scope.loc3.disabled = "true";
      $scope.loading = false;
      curr_id = "";
      curr_place = {};
      // $scope.search.disabled = "true";
      $scope.myForm.$setUntouched();
      text_store = [];
      data_final = [];
      curr_list_page = 0;
      curr_favor_page = 0;
      curr_list_mode = true;
      document.getElementById("results").innerHTML = "";
      $scope.disabled = true;
    }
    $scope.categories = ["Default", "Airport", "Amusement Park", "Aquarium", "Art Gallery",
  "Bakery", "Bar", "Beauty Salon", "Bowling Alley", "Bus Station", "Cafe", "Campground",
  "Car Rental", "Casino", "Lodging", "Movie Theater", "Museum", "Night Club", "Park",
  "Parking", "Restaurant", "Shopping Mall", "Stadium", "Subway Station", "Taxi Stand",
  "Train Station", "Transit Station", "Travel Agency", "Zoo"];
    $scope.street = function(lat, lng){
      var dest = {lat: lat, lng: lng};
      var map = new google.maps.Map(document.getElementById('mapFigure'), {
        center: dest,
        zoom: 14
      });
      var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('mapFigure'), {
          position: dest,
          pov: {
            heading: 34,
            pitch: 10
          }
      });
      map.setStreetView(panorama);
      var text = '';
      text += '<button class="btn btn-default" style="padding: 0" ng-click="googleMap('+lat+', '+lng+')">';
      text += '<img width="35px" height="32px" src="https://www.iosicongallery.com/icons/google-maps-2014-11-12/512.png">';
      text += '</button>';
      de = document.getElementById("streetView");
      de.innerHTML = "";
      angular.element(de).append($compile(text)($scope));
    }
    $scope.googleMap = function(lat, lng) {
      var dest = {lat: lat, lng: lng};
      //console.log(dest);
      var map = new google.maps.Map(document.getElementById("mapFigure"), {
        zoom: 15,
        center: dest
      });
      var marker = new google.maps.Marker({
        position: dest,
        map: map
      });
      var text = '';
      text += '<button class="btn btn-default" style="padding: 0" ng-click="street('+lat+', '+lng+')">';
      text += '<img width="35px" height="32px" src="http://veniceatlas.epfl.ch/wp-content/uploads/2014/12/pegman_02.jpg">';
      text += '</button>';
      de = document.getElementById("streetView");
      de.innerHTML = "";
      angular.element(de).append($compile(text)($scope));
    }
    $scope.getDirection = function(e) {
      var startP = (document.getElementById("start").value == "Your Location") ? {lat: $scope.lat, lng: $scope.lon} : document.getElementById("start").value;
      var endP = document.getElementById("end").value;
      var travelRequest =
      {
        origin: startP,
        destination: endP,
        travelMode: travelMode,
        provideRouteAlternatives: true
      };
      var directionsService = new google.maps.DirectionsService();
      var directionsDisplay = new google.maps.DirectionsRenderer();
      var mapOptions = {
        zoom: 15,
        center: endP
      }
      var map = new google.maps.Map(document.getElementById('mapFigure'), mapOptions);
      directionsDisplay.setMap(map);
      directionsService.route(travelRequest, function(result, status) {
        if (status == 'OK') {
          directionsDisplay.setDirections(result);
          console.log(result);
        }
      });
      document.getElementById('routePanel').innerHTML = '';
      directionsDisplay.setPanel(document.getElementById('routePanel'));
      e.preventDefault();
    }
    $scope.drive = function() {
      var re = document.getElementById("mode");
      text = "Driving <span class=\"caret  pull-right\"></span>";
      re.innerHTML = text;
      travelMode = 'DRIVING';
    }
    $scope.cycle = function() {
      var re = document.getElementById("mode");
      text = "Bicycling <span class=\"caret  pull-right\"></span>";
      re.innerHTML = text;
      travelMode = 'BICYCLING';
    }
    $scope.bus = function() {
      var re = document.getElementById("mode");
      text = "Transit <span class=\"caret pull-right\"></span>";
      re.innerHTML = text;
      travelMode = 'TRANSIT';
    }
    $scope.walk = function() {
      var re = document.getElementById("mode");
      text = "Walking <span class=\"caret pull-right\"></span>";
      re.innerHTML = text;
      travelMode = 'WALKING';
    }
    $scope.loc1 = true;
    $scope.ajaxGet = function(e) {
      var location = ($scope.loc1 == "true") ? undefined : document.getElementById('loc3').value;
      var url = "http://rmali.us-east-2.elasticbeanstalk.com/messages?"+"keyword="+$scope.keyword+"&category="+$scope.category+"&distance="+$scope.distance+"&location="+location+"&lon="+$scope.lon+"&lat="+$scope.lat;
      $scope.loading = true;
      $scope.listing = true;
      $scope.detailing = false;
      $scope.disabled = true;
      curr_id = "";
      curr_place = {};
      $http.get(url)
      .then(function(response) {
        if (response.statusText == "OK") {
          var data = response.data;
          $scope.loading = false;
          text_store = [];
          data_final = [];
          curr_list_page = 0;
          curr_favor_page = 0;
          curr_list_mode = true;
          getTable(data, 1);
        }
        else {
          $scope.errorDisplay();
        }
      }).catch(angular.noop);
      e.preventDefault();
    }
    $scope.errorDisplay = function() {
      $scope.listing = true;
      $scope.detailing = false;
      var text = '<div class="well well-sm fail">Failed to get search results</div>';
      var de = document.getElementById("results");
      de.innerHTML = "";
      angular.element(de).append($compile(text)($scope));
    }
    $scope.favorDetail = function(pg, ind) {
      var keys = JSON.parse(localStorage.getItem("keys"));
      var id = keys[20*pg+ind];
      $("#"+id).addClass("highlight");
      $("#"+id).siblings().removeClass("highlight");
      curr_id = id;
      $scope.detailFetch(id);
    }
    $scope.placeDetail = function(pg, ind) {
      curr_list_page = pg+1;
      curr_list_row = ind+1;
      var id = data_final[pg].places[ind].place_id;
      $("#"+id).addClass("highlight");
      $("#"+id).siblings().removeClass("highlight");
      curr_id = id;
      $scope.detailFetch(id);
    }
    $scope.detailFetch = function(id) {
      $scope.listing = false;
      $scope.detailing = true;
      var request = {
        placeId: id
      };
      var service = new google.maps.places.PlacesService($('#falseMap').get(0));
      service.getDetails(request, callback);
      function callback(place, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        //console.log(place);
        detailTable(place);
        curr_place = place
        }
      }
    }
     function detailTable(place) {
       $scope.showInfo();
       detailLoc = place.place_id;
      $scope.disabled = false;
      var text = "";
      text += '<br><br><h3 style="text-align: center"><span class="place-header">'+place.name+'</span></h3>';
      text += '<br><br><br><div>';
      text += '<button type="button" class="btn btn-default pull-left" id="lists" ng-click="list()"><span class="glyphicon glyphicon-chevron-left"></span>List</button>';
      text += '<button class="btn btn-default pull-right" style="padding: 0">';
      text += '<a href="https://twitter.com/intent/tweet?text='+encodeURI("Check out ")+encodeURI(place.name)+encodeURI(" located at ")+encodeURI(place.formatted_address)+encodeURI(". Website: ")+'&url='+encodeURI(place.website)+'&hashtags=TravelAndEntertainmentSearch">';
      text += '<img width=35px height=32px src="https://upload.wikimedia.org/wikipedia/fr/thumb/c/c8/Twitter_Bird.svg/738px-Twitter_Bird.svg.png" style="margin-left:1em;">';
      text += '</a>';
      text += '</button>';
      text += '<div id="detailfav" >'
      var keys = JSON.parse(localStorage.getItem("keys"));
      if (keys == null || !keys.includes(place.place_id)) {
        text += '<button type="button" class="btn btn-default pull-right" ng-click="favorsdetail()"><span class="glyphicon glyphicon-star-empty unfavoring"></span></button>';
      }
      else {
        text += '<button type="button" class="btn btn-default pull-right" ng-click="unfavorsdetail()"><span class="glyphicon glyphicon-star favoring"></span></button>';
      }
      text += '</div>';
      text += '</div>';
      text += '<br><br>';
      var de = document.getElementById("detailHeading");
      de.innerHTML = "";
      angular.element(de).append($compile(text)($scope));
      text = '';
      text += '<div>';
      var black=true;
      text += '<table class="table table-striped">';
      if (place.formatted_address != undefined) {
        if(black==true)
        {
            text += '<tr class="black-text">';
            black=false;
        }
        else
        {
            text += '<tr class="white-text">';
            black=true;
        }
        text += '<th>Address</th>';
        text += '<td>'+place.formatted_address+'</td>';
        text += '</tr>';
      }
      if (place.international_phone_number != undefined) {
        if(black==true)
        {
            text += '<tr class="black-text">';
            black=false;
        }
        else
        {
            text += '<tr class="white-text">';
            black=true;
        }
        text += '<th>Phone Number</th>';
        text += '<td>'+place.international_phone_number+'</td>';
        text += '</tr>';
      }
      if (place.price_level != undefined){
        if(black==true)
        {
            text += '<tr class="black-text">';
            black=false;
        }
        else
        {
            text += '<tr class="white-text">';
            black=true;
        }
        text += '<th>Price Level</th>';
        text += '<td>';
        for (var i = 0; i < place.price_level; i++) {
          text += '$';
        }
        text += '</td>';
        text += '</tr>';
      }
      if (place.rating != undefined) {
        if(black==true)
        {
            text += '<tr class="black-text">';
            black=false;
        }
        else
        {
            text += '<tr class="white-text">';
             black=true;
        }
        text += '<th>Rating</th>';
        text += '<td>'+place.rating;
        text += '<div id="stars-outer">';
        text += '<div id="stars-inner" style="width: '+(place.rating/5.0*100)+'%"></div>';
        text += '</div>';
        text += '</td>';
        text += '</tr>';
      }
      if (place.url != undefined) {
        if(black==true)
        {
            text += '<tr class="black-text">';
            black=false;
        }
        else
        {
            text += '<tr class="white-text">';
             black=true;
        }
        text += '<th>Google Page</th>';
        // text += '<td></td>';
        text += '<td><a href='+place.url+' target="_blank">'+place.url+'</a></td>';
        text += '</tr>';
      }
      if (place.website != undefined) {
        if(black==true)
        {
            text += '<tr class="black-text">';
            black=false;
        }
        else
        {
            text += '<tr class="white-text">';
            black=true;
        }
        text += '<th>Website</th>';
        // text += '<td></td>';
        text += '<td><a href='+place.website+' target="_blank">'+place.website+'</a></td>';
        text += '</tr>';
      }
      var modal = '';
      if (place.opening_hours != undefined) {
        if(black==true)
        {
            text += '<tr class="black-text">';
            black=false;
        }
        else
        {
            text += '<tr class="white-text">';
            black=true;
        }
        text += '<th>Hours</th>';
        text += '<td>';
        var now = moment();
        now.utcOffset(place.utc_offset);
        var day = (now.day()-1 < 0) ? 6 : now.day()-1;
        if (place.opening_hours.open_now) {
          var ind = place.opening_hours.weekday_text[day].indexOf(":");
          text += 'Open now:'+place.opening_hours.weekday_text[day].slice(ind+1)+' ';
        }
        else {
          text += 'Closed ';
        }
        text += '<a href="" data-toggle="modal" data-target="#myModal">Daily open hours</a>';
        text += '</td>';
        text += '</tr>';
        modal += '<div class="modal fade" id="myModal" role="dialog">';
        modal += '<div class="modal-dialog">';
        modal += '<div class="modal-content">';
        modal += '<div class="modal-header">';
        modal += '<button type="button" class="close" data-dismiss="modal">&times;</button>';
        modal += '<h4 class="modal-title">Open hours</h4>';
        modal += '</div>';
        modal += '<div class="modal-body">';
        modal += '<table class="table">'
        var allDays = place.opening_hours.weekday_text;
        allDays = (allDays.slice(day)).concat(allDays.slice(0, day));
        for (var i = 0; i < allDays.length; i++) {
          var days = allDays[i];
          days = days.split(": ");
          // console.log(day);
          modal += '<tr>';
          if (i == 0) {
            modal += '<td><b>'+days[0]+'</b></td>';
            modal += '<td><b>'+days[1]+'</b></td>';
          }
          else {
            modal += '<td>'+days[0]+'</td>';
            modal += '<td>'+days[1]+'</td>';
          }
          modal += '</tr>';
        }
        modal += '</table>';
        modal += '</div>';
        modal += '<div class="modal-footer">';
        modal += '<button type="button" id="modalClose" class="btn btn-primary" data-dismiss="modal">Close</button>';
        modal += '</div>';
        modal += '</div>';
        modal += '</div>';
        modal += '</div>';
      }
      text += '</table>';
      text += modal;
      text += '</div>';
      de = document.getElementById("infoSection");
      de.innerHTML = "";
      angular.element(de).append($compile(text)($scope));
      text = '';
      text += '<div>';
      if (place.photos == undefined) {
        text += '<div id="no" class="well well-sm">No Records</div>';
      }
      else {
        text += '<div class="row">';
        var col = ['<div class="col-md-3 col-sm-12">', '<div class="col-md-3 col-sm-12">', '<div class="col-md-3 col-sm-12">', '<div class="col-md-3 col-sm-12">'];
        for (var i = 0; i < place.photos.length; i++) {
          var tmp = col[i%4];
          var url = place.photos[i].getUrl({'maxWidth': 1600});
          tmp += '<div>';
          tmp += '<a href="'+url+'" target="_blank">';
          tmp += '<img style="width: 100%" src="'+url+'">';
          tmp += '</a>';
          tmp += '</div>';
          tmp += '<br>';
          col[i%4] = tmp;
        }
        for (var j = 0; j < 4; j++) {
          text += col[j];
          text += '</div>';
        }
        text += '</div>';
      }
      text += '</div>';
      de = document.getElementById("photoSection");
      de.innerHTML = "";
      angular.element(de).append($compile(text)($scope));
      text = '';
      document.getElementById("start").value = "Your Location";
      document.getElementById("direct").disabled = false;
      var endPoint = place.name+", "+place.formatted_address;
      document.getElementById("end").value=endPoint;
      $scope.googleMap(parseFloat(place.geometry.location.lat()), parseFloat(place.geometry.location.lng()));
      text += '<div>';
      text += '<div class="btn-group">';
      text += '<button type="button" id="reviewBtn" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
      text += 'Google Reviews <span class="caret"></span>';
      text += '</button>';
      text += '<ul class="dropdown-menu">';
      text += '<li><a href="#google" ng-click="showGoogle()">Google Reviews</a></li>';
      text += '<li><a href="#yelp" ng-click="showYelp()">Yelp Reviews</a></li>';
      text += '</ul>';
      text += '</div>';
      text += '<div class="btn-group">';
      text += '<button type="button" id="orderBtn" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
      text += 'Default Order <span class="caret"></span>';
      text += '</button>';
      text += '<ul class="dropdown-menu">';
      text += '<li><a href="#defaultOrder" ng-click="defaultOrder()">Default Order</a></li>';
      text += '<li><a href="#highestRating" ng-click="highestRating()">Highest Rating</a></li>';
      text += '<li><a href="#lowestRating" ng-click="lowestRating()">Lowest Rating</a></li>';
      text += '<li><a href="#mostRecent" ng-click="mostRecent()">Most Recent</a></li>';
      text += '<li><a href="#leastRecent" ng-click="leastRecent()">Least Recent</a></li>';
      text += '</ul>';
      text += '</div>';
      text += '<br><br>';
      text += '</div>';
      de = document.getElementById("reviewSectionBtn");
      de.innerHTML = "";
      angular.element(de).append($compile(text)($scope));
      text = '';
      reviews[0] = place.reviews;
      default_reviews = reviews[0].slice();
      curr_reviews = default_reviews.slice();
      orderMode = 0;
      reviewMode = true;
      var addrs = place.formatted_address.split(", ");
      var ad1 = addrs[0];
      var ad2 = addrs[2];
      var city = addrs[1];
      var state = (addrs[2].split(" "))[0];
      var country = "US";
      //console.log(addrs);
      var url_yelp = "http://rmali.us-east-2.elasticbeanstalk.com/yelp?"+"name="+place.name+"&address1="+ad1+"&address2="+ad2+"&city="+city+"&state="+state+"&country="+country;
      $http.get(encodeURI(url_yelp))
      .then(function(response) {
        //console.log(response);
        if (response == "error") {
          $scope.errorDisplay();
        }
        else {
          updateReviews(response.data);
        }
      }).catch(angular.noop);
      displayReviews();
    }
    function updateReviews(data) {
      reviews[1] = data;
    }
    function displayReviews() {
      curr_reviews = default_reviews.slice();
      var text = '';
      if (reviewMode) {
        default_reviews = reviews[0].slice();
        curr_reviews = default_reviews.slice();
        text = displayGoogle();
      }
      else {
        default_reviews = reviews[1].slice();
        curr_reviews = default_reviews.slice();
        text = displayYelp();
      }
      de = document.getElementById("reviewSectionPanel");
      de.innerHTML = "";
      angular.element(de).append($compile(text)($scope));
    }
    function displayYelp() {
      var text = '';
      if (curr_reviews.length == 0) {
        text += '<div id="no" class="well well-sm">No Records</div>';
      }
      else {
        switch(orderMode) {
          case 0:
            break;
          case 1:
            function compare1(a,b) {
              if (a.rating < b.rating)
                return 1;
              if (a.rating > b.rating)
                return -1;
              return 0;
            }
            curr_reviews.sort(compare1);
            break;
          case 2:
            function compare2(a,b) {
              if (a.rating < b.rating)
                return -1;
              if (a.rating > b.rating)
                return 1;
              return 0;
            }
            curr_reviews.sort(compare2);
            break;
          case 3:
            function compare3(a,b) {
              return -(moment(a.time_created).diff(moment(b.time_created)));
            }
              curr_reviews.sort(compare3);
            break;
          case 4:
            function compare4(a,b) {
              return (moment(a.time_created).diff(moment(b.time_created)));
            }
              curr_reviews.sort(compare4);
            break;
        }
        for (var i = 0; i < curr_reviews.length; i++) {
          text += '<div class="panel panel-default">';
          text += '<div class="panel-body">';
          text += '<div id="bloc1"  class="col-sm-1 col-xs-2">'//user photo div
          if (curr_reviews[i].user.image_url != undefined) {
            text += '<img style="width: 40px" class="img-circle" src="'+curr_reviews[i].user.image_url+'">';
          }
          text += '</div>';
          text += '<div id="bloc2" class="col-sm-11 col-xs-10">'//review content div
          text += '<div>'//review author name
          text += '<a href="'+curr_reviews[i].url+'" target="_blank">'+curr_reviews[i].user.name+'</a>';
          text += '</div>'
          text += '<div id="reviewRating">'//personal rating
          var rate = curr_reviews[i].rating;
          for (var j = 0; j < rate; j++) {
            text += '<div class="glyphicon glyphicon-star"></div>';
          }
          text += '</div>';
          text += '<div id="reviewTime" style="padding-left: 5px; color: #808080">';//review time
          text += curr_reviews[i].time_created;
          text += '</div>';
          text += '<div>';//rating text
          text += curr_reviews[i].text;
          text += '</div>';
          text += '</div>';
          text += '</div>';
          text += '</div>';
        }
      }
      return text;
    }
    function displayGoogle() {
      var text = '';
      if (curr_reviews.length == 0) {
        text += '<div id="no" class="well well-sm">No Records</div>';
      }
      else {
        switch(orderMode) {
          case 0:
            break;
          case 1:
            function compare1(a,b) {
              if (a.rating < b.rating)
                return 1;
              if (a.rating > b.rating)
                return -1;
              return 0;
            }
            curr_reviews.sort(compare1);
            break;
          case 2:
            function compare2(a,b) {
              if (a.rating < b.rating)
                return -1;
              if (a.rating > b.rating)
                return 1;
              return 0;
            }
            curr_reviews.sort(compare2);
            break;
          case 3:
            function compare3(a,b) {
              if (a.time < b.time)
                return 1;
              if (a.time > b.time)
                return -1;
              return 0;
            }
            curr_reviews.sort(compare3);
            break;
          case 4:
            function compare4(a,b) {
              if (a.time < b.time)
                return -1;
              if (a.time > b.time)
                return 1;
              return 0;
            }
            curr_reviews.sort(compare4);
            break;
        }
        for (var i = 0; i < curr_reviews.length; i++) {
          text += '<div class="panel panel-default">';
          text += '<div class="panel-body">';
          text += '<div id="bloc1"  class="col-sm-1 col-xs-2">'//user photo div
          if (curr_reviews[i].profile_photo_url != undefined) {
            text += '<img style="width: 40px" src="'+curr_reviews[i].profile_photo_url+'">';
          }
          text += '</div>';
          text += '<div id="bloc2" class="col-sm-11 col-xs-10">'//review content div
          text += '<div>'//review author name
          text += '<a href="'+curr_reviews[i].author_url+'" target="_blank">'+curr_reviews[i].author_name+'</a>';
          text += '</div>'
          text += '<div id="reviewRating">'//personal rating
          var rate = curr_reviews[i].rating;
          for (var j = 0; j < rate; j++) {
            text += '<div class="glyphicon glyphicon-star"></div>';
          }
          text += '</div>';
          text += '<div id="reviewTime" style="padding-left: 5px; color: #808080">';//review time
          var day = moment("1970-01-01 00:00:00");
          day.add(curr_reviews[i].time, 's')
          text += day.format("YYYY-MM-DD hh:mm:ss");//"dddd, MMMM Do YYYY, h:mm:ss a"
          text += '</div>';
          text += '<div>';//rating text
          text += curr_reviews[i].text;
          text += '</div>';
          text += '</div>';
          text += '</div>';
          text += '</div>';
        }
      }
      return text;
    }
    $scope.defaultOrder = function() {
      var re = document.getElementById("orderBtn");
      text = "Default Order <span class=\"caret\"></span>";
      re.innerHTML = text;
      orderMode = 0;
      displayReviews();
    }
    $scope.highestRating = function() {
      var re = document.getElementById("orderBtn");
      text = "Highest Rating <span class=\"caret\"></span>";
      re.innerHTML = text;
      orderMode = 1;
      displayReviews();
    }
    $scope.lowestRating = function() {
      var re = document.getElementById("orderBtn");
      text = "Lowest Rating <span class=\"caret\"></span>";
      re.innerHTML = text;
      orderMode = 2;
      displayReviews();
    }
    $scope.mostRecent = function() {
      var re = document.getElementById("orderBtn");
      text = "Most Recent <span class=\"caret\"></span>";
      re.innerHTML = text;
      orderMode = 3;
      displayReviews();
    }
    $scope.leastRecent = function() {
      var re = document.getElementById("orderBtn");
      text = "Least Recent <span class=\"caret\"></span>";
      re.innerHTML = text;
      orderMode = 4;
      displayReviews();
    }
    $scope.showGoogle = function() {
      var re = document.getElementById("reviewBtn");
      text = "Google Reviews <span class=\"caret\"></span>";
      re.innerHTML = text;
      default_reviews = reviews[0].slice();
      curr_reviews = default_reviews.slice();
      reviewMode = true;
      displayReviews();
    }
    $scope.showYelp = function() {
      var re = document.getElementById("reviewBtn");
      text = "Yelp Reviews <span class=\"caret\"></span>";
      re.innerHTML = text;
      default_reviews = reviews[1].slice();
      curr_reviews = default_reviews.slice();
      //console.log(curr_reviews);
      reviewMode = false;
      displayReviews();
    }
    $scope.loc1click = function() {
      document.getElementById("loc3").value = "";
    }
    $scope.initial = function() {
      $scope.infoShow = true;
      $scope.photosShow = false;
      $scope.mapShow = false;
      $scope.reviewsShow = false;
    }
    $scope.showInfo = function() {
      $scope.infoShow = true;
      $scope.photosShow = false;
      $scope.mapShow = false;
      $scope.reviewsShow = false;
      $("#info").addClass("active");
      $("#photos").removeClass("active");
      $("#map").removeClass("active");
      $("#reviews").removeClass("active");
    }
    $scope.showPhotos = function() {
      $scope.infoShow = false;
      $scope.photosShow = true;
      $scope.mapShow = false;
      $scope.reviewsShow = false;
      $("#photos").addClass("active");
      $("#map").removeClass("active");
      $("#reviews").removeClass("active");
      $("#info").removeClass("active");
    }
    $scope.showMap = function() {
      $scope.infoShow = false;
      $scope.photosShow = false;
      $scope.mapShow = true;
      $scope.reviewsShow = false;
      $("#map").addClass("active");
      $("#photos").removeClass("active");
      $("#reviews").removeClass("active");
      $("#info").removeClass("active");
    }
    $scope.showReviews = function() {
      $scope.infoShow = false;
      $scope.photosShow = false;
      $scope.mapShow = false;
      $scope.reviewsShow = true;
      $("#reviews").addClass("active");
      $("#photos").removeClass("active");
      $("#map").removeClass("active");
      $("#info").removeClass("active");
    }
    $scope.list = function() {
      $("#routePanel").empty();
      $scope.listing = true;
      $scope.detailing = false;
      if (curr_list_mode) {
        getTable(data_final[curr_list_page-1], curr_list_page)
      }
      else {
        $scope.favorTable(curr_favor_page);
      }
    }
    $scope.showDetail = function() {
      $scope.listing = false;
      $scope.detailing = true;
    }
    $scope.resultList = function() {
      curr_list_mode = true;
      document.getElementById("favorites").style.color = "rgb(66, 121, 178)";
      document.getElementById("favorites").style.backgroundColor = "white";
      document.getElementById("resultBtn").style.color = "white";
      document.getElementById("resultBtn").style.backgroundColor = "rgb(66, 121, 178)";
      $scope.list();
      var re = document.getElementById("results");
      var text = "";
      if (data_final.length == 0) {
        text += '<div id="no" class="well well-sm">No Records</div>';
      }
      else {
        var data = data_final[curr_list_page-1];
        getTable(data, curr_list_page);
      }
    }
    function getTable(data, page) {
      data_final[page-1] = data;
      curr_list_page = page;
      curr_list_mode = true;
      var re = document.getElementById("results");
      var text = "";
      if (data == null || data.places.length == 0) {
        text += '<div id="no" class="well well-sm">No Records</div>';
      }
      else {
        var leng = data.places.length;
        text += '<div style="text-align: right">';
        text += '<button type="button" class="btn btn-default" ng-model="details" ng-disabled="disabled" ng-click="showDetail()" id="details">Details<span class="glyphicon glyphicon-chevron-right"></span></button>';
        text += '</div>';
        text += '<div style="overflow-x:auto;">';
        text += '<table class="table">';
        text += '<thead>';
        text += '<tr>';
        text += '<th scope="col">#</th>';
        text += '<th scope="col">Category</th>';
        text += '<th scope="col">Name</th>';
        text += '<th scope="col">Address</th>';
        text += '<th scope="col">Favorite</th>';
        text += '<th scope="col">Details</th>';
        text += '</tr>';
        text += '</thead>';
        text += '<tbody>';
        for (var i = 1; i <= leng; i++) {
          if (data.places[i-1].place_id == curr_id) {
            text += '<tr id="'+data.places[i-1].place_id+'" style="height: 30px" class="highlight">';
          }
          else {
            text += '<tr id="'+data.places[i-1].place_id+'" style="height: 30px">';//tr's id: 1=>resultlist 2=>favoriteList
          }
          text += '<th scope="row" style="height: 30px">'+i+'</th>';
          text += '<td><img src='+data.places[i-1].icon+' alt="category_pic"  style="height: 30px"></td>';
          text += '<td style="min-width:400px">'+data.places[i-1].name+'</td>';
          text += '<td style="min-width:400px">'+data.places[i-1].vicinity+'</td>';
          // data_final[page-1].places[this.parentNode.parentNode.id]
          var keys = JSON.parse(localStorage.getItem("keys"));
          if (keys == null || !keys.includes(data.places[i-1].place_id)) {
            text += '<td><button type="button" class="btn btn-default" ng-click="favorsList('+(page-1)+', '+(i-1)+')"><span class="unfavoring glyphicon glyphicon-star-empty"></span></button></td>';
          }
          else {
            text += '<td><button type="button" class="btn btn-default favoring" ng-click="unfavorsList('+(page-1)+', '+(i-1)+')"><span class="favoring glyphicon glyphicon-star"></span></button></td>';
          }
          text += '<td><button type="button" class="btn btn-default" ng-click="placeDetail('+(page-1)+', '+(i-1)+')"><span class="glyphicon glyphicon-chevron-right"></span></button></td>';
          text += '</tr>';
        }
        text += '</tbody>';
        text += '</table>';
        text += '</div>';
        text += '<div style="text-align: center">';
        if (page > 1) {
          text += '<button type="button" class="btn btn-default" style="width: 100px" ng-click="prePage('+(page-1)+')">Previous</button>';
        }
        if (data.token != undefined) {
          text += '<button type="button" class="btn btn-default" style="width: 100px" ng-click="nextPage('+(page+1)+')">Next</button>';
        }
        text += '</div>';
        text_store[page-1] = text;
      }
      re.innerHTML = "";
      angular.element(re).append($compile(text)($scope));
    }
    $scope.favorBefore = function() {
      document.getElementById("favorites").style.color = "white";
      document.getElementById("favorites").style.backgroundColor = "rgb(66, 121, 178)";
      document.getElementById("resultBtn").style.color = "rgb(66, 121, 178)";
      document.getElementById("resultBtn").style.backgroundColor = "white";
      $scope.favorTable(1);
    }
    $scope.favorTable = function(page) {
      curr_favor_page = page;
      curr_list_mode = false;
      $scope.listing = true;
      $scope.detailing = false;
      var re = document.getElementById("results");
      var keys = JSON.parse(localStorage.getItem("keys"));
      if (keys == null) {
        keys = [];
      }
      var text = "";
      if (keys.length == 0) {
        text += '<div id="no" class="well well-sm">No Records!</div>';
      }
      else {
        //console.log(keys);
        var leng = (keys.length > 20*page) ? 20 : keys.length-20*(page-1);
        text += '<div style="text-align: right">';
        text += '<button type="button" class="btn btn-default" id="detailsFavor" ng-click="showDetail()"  ng-model="details" ng-disabled="disabled">Details<span class="glyphicon glyphicon-chevron-right"></span></button>';
        text += '</div>';
        text += '<div style="overflow-x:auto;">';
        text += '<table class="table">';
        text += '<thead>';
        text += '<tr>';
        text += '<th scope="col">#</th>';
        text += '<th scope="col">Category</th>';
        text += '<th scope="col">Name</th>';
        text += '<th scope="col">Address</th>';
        text += '<th scope="col">Favorite</th>';
        text += '<th scope="col">Details</th>';
        text += '</tr>';
        text += '</thead>';
        text += '<tbody>';
        for (var i = 1; i <= leng; i++) {
          var key = keys[20*(page-1)+i-1];
          if (key != null) {
            var ob = JSON.parse(localStorage.getItem(key));
            //console.log(key);
            //console.log(ob);
            text += '<tr id="'+key+'" style="height: 30px">';
            text += '<th scope="row" style="height: 30px">'+i+'</th>';
            text += '<td><img src='+ ob.icon+' alt="category_pic"  style="height: 30px"></td>';
            text += '<td style="min-width:400px">'+ob.name+'</td>';
            text += '<td style="min-width:400px">'+ob.vicinity+'</td>';
            text += '<td><button type="button" class="btn btn-default" ng-click="unfavors('+i+', '+page+')"><span class="glyphicon glyphicon-trash"></span></button></td>';
            text += '<td><button type="button" class="btn btn-default" ng-click="favorDetail('+(page-1)+', '+(i-1)+')"><span class="glyphicon glyphicon-chevron-right"></span></button></td>';
            text += '</tr>';
          }
          //console.log(page);
          //console.log(i);
          //console.log(leng);
        }
        text += '</tbody>';
        text += '</table>';
        text += '</div>';
        text += '<div style="text-align: center">';
        if (keys.length > 20*page) {
          text += '<button type="button" class="btn btn-default" style="width: 100px" ng-click="favorTable('+(page+1)+')">Next</button>';
        }
        if (page > 1) {
          text += '<button type="button" class="btn btn-default" style="width: 100px" ng-click="favorTable('+(page-1)+')">Previous</button>';
        }
        text += '</div>';
      }
      re.innerHTML = "";
      angular.element(re).append($compile(text)($scope));
    }
    $scope.unfavorsList = function(pg, ind) {
      var place = data_final[pg].places[ind];
      var id = place.place_id;
      var re = document.getElementById(id).childNodes[4];
      var text = '<button type="button" class="btn btn-default" ng-click="favorsList('+pg+', '+ind+')"><span class="unfavoring glyphicon glyphicon-star-empty"></span></button>';
      re.innerHTML = "";
      angular.element(re).append($compile(text)($scope));
      $scope.unfavorsDe(id);
    }
    $scope.favorsList = function(pg, ind) {
      var place = data_final[pg].places[ind];
      var id = place.place_id;
      var re = document.getElementById(id).childNodes[4];
      var text = '<button type="button" class="btn btn-default" ng-click="unfavorsList('+pg+', '+ind+')"><span class="favoring glyphicon glyphicon-star"></span></button>';
      re.innerHTML = "";
      angular.element(re).append($compile(text)($scope));
      $scope.favors(place);//
    }
    $scope.favorsdetail = function() {
      document.getElementById("detailfav").innerHTML = '<button type="button" class="btn btn-default pull-right" ng-click="unfavorsdetail()"><span class="glyphicon glyphicon-star favoring"></span></button>';
      $scope.favors(curr_place);
    }
    $scope.unfavorsdetail = function() {
      document.getElementById("detailfav").innerHTML = '<button type="button" class="btn btn-default pull-right" ng-click="favorsdetail()"><span class="glyphicon glyphicon-star-empty unfavoring"></span></button>'
      $scope.unfavorsDe(curr_place.place_id);
    }
    $scope.favors = function(place) {
      if (localStorage.getItem(place.place_id) == null) {
        localStorage.setItem(place.place_id, JSON.stringify(place));
        if(localStorage.getItem("keys") != null) {
          var keys = JSON.parse(localStorage.getItem("keys"));
        }
        else {
          var keys = [];
        }
        keys.push(place.place_id);
        localStorage.setItem("keys", JSON.stringify(keys));
      }
    }
      $scope.unfavors = function(id, page) {
        var keys = JSON.parse(localStorage.getItem("keys"));
        var key = keys[20*(page-1)+id-1];
        var ind = keys.indexOf(key);
        keys.splice(ind, 1);
        localStorage.removeItem(key);
        localStorage.setItem("keys", JSON.stringify(keys));
        $scope.favorTable(page);
      }
      $scope.unfavorsDe = function(key) {
        var keys = JSON.parse(localStorage.getItem("keys"));
        var ind = keys.indexOf(key);
        keys.splice(ind, 1);
        localStorage.removeItem(key);
        localStorage.setItem("keys", JSON.stringify(keys));
      }
      $scope.prePage = function(page) {
        curr_list_page = page;
        var data = data_final[page-1];
        getTable(data, page);
      }
      $scope.nextPage = function(page) {
        curr_list_page = page;
          $scope.loading = true;
          var url = "http://rmali.us-east-2.elasticbeanstalk.com/next?"+"token="+data_final[page-2].token;
          $http.get(url)
          .then(function(response) {
            if (response.statusText == "OK") {
              var data = response.data;
              $scope.loading = false;
              getTable(data, page);
            }
            else {
              $scope.errorDisplay();
            }
          }).catch(angular.noop);
      }
      var input1 = document.getElementById('loc3');
      var input2 = document.getElementById('start');
      autocomplete1 = new google.maps.places.Autocomplete(input1);
      autocomplete2 = new google.maps.places.Autocomplete(input2);
  })
  
});
