/********************************
M E D I A P L A Y E R
********************************/

var Mediaplayer = function () {
    if (Mediaplayer) {
        Mediaplayer.Query ();
        return Mediaplayer;
    }

    /********************************
    S U B C L A S S E S 
    ********************************/

    /********************************
    Skin
    ********************************/

    var Skin = function () {
        var Skin = {};

        Skin.overlay = function () {
            var html = '<div class="overlay">';
            html += '   <a class="btn btn-cta btn-play" title="Play Video"><i class="icon-play"></i></a>';
            html += '</div>';
            return $(html);
        };
        Skin.controls = function () {
            var html = '<div class="controls">';
            html += '   <div class="play"><i class="icon-play"></i></div>';
            html += '   <div class="pause"><i class="icon-pause"></i></div>';
            html += '   <div class="timeline">';
            html += '       <div class="track">';
            html += '           <div class="buffer"></div>';
            html += '           <div class="progress"></div>';
            html += '       </div>';
            html += '       <div class="scrub"></div>';
            html += '   </div>';
            html += '   <div class="info">';
            html += '       <span class="current">00:00</span>';
            html += '       <span class="duration">00:00</span>';
            html += '   </div>';
            html += '   <div class="audio-on"><i class="icon-audio-on"></i></div>';
            html += '   <div class="audio-off"><i class="icon-audio-off"></i></div>';
            html += '   <div class="fullscreen"><i class="icon-fullscreen"></i></div>';
            html += '   <div class="normal"><i class="icon-normal"></i></div>';
            html += '   <div class="share"><i class="icon-share"></i></div>';
            html += '</div>';
            return $(html);
        };

        return Skin;
    }();

    /********************************
    VideoHtml5
    ********************************/

    var VideoHtml5 = function () {

        var READY = false, players = {}, count = 0;

        function timeRangesToString(r) {
            var log = "";
            for (var i = 0; i < r.length; i++) {
                log += "[" + r.start(i) + "," + r.end(i) + "]<br>";
            }
            return log;
        }

        function Buffer($e) {
            var player = $e.target;
            var item = players[player.id];
            var buffer = player.buffered, start, end, maxBuffer = 0;
            if (buffer) {
                var i = 0; t = buffer.length;
                while (i < t) {
                    start = buffer.start(i) / player.duration;
                    end = buffer.end(i) / player.duration;
                    maxBuffer = Math.max(maxBuffer, end);
                    i++;
                }
                /*
                var log = "Buffered:<br>"
                        + timeRangesToString(video.buffered)
                        + "<br>" 
                        + "Seekable:<br>" 
                        + timeRangesToString(video.seekable)
                        + "<br>";
                var currentTime = video.currentTime / video.duration * 100;
                videoDiv.find('.btn-play .progress').css({'width': (Math.round(maxBuffer*10)/10) + '%'});
                // console.log ('Video.updateBuffer', maxBuffer);       
                */
            }
            return maxBuffer;
        }

        function onVideoLoadStart($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // console.log ('VideoHtml5.onVideoLoadStart', item);
            item.onLoad ? item.onLoad(item) : null;
        }
        function onLoadProgress($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // console.log ('VideoHtml5.onLoadProgress', item);
            item.buffer = Buffer($e);
            item.onLoadProgress ? item.onLoadProgress(item) : null;
        }
        function onPlayProgress($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // console.log ('VideoHtml5.onPlayProgress', item);
            if (!item.duration) {
                item.duration = player.duration;
            }
            item.progress = player.currentTime;
            item.onPlayProgress ? item.onPlayProgress(item) : null;
        }
        function onVideoCanPlay($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // console.log ('VideoHtml5.onVideoCanPlay', item);
            item.videoWidth = player.videoWidth;
            item.videoHeight = player.videoHeight;
            item.duration = player.duration;
            item.onReady ? item.onReady(item) : null;
        }
        function onVideoCanThrough($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // console.log ('VideoHtml5.onVideoCanThrough', item);
            item.onLoadComplete ? item.onLoadComplete(item) : null;
        }
        function onVideoEnded($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // console.log ('VideoHtml5.onVideoEnded', item);
            item.paused = true;
            item.buffering = false;
            item.onEnded ? item.onEnded(item) : null;
        }
        function onVideoError($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // console.log ('VideoHtml5.onVideoError', item);
            item.paused = true;
            item.buffering = false;
            item.onError ? item.onError(item) : null;
        }
        function onVideoPlay($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // console.log ('VideoHtml5.onVideoPlay', item);
            item.paused = false;
            item.buffering = false;
            item.onState ? item.onState(item) : null;
        }
        function onVideoPause($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // console.log ('VideoHtml5.onVideoPause', item);
            item.paused = true;
            item.buffering = false;
            item.onState ? item.onState(item) : null;
        }
        function onVideoWaiting($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // console.log ('VideoHtml5.onVideoWaiting', item);
            item.paused = true;
            item.buffering = true;
            item.onState ? item.onState(item) : null;
        }
        function onVideoSeeked($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // console.log ('VideoHtml5.onVideoWaiting', item);
            item.onState ? item.onState(item) : null;
        }

        function Load($item) {
            $item.id = 'videohtml5-' + count; count++;
            var playerTag = $('<video id="' + $item.id + '" class="html5player"><source src="' + $item.source + '" type="video/mp4"></video>').prependTo($item.mediaplayer);
            var player = playerTag[0];

            player.addEventListener('loadstart', onVideoLoadStart, false);
            player.addEventListener('progress', onLoadProgress, false);
            player.addEventListener('timeupdate', onPlayProgress, false);
            player.addEventListener('canplay', onVideoCanPlay, false);
            player.addEventListener('canplaythrough', onVideoCanThrough, false);
            player.addEventListener('ended', onVideoEnded, false);
            player.addEventListener('error', onVideoError, false);
            player.addEventListener('play', onVideoPlay, false);
            player.addEventListener('pause', onVideoPause, false);
            player.addEventListener('waiting', onVideoWaiting, false);
            player.addEventListener('seeked', onVideoSeeked, false);
            player.id = $item.id;

            $item.player = player;
            players[player.id] = $item;

            $item.Play = function () {
                player.play();
            };
            $item.Stop = function () {
                player.pause();
            };
            $item.Mute = function () {
                player.muted = true;
            };
            $item.UnMute = function () {
                player.muted = false;
            };
            $item.Seek = function ($pow) {
                player.currentTime = ($pow * this.duration);
            };
            player.load();
            // console.log ('VideoHtml5.Load', $item.id, players);
        }

        var VideoHtml5 = {};

        VideoHtml5.Load = Load;

        return VideoHtml5;

    }();

    /********************************
    VideoYoutube
    ********************************/

    var VideoYoutube = function () {

        var INIT = false, READY = false, callbacks = [], players = {};

        function Init() {
            // console.log ('VideoYoutube.Init');
            if (INIT) {
                return;
            }
            INIT = true;
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        function onPlayerReady($e) {
            var player = $e.target;
            var item = players[player.id];

            // console.log ('VideoYoutube.onPlayerReady', player);
            // console.log ('VideoYoutube.onPlayerReady', 'item.id', item.id);
            // console.log ('VideoYoutube.onPlayerReady.getVideoData', player.width, player.height);
            // player.playVideo();
            // player.stopVideo();
            
            item.videoWidth = player.width;
            item.videoHeight = player.height;
            item.duration = player.getDuration();

            item.onReady ? item.onReady(item) : null;

            // console.log('VideoYoutube.onPlayerReady', player.width, player.height);

            /*
            $.ajax({
                dataType: "json",
                method: 'GET',
                url: 'http://www.youtube.com/oembed?url=http%3A//www.youtube.com/watch?v%3D'+item.youtube+'&format=json',
                success: function($json) {
                    // console.log ('VideoYoutube.onPlayerReady', $json);
                    item.videoWidth = $json.width;
                    item.videoHeight = $json.height;            
                    item.onReady ? item.onReady(item) : null;
                }
            });         
            */

        }
        function updateProgress(player, item) {         
            var buffer = player.getVideoLoadedFraction();
            if (item.buffer != buffer) {
                item.buffer = buffer;
                item.onLoadProgress ? item.onLoadProgress (item) : null;
            }
            var progress = 0, duration = player.getDuration();
            if (duration>0) {
                progress = player.getCurrentTime() / duration;
            }
            if (item.duration == 0) {
                item.duration = player.getDuration();
            }
            if (item.progress != progress) {
                item.progress = progress;
                item.onPlayProgress ? item.onPlayProgress (item) : null;
            }            
        }
        function checkStatus($e) {
            var player = $e.target;
            var item = players[player.id];
            if (item.i) {
                clearInterval (item.i);
            }
            item.i = setInterval (function() {
                updateProgress (player, item);
            }, 1000/25);            
        }
        function uncheckStatus($e) {
            var player = $e.target;
            var item = players[player.id];
            if (item.i) {
                clearInterval (item.i);
            }
            updateProgress (player, item);        
        }
        function onPlayerPlaybackQualityChange($e) {
            // console.log ('VideoYoutube.onPlayerPlaybackQualityChange', $e.data, $e.target, $e.target.getVideoInfo());
        }
        function onPlayerStateChange($e) {
            // console.log ('VideoYoutube.onPlayerStateChange', $e.data);
            var player = $e.target;
            var item = players[player.id];
            switch ($e.data) {
                case YT.PlayerState.PLAYING:
                    item.paused = false;
                    item.buffering = false;
                    item.onState ? item.onState(item) : null;
                    checkStatus ($e);
                    break;
                case YT.PlayerState.PAUSED:
                    item.paused = true;
                    item.buffering = false;
                    item.onState ? item.onState(item) : null;
                    uncheckStatus ($e);
                    break;
                case YT.PlayerState.BUFFERING:
                    item.paused = true;
                    item.buffering = true;
                    item.onState ? item.onState(item) : null;
                    uncheckStatus ($e);
                    break;
                case YT.PlayerState.ENDED:
                    item.paused = true;
                    item.buffering = false;
                    item.onEnded ? item.onEnded(item) : null;
                    uncheckStatus ($e);
                    break;
            }
        }
        function onPlayerError($e) {
            console.log('VideoYoutube.onPlayerError');
            var player = $e.target;
            var item = players[player.id];
            item.onError ? item.onError(item) : null;
        }

        function Create($item) {
            // console.log ('VideoYoutube.Create', $item.id);
            // 'M7lc1UVf-VE'
            /*
            autohide
            autoplay
            cc_load_policy
            color
            controls
            disablekb
            enablejsapi
            end
            fs
            iv_load_policy
            list
            listType
            loop
            modestbranding
            origin
            playerapiid
            playlist
            playsinline
            rel
            showinfo
            start
            theme
            */
            var id = $item.id, url = $item.youtube, player;
            player = new YT.Player(id, {
                videoId: url,
                playerVars: { 'rel': 0, 'playerapiid': id, 'showinfo': 0, 'modestbranding': 1, 'autoplay': 0, 'controls': 0, 'html5': 1, 'enablejsapi': 1, 'origin': document.location.hostname, 'suggestedQuality': 'hd1080' },
                events: {
                    'onReady': onPlayerReady,
                    'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
                    'onStateChange': onPlayerStateChange,
                    'onError': onPlayerError
                }
            });
            player.id = $item.id;
            $item.player = player;
            players[player.id] = $item;

            $item.Play = function () {
                player.playVideo();
            };
            $item.Stop = function () {
                player.pauseVideo();
            };
            $item.Mute = function () {
                player.mute();
            };
            $item.UnMute = function () {
                player.unMute();
            };
            $item.Seek = function ($pow, $ahead) {
                player.seekTo($pow * this.duration, $ahead);
            };
            $item.onLoad ? $item.onLoad($item) : null;
        }

        function Load($item) {
            $item.id = 'youtube-' + $item.youtube;
            $('<div id="' + $item.id + '" class="youtubeplayer"></div>').prependTo($item.mediaplayer);
            // console.log ('VideoYoutube.Load', $item.id);
            Init();
            callbacks.push($item);
            if (READY) {
                Callbacks();
            }
        }

        function Callbacks() {
            // console.log ('VideoYoutube.Callbacks');
            while (callbacks.length > 0) {
                var item = callbacks.shift();
                Create(item);
            }
        }

        function onYouTubeIframeAPIReady() {
            // console.log ('VideoYoutube.onYouTubeIframeAPIReady');
            READY = true;
            Callbacks();
        }
        window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

        var VideoYoutube = {};

        VideoYoutube.Load = Load;

        return VideoYoutube;

    }();


    /********************************
    VideoVimeo
    ********************************/

    var VideoVimeo = function () {

        var INIT = false, READY = false, callbacks = [], players = {};

        function Init() {
            // console.log ('VideoVimeo.Init');
            if (INIT) {
                return;
            }
            INIT = true;
            var fl = $.ajax({
                url: 'http://a.vimeocdn.com/js/froogaloop2.min.js',
                dataType: "script",
                success: onVimeoFroogaloopReady
            });
        }
        function onVimeoFroogaloopReady() {
            // console.log ('VideoVimeo.onVimeoFroogaloopReady');
            READY = true;
            Callbacks();
        }

        function onPlayerReady($e) {
            var player = $e.target;
            var item = players[player.id];
            // console.log ('VideoVimeo.onPlayerReady', item);
            // console.log ('VideoVimeo.onPlayerReady', 'item.id', item.id);
            // console.log ('VideoVimeo.onPlayerReady.getVideoData', player.width, player.height);
            // player.playVideo();
            // player.stopVideo();
            
            // console.log('VideoVimeo.onPlayerReady', player.api);

            player.api('getVideoWidth', function ($val, $id) {
                item.videoWidth = parseInt($val, 10);
                player.api('getVideoHeight', function ($val, $id) {
                    item.videoHeight = parseInt($val, 10);
                    player.api('getDuration', function ($val, $id) {
                        item.duration = parseFloat($val);
                        // console.log('VideoVimeo.onPlayerReady', item.videoWidth, item.videoHeight);
                        item.onReady ? item.onReady(item) : null;
                    }); 
                });
            });

        }
        /*
        function onPlayerPlaybackQualityChange ($e) {
            // console.log ('VideoVimeo.onPlayerPlaybackQualityChange', $e.data, $e.target, $e.target.getVideoInfo());
        }
        function onPlayerStateChange ($e) {
            // console.log ('VideoVimeo.onPlayerStateChange', $e.data);
            var player = $e.target;
            var item = players[player.id];
            switch ($e.data) {
                case YT.PlayerState.PLAYING:
                    item.paused = false;
                    item.buffering = false;
                    item.onState ? item.onState(item) : null;
                break;
                case YT.PlayerState.PAUSED:
                    item.paused = true;
                    item.buffering = false;
                    item.onState ? item.onState(item) : null;
                break;
                case YT.PlayerState.BUFFERING:
                    item.paused = true;
                    item.buffering = true;
                    item.onState ? item.onState(item) : null;
                break;
                case YT.PlayerState.ENDED:
                    item.paused = true;
                    item.buffering = false;
                    item.onEnded ? item.onEnded(item) : null;
                break;              
            }
        }
        */

        function onLoadProgress($e) {
            // console.log ('VideoVimeo.onLoadProgress', arguments);    
            var player = $e.target;
            var item = players[player.id];
            // console.log ($e.data);
            item.buffer = parseFloat($e.data.percent);
            item.onLoadProgress ? item.onLoadProgress(item) : null;
        }
        function onPlayProgress($e) {
            // console.log ('VideoVimeo.onPlayProgress', arguments);    
            var player = $e.target;
            var item = players[player.id];
            // console.log ($e.data);
            item.progress = parseFloat($e.data.percent);
            if (item.duration == 0) {
                player.api('getDuration', function ($val, $id) {
                    item.duration = parseFloat($val);               
                });
            }
            item.onPlayProgress ? item.onPlayProgress(item) : null;            
        }
        function onPlayerSeek($e) {
            // console.log ('VideoVimeo.onPlayerSeek', arguments);  
            var player = $e.target;
            var item = players[player.id];
            // console.log ($e.data);
            item.progress = parseFloat($e.data.percent);
            item.onSeek ? item.onSeek(item) : null;            
        }
        function onPlayerPlay($e) {
            // console.log ('VideoVimeo.onPlayerPause', arguments); 
            var player = $e.target;
            var item = players[player.id];
            item.paused = false;
            item.buffering = false;
            item.onState ? item.onState(item) : null;
        }
        function onPlayerPause($e) {
            // console.log ('VideoVimeo.onPlayerPause', arguments); 
            var player = $e.target;
            var item = players[player.id];
            item.paused = true;
            item.buffering = false;
            item.onState ? item.onState(item) : null;
        }
        function onPlayerEnd($e) {
            // console.log ('VideoVimeo.onPlayerEnd', arguments);   
            item.paused = false;
            item.buffering = false;
            item.onState ? item.onState(item) : null;
        }
        function onPlayerError($e) {
            // console.log ('VideoVimeo.onPlayerError');    
            var player = $e.target;
            var item = players[player.id];
            item.onError ? item.onError(item) : null;
        }

        function Create($item) {
            // console.log ('VideoVimeo.Create', $item.id);
            // 'M7lc1UVf-VE'
            var id = $item.id, url = $item.vimeo;
            var ww = $(window).width();
            var wh = ww / 16 * 9;

            var iframe = $('<iframe id="' + id + '" src="http://player.vimeo.com/video/' + url + '?api=1&player_id=' + id + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
            iframe.prependTo($item.mediaplayer);

            var player = $f(iframe[0]);
            player.addEvent('ready', function ($id) {
                onPlayerReady.call(player, { target: player, id: $id });
                player.addEvent('play', function ($id) {
                    onPlayerPlay.call(player, { target: player, id: $id });
                });
                player.addEvent('pause', function ($id) {
                    onPlayerPause.call(player, { target: player, id: $id });
                });
                player.addEvent('finish', function ($id) {
                    onPlayerEnd.call(player, { target: player, id: $id });
                });
                player.addEvent('playProgress', function ($data, $id) {
                    onPlayProgress.call(player, { target:player, id: $id, data: $data });
                });
                player.addEvent('loadProgress', function ($data, $id) {
                    onLoadProgress.call(player, { target:player, id: $id, data: $data });
                });
                player.addEvent('seek', function ($data, $id) {
                    onPlayerSeek.call(player, { target:player, id: $id, data: $data });
                });
            });

            // player.api($(this).text().toLowerCase());
            /*
            function onPause(id) {
                status.text('paused');
            }

            function onFinish(id) {
                status.text('finished');
            }

            function onPlayProgress(data, id) {
                status.text(data.seconds + 's played');
            }
            */

            /*
            player = new YT.Player(id, {
                width: $(window).width(),
                height: $(window).width() / 16 * 9,
                videoId: url,
                playerVars: { 'autoplay': 0, 'controls': 0, 'html5':1,'enablejsapi':1, 'origin':document.location.hostname, 'suggestedQuality': 'hd1080' },
                events: {
                    'onReady': onPlayerReady,
                    'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
                    'onStateChange': onPlayerStateChange,
                    'onError': onPlayerError
                }
            })
            */

            $item.player = player;
            players[player.id] = $item;

            $item.Play = function () {
                // player.playVideo();
                player.api('play');
            };
            $item.Stop = function () {
                // player.pauseVideo();
                player.api('pause');
            };
            $item.Mute = function () {
                player.api('setVolume', 0);
            };
            $item.UnMute = function () {
                player.api('setVolume', 1);
            };
            $item.Seek = function ($pow) {
                player.api('seekTo', $pow * this.duration);
            };
            $item.onLoad ? $item.onLoad($item) : null;
        }

        function Load($item) {
            $item.id = 'vimeo-' + $item.vimeo;
            // $('<div id="'+ $item.id +'" class="vimeoplayer"></div>').prependTo($item.mediaplayer);
            // console.log('VideoVimeo.Load', $item.id);
            Init();
            callbacks.push($item);
            if (READY) {
                Callbacks();
            }
        }

        function Callbacks() {
            // console.log ('VideoVimeo.Callbacks');
            while (callbacks.length > 0) {
                var item = callbacks.shift();
                Create(item);
            }
        }

        var VideoVimeo = {};

        VideoVimeo.Load = Load;

        return VideoVimeo;

    }();



    // CONST

    // FLAGS

    // DOM
    var win, html, videoDiv, videoPlayer, target, source;

    // PRIVATE
    var video, videoWidth = 16, videoHeight = 9, vw, vh, vl, vt;

    var items = [], mediaplayers = {};

    function secToTime($sec) {
        hours = Math.floor($sec / 3600);
        $sec %= 3600;
        minutes = Math.floor($sec / 60);
        seconds = Math.floor($sec % 60);
        if (hours>0) {
            return (hours>9?hours:'0'+hours)+':'(minutes>9?minutes:'0'+minutes)+':'+(seconds>9?seconds:'0'+seconds);
        } else {
            return (minutes>9?minutes:'0'+minutes)+':'+(seconds>9?seconds:'0'+seconds);
        }
    }
    function onLoad($item) {
        // console.log ('Mediaplayer.onLoad', $item);   
        $item.mediaplayer.addClass('loading');
    }
    function onLoadProgress($item) {
        // console.log ('Mediaplayer.onLoadProgress', $item);   
        if ($item.controls) {
            $item.controls.find('.buffer').width(($item.buffer * 100) + '%');
        }
    }
    function onPlayProgress($item) {
        // console.log ('Mediaplayer.onPlayProgress', $item);   
        if ($item.controls && !$item.scrubbing) {
            $item.controls.find('.progress').width(($item.progress * 100) + '%');
            $item.controls.find('.scrub').css({'left': ($item.progress * 100) + '%'});
            $item.controls.find('.current').text(secToTime($item.progress * $item.duration));
            $item.controls.find('.duration').text(secToTime($item.duration));
        }
    }
    function onSeek($item) {
        // console.log ('Mediaplayer.onSeek', $item);
        if ($item.controls) {
            $item.controls.find('.progress').width(($item.progress * 100) + '%');
            $item.controls.find('.scrub').css({'left': ($item.progress * 100) + '%'});
            $item.controls.find('.current').text(secToTime($item.progress * $item.duration));
            $item.controls.find('.duration').text(secToTime($item.duration));
        }   
    }
    function onReady($item) {
        // console.log ('Mediaplayer.onReady', $item);
        setTimeout (function(){
            $item.mediaplayer.removeClass('loading').addClass('canplay');
            Resize($item);
            $item.callback ? $item.callback() : null;
            Minimize.call($item.mediaplayer[0]);
        }, 5000);
    }
    function onLoadComplete($item) {
        // console.log ('Mediaplayer.onLoadComplete', $item);           
    }
    function onEnded($item) {
        // console.log ('Mediaplayer.onEnded', $item);
        $item.mediaplayer.removeClass('playing');
    }
    function onError($item) {
        console.log('Mediaplayer.onError', $item);
        $item.mediaplayer.addClass('error');
    }
    function onState($item) {
        // console.log ('Mediaplayer.onState', $item);
        $item.paused ? $item.mediaplayer.removeClass('playing') : $item.mediaplayer.addClass('playing');
        $item.buffering ? $item.mediaplayer.addClass('buffering') : $item.mediaplayer.removeClass('buffering');
    }

    function Init($callback) {
        $(".mediaplayer[data-init!='true']").each(function () {
            var mediaplayer = $(this);
            var item = {
                vimeo: mediaplayer.attr('vimeo'),
                youtube: mediaplayer.attr('youtube'),
                source: mediaplayer.attr('source'),
                poster: mediaplayer.attr('poster'),
                controls: mediaplayer.attr('controls'),
                crop: mediaplayer.hasClass('crop'),
                circle: mediaplayer.hasClass('circle'),
                mediaplayer: mediaplayer,
                paused: true,
                callback: $callback
            };
            item.onLoad = onLoad;
            item.onLoadProgress = onLoadProgress;
            item.onPlayProgress = onPlayProgress;
            item.onSeek = onSeek;
            item.onReady = onReady;
            item.onLoadComplete = onLoadComplete;
            item.onEnded = onEnded;
            item.onState = onState;
            items.push(item);

            var id = 'mediaplayer-' + items.length;
            mediaplayers[id] = item;
            mediaplayer.attr({ 'data-init': 'true', 'id': id });

            if (item.overlay !== 'false') {
                var overlay = Skin.overlay();
                overlay.appendTo(mediaplayer);
                item.overlay = overlay;
            }
            if (item.controls) {
                var controls = Skin.controls();
                controls.appendTo(mediaplayer);
                item.controls = controls;
            }
            if (item.poster) {
                Poster(item);
            }

            if (item.vimeo) {
                mediaplayer.addClass('vimeo');
                VideoVimeo.Load(item);
            } else if (item.youtube) {
                mediaplayer.addClass('youtube');
                VideoYoutube.Load(item);
            } else {
                mediaplayer.addClass('html5');
                VideoHtml5.Load(item);
            }
        });
    }

    function Poster($item) {
        var poster = $item.poster;
        $item.poster = $('<img src="' + poster + '" class="poster"/>').prependTo($item.mediaplayer.find('.overlay'));
        var img = new Image();
        img.onload = function () {
            $item.posterWidth = this.naturalWidth;
            $item.posterHeight = this.naturalHeight;
            console.log('Mediaplayer.Poster', $item.posterWidth, $item.posterHeight);
            Resize($item);
        };
        img.onerror = function () {
        };
        img.src = poster;
        $item.mediaplayer.addClass('poster');
    }

    win = $(window);
    win.on('resize', function () {
        Resize();
    });
    function Resize($item) {
        console.log('Mediaplayer.Resize');
        // var ww = win.width();
        // var wh = win.height();
        function resizeItem(item) {
            var vw = item.mediaplayer.width();
            var vh = item.mediaplayer.height();
            var vr = vw / vh;
            var ir = 16 / 9;
            var pr = ir;
            console.log('Mediaplayer.resizeItem', item.posterWidth, item.videoWidth);
            if (item.posterWidth) {
                pr = item.posterWidth / item.posterHeight;
            }
            if (item.videoWidth) {
                ir = item.videoWidth / item.videoHeight;
            } else {
                ir = pr;
            }
            var nw, nh, nl, nt, pw, ph, pl, pt, d = 2;
            // CROP
            if (item.crop) {
                if (item.circle) {
                    vh = vw;
                    vr = 1;
                    item.mediaplayer.height(Math.round(vh));
                }
                if (ir > vr) {
                    nh = vh + d;
                    nw = nh * ir;
                } else {
                    nw = vw + d;
                    nh = nw / ir;
                }
                nl = (vw - nw) / 2;
                nt = (vh - nh) / 2;
                if (pr > vr) {
                    ph = vh + d;
                    pw = ph * pr;
                } else {
                    pw = vw + d;
                    ph = pw / pr;
                }
                pl = (vw - pw) / 2;
                pt = (vh - ph) / 2;
            } else {
                nw = vw;
                nh = vw / ir;
                nl = 0;
                nt = 0;
                /*
                if (item.vimeo || item.youtube) {
                    item.mediaplayer.height(Math.round(nh));
                }
                */
                pw = vw;
                ph = vw / pr;
                pl = 0;
                pt = 0;
                console.log('item.videoWidth', item.videoWidth);
                if (item.videoWidth) {
                    item.mediaplayer.height(Math.round(nh));
                } else if (item.posterWidth) {
                    console.log('posterWidth', ph);
                    item.mediaplayer.height(Math.round(ph));
                }
            }
            nw = Math.round(nw);
            nh = Math.round(nh);
            nl = Math.round(nl);
            nt = Math.round(nt);
            pw = Math.round(pw);
            ph = Math.round(ph);
            pl = Math.round(pl);
            pt = Math.round(pt);
            var iframe;
            if (item.poster) {
                item.poster.css({
                    'width': pw + 'px',
                    'height': ph + 'px',
                    'left': pl + 'px',
                    'top': pt + 'px'
                });
            }
            if (item.vimeo) {
                iframe = item.mediaplayer.find('iframe');
                iframe.css({
                    'width': nw + 'px',
                    'height': (nh + 120) + 'px',
                    'left': nl + 'px',
                    'top': (nt - 60) + 'px'
                });
            } else if (item.youtube) {
                if (item.player) {
                    item.player.width = nw;
                    item.player.height = nh + 240;
                }
                iframe = item.mediaplayer.find('iframe');
                iframe.css({
                    'width': nw + 'px',
                    'height': (nh + 240) + 'px',
                    'left': nl + 'px',
                    'top': (nt - 120) + 'px'
                });
            } else if (item.player) {
                item.player.width = nw;
                item.player.height = nh;
            }
            // console.log ('Mediaplayer.Resize', nw, nh);  
        }
        if ($item) {
            return resizeItem($item);
        }
        $.each(items, function (i, item) {
              resizeItem(item);          
        });
    }

    function Clear() {
        // youtube player.destroy()
        /*
        if (video) {
            videoPlayer.attr('src','video/empty.mp4');
            video.load();
            videoPlayer.remove();
        }
        */
    }

    function stopAll() {
        // console.log ('Mediaplayer.stopAll', video);
        for (var p in mediaplayers) {
            var item = mediaplayers[p];
            if (item.player && !item.paused) {
                item.Stop();
            }    
        }
    }
    function togglePlay() {
        // console.log ('Mediaplayer.togglePlay', video);
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        // console.log(mediaplayer);
        if (item.player) {
            if (item.paused) {
                stopAll ();
                item.Play();
            } else {
                item.Stop();
            }
        }
    }
    function Play() {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        // console.log(mediaplayer);
        if (item.player && item.paused) {
            stopAll ();
            item.Play();
        }
    }
    function Pause() {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        // console.log(mediaplayer);
        if (item.player && !item.paused) {
            item.Stop();
        }
    }
    function Fullscreen() {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        // console.log(mediaplayer);
        if (item.player && !item.fullscreen) {
            item.fullscreen = true;
            mediaplayer.addClass('fullscreen');
            $('html').addClass('mediaplayer-fullscreen');
            Resize(item);
        }
    }
    function Normal() {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        // console.log(mediaplayer);
        if (item.player && item.fullscreen) {
            item.fullscreen = false;
            mediaplayer.removeClass('fullscreen');
            $('html').removeClass('mediaplayer-fullscreen');
            Resize(item);
        }
    }
    function Mute() {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        if (item.player && !item.mute) {
            item.mute = true;
            mediaplayer.addClass('mute');
            item.Mute();
        }
    }
    function UnMute() {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        if (item.player && item.mute) {
            item.mute = false;
            mediaplayer.removeClass('mute');
            item.UnMute();
        }
    }
    function Seek($pow) {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        // console.log(mediaplayer);
        if (item.player) {
            item.Seek($pow);
        }
    }
    function Share() {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        if (item.player) {
            alert('Share ' + item.id);
            var token = '52de26c95a1edeb7f26eace81df6f2c991cc6a22';
            var longUrl = escape('http://extranet.wslabs.it/ios/kemon/public/');
            $.ajax({
                dataType: "json",
                method: 'GET',
                url: 'https://api-ssl.bitly.com/v3/user/link_save?access_token='+token+'&longUrl='+longUrl,
                success: function($json) {
                    console.log ('Mediaplayer.Share', $json);
                }                
            })
        }
    }
    function Minimize() {
        // console.log('Minimize');
        var mediaplayer = getMediaplayer.call(this);
        mediaplayer.removeClass('minimized');
        var item = mediaplayers[mediaplayer.attr('id')];
        if (item.player) {
            if (item.mto) {
                clearTimeout(item.mto);
            }
            item.mto = setTimeout (function(){
                mediaplayer.addClass('minimized');
            }, 8000);
        }
    }
    function ScrubStart($xy) {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        if (item.player) {
            item.scrubbing = { start:$xy, pos:mediaplayer.find('.scrub').position() };
        }
        Minimize.call(this);
    }
    function ScrubMove($xy) {
        var mediaplayer = getMediaplayerByProp('scrubbing', true);
        if (mediaplayer) {
            var item = mediaplayers[mediaplayer.attr('id')];
            if (item.scrubbing) {
                item.scrubbing.current = $xy;
                var tw = mediaplayer.find('.track').width();
                var dx = item.scrubbing.current.x - item.scrubbing.start.x;
                var x = Math.max(0, Math.min(tw, item.scrubbing.pos.left + dx));
                mediaplayer.find('.scrub').css({'left':x+'px'});
            }
            Minimize.call(mediaplayer[0]);
        }
    }
    function ScrubEnd($xy) {
        var mediaplayer = getMediaplayerByProp('scrubbing', true);
        if (mediaplayer) {
            var item = mediaplayers[mediaplayer.attr('id')];
            if (item.scrubbing) {
                var tw = mediaplayer.find('.track').width();
                var dx = item.scrubbing.current.x - item.scrubbing.start.x;
                var x = Math.max(0, Math.min(tw, item.scrubbing.pos.left + dx));
                mediaplayer.find('.scrub').css({'left':x+'px'});
                console.log ('Mediaplayer.ScrubEnd', x, tw);
            
                Seek.call(mediaplayer[0], x/tw);
                item.scrubbing = null;
            }
        }
    }
    function Track($xy) {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        if (item.player) {
            var track = mediaplayer.find('.track');
            var tw = track.width();
            var x = $xy.x - track.offset().left;
            x = Math.max(0, Math.min(tw, x));
            mediaplayer.find('.scrub').css({'left':x+'px'});
            Seek.call(mediaplayer[0], x/tw);
            item.scrubbing = null;
        }
    }
    function getMediaplayer() {
        var mediaplayer = $(this);
        if (mediaplayer.hasClass('mediaplayer')) {
            return mediaplayer;
        } else {
            return mediaplayer.closest('.mediaplayer');
        }
    }
    function getMediaplayerByProp($prop, $val) {
        var mediaplayer = null;
        for(var p in mediaplayers) {
            var item = mediaplayers[p];                
            if ($val === true && item[$prop] != undefined) {
                mediaplayer = item.mediaplayer;
            }
        }
        return mediaplayer;
    }
    function Load() {
        if (video) {
            video.load();
        }
    }

    $('body').on('click', '.mediaplayer .overlay, .mediaplayer .btn-play', function ($e) {
        togglePlay.call(this);
        return false;
    }).on('click', '.mediaplayer .play', function ($e) {
        Play.call(this);
        return false;
    }).on('click', '.mediaplayer .pause', function ($e) {
        Pause.call(this);
        return false;
    }).on('click', '.mediaplayer .fullscreen', function ($e) {
        Fullscreen.call(this);
        return false;
    }).on('click', '.mediaplayer .normal', function ($e) {
        Normal.call(this);
        return false;
    }).on('click', '.mediaplayer .audio-on', function ($e) {
        Mute.call(this);
        return false;
    }).on('click', '.mediaplayer .audio-off', function ($e) {
        UnMute.call(this);
        return false;
    }).on('click', '.mediaplayer .share', function ($e) {
        Share.call(this);
        return false;
    }).on('mousedown', '.mediaplayer .scrub', function ($e) {
        ScrubStart.call(this, {x:$e.clientX, y:$e.clientY});
        return false;
    }).on('mousemove mousedown touchstart', '.mediaplayer', function ($e) {
        Minimize.call(this);
        return true;
    }).on('mousemove', function ($e) {
        ScrubMove({x:$e.clientX, y:$e.clientY});
        return true;
    }).on('mouseup', function ($e) {
        ScrubEnd({x:$e.clientX, y:$e.clientY});
        return true;
    }).on('touchstart', '.mediaplayer .scrub', function ($e) {
        var e = $e.originalEvent;
        var startX = e.touches[0].pageX;
        var startY = e.touches[0].pageY;
        ScrubStart.call(this, {x:startX, y:startY});
        return false;
    }).on('touchmove', function ($e) {
        var e = $e.originalEvent;
        var startX = e.touches[0].pageX;
        var startY = e.touches[0].pageY;
        var curX = e.targetTouches[0].pageX;
        var curY = e.targetTouches[0].pageY;
        ScrubMove({x:curX, y:curY});
        return true;
    }).on('touchend', function ($e) {
        ScrubEnd({x:0, y:0});
        return true;
    }).on('mouseup', '.mediaplayer .track', function ($e) {
        Track.call(this, {x:$e.clientX, y:$e.clientY});
        return true;
    }).on('touchstart', '.mediaplayer .track', function ($e) {
        var e = $e.originalEvent;
        var startX = e.touches[0].pageX;
        var startY = e.touches[0].pageY;
        Track.call(this, {x:startX, y:startY});
        return false;
    });
    
    function Query () {
        console.log('Mediaplayer.Query');
    }

    var Mediaplayer = {
    };

    Mediaplayer.Init = Init;
    Mediaplayer.Clear = Clear;
    Mediaplayer.togglePlay = togglePlay;
    Mediaplayer.mediaplayers = mediaplayers;
    Mediaplayer.Query = Query;

    Query ();

    $(window).load(function () {
        Mediaplayer.Init(function () {
            console.log('Mediaplayer.Init.callback');
            // Columnzr.Recol.call(link.closest('.items')[0]);
        });
    });

    return Mediaplayer;

}();
