/********************************
M E D I A P L A Y E R
********************************/

var Mediaplayer = function () {

    /********************************
    S U B C L A S S E S 
    ********************************/

    var DEBUG               = false, 
        USE_FALLBACK        = true,
        MEDIAPLAYER_FLASH   = 'swf/mediaplayer.swf?aag',
        DEBUG_FLASH         = false,
        UA      = window.navigator.userAgent.toLowerCase(),
        IPHONE  = UA.indexOf('iphone')!=-1,
        IPOD    = UA.indexOf('ipod')!=-1,
        IPAD    = UA.indexOf('ipad')!=-1,
        MOBILE  = UA.indexOf('mobile')!=-1;

    /********************************
    Javascript QueryString
    ********************************/

    var qso = function () {
        var scripts = document.getElementsByTagName('script');
        var script = scripts[scripts.length-1];
        return {
            'shortUrl': script.src,
            'script':   script
        };
    }();
    if (qso.shortUrl.indexOf('?') != -1 || qso.shortUrl.indexOf('bit.ly') != -1) {
        console.log ('Mediaplayer.qso.shortUrl', qso.shortUrl);
    }

    /********************************
    Prevent Double Initialization
    ********************************/

    if (window['Mediaplayer']) {        
        var Mediaplayer = window['Mediaplayer'];
        if (qso.shortUrl.indexOf('?') != -1 || qso.shortUrl.indexOf('bit.ly') != -1) {
            var query = qso;
            function tryQuery () {
                if (window['$']) {
                    Mediaplayer.Query (query);
                } else {
                    setTimeout(tryQuery ,100);
                }
            }
            tryQuery ();
        }
        return Mediaplayer;
    }

    /********************************
    Log
    ********************************/

    var Console = function () {
        var Console;
        if (DEBUG && window['console'] && window['console']['log']) {
            Console = window.console;
        } else {
            Console = {log: function(){}};
        }
        return Console;
    }();

    /********************************
    Bitly
    ********************************/

    var Bitly = function () {

        var USE_BITLY = true,
        BITLY_TOKEN =   '52de26c95a1edeb7f26eace81df6f2c991cc6a22',
        BITLY_SAVE =    'https://api-ssl.bitly.com/v3/user/link_save?access_token=##access_token##&longUrl=##longUrl##',
        BITLY_EXPAND =  'https://api-ssl.bitly.com/v3/expand?access_token=##access_token##&shortUrl=##shortUrl##';
        
        function Save ($longUrl, $success, $error) {
            var shortUrl = $longUrl;
            if (USE_BITLY) {
                $.ajax({
                    dataType: "json",
                    method: 'GET',
                    url: BITLY_SAVE.split('##access_token##').join(BITLY_TOKEN).split('##longUrl##').join($longUrl),
                    success: function($json) {
                        if ($json.data && $json.data.link_save && $json.data.link_save.link) {
                            shortUrl = $json.data.link_save.link;
                            // Console.log ('Bitly.Save', $longUrl, shortUrl);
                            $success ? $success (shortUrl) : null;
                        } else {
                            $error ? $error (shortUrl) : null;
                        }   
                    },
                    error: function() {
                        $error ? $error (shortUrl) : null;
                    }            
                });
            } else {
                $success ? $success (shortUrl) : null;
            } 
        }

        function Expand ($shortUrl, $success, $error) {
            var longUrl = $shortUrl;
            if (USE_BITLY && $shortUrl.indexOf('bit.ly') != -1) {
                $.ajax({
                    dataType: "json",
                    method: 'GET',
                    url: BITLY_EXPAND.split('##access_token##').join(BITLY_TOKEN).split('##shortUrl##').join($shortUrl),
                    success: function($json) {
                        Console.log ('Bitly.Expand', $json);
                        if ($json.data && $json.data.expand && $json.data.expand.length == 1 && $json.data.expand[0].long_url) {
                            longUrl = $json.data.expand[0].long_url;
                            Console.log ('Bitly.Expand', $shortUrl, longUrl);
                            $success ? $success (longUrl) : null;
                        } else {
                            $error ? $error (longUrl) : null;
                        }   
                    },
                    error: function() {
                        $error ? $error (longUrl) : null;
                    }            
                });
            } else {
                $success ? $success (longUrl) : null;
            } 
        }

        var Bitly = {};

        Bitly.Save = Save;
        Bitly.Expand = Expand;

        return Bitly;
    }();

    /********************************
    Skin
    ********************************/

    var Skin = function () {
        var Skin = {};

        Skin.overlay = function () {
            var html = '<div class="overlay">';
            html += '   <a class="btn btn-cta btn-play" title="Play Video"><span>Play Video</span><i class="icon-play"></i><i class="icon-loading"></i><i class="icon-broken"></i></a>';
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
        Skin.flash = function ($data) {
            var html = '<object id="object-##video_id##" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0">';
            html += '    <param name="flashvars" value="video=##url##&loop=##loop##&autoplay=##autoplay##&crop=##crop##" />';
            html += '    <param name="allowScriptAccess" value="sameDomain" />';
            html += '    <param name="movie" value="##mediaplayerUrl##" />';
            html += '    <param name="menu" value="false" />';
            html += '    <param name="quality" value="high" />';
            html += '    <param name="scale" value="noscale" />';
            html += '    <param name="salign" value="lt" />';
            html += '    <param name="wmode" value="gpu" />';
            html += '    <param name="bgcolor" value="#000000" />';
            html += '    <embed src="##mediaplayerUrl##" id="embed-##video_id##" name="embed-##video_id##" flashVars="video=##url##&loop=##loop##&autoplay=##autoplay##&crop=##crop##" menu="false" quality="high" scale="noscale" wmode="gpu" bgcolor="#000000" swLiveConnect=true allowScriptAccess="sameDomain" type="application/x-shockwave-flash" pluginspage="http://www.adobe.com/go/getflashplayer" />';
            html += '</object>';
            /*
            var html = '<object id="object-##video_id##" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=10,0,0,0">';
            html += '    <param name="flashvars" value="video=##url##&loop=##loop##&autoplay=##autoplay##" />';
            html += '    <param name="allowScriptAccess" value="sameDomain" />';
            html += '    <param name="movie" value="##mediaplayerUrl##" />';
            html += '    <param name="menu" value="false" />';
            html += '    <param name="quality" value="high" />';
            html += '    <param name="scale" value="noscale" />';
            html += '    <param name="salign" value="lt" />';
            html += '    <param name="wmode" value="gpu" />';
            html += '    <param name="bgcolor" value="#000000" />';
            html += '    <embed src="##mediaplayerUrl##" id="embed-##video_id##" name="embed-##video_id##" flashVars="video=##url##&loop=##loop##&autoplay=##autoplay##" menu="false" quality="high" scale="noscale" wmode="gpu" bgcolor="#000000" swLiveConnect=true allowScriptAccess="sameDomain" type="application/x-shockwave-flash" pluginspage="http://www.adobe.com/go/getflashplayer" />';
            html += '</object>';
            */

            /*
            var html = '<object id="##video_id##" name="##video_id##" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" type="application/x-shockwave-flash" data="##mediaplayerUrl##">';
            html += '   <param name="movie" value="##mediaplayerUrl##" />';
            html += '   <param name="allowscriptaccess" value="always">';
            html += '   <param name="quality" value="high">';
            html += '   <param name="bgcolor" value="#000000">';
            html += '   <param name="wmode" value="opaque">';
            html += '   <param name="swfversion" value="10.1">';
            html += '   <param name="flashvars" value="video=##url##&loop=##loop##&autoplay=##autoplay##">';
            html += '</object>';
            */
            /*
            var html = '<object id="##video_id##" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000">';
            html += '   <param name="movie" value="##mediaplayerUrl##" />';
            html += '   <param name="allowscriptaccess" value="always">';
            html += '   <param name="quality" value="high">';
            html += '   <param name="bgcolor" value="#000000">';
            html += '   <param name="wmode" value="opaque">';
            html += '   <param name="swfversion" value="10.1">';
            html += '   <param name="flashvars" value="video=##url##&loop=##loop##&autoplay=##autoplay##">';
            html += '   <object name="##video_id##" type="application/x-shockwave-flash" data="##mediaplayerUrl##">';
            html += '       <param name="movie" value="##mediaplayerUrl##" />';
            html += '       <param name="allowscriptaccess" value="always">';
            html += '       <param name="quality" value="high">';
            html += '       <param name="bgcolor" value="#000000">';
            html += '       <param name="wmode" value="opaque">';
            html += '       <param name="swfversion" value="10.1">';
            html += '       <param name="flashvars" value="video=##url##&loop=##loop##&autoplay=##autoplay##">';
            html += '   </object>';
            html += '</object>';
            */
            /*
            var html = '<object id="##video_id##" name="##video_id##" class="flashplayer" type="application/x-shockwave-flash" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000">';
            html += '   <param name="movie" value="swf/mediaplayer.swf">';
            html += '   <param name="allowscriptaccess" value="always">';
            html += '   <param name="quality" value="high">';
            html += '   <param name="bgcolor" value="#000000">';
            html += '   <param name="wmode" value="opaque">';
            html += '   <param name="swfversion" value="10.1">';
            html += '   <param name="flashvars" value="video=##url##&loop=##loop##&autoplay=##autoplay##">';
            html += '</object>';
            */
            for (var p in $data) {
                html = html.split('##'+p+'##').join($data[p]);
            }
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
                // Console.log ('Video.updateBuffer', maxBuffer);       
                */
            }
            return maxBuffer;
        }

        function onVideoLoadStart($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // Console.log ('VideoHtml5.onVideoLoadStart', item);
            item.onLoad ? item.onLoad(item) : null;
        }
        function onLoadProgress($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // Console.log ('VideoHtml5.onLoadProgress', item);
            item.buffer = Buffer($e);
            item.onLoadProgress ? item.onLoadProgress(item) : null;
        }
        function onPlayProgress($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // Console.log ('VideoHtml5.onPlayProgress', item);
            if (!item.duration) {
                item.duration = player.duration;
            }
            item.progress = player.currentTime;
            item.onPlayProgress ? item.onPlayProgress(item) : null;
        }
        function onVideoCanPlay($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // Console.log ('VideoHtml5.onVideoCanPlay', item);
            item.videoWidth = player.videoWidth;
            item.videoHeight = player.videoHeight;
            item.duration = player.duration;
            item.onReady ? item.onReady(item) : null;
        }
        function onVideoCanThrough($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // Console.log ('VideoHtml5.onVideoCanThrough', item);
            item.onLoadComplete ? item.onLoadComplete(item) : null;
        }
        function onVideoEnded($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // Console.log ('VideoHtml5.onVideoEnded', item);
            item.paused = true;
            item.buffering = false;
            item.onEnded ? item.onEnded(item) : null;
        }
        function onVideoError($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // Console.log ('VideoHtml5.onVideoError', item);
            item.paused = true;
            item.buffering = false;
            item.onError ? item.onError(item) : null;
        }
        function onSourceError($e) {
            var player = $(this).closest('video')[0];
            var item = players[player.id];
            // Console.log ('VideoHtml5.onSourceError', item);
            item.paused = true;
            item.buffering = false;
            item.onError ? item.onError(item) : null;
        }
        function onVideoPlay($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // Console.log ('VideoHtml5.onVideoPlay', item);
            item.paused = false;
            item.buffering = false;
            item.onState ? item.onState(item) : null;
        }
        function onVideoPause($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // Console.log ('VideoHtml5.onVideoPause', item);
            item.paused = true;
            item.buffering = false;
            item.onState ? item.onState(item) : null;
        }
        function onVideoWaiting($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // Console.log ('VideoHtml5.onVideoWaiting', item);
            item.paused = true;
            item.buffering = true;
            item.onState ? item.onState(item) : null;           
        }
        function onVideoSeeked($e) {
            var player = $($e.target)[0];
            var item = players[player.id];
            // Console.log ('VideoHtml5.onVideoWaiting', item);
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
            // player.addEventListener('waiting', onVideoWaiting, false);
            player.addEventListener('seeked', onVideoSeeked, false);

            var source = playerTag.find('source')[0];
            source.addEventListener('error', onSourceError, false);
            $item.source = source;

            player.id = $item.id;

            player.loop = $item.loop || $item.hover;
            player.autoplay = $item.autoplay;

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
            // Console.log ('VideoHtml5.Load', $item.id, players);
        }

        var VideoHtml5 = {};

        VideoHtml5.Load = Load;

        return VideoHtml5;

    }();
    var AudioHtml5 = VideoHtml5;

    /********************************
    VideoFlash
    ********************************/

    var VideoFlash = function () {

        var READY = false, players = {}, count = 0;
        /*
        STREAM.addEventListener(StreamEvent.STARTED,        onStreamStarted);
        STREAM.addEventListener(StreamEvent.END,            onStreamEnded);
        STREAM.addEventListener(StreamEvent.ERROR,          onStreamError);
        STREAM.addEventListener(StreamEvent.PROGRESS,       onStreamProgress);
        STREAM.addEventListener(StreamEvent.PLAYING,        onStreamPlaying);
        STREAM.addEventListener(StreamEvent.PAUSED,         onStreamPaused);
        STREAM.addEventListener(StreamEvent.SEEKED,         onStreamSeeked);
        */
        function Event () {
            var a = Array.prototype.slice.call(arguments, 0);
            var id = a.shift();
            var event = a.shift();
            var object = $('#' + id);
            id = id.split('embed-').join('').split('object-').join('');
            if (object.size() === 1) {
                Console.log ('VideoFlash.Event', event, id, a);
                if (event == 'onPlayerReady') {
                    var player = object[0];
                    var item = players[id];
                    item.player = player;
                    item.Play = function () {
                        player.videoPlay();
                    };
                    item.Stop = function () {
                        player.videoPause();
                    };
                    item.Mute = function () {
                        player.videoMute(true);
                    };
                    item.UnMute = function () {
                        player.videoMute(false);
                    };
                    item.Seek = function ($pow) {
                        player.videoSeek($pow * this.duration);
                    };
                    item.onLoad ? item.onLoad(item) : null;
                } else {
                    var item = players[id];
                    var player = item.player;
                    if (player) {
                        switch(event) {
                            case 'onStreamReady':
                                var mediaInfo = a.shift();
                                Console.log (mediaInfo);
                                item.videoWidth = mediaInfo.videoWidth;
                                item.videoHeight = mediaInfo.videoHeight;
                                item.duration = mediaInfo.duration;
                                item.onReady ? item.onReady(item) : null;
                            break;
                            case 'onStreamInfo':
                                var mediaInfo = a.shift();
                                Console.log (mediaInfo);
                                item.videoWidth = mediaInfo.videoWidth;
                                item.videoHeight = mediaInfo.videoHeight;
                                item.duration = mediaInfo.duration;
                                if (item.progress != mediaInfo.progress) {
                                    item.progress = mediaInfo.progress;
                                    item.onPlayProgress ? item.onPlayProgress (item) : null;
                                } 
                                if (item.buffer != mediaInfo.buffer) {
                                    item.buffer = mediaInfo.buffer;
                                    item.onLoadProgress ? item.onLoadProgress (item) : null;
                                }
                            break;
                            case 'onStreamStarted':
                                // item.onLoad ? item.onLoad(item) : null;
                            break;
                            case 'onStreamProgress':
                                item.buffer = $e.progress || 0;
                                item.onLoadProgress ? item.onLoadProgress(item) : null;
                            break;
                            case 'onStreamPlaying':
                                item.paused = false;
                                item.buffering = false;
                                item.onState ? item.onState(item) : null;
                            break;
                            case 'onStreamPaused':
                                item.paused = true;
                                item.buffering = false;
                                item.onState ? item.onState(item) : null;
                            break;
                            case 'onStreamSeeked':
                                item.onState ? item.onState(item) : null;
                            break;
                            case 'onStreamEnd':
                                item.paused = true;
                                item.buffering = false;
                                item.onEnded ? item.onEnded(item) : null;
                            break;
                            case 'onStreamError':
                                item.paused = true;
                                item.buffering = false;
                                item.onError ? item.onError(item) : null;
                            break;
                            default :
                                Console.log ('VideoFlash.Event', event, 'not found');                
                            break;
                        }
                    }
                }
            }
        }
        function Load($item) {
            $item.id = 'videoflash-' + count; count++;
            players[$item.id] = $item;
            var mediaplayerUrl = MEDIAPLAYER_FLASH;
            var absoluteUrl = $item.source;
            if (absoluteUrl.indexOf('http') != 0) {
                absoluteUrl = window.location.protocol + '//' + window.location.host + '/' + absoluteUrl;
            }
            var playerTag = Skin.flash({ 
                'mediaplayerUrl': mediaplayerUrl,
                'video_id': $item.id, 
                'url': absoluteUrl, 
                'loop': ($item.loop || false), 
                'autoplay': ($item.autoplay || false), 
                'crop': ($item.crop || false)
            });
            $item.flash = playerTag;
            playerTag.prependTo($item.mediaplayer);
            Console.log('VideoFlash.Load', $item);
        }

        var VideoFlash = {};

        VideoFlash.Event = Event;
        VideoFlash.Load = Load;

        return VideoFlash;
    }();
    var AudioFlash = VideoFlash;

    /********************************
    VideoYoutube
    ********************************/

    var VideoYoutube = function () {

        var INIT = false, READY = false, callbacks = [], players = {}, count = 0;

        function Init() {
            // Console.log ('VideoYoutube.Init');
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
            var iframe = $(player.getIframe());
            item.videoWidth = parseInt(iframe.attr('width'));
            item.videoHeight = parseInt(iframe.attr('height'));
            item.duration = player.getDuration();
            var videoData = player.getVideoData();
            if (videoData.video_id != null) {
                item.videoData = videoData;
                item.onReady ? item.onReady(item) : null;
                Console.log('VideoYoutube.onPlayerReady', item);
            } else {
                item.onError ? item.onError(item) : null;
            }      
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
            // Console.log ('VideoYoutube.onPlayerPlaybackQualityChange', $e.data, $e.target, $e.target.getVideoInfo());
        }
        function onPlayerStateChange($e) {
            // Console.log ('VideoYoutube.onPlayerStateChange', $e.data);
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
            // Console.log('VideoYoutube.onPlayerError');
            var player = $e.target;
            var item = players[player.id];
            item.onError ? item.onError(item) : null;
        }
        
        function Create($item) {
            // Console.log ('VideoYoutube.Create', $item.id);
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
            var id = $item.id, videoId = $item.youtube, player;
            var playerVars = {
                'rel': 0, 
                'playerapiid': id, 
                'showinfo': 0, 
                'modestbranding': 1, 
                'autoplay': $item.autoplay ? 1 : 0, 
                'controls': 0, 
                'html5': 1, 
                'enablejsapi': 1, 
                'origin': document.location.hostname, 
                'suggestedQuality': 'hd1080'
            };
            if ($item.loop) {
                playerVars.loop = 1;
                playerVars.playlist = videoId;
            }
            player = new YT.Player(id, {
                'videoId': videoId,
                'playerVars': playerVars,
                'events': {
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
            $item.id = 'youtube-' + count + '-' + $item.youtube; count++;
            $('<div id="' + $item.id + '" class="youtubeplayer"></div>').prependTo($item.mediaplayer);
            // Console.log ('VideoYoutube.Load', $item.id);
            Init();
            callbacks.push($item);
            if (READY) {
                Callbacks();
            }
            /*
            $.ajax({
                type: 'GET',
                url: ' https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=' + $item.youtube + '&key=AIzaSyDuTLvoZeZis5kF1tILusJsAuQc11e_gtE',
                dataType: 'json',
                success: function ($data) {
                    console.log ('VideoYoutube.Load Api', $data);
                },
                error: function (xhr) {
                    console.log ('VideoYoutube.Load Error', xhr);
                }
            });
            */
        }

        function Callbacks() {
            // Console.log ('VideoYoutube.Callbacks');
            while (callbacks.length > 0) {
                var item = callbacks.shift();
                Create(item);
            }
        }

        function onYouTubeIframeAPIReady() {
            // Console.log ('VideoYoutube.onYouTubeIframeAPIReady');
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

        var INIT = false, READY = false, callbacks = [], players = {}, count = 0;

        function Init() {
            // Console.log ('VideoVimeo.Init');
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
            // Console.log ('VideoVimeo.onVimeoFroogaloopReady');
            READY = true;
            Callbacks();
        }
        function onPlayerReady($e) {
            var player = $e.target;
            var item = players[player.id];
            // Console.log ('VideoVimeo.onPlayerReady', item);
            // Console.log ('VideoVimeo.onPlayerReady', 'item.id', item.id);
            // Console.log ('VideoVimeo.onPlayerReady.getVideoData', player.width, player.height);
            // player.playVideo();
            // player.stopVideo();            
            // Console.log('VideoVimeo.onPlayerReady', player.api);
            player.api('getVideoWidth', function ($val, $id) {
                item.videoWidth = parseInt($val, 10);
                player.api('getVideoHeight', function ($val, $id) {
                    item.videoHeight = parseInt($val, 10);
                    player.api('getDuration', function ($val, $id) {
                        item.duration = parseFloat($val);
                        // Console.log('VideoVimeo.onPlayerReady', item.videoWidth, item.videoHeight);
                        item.onReady ? item.onReady(item) : null;
                        if (item.loop) {
                            player.api('setLoop', true);
                        }
                        if (item.autoplay) {
                            item.Play();
                        }
                    }); 
                });
            });
        }
        /*
        function onPlayerPlaybackQualityChange ($e) {
            // Console.log ('VideoVimeo.onPlayerPlaybackQualityChange', $e.data, $e.target, $e.target.getVideoInfo());
        }
        function onPlayerStateChange ($e) {
            // Console.log ('VideoVimeo.onPlayerStateChange', $e.data);
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
            // Console.log ('VideoVimeo.onLoadProgress', arguments);    
            var player = $e.target;
            var item = players[player.id];
            // Console.log ($e.data);
            item.buffer = parseFloat($e.data.percent);
            item.onLoadProgress ? item.onLoadProgress(item) : null;
        }
        function onPlayProgress($e) {
            // Console.log ('VideoVimeo.onPlayProgress', arguments);    
            var player = $e.target;
            var item = players[player.id];
            // Console.log ($e.data);
            item.progress = parseFloat($e.data.percent);
            if (item.duration == 0) {
                player.api('getDuration', function ($val, $id) {
                    item.duration = parseFloat($val);               
                });
            }
            item.onPlayProgress ? item.onPlayProgress(item) : null;            
        }
        function onPlayerSeek($e) {
            // Console.log ('VideoVimeo.onPlayerSeek', arguments);  
            var player = $e.target;
            var item = players[player.id];
            // Console.log ($e.data);
            item.progress = parseFloat($e.data.percent);
            item.onSeek ? item.onSeek(item) : null;            
        }
        function onPlayerPlay($e) {
            // Console.log ('VideoVimeo.onPlayerPause', arguments); 
            var player = $e.target;
            var item = players[player.id];
            item.paused = false;
            item.buffering = false;
            item.onState ? item.onState(item) : null;
        }
        function onPlayerPause($e) {
            // Console.log ('VideoVimeo.onPlayerPause', arguments); 
            var player = $e.target;
            var item = players[player.id];
            item.paused = true;
            item.buffering = false;
            item.onState ? item.onState(item) : null;
        }
        function onPlayerEnd($e) {
            // Console.log ('VideoVimeo.onPlayerEnd', arguments);   
            item.paused = false;
            item.buffering = false;
            item.onState ? item.onState(item) : null;
        }
        function onPlayerError($e) {
            // Console.log ('VideoVimeo.onPlayerError');    
            var player = $e.target;
            var item = players[player.id];
            item.onError ? item.onError(item) : null;
        }
        function onIframeError($item) {
            // Console.log ('VideoVimeo.onIframeError', $item);    
            $item.onError ? $item.onError($item) : null;
        }
        function Create($item) {
            // Console.log ('VideoVimeo.Create', $item.id);
            // 'M7lc1UVf-VE'
            var id = $item.id, videoId = $item.vimeo;

            function onVimeoApiSuccess ($data) {
                // Console.log ('VideoVimeo.onVimeoApiSuccess', $data);
                var ww = $(window).width();
                var wh = ww / 16 * 9;

                var iframe = $('<iframe id="' + id + '" src="http://player.vimeo.com/video/' + videoId + '?api=1&player_id=' + id + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
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
                    videoId: videoId,
                    playerVars: { 'autoplay': 0, 'controls': 0, 'html5':1,'enablejsapi':1, 'origin':document.location.hostname, 'suggestedQuality': 'hd1080' },
                    events: {
                        'onReady': onPlayerReady,
                        'onPlaybackQualityChange': onPlayerPlaybackQualityChange,
                        'onStateChange': onPlayerStateChange,
                        'onError': onPlayerError
                    }
                })
                */

                $item.videoData = $data;
                
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

            $.ajax({
                type: 'GET',
                url: 'http://vimeo.com/api/v2/video/' + videoId + '.json',
                dataType: 'json',
                success: function ($data) {
                    onVimeoApiSuccess ($data);
                },
                error: function (xhr) {
                    onIframeError($item);
                    /*
                    var message = xhr.statusText;
                    if (xhr.statusText == 'OK') {
                        message = 'document malformed';
                    }
                    */
                }
            });

        }

        function Load($item) {
            $item.id = 'vimeo-' + count + '-' + $item.vimeo; count++;
            // $('<div id="'+ $item.id +'" class="vimeoplayer"></div>').prependTo($item.mediaplayer);
            // Console.log('VideoVimeo.Load', $item.id);
            Init();
            callbacks.push($item);
            if (READY) {
                Callbacks();
            }
        }

        function Callbacks() {
            // Console.log ('VideoVimeo.Callbacks');
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
        // Console.log ('Mediaplayer.onLoad', $item);   
        $item.mediaplayer.addClass('loading');
    }
    function onLoadProgress($item) {
        // Console.log ('Mediaplayer.onLoadProgress', $item);   
        if ($item.controls) {
            $item.controls.find('.buffer').width(($item.buffer * 100) + '%');
        }
    }
    function onPlayProgress($item) {
        // Console.log ('Mediaplayer.onPlayProgress', $item);   
        if ($item.controls && !$item.scrubbing) {
            $item.controls.find('.progress').width(($item.progress * 100) + '%');
            $item.controls.find('.scrub').css({'left': ($item.progress * 100) + '%'});
            $item.controls.find('.current').text(secToTime($item.progress * $item.duration));
            $item.controls.find('.duration').text(secToTime($item.duration));
        }
    }
    function onSeek($item) {
        // Console.log ('Mediaplayer.onSeek', $item);
        if ($item.controls) {
            $item.controls.find('.progress').width(($item.progress * 100) + '%');
            $item.controls.find('.scrub').css({'left': ($item.progress * 100) + '%'});
            $item.controls.find('.current').text(secToTime($item.progress * $item.duration));
            $item.controls.find('.duration').text(secToTime($item.duration));
        }   
    }
    function onReady($item) {
        if (!$item.mediaplayer.hasClass('canplay')) {
            // Console.log ('Mediaplayer.onReady', $item);
            setTimeout (function(){
                $item.mediaplayer.removeClass('loading').addClass('canplay');
                Resize($item);
                $item.callback ? $item.callback() : null;
                Minimize.call($item.mediaplayer[0]);
            }, 100);
        }
    }
    function onLoadComplete($item) {
        // Console.log ('Mediaplayer.onLoadComplete', $item);           
    }
    function onEnded($item) {
        // Console.log ('Mediaplayer.onEnded', $item);
        if ($item.loop) {
            $item.Seek(0);
            $item.Play(0);
        }
        $item.mediaplayer.removeClass('playing');
    }
    function onError($item) {
        // Console.log('Mediaplayer.onError', $item);
        $item.mediaplayer.removeClass('loading').addClass('error');
    }
    function onState($item) {
        // Console.log ('Mediaplayer.onState', $item);
        $item.paused ? $item.mediaplayer.removeClass('playing') : $item.mediaplayer.addClass('playing');
        $item.buffering ? $item.mediaplayer.addClass('buffering') : $item.mediaplayer.removeClass('buffering');
    }

    function InitMediaplayer($callback) {
        var mediaplayer = $(this);
        var id = 'mediaplayer-' + items.length;
        mediaplayer.attr({ 'data-init': 'true', 'id': id });

        var item = {
            vimeo: mediaplayer.attr('vimeo'),
            youtube: mediaplayer.attr('youtube'),
            mp4: mediaplayer.attr('mp4'),
            mp3: mediaplayer.attr('mp3'),
            poster: mediaplayer.attr('poster'),
            controls: mediaplayer.attr('controls'),
            fallback: mediaplayer.attr('fallback'),
            autoplay: mediaplayer.attr('autoplay'),
            loop: mediaplayer.attr('loop'),
            crop: mediaplayer.hasClass('crop'),
            square: mediaplayer.hasClass('square'),
            circle: mediaplayer.hasClass('circle'),
            hover: mediaplayer.hasClass('hover'),
            mediaplayer: mediaplayer,
            paused: true,
            callback: $callback
        };
        item.onLoad = onLoad;
        item.onError = onError;
        item.onReady = onReady;
        item.onLoadProgress = onLoadProgress;
        item.onPlayProgress = onPlayProgress;
        item.onSeek = onSeek;
        item.onLoadComplete = onLoadComplete;
        item.onEnded = onEnded;
        item.onState = onState;
        items.push(item);
        mediaplayers[id] = item;
        
        item.controls =     item.controls !== undefined ? true : false;
        item.fallback =     item.fallback !== undefined ? true : false;
        item.autoplay =     item.autoplay !== undefined ? true : false;
        item.loop =         item.loop !== undefined ? true : false;
        
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
            mediaplayer.addClass('vimeo video');
            VideoVimeo.Load(item);

        } else if (item.youtube) {
            mediaplayer.addClass('youtube video');
            VideoYoutube.Load(item);

        } else if (item.mp4) {
            item.source = item.mp4;
                
            if (canPlayMp4()) {
                mediaplayer.addClass('html5 video');
                VideoHtml5.Load(item);

            } else if (USE_FALLBACK && item.fallback) {
                mediaplayer.addClass('flash video');
                VideoFlash.Load(item);

            } else {
                onError(item);

            }
        } else if (item.mp3) {
            item.source = item.mp3;

            if (canPlayMp3()) {
                mediaplayer.addClass('html5 audio');
                AudioHtml5.Load(item);

            } else if (USE_FALLBACK && item.fallback) {
                mediaplayer.addClass('flash audio');
                AudioFlash.Load(item);

            } else {
                onError(item);

            }
        } else {
            onError(item);

        }
    }
    function Init($callback) {
        // Console.log ('Mediaplayer.Init');
        $(".mediaplayer[data-init!='true']").each(function () {
            InitMediaplayer.call(this);
        });
    }

    function supportVideo() {
        return !!document.createElement('video').canPlayType;
    }
    function supportAudio() {
        return !!document.createElement('audio').canPlayType;
    }
    function canPlayMp4 () {
        if (DEBUG_FLASH || !supportVideo()) { 
            return false; 
        }
        var v = document.createElement("video");
        var canPlay = v.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"');
        return (canPlay === 'probably' || canPlay === 'maybe');
    }
    function canPlayMp3 () {
        if (DEBUG_FLASH || !supportAudio()) { 
            return false; 
        }
        var v = document.createElement("audio");
        var canPlay = v.canPlayType('audio/mpeg');
        return (canPlay === 'probably' || canPlay === 'maybe');
    }

    function Poster($item) {
        var poster = $item.poster;
        $item.poster = $('<img src="' + poster + '" class="poster"/>').prependTo($item.mediaplayer.find('.overlay'));
        var img = new Image();
        img.onload = function () {
            $item.posterWidth = this.naturalWidth;
            $item.posterHeight = this.naturalHeight;
            // Console.log('Mediaplayer.Poster', $item.posterWidth, $item.posterHeight);
            Resize($item);
        };
        img.onerror = function () {
        };
        img.src = poster;
        $item.mediaplayer.addClass('poster');
    }

    function Resize($item) {
        // Console.log('Mediaplayer.Resize');
        // var ww = win.width();
        // var wh = win.height();
        function resizeItem(item) {
            var vw, vh, vr, ir, pr;
            var aw, ah, al, at, nw, nh, nl, nt, pw, ph, pl, pt, d = 2;
            vw = item.mediaplayer.width();
            vh = item.mediaplayer.height();
            vr = vw / vh;
            ir = 16 / 9;
            pr = ir;
            if (item.posterWidth) {
                pr = item.posterWidth / item.posterHeight;
            }
            if (item.videoWidth) {
                ir = item.videoWidth / item.videoHeight;
            } else {
                ir = pr;
            }
            // CROP
            console.log (item.id, 'item.crop', item.crop);
            if (item.crop) {
                if (item.circle || item.square) {
                    vh = vw;
                    vr = 1;
                    item.mediaplayer.height(Math.round(vh));
                }
                // console.log(vw,vh,ir,vr);                
                aw = vw + d;
                ah = vh + d;
                al = - d / 2;
                at = - d / 2;
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
                nw = vw + d;
                nh = vw / ir;
                nl = - d / 2;
                nt = - d / 2;                
                aw = nw;
                ah = nh;
                al = nl;
                at = nt;
                /*
                if (item.vimeo || item.youtube) {
                    item.mediaplayer.height(Math.round(nh));
                }
                */
                pw = vw + d;
                ph = vw / pr;
                pl = - d / 2;
                pt = - d / 2;
                // Console.log('item.videoWidth', item.videoWidth);
                if (item.videoWidth) {
                    item.mediaplayer.height(Math.round(nh));
                } else if (item.posterWidth) {
                    // Console.log('posterWidth', ph);
                    item.mediaplayer.height(Math.round(ph));
                }
            }
            aw = Math.round(aw);
            ah = Math.round(ah);
            al = Math.round(al);
            at = Math.round(at);
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
                    'width':    pw + 'px',
                    'height':   ph + 'px',
                    'left':     pl + 'px',
                    'top':      pt + 'px'
                });
            }
            if (item.vimeo) {
                iframe = item.mediaplayer.find('iframe');
                iframe.css({
                    'width':    nw + 'px',
                    'height':   (nh + 120) + 'px',
                    'left':     nl + 'px',
                    'top':      (nt - 60) + 'px'
                });
                Console.log('Mediaplayer.Resize.resizeItem.vimeo', item.videoWidth, item.videoHeight);
           
            } else if (item.youtube) {
                if (item.player) {
                    item.player.width = nw;
                    item.player.height = nh + 240;
                }
                iframe = item.mediaplayer.find('iframe');
                iframe.css({
                    'width':    nw + 'px',
                    'height':   (nh + 240) + 'px',
                    'left':     nl + 'px',
                    'top':      (nt - 120) + 'px'
                });
                Console.log('Mediaplayer.Resize.resizeItem.youtube', item.videoWidth, item.videoHeight);
           
            } else if (item.flash) {
                item.flash.css({
                    'width':    aw + 'px',
                    'height':   ah + 'px',
                    'left':     al + 'px',
                    'top':      at + 'px'
                });
                item.flash.find('*').css({
                    'width':    aw + 'px',
                    'height':   ah + 'px'
                });
                Console.log('Mediaplayer.Resize.resizeItem.flash', item.videoWidth, item.videoHeight);
           
            } else if (item.player) {
                item.player.width = nw;
                item.player.height = nh;
                $(item.player).css({
                    'width':    nw + 'px',
                    'height':   nh + 'px',
                    'left':     nl + 'px',
                    'top':      nt + 'px'
                });
                Console.log('Mediaplayer.Resize.resizeItem.html5', item.videoWidth, item.videoHeight);
           
            }
            // Console.log ('Mediaplayer.Resize', nw, nh);  
        }
        if ($item) {
            return resizeItem($item);
        }
        $.each(items, function (i, item) {
            resizeItem(item);                  
        });
    }

    function Load() {
        if (video) {
            video.load();
        }
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
    }function Load() {
        if (video) {
            video.load();
        }
    }
    
    function stopAll() {
        // Console.log ('Mediaplayer.stopAll', video);
        for (var p in mediaplayers) {
            var item = mediaplayers[p];
            if (item.player && !item.paused) {
                item.Stop();
            }    
        }
    }
    function togglePlay() {
        // Console.log ('Mediaplayer.togglePlay', video);
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        // Console.log(mediaplayer);
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
        // Console.log(mediaplayer);
        if (item.player && item.paused) {
            stopAll ();
            item.Play();
        }
    }
    function Pause() {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        // Console.log(mediaplayer);
        if (item.player && !item.paused) {
            item.Stop();
        }
    }
    function Fullscreen() {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        // Console.log(mediaplayer);
        if (item.player && !item.fullscreen) {
            item.fullscreen = true;
            mediaplayer.addClass('fullscreen');
            $('html').addClass('mediaplayer-fullscreen');
            /*
            var elem = mediaplayer[0];
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
            */
            Resize(item);
        }
    }
    function Normal() {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        // Console.log(mediaplayer);
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
        // Console.log(mediaplayer);
        if (item.player) {
            item.Seek($pow);
        }
    }
    function Minimize() {
        // Console.log('Minimize');
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
                // Console.log ('Mediaplayer.ScrubEnd', x, tw);
            
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
    function Share() {
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        var data = Enquery.call(this);
        if (data.script && qso.shortUrl && qso.shortUrl.indexOf('/mediaplayer.js') != -1) {
            var parameters = '';
            for (var p in data) {
                if (p != 'script') {
                    parameters += '&' + p + '=' + data[p];
                }
            }
            parameters = parameters.split('&');
            parameters.shift();
            parameters = parameters.join('&');
            var longUrl = escape(qso.shortUrl.split('/mediaplayer.js')[0] + '/mediaplayer.js?' + parameters);
            Bitly.Save(longUrl, function($shortUrl) {
                var scriptHtml = '<script type="text/javascript" src="' + $shortUrl + '"></script>';
                Console.log ('Mediaplayer.Share.makeScript', scriptHtml, $shortUrl);
            });
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
    function Enquery () {
        Console.log('Mediaplayer.Enquery');
        var mediaplayer = getMediaplayer.call(this);
        var item = mediaplayers[mediaplayer.attr('id')];
        var qso = {}
        if (item.player) {
            var classes = mediaplayer.attr('class').split(' ');
            var attributes = {};
            $(mediaplayer[0].attributes).each(function() {
                attributes[this.nodeName] = this.nodeValue;
            });
            $.each(classes, function($i,$v) {
                switch($v) {
                    case 'square':
                    case 'circle':
                    case 'crop':
                    case 'hover':
                        qso[$v] = 'true';
                    break;
                }
            });
            for (var p in attributes) {
                switch(p) {
                    case 'mp4':
                    case 'youtube':
                    case 'vimeo':
                    case 'poster':
                        qso[p] = attributes[p];
                    break;
                    case 'fallback':
                    case 'controls':
                    case 'autoplay':
                    case 'loop':
                        qso[p] = 'true';
                    break;
                }
            }
            qso.script = true;
        }
        return qso;
        var qso = Enquery.call(this);        
            if (qso.script) {
            var mediaplayer = $('<div class="mediaplayer"></div>');
            for (var p in qso) {
                switch(p) {
                    case 'script':
                    break;
                    case 'circle':
                    case 'square':
                    case 'crop':
                    case 'hover':
                        qso[p] === 'true' ? mediaplayer.addClass(p) : null;
                    break;
                    default:
                        mediaplayer.attr(p, qso[p]);
                }
            }
            mediaplayer.insertAfter($(qso.script));
        }
    }

    function Query ($query) {
        if ($query) {
            Console.log('Mediaplayer.Query', $query.shortUrl, $query.script);
            var query = $query;
            if (query.script) {
                var script = query.script;
                var shortUrl = query.shortUrl, longUrl = shortUrl;
                // Console.log('Mediaplayer.Query', shortUrl);
                function parseQSO (qs) {
                    var query = {};
                    if (!qs) return query;
                    // Console.log('Mediaplayer.parseQSO', qs);
                    var pairs = qs.split(/[;&]/);
                    for (var i = 0; i < pairs.length; i++) {
                        var kv = pairs[i].split('=');
                        if (!kv || kv.length != 2) continue;
                        var key = unescape(kv[0]);
                        var val = unescape(kv[1]);
                        val = val.replace(/\+/g, ' ');
                        query[key] = val;
                    }
                    return query;
                }
                function parseQS ($longUrl) {
                    var qs = $longUrl.replace(/^[^\?]+\??/,'');
                    var query = parseQSO(qs);
                    query.script = script;
                    var mediaplayer = $('<div class="mediaplayer"></div>'), hasAttributes = false;
                    for (var p in query) {
                        switch(p) {
                            case 'script':
                            break;
                            case 'circle':
                            case 'square':
                            case 'crop':
                            case 'hover':
                                if (query[p] === 'true') {
                                    mediaplayer.addClass(p);
                                }
                            break;
                            case 'mp4':
                            case 'vimeo':
                            case 'youtube':
                            case 'poster':
                            case 'controls':
                            case 'fallback':
                            case 'autoplay':
                            case 'loop':
                                mediaplayer.attr(p, query[p]);
                                hasAttributes = true;
                            break;
                        }
                    }
                    if (hasAttributes) {
                        mediaplayer.insertAfter($(query.script));
                        Console.log ('Mediaplayer.EmbedObject', mediaplayer);                
                        InitMediaplayer.call(mediaplayer[0]);
                    } else {
                        Console.log ('Mediaplayer.EmbedObject', $longUrl, mediaplayer, hasAttributes);                
                    }                        
                }
                Bitly.Expand(shortUrl, function($longUrl) {
                    parseQS ($longUrl);
                });
            }        
        }
    }

    var Api = function () {
        Console.log('Mediaplayer.Api');

        function Event() {
            VideoFlash.Event.apply( this, arguments );
        }

        function Log($func, $params) {
            var params = '';
            for (var p in $params) {
                params += p + ': ' + $params[p] + ' ';
            }
            Console.log ($func, params);
        }

        var Api = {};

        Api.Event = Event;
        Api.Log = Log;

        return Api;
    }();

    var Mediaplayer = {
    };

    Mediaplayer.mediaplayers = mediaplayers;
    Mediaplayer.Init = Init;
    Mediaplayer.InitMediaplayer = InitMediaplayer;
    Mediaplayer.Clear = Clear;
    Mediaplayer.togglePlay = togglePlay;
    Mediaplayer.Query = Query;
    Mediaplayer.Api = Api;

    function Initialize () {
        if (window['$']) {

            Mediaplayer.Init(function () {
                Console.log('Mediaplayer.Init.callback');
            });

            if (qso.shortUrl.indexOf('?') != -1 || qso.shortUrl.indexOf('bit.ly') != -1) {
                Query (qso);
            }

            win = $(window);
            win.on('resize', function () {
                Resize();
            });

            $('body').on('touchstart click', '.mediaplayer .overlay, .mediaplayer .btn-play', function ($e) {
                togglePlay.call(this);
                return false;
            }).on('mouseover', '.mediaplayer .overlay', function ($e) {
                if ($(this).closest('.mediaplayer').hasClass('hover')) {
                    Play.call(this);
                    return false;
                } else {
                    return true;
                }        
            }).on('mouseout', '.mediaplayer .overlay', function ($e) {
                if ($(this).closest('.mediaplayer').hasClass('hover')) {
                    Pause.call(this);
                    return false;
                } else {
                    return true;
                }        
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

        } else {
            setTimeout (Initialize, 100);

        }
    }

    Initialize ();

    return Mediaplayer;

}();