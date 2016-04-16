var api = Instajam.init({
    clientId: 'd487fbb45af44248899be4ec567fa1c4',
    redirectUri: 'http://localhost:3000',
    scope: ['basic','follower_list','public_content']
});

var app = angular.module('app', ['ngRoute']);

app.service('instajam', function($q){

    var self = $q.defer();
    var media = $q.defer();

    var selfLoaded = false;
    var mediaLoaded = false;

    this.self = function() {
        if(!selfLoaded){
            api.user.self.profile(function(response){
                self.resolve(response.data);
                selfLoaded = true;
            });
        }
        return self.promise;
    };

    this.media = function() {
        if(!mediaLoaded){
            api.user.self.media({count:9},function(response){
                media.resolve(response.data);
                mediaLoaded = true;
            });
        }
        return media.promise;
    };

    this.followedBy = function(){

    };

    this.api = function() {
        return api;
    };

});

app.config(function($routeProvider) {
 $routeProvider

 .when('/', {
    templateUrl: 'views/home.htm',
    controller: 'homeController'
})

 .when('/media', {
     templateUrl: 'views/media.htm',
     controller: 'mediaController'
 });
});

app.controller('navController', function($scope, instajam){
    $scope.api = instajam.api();
});

app.controller('mainController', function($scope, instajam) {
    $scope.api = instajam.api();
});

app.controller('homeController', function($scope, instajam){
    instajam.self().then(function(data){
        $scope.self = data;
    });

    var outgoing =[];
    var incoming = [];

    //users i am following
    instajam.api().user.follows('self',function(response){
        var i;
        for(i = 0; i < response.data.length; i++){
            var profile = response.data[i];

            instajam.api().user.relationshipWith(profile.id,function(status){
                //if they don't follow me
                if(status.data.incoming_status == 'none'){
                    outgoing.push(profile);
                }
                $scope.outgoing = outgoing;
                $scope.$apply();

            });
        }
    });

    // users who follow me
    instajam.api().user.following('self', function(response){
        var i;
        for (i = 0; i < response.data.length; i++){
            var profile = response.data[i];

            instajam.api().user.relationshipWith(profile.id,function(status){
                //if i don't follow them
                if(status.data.outgoing_status == 'none'){
                    incoming.push(profile);
                }
                $scope.incoming = incoming;
                $scope.$apply();
            });
        }
    });

});

app.controller('mediaController', function($scope, instajam) {
    instajam.media().then(function(data){
        $scope.media = data;
    });

});

