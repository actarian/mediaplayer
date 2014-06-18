
	var Styler = function () {

		// CONST
		var media = {
			xs: 0,
			sm: 1,
			md: 2,
			lg: 3
		};
		var queries = {
			xs: [0,767],
			sm: [768,991],
			md: [992,1199],
			lg: [1200,20000]
		};

		var win = {w:0, h:0, m:0}, rules = {}, sequence = [], callbacks = [];

		var styleSheet, mediaType, M, B = true;

		function getMedia($w) {
			var m = 'xs';
			for (var p in queries) {
				if ($w>= queries[p][0] && $w<= queries[p][1]) {
					m = p;
				}
			}
			return media[m];
		}
		function getRuleMedia($rule) {
			var media = null;
			if ($rule && $rule.parentRule && $rule.parentRule.parentRule && $rule.parentRule.parentRule.media && $rule.parentRule.parentRule.media.length) {
				media = $rule.parentRule.parentRule.media[0];
			}
			return media;
		}
		function getMinMax() {
			for (var p in queries) {
				var rule = getSelector('.visible-'+p);
				if (rule) {
					var media = getRuleMedia(rule);
					if (media) {
						media = media.split(' ').join('');
						var max = media.split('max-width:');
						if (max.length == 2) {
							max = parseInt(max[1].split('px')[0]);
						} else {
							max = 20000;
						}
						var min = media.split('min-width:');
						if (min.length == 2) {
							min = parseInt(min[1].split('px')[0]);
						} else {
							min = 0;
						}
						queries[p][0] = min;
						queries[p][1] = max;
					}
				} else {
					B = false;
				}
			}
		}
		getMinMax ();
		if (B) {
			console.log('Bootstrap','xs',queries.xs,'sm',queries.sm,'md',queries.md,'lg',queries.lg);
		}

/*
Most browsers support window.innerWidth and window.innerHeight.
But IE6, 7, 8 and 9 in quirks mode require document.body.clientWidth and document.body.clientHeight.
All the main browsers support document.documentElement.clientWidth and document.documentElement.clientHeight but it’s inconsistent. Either the window or document dimensions will be returned depending on the browser and mode.
*/

		function Resize() {
			win.w = document.documentElement.clientWidth;
			win.h = document.documentElement.clientHeight;
			win.m = getMedia(win.w);
			Callback();
		}
		if (window.addEventListener) {
			window.addEventListener('resize', function(event){
				Resize ();
			});
		} else {
			window.attachEvent('onresize', function(event){
				Resize ();
			});
		}
		Resize ();

		function Callback () {
			var i, callback, rule;
			for (i = 0; i < sequence.length; i++) {
				var selector = sequence[i];
				rule = rules[selector];
				if (rule && rule.callback) {
					rule.callback(rule.rule, win);
				}
			}
			for (i = 0; i < callbacks.length; i++) {
				callback = callbacks[i];
				if (callback) {
					callback(rules, win);
				}
			}
		}

		function addCallback (callback) {
			if (callback) {
				callbacks.push(callback);
				callback(rules, win);
			}
		}

		function watchSelector (selector, style, callback) {
			var rule = addSelector (selector, style);
			if (rule) {
				rules[selector] = {'rule': rule, 'callback': callback};
				sequence.push(selector);
			}
			if (callback) {
				callback(rule, win);
			}
			console.log ('Styler.watchSelector');
		}

		function getStylesheet () {
		    if (!document.styleSheets) {
		        return;
		    }
		    if (document.getElementsByTagName('head').length === 0) {
		        return;
		    }
		    var i, media;
		    if (document.styleSheets.length > 0) {
		        for (i = 0; i < document.styleSheets.length; i++) {
		            if (document.styleSheets[i].disabled) {
		                continue;
		            }
		            media = document.styleSheets[i].media;
		            mediaType = typeof media;
		            if (mediaType == 'string') {
		                if (media === '' || (media.indexOf('screen') != -1)) {
		                    styleSheet = document.styleSheets[i];
		                }
		            } else if (mediaType == 'object') {
		                if (media.mediaText === '' || (media.mediaText.indexOf('screen') != -1)) {
		                    styleSheet = document.styleSheets[i];
		                }
		            }
		            if (typeof styleSheet != "undefined") {
		                break;
		            }
		        }
		    }
		    if (typeof styleSheet == "undefined") {
		        var styleSheetElement = document.createElement("style");
		        styleSheetElement.type = "text/css";
		        document.getElementsByTagName("head")[0].appendChild(styleSheetElement);
		        for (i = 0; i < document.styleSheets.length; i++) {
		            if (document.styleSheets[i].disabled) {
		                continue;
		            }
		            styleSheet = document.styleSheets[i];
		        }
		        media = styleSheet.media;
		        mediaType = typeof media;
		    }
		    return styleSheet;
		}

		function getRule (selector, $styleSheet) {
			var rule, i, ss = $styleSheet || styleSheet;
			if (mediaType == "string") {
		    	for (i = 0; i < ss.rules.length; i++) {
		            if (ss.rules[i].selectorText && ss.rules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
		                rule = ss.rules[i].style;
		                return rule;
		            } else if (ss.rules[i].media && ss.rules[i].media.length) {
						rule = getRule(selector, ss.rules[i]);
						if (rule) {
							return rule;
						}
					}
		        }
		    } else if (mediaType == "object") {
		        for (i = 0; i < ss.cssRules.length; i++) {
					if (ss.cssRules[i].selectorText && ss.cssRules[i].selectorText.toLowerCase() == selector.toLowerCase()) {
		                rule = ss.cssRules[i].style;
		                return rule;
		            } else if (ss.cssRules[i].media && ss.cssRules[i].media.length) {
						rule = getRule(selector, ss.cssRules[i]);
						if (rule) {
							return rule;
						}
					}
		        }
		    }
		}

		function insertRule (selector, style) {
		    if (mediaType == "string") {
		    	styleSheet.addRule(selector, style);
		    } else if (mediaType == "object") {
		        styleSheet.insertRule(selector + "{" + style + "}", styleSheet.cssRules.length);
		    }
		}

		function addSelector (selector, style) {
			styleSheet = styleSheet || getStylesheet();
			if (!styleSheet) {
				return;
			}
			var rule = getRule(selector);
			if (rule) {
				return rule;
			}
			insertRule(selector, style);
			return getRule(selector);
		}

		function getSelector (selector) {
			styleSheet = styleSheet || getStylesheet();
			if (!styleSheet) {
				return;
			}
			return getRule(selector);
		}

		var windowHeight = 				addSelector('.windowHeight', 		'height:0');
		// var windowMediaWidth = 		addSelector('.windowMediaWidth', 	'width:100%');
		addCallback(function($rules, $win) {
			windowHeight.height = $win.h + 'px';
		});

		/*
		watchSelector('.windowHeight', 'height:0', function($rule, $win) {
			$rule.height = $win.h + 'px';
		});
		*/

		var Styler = {};

		Styler.media 			  	= media;
		Styler.queries 				= queries;
		Styler.addSelector 			= addSelector;
		Styler.getSelector		 	= getSelector;
		Styler.watchSelector 	  	= watchSelector;
		Styler.addCallback 			= addCallback;

		Styler.hasBootstrap 		   = B;

		return Styler;

	}();

	var Templ = function () {

		var queries = Styler.queries;

		var Templ = {};

		Templ.Debuggr = ''+
		'<debuggr class="windowHeight">'+
		'	<div class="container">'+
		'		<div class="row">'+
		'		</div>'+
		'	</div>'+
		'	<debuggrInfo><span></span></debuggrInfo>'+
		'	<style>'+
		'		body {'+
		'			margin-bottom:30px;'+
		'		}'+
		'		debuggr {'+
		'			display:block;position:fixed;top:0;left:0;width:100%;background:rgba(255,255,255,0.1);z-index:666666;font-size:12px;font-weight:bold;letter-spacing:0;'+
		'		}'+
		'		debuggr, debuggr div {'+
		'			height:100%;'+
		'		}'+
		'		debuggr span {'+
		'			display:block;width:100%;height:100%;border-left:1px solid cyan;border-right:1px solid cyan;background:rgba(0,255,255,0.1);'+
		'		}'+
		'		debuggr>debuggrInfo {'+
		'			display:block;position:absolute;width:100%;height:30px;bottom:0;background:cyan;color:white;text-align:center;'+
		'		}'+
		'		debuggr>debuggrInfo:before {'+
		'			display:inline-block;height:30px;line-height:30px;padding:0 15px;color:black;text-align:center;'+
		'		}'+
		'		debuggr>debuggrInfo:after {'+
		'			display:inline-block;position:absolute;height:30px;right:0;line-height:30px;padding:0 15px;text-align:center;background:#eee;color:black;'+
		'		}'+
		'		debuggr>debuggrInfo>span {'+
		'			display:inline-block;position:absolute;width:auto;height:30px;left:0;line-height:30px;padding:0 15px;text-align:left;background:#eee;color:black;'+
		'		}'+
		'		/*XS*/'+
		'		@media (max-width: '+queries.xs[1]+'px) {'+
		'			debuggr>debuggrInfo:after {'+
		'				content: "XS max-width '+queries.xs[1]+'";'+
		'			}'+
		'		}'+
		'		/*SM*/'+
		'		@media (min-width: '+queries.sm[0]+'px) and (max-width: '+queries.sm[1]+'px) {'+
		'			debuggr>debuggrInfo:after {'+
		'				content: "SM min-width '+queries.sm[0]+'";'+
		'			}'+
		'		}'+
		'		/*MD*/'+
		'		@media (min-width: '+queries.md[0]+'px) and (max-width: '+queries.md[1]+'px) {'+
		'			debuggr>debuggrInfo:after {'+
		'				content: "MD min-width '+queries.md[0]+'";'+
		'			}'+
		'		}'+
		'		/*LG*/'+
		'		@media (min-width: '+queries.lg[0]+'px) {'+
		'			debuggr>debuggrInfo:after {'+
		'				content: "LG min-width '+queries.lg[0]+'";'+
		'			}'+
		'		}'+
		'	</style>'+
		'</debuggr>';

		Templ.DebuggrCol = ''+
		'			<div class="##type##">'+
		'				<span>'+
		'				</span>'+
		'			</div>';

		return Templ;

	}();

	var Snippr = function () {

		var visible, el;

		function Make ($html,$data) {
			html = $html;
			if ($data) {
				for (var p in $data) {
					html = html.split('##'+p+'##').join($data[p]);
				}
			}
			return $(html);
		}

		var Snippr = {};

		Snippr.Make			= Make;

		return Snippr;

	}();

	var Debuggr = function () {

		var visible, el, num;

		function Cols() {
			el.find('.row').html('');
			var type = 'col-xs-' + num;
			var col = Snippr.Make ( Templ.DebuggrCol, {'type': type} ), i = 0;
			while(i<(12/num)){
				col.clone().appendTo(el.find('.row'));
				i++;
			}
		}
		function El() {
			if (!el) {
				el = Snippr.Make ( Templ.Debuggr );
				var id = $('html').attr('data-id') || '0';
				/*
				var classes = $('html').attr('class') || '';
				classes = classes.substring(0, Math.min(classes.length, 17)) + '...';
				*/
				var classes = $('html').attr('class').split(' ');
				classes.length = Math.min(2, classes.length);
				el.find('debuggrInfo>span').text('#' + id + ', ' + classes.join(' '));
			}
			return el;
		}
		function Show ($num) {
			num = ($num === 5) ? 12 : $num;
			el = El();
			if (Styler.hasBootstrap) {
				Cols();
			}
			if (!el.parent().size()){
				el.appendTo('body');
			}
			// $('html').addClass('windowMediaWidth');
			visible = true;
		}
		function Hide () {
			el.remove();
			// $('html').removeClass('windowMediaWidth');
			visible = false;
		}
		function Toggle ($num) {
			if(visible && (num == $num)) {
				Hide();
			} else {
				Show($num);
			}
		}
		$(document).keydown(function($e) {
			// 49 - 52 (1-6)
	        if ($e.altKey && $e.keyCode > 48 && $e.keyCode < 55) {
	            Toggle ($e.keyCode - 48);
	            // Styler.windowMediaWidth.width = '960px';
	        }
	    });
		Styler.watchSelector('debuggrInfo::before', "content:'0x0';", function($rule,$win){
			$rule.content = "'" + $win.w + 'x' + $win.h + "'";
		});

		var Debuggr = {};

		Debuggr.Show			= Show;
		Debuggr.Hide			= Hide;

		return Debuggr;

	}();
