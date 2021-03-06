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
    }, function($rootScope, profile, idToken, accessToken, state, $h, refreshToken) {
      store.set('profile', profile);
      store.set('token', idToken);
      store.set('refreshToken', refreshToken);
      $state.go('tab.dash');
      $rootScope.register();

      var formData = {
            uid: profile.user_id,
            name: profile.name,
           picture: profile.picture
          };
          console.log("a here",formData);

          $scope.method = 'POST';
          $scope.url = 'http://46.101.46.12/ChatCatApi/api/addUser.php';
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
.controller('DashCtrl', function($scope, $rootScope,auth, $cordovaPush, $cordovaDialogs, $cordovaMedia, $cordovaToast, ionPlatform, $http) {
  $scope.auth = auth;
  $scope.notifications = [];
  // call to register automatically upon device ready
  ionPlatform.ready.then(function (device) {
    $scope.register();
  });
  // Register
  $scope.register = function () {
  var config = null;
  if (ionic.Platform.isAndroid()) {
    config = {
      "senderID": "746245400391" // REPLACE THIS WITH YOURS FROM GCM CONSOLE - also in the project URL like: https://console.developers.google.com/project/434205989073
    };
  }
    else if (ionic.Platform.isIOS()) {
            config = {
                "badge": "true",
                "sound": "true",
                "alert": "true"
            }
        }

    $cordovaPush.register(config).then(function (result) {
           console.log("Register success " + result);

           $cordovaToast.showShortCenter('Registered for push notifications');
           $scope.registerDisabled=true;
           // ** NOTE: Android regid result comes back in the pushNotificationReceived, only iOS returned here
           if (ionic.Platform.isIOS()) {
               $scope.regId = result;
               storeDeviceToken("ios");
           }
       }, function (err) {
           console.log("Register error " + err)
       });
   }
    // Notification Received
    $scope.$on('$cordovaPush:notificationReceived', function (event, notification) {
       console.log(JSON.stringify([notification]));
       if (ionic.Platform.isAndroid()) {
           handleAndroid(notification);
       }
       else if (ionic.Platform.isIOS()) {
           handleIOS(notification);
           $scope.$apply(function () {
               $scope.notifications.push(JSON.stringify(notification.alert));
           })
       }
    });
    // Android Notification Received Handler
    function handleAndroid(notification) {
    // ** NOTE: ** You could add code for when app is in foreground or not, or coming from coldstart here too
    // via the console fields as shown.
    console.log("In foreground " + notification.foreground + " Coldstart " + notification.coldstart);
    if (notification.event == "registered") {
      $scope.regId = notification.regid;
      storeDeviceToken("android");
    }
    else if (notification.event == "message") {
      $cordovaDialogs.alert(notification.message, "Push Notification Received");
      $scope.$apply(function () {
        $scope.notifications.push(JSON.stringify(notification.message));
    })
    }
    else if (notification.event == "error")
      $cordovaDialogs.alert(notification.msg, "Push notification error event");
    else $cordovaDialogs.alert(notification.event, "Push notification handler - Unprocessed Event");
    }
  // type: Platform type (ios, android etc)
  function storeDeviceToken(type) {
    // Create a random userid to store with it
    var user = { uid: auth.profile.user_id, type: type, token: $scope.regId };
    $scope.method = 'POST';
    $scope.url = 'http://46.101.46.12/ChatCatApi/api/addGSMUser.php';
    //execute method
    $http({method: $scope.method, url: $scope.url, data: JSON.stringify(user), headers : {'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}}).
      success(function(data, status) {
        //if added information, it will log OK and redirect.
        console.log("Token stored, device is successfully subscribed to receive push notifications.");
        //redirect to main post page
    }).error(function(data, status) {
        $scope.status = status;
        console.log("Error storing device token." + data + " " + status)
    });
}

 // Unregister - Unregister your device token from APNS or GCM
 // Not recommended:  See http://developer.android.com/google/gcm/adv.html#unreg-why
 //                   and https://developer.apple.com/library/ios/documentation/UIKit/Reference/UIApplication_Class/index.html#//apple_ref/occ/instm/UIApplication/unregisterForRemoteNotifications
 //
 // ** Instead, just remove the device token from your db and stop sending notifications **
 $scope.unregister = function () {
     console.log("Unregister called");
     removeDeviceToken();
     $scope.registerDisabled=false;
     //need to define options here, not sure what that needs to be but this is not recommended anyway
//        $cordovaPush.unregister(options).then(function(result) {
//            console.log("Unregister success " + result);//
//        }, function(err) {
//            console.log("Unregister error " + err)
//        });
 }

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
})

.controller('users', function($scope, auth, $http){

});
