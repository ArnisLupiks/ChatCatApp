angular.module('starter.controllers', [])
.controller('LoginCtrl', function($scope, auth, $state, store, $http) {
  function doAuth() {
    auth.signin({
      closable: false,
      // This asks for the refresh token
      // So that the user never has to log in again
      authParams: {
        scope: 'openid offline_access'
      }
    }, function(profile, idToken, accessToken, state, $h, refreshToken) {
      store.set('profile', profile);
      store.set('token', idToken);
      store.set('refreshToken', refreshToken);
      $state.go('tab.dash');

      var formData = {
            uid: profile.user_id,
            name: profile.name,
           picture: profile.picture
          };
          console.log("a here",formData);
          $scope.method = 'POST';
          $scope.url = 'http://46.101.46.12/ChatCat/api/addUser.php';
          //execute method
          $http({method: $scope.method, url: $scope.url, data: JSON.stringify(formData), headers : {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}}).
            success(function(data, status) {
              //if added information, it will log OK and redirect.
              console.log("OK", data);
              //redirect to main post page
          }).error(function(data, status) {
              $scope.status = status;
              console.log("oh, something whent wrong: " , data);
          });

    }, function(error) {
      console.log("There was an error logging in", error);
    });
  }

  $scope.$on('$ionic.reconnectScope', function() {
    doAuth();
  });

  doAuth();


})

.controller('DashCtrl', function($scope, $http, auth) {
  $scope.auth = auth;

  $scope.callApi = function() {
    // Just call the API as you'd do using $http
    $http({
      url: 'http://auth0-nodejsapi-sample.herokuapp.com/secured/ping',
      method: 'GET'
    }).then(function() {
      alert("We got the secured data successfully");
    }, function() {
      alert("Please download the API seed so that you can call it.");
    });
  };

})

.controller('ChatsCtrl', function($scope, Chats, auth) {
  $scope.auth = auth;

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope, auth, store, $state) {
  $scope.logout = function() {
    auth.signout();
    store.remove('token');
    store.remove('profile');
    store.remove('refreshToken');
    $state.go('login', {}, {reload: true});
  };
});
