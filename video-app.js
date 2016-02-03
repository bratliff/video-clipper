var videoApp = angular.module('videoApp', ['ngAnimate']);

videoApp.controller('VideoController', ['$scope', '$compile', '$q', '$window', '$interval', '$http', function($scope, $compile, $q, $window, $interval, $http) {
    $scope.videoDisplay = document.getElementById("VideoElement");
    $scope.videoSource = $window.videoSource;
    $scope.titleDisplay = $window.titleDisplay;
    $scope.videoDescription = $window.videoDescription;
    $scope.videoPlaying = false;
    $scope.currentTime;
    $scope.scrubTop = -900;
    $scope.scrubLeft = -1000;
    $scope.vidHeightCenter = -1000;
    $scope.vidWidthCenter = -1000;
    $scope.isDragging = false;
    $scope.showOptions = true;
    $scope.clips;
    $scope.keypress = false;
    $scope.vidIndex = 0;

    
    
    $http.get('data/clips.json').success(function(data) {
        $scope.clips = data;
    })
    
    $interval(function(){
        if(!$scope.isDragging){
            var t = $scope.videoDisplay.currentTime;
            var d = $scope.videoDisplay.duration;
            var w = t / d * 100;
            var p = document.getElementById('progressMeterFull').offsetLeft + document.getElementById('progressMeterFull').offsetWidth;
            $scope.scrubLeft = (t / d * p) - 7;
        }else{
            $scope.scrubLeft = document.getElementById('thumbScrubber').offsetLeft;
        }
        $scope.updateLayout()
    }, 100);
    
    
    $scope.initPlayer = function() {
        $scope.currentTime = 0;
        $scope.totalTime = 0;
        $scope.videoDisplay.addEventListener("timeupdate", $scope.updateTime, true);
        $scope.videoDisplay.addEventListener("loadedmetadata", $scope.updateData, true);
    }

    $scope.loadTime 
    
    $scope.updateTime = function(e) {
        if(!$scope.videoDisplay.seeking){
            $scope.currentTime = e.target.currentTime;
            if($scope.currentTime == $scope.totalTime){
                $scope.videoDisplay.pause();
                $scope.videoPlaying = false;
                $scope.currentTime = 0;
                $('#playBtn').children("span").toggleClass("glyphicon-play", true);
                $('#playBtn').children("span").toggleClass("glyphicon-pause", false);
            }
        }
    }
    
    $scope.updateData = function(e) {
        $scope.totalTime = e.target.duration;
    }
    
    $scope.updateLayout = function() {
        $scope.scrubTop = document.getElementById('progressMeterFull').offsetTop-2;
        $scope.vidHeightCenter =  $scope.videoDisplay.offsetHeight/2 - 50;
        $scope.vidWidthCenter = $scope.videoDisplay.offsetWidth/2 - 50;
        if(!$scope.$$phase) {
            $scope.$apply();
        }
    }
    
    
    $scope.mouseMoving = function($event) {
        if($scope.isDragging){
            $("#thumbScrubber").offset({left:$event.pageX});
        }
    }

    $scope.dragStart = function($event) {
        $scope.isDragging = true;
    }

    $scope.dragStop = function($event) {
        if($scope.isDragging){
            $scope.videoSeek($event);
            $scope.isDragging = false;
        }
    }
    
    
    $scope.videoSeek = function($event) {
        var w = document.getElementById('progressMeterFull').offsetWidth;
        var d = $scope.videoDisplay.duration;
        var s = Math.round($event.pageX / w * d);
        $scope.videoDisplay.currentTime = s;
    }

    $scope.markerpositions = function(startTime) {
        var w = document.getElementById('progressMeterFull').offsetWidth;
        var timetotal = Math.round($scope.totalTime);
        var unit = (w / timetotal);
        var leftPos = Math.round(startTime * unit) - 13;
        return leftPos;
    }

    $scope.placemarkers = function($event) {
        $('.vidmarkers').empty();

        for (var i = 0; i < $scope.clips.length; i++) {
            var $newPin = angular.element('<img src="blue-pin.png" class="pin clipchoice" style="left:' + $scope.markerpositions($scope.clips[i].startTime) + 'px" ng-click="togglePlay($event,' + i + ')" />');
           $compile($newPin)($scope);
            $('.vidmarkers').append($newPin);     
        }
    }
     
    $scope.toggleDetails = function() {
        if($scope.showOptions){
            $scope.showOptions = false;
        }else{
            $scope.showOptions = true;
        }
    }
    
    
    $scope.videoSelected = function(i) {
        $scope.titleDisplay = $scope.playlist[i].title;
        $scope.videoDescription = $scope.playlist[i].description;
        $scope.videoSource = $scope.playlist[i].path;
        $scope.videoDisplay.load($scope.videoSource);
        $scope.videoPlaying = false;
        $('#playBtn').children("span").toggleClass("glyphicon-play", true);
        $('#playBtn').children("span").toggleClass("glyphicon-pause", false);
        $scope.showOptions = false;
    }
    
    
    $scope.togglePlay = function(event, index) { 
        var parenttarget = angular.element(event.target.parentNode);

        if(parenttarget.hasClass('clipchoice') || parenttarget.hasClass('vidmarkers') || $scope.keypress == true){
            var location;
            location = 'video/sintel_trailer-480.mp4#t=' + $scope.clips[index].startTime +
        ',' + $scope.clips[index].endTime;
            $scope.videoSource = location;
            $scope.videoDisplay.play(); 
            $scope.vidIndex = index;
        }
           
        if($scope.videoDisplay.paused){
            $scope.videoDisplay.play();
            $scope.videoPlaying = true;
            $('#playBtn').children("span").toggleClass("glyphicon-play", false);
            $('#playBtn').children("span").toggleClass("glyphicon-pause", true);
        }else{
            $scope.videoDisplay.pause();
            $scope.videoPlaying = false;
            $('#playBtn').children("span").toggleClass("glyphicon-play", true);
            $('#playBtn').children("span").toggleClass("glyphicon-pause", false);
        }
    }
    
    $scope.toggleMute = function() {
        if($scope.videoDisplay.volume == 0.0){
            $scope.videoDisplay.volume = 1.0;
            $('#muteBtn').children("span").toggleClass("glyphicon-volume-up", true);
            $('#muteBtn').children("span").toggleClass("glyphicon-volume-off", false);
        }else{
            $scope.videoDisplay.volume = 0.0;
            $('#muteBtn').children("span").toggleClass("glyphicon-volume-up", false);
            $('#muteBtn').children("span").toggleClass("glyphicon-volume-off", true);
        }
    }
    
    
    $scope.toggleFullscreen = function() {
        var v = $scope.videoDisplay;
        if(v.requestFullscreen) {
            v.requestFullscreen();
        }else if(v.mozRequestFullScreen) {
            v.mozRequestFullScreen();
        }else if(v.webkitRequestFullscreen) {
            v.webkitRequestFullscreen();
        }else if(v.msRequestFullscreen) {
            v.msRequestFullscreen();
        }
    }

    $scope.clipDeleted = function(index) {
        $scope.clips.splice(index, 1);
    }
    $scope.newClip = function() {
        if ($scope.endTime > $scope.totalTime) {
            $scope.endTime = Math.round($scope.totalTime);
        }
        var newObj = {'title':$scope.clipName,'startTime':$scope.startTime,'endTime':$scope.endTime };
        $scope.clips.push(newObj);
        $scope.placemarkers();
    }
    
    $scope.readKey = function(event) {
        var newIndex;

        if(event.charCode == 46) {
            $scope.keypress = true;
            if($scope.vidIndex < $scope.clips.length-1 ) {
                $scope.vidIndex++;
            }
            $scope.togglePlay(event, $scope.vidIndex);
        }
        if(event.charCode == 44) {
            $scope.keypress = true;
            if($scope.vidIndex !== 0) {
               $scope.vidIndex--; 
            } 
            $scope.togglePlay(event, $scope.vidIndex);
        }
    }

    function timeLoad() {
      // perform some asynchronous operation, resolve or reject the promise when appropriate.
      return $q(function(resolve, reject) {
        setTimeout(function() {
          if ($scope.totalTime !== 0) {
            resolve('Time loaded');
          } else {
            reject('Time not loaded');
          }
        }, 1000);
      });
    }

    var promise = timeLoad();
    promise.then(function(){
        $scope.placemarkers();
    })

    
    $scope.initPlayer();
    
}]);

videoApp.filter('time', function() {
    return function(seconds) {
        var hh = Math.floor(seconds / 3600), mm = Math.floor(seconds / 60) % 60, ss = Math.floor(seconds) % 60;
        return hh + ":" + (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss;
    };
});


