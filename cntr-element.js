/**
 * CntrElement - is small module that help you always show element in center
 * of parent container with reference to vertical scroll
 *
 * Options: {
 *  viewport – window or iframe elements (default: window)
 *  container – parent documentElement
 *  element – child documentElement in container
 *  padding – top and bottom padding for container in px
 *  debug – show debug information in DevTools
 *
 */
define(function() {
	'use strict';

	var defaultOptions = {
		viewport: window,
		padding: 25,
		debug: false
	};

	function extendOptions(dflt, cstm) {
		for (var property in cstm) {
			dflt[property] = cstm[property];
		}
		return dflt;
	}

	return function(options) {
		var inst = {},
			debug = {},
			containerHeight;

		calcContainerHeight();

		function calcContainerHeight() {
			containerHeight = options.container.offsetHeight;
		}

		options = extendOptions(defaultOptions, options);

		options.element.style.position = 'absolute';
		options.element.style.margin = 'none';
		options.element.style.bottom = 'inherit';
		options.element.style.left = 0;
		options.element.style.right = 0;

		function getContainerTopLevel(container) {
			var level = 0;

			if ( container.getBoundingClientRect ) {
				level = options.container.getBoundingClientRect().top + options.viewport.pageYOffset
			} else {
				while (container) {
					level = level + container.offsetTop;
					container = container.offsetParent;
				}
			}

			return level;
		}

		function center() {
			var windowTopLevel = options.viewport.pageYOffset,
				windowBottomLevel = options.viewport.innerHeight + options.viewport.pageYOffset,
				containerTopLevel = getContainerTopLevel(options.container),
				containerBottomLevel = containerTopLevel + containerHeight,
				isConatainerInViewport = containerTopLevel <= options.viewport.innerHeight + options.viewport.pageYOffset,
				isConatainerFullInViewport = ( (windowTopLevel <= containerTopLevel) && (windowBottomLevel >= containerBottomLevel) ),
				minElementX = options.padding,
				maxElementX = containerHeight - options.element.offsetHeight - minElementX,
				x = minElementX;

			if (isConatainerInViewport) {
				if (isConatainerFullInViewport) {
					x = ( containerHeight - options.element.offsetHeight ) / 2;
				} else {
					// Case: top
					debug.case = 'top';
					if ( containerTopLevel >= options.viewport.pageYOffset ) {
						var resultX = ( options.viewport.innerHeight - containerTopLevel +
							options.viewport.pageYOffset - options.element.offsetHeight) / 2;
						x = (resultX < minElementX) ? minElementX : resultX;
						// Case: bottom
					} else if ( containerTopLevel +
						containerHeight <= options.viewport.innerHeight + options.viewport.pageYOffset ) {
						debug.case = 'bottom';
						var resultX = ( (containerHeight + containerTopLevel -
							options.viewport.pageYOffset - options.element.offsetHeight ) / 2 ) +
							(options.viewport.pageYOffset - containerTopLevel );
						x = (resultX > maxElementX) ? maxElementX : resultX;
						// Case: middle
					} else {
						debug.case = 'middle';
						x = ( options.viewport.innerHeight - containerTopLevel +
							options.viewport.pageYOffset + (options.viewport.pageYOffset -
							containerTopLevel) - options.element.offsetHeight) / 2;
					}
				}
			}

			options.element.style.top = x + 'px';

			if (options.debug) {
				console.log('Case', debug.case);
				console.log('Window', windowTopLevel, windowBottomLevel);
				console.log('Container', containerTopLevel, containerBottomLevel);
				console.log('Result', windowTopLevel <= containerTopLevel, windowBottomLevel >= containerBottomLevel );
			}
		}

		options.viewport.addEventListener('scroll', onScroll, false);
		options.viewport.addEventListener('resize', onResize, false);
		center();

		function onScroll() {
			center();
		}

		function onResize() {
			calcContainerHeight();
			center();
		}

		inst = {
			on: function() {
				options.viewport.addEventListener('scroll', onScroll, false);
				options.viewport.addEventListener('resize', onResize, false);
			},
			off: function() {
				options.viewport.removeEventListener('scroll', onScroll, false);
				options.viewport.removeEventListener('resize', onResize, false);
			}
		};

		return inst;
	};
});