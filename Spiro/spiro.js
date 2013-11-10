	
var spiro = (function(window, document, $, undefined) {
    // shim layer with setTimeout fallback
    var requestAnimationFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();
	
	var config = {
		maxRadius : 100,
		maxArmSpeed: 20,
		minArmSpeed: -20,
		
		apparatus : {
			visible : true
		},
		
		pen : {
			color : "#FF0000",
			rotationSpeed : 5
		},
		
		arm1 : {
			color : "#87CEEB",
			initialRadius: 20,
			initialSpeed: 1
		},
		
		arm2 : {
			color : "#eeceeb",
			initialRadius: 20,
			initialSpeed: 1
		},
	};
	
	var apparatusVisible;	
    var apparatusCanvas;
    var apparatusCtx;
	var spiroCanvas;
    var spiroCtx;
	var $spiro
    
	var tempCanvas = document.createElement("canvas");
	var tempCtx = tempCanvas.getContext("2d");
	
	var isRunning = false;	
	
	var canvasMargin = 10;
	var armWidth = 5;
	
	var pageCenter = {x:0, y:0};
	var pageCenterMarkerSize = 10;
	var iterationCount = 0;
	
	var pen = {};
	
    var arm1 = {}
    
    var arm2 = { }    
    
    $(document).ready(function() {
        apparatusCanvas = document.getElementById("apparatusCanvas");
        apparatusCtx = apparatusCanvas.getContext("2d");
		spiroCanvas = document.getElementById("spiroCanvas");
        spiroCtx = spiroCanvas.getContext("2d");
		tempCanvas.width = spiroCanvas.width;
		tempCanvas.height = spiroCanvas.height;
		apparatusVisible = config.apparatus.visible
		$spiro = $("#spiro")

		init();
        drawApparatus();
		
		// Setup the controls
		configureControlPanel();

		// Setup the event handlers
		$("#apparatusCanvas").on("mousedown", canvasStartDrag).on("mousemove", canvasDrag).on("mouseup", canvasEndDrag);
		//$("#apparatusCanvas").on("click", clickTest);
    });

	function configureControlPanel() {
		$("#controlPanel")
			.find("#start").on("click", startSpiro).end()
			.find("#stop").on("click", stopSpiro).end()
			.find("#clear").on("click", clearSpiro).end()
			.find("#reset").on("click", resetSpiro).end()
			.find("#save").on("click", saveSpiro).end()
			.find("#penColor")
				.val(config.pen.color)
				.on("change", function() {
					if (isRunning) {
						spiroCtx.closePath();
						spiroCtx.beginPath();
						spiroCtx.moveTo(pen.contactPoint.x, pen.contactPoint.y);
					}
					
					pen.color = $(this).val();
					drawApparatus();
				})
				.end()
			.find("#displayApparatus")
				.prop("checked", config.apparatus.visible)
				.on("click", function() {
					if ($(this).is(":checked")) {
						apparatusVisible = true;
						$("#apparatusCanvas").show();
					} else {
						apparatusVisible = false;
						$("#apparatusCanvas").hide();
					}
				});
			
		$("#pen .speed")
			.val(config.pen.rotationSpeed)
			.knob({
				fgColor : '#000',
				width : 100,
				min : 1,
				max : 10,
				displayInput : true,
				change : function(v) {
						pen.rotation = v;
					}
				})
			.end();
			
		$("#arm1 .radius")
			.val(config.arm1.initialRadius)
			.knob({
				fgColor : config.arm1.color,
				width : 100,
				min : 0,
				max : config.maxRadius,
				displayInput : true,
				change : function(v) {
						arm1.radius = v;
						update();
						drawApparatus();
					}
				})
			.end();
				
		$("#arm1 .speed")
			.val(config.arm1.initialSpeed)
			.knob({
				fgColor : config.arm1.color,
				width : 100,
				min : config.minArmSpeed,
				max : config.maxArmSpeed,
				displayInput : true,
				change : function(v) {
						arm1.direction = v;
						update();
						drawApparatus();
					}
				})
			.end();
				
		$("#arm2 .radius")
			.val(config.arm2.initialRadius)
			.knob({
				fgColor : config.arm2.color,
				width : 100,
				min : 0,
				max : config.maxRadius,
				displayInput : true,
				change : function(v) {
						arm2.radius = v;
						update();
						drawApparatus();
					}
				})
			.end();
				
		$("#arm2 .speed")
			.val(config.arm2.initialSpeed)
			.knob({
				fgColor : config.arm2.color,
				width : 100,
				min : config.minArmSpeed,
				max : config.maxArmSpeed,
				displayInput : true,
				change : function(v) {
						arm2.direction = v;
						update();
						drawApparatus();
					}
				})
			.end();
		
	}
	
	function startSpiro() {
		if (isRunning) {
			return;
		}
		
		$("#spiroImg").hide();
		spiroCtx.moveTo(pen.contactPoint.x, pen.contactPoint.y);
		spiroCtx.beginPath();
		
		isRunning = true;
		requestAnimationFrame(loop);
	}
	
	var frameCount = 0;
	var intervalStart = null;
	
	function loop() {
		if (!isRunning) {
			return;
		}

		var now = new Date().getTime();
		if (intervalStart == null) {
			intervalStart = now;
		} else if (now - intervalStart > 2000) {
			console.log((frameCount/(now - intervalStart))*1000)
			intervalStart = now;
			frameCount = 0;
		}
		
		++frameCount;
		
		arm1.phase = arm1.phase + (arm1.direction * (Math.PI/180));
		arm2.phase = arm2.phase + (arm2.direction * (Math.PI/180));
		update();
		drawApparatus();
		drawSpiro();
		//++iterationCount;
		iterationCount += pen.rotation;
		
		requestAnimationFrame(loop);
		
	}
	
	function stopSpiro() {
		if (isRunning) {
			spiroCtx.closePath();
		}
		
		isRunning = false;
	}
		
	function resetSpiro() {
		iterationCount = 0;
		init();
		$("input").change();
		clearSpiro();
		drawApparatus();
		$("#spiroImg").hide();
	}
	
	function saveSpiro() {
		stopSpiro();
		var dataURL = spiroCanvas.toDataURL();
		var img = document.getElementById("spiroImg");
		img.src = dataURL;
		$(img).show();
	}
	
	function init() {
		iterationCount = 0;
		pageCenter = {x: apparatusCanvas.width/2, y:apparatusCanvas.height/2}
		
		pen = {
			color: config.pen.color,
			contactPoint : {x:0, y:0},
			rotation : config.pen.rotationSpeed
		};
		
		arm1 = {
			phase:    0,
			radius:  config.arm1.initialRadius,
			length:  390,
			
			direction: config.arm1.initialSpeed,
			
			// Move the disc
			center : {
				x : apparatusCanvas.width/2,
				y : apparatusCanvas.height - (config.arm1.initialRadius + canvasMargin)
			}
		}
		
		var a2r = 10;
		arm2 = {
			phase:    0,
			radius:  config.arm2.initialRadius,
			length:  390,
			
			direction: 	config.arm1.initialSpeed,
			
			// Move the disc
			center : {
				x : config.arm2.initialRadius + canvasMargin,
				y : apparatusCanvas.height/2
			}
		}    
		
		$("#penColor").val(config.pen.color);
		$("#arm1 .radius").val(config.arm1.initialRadius);
		$("#arm1 .speed").val(config.arm1.initialSpeed);
		$("#arm2 .radius").val(config.arm2.initialRadius);
		$("#arm2 .speed").val(config.arm2.initialSpeed);
			
		update();
	}

	
    function drawApparatus() {
		if (!apparatusVisible) {
			return;
		}
        clearApparatus();
        
        // Arm1 
        drawCircle(apparatusCtx, arm1.disc, arm1.radius, false, config.arm1.color);
		drawLine(apparatusCtx, arm1.peg, pen.contactPoint, armWidth, config.arm1.color);
		drawCircle(apparatusCtx, arm1.peg, armWidth, false, '#000');
		
		
		// Arm2
		drawCircle(apparatusCtx, arm2.disc, arm2.radius, false, config.arm2.color);
		drawLine(apparatusCtx, arm2.peg, pen.contactPoint, armWidth, config.arm2.color);
		drawCircle(apparatusCtx, arm2.peg, armWidth, false, '#000');

		// Draw Contact
		drawCircle(apparatusCtx, pen.contactPoint, armWidth, true, pen.color);
		
		// Draw Page Center
		drawCircle(apparatusCtx, pageCenter, pageCenterMarkerSize, true, '#ff0');
    }
    
	
	function update() {
		arm1.disc = {x:arm1.center.x, y:arm1.center.y };
		arm1.peg = {
			x : arm1.disc.x + arm1.radius * Math.sin(arm1.phase),
			y : arm1.disc.y + arm1.radius * Math.cos(arm1.phase)
		};
		
		arm2.disc = {x:arm2.center.x, y:arm2.center.y };
		arm2.peg = {
			x : arm2.disc.x + arm2.radius * Math.sin(arm2.phase),
			y : arm2.disc.y + arm2.radius * Math.cos(arm2.phase)
		};
		
		// Apply roation
		var origin = {x: spiroCanvas.width/2, y: spiroCanvas.height/2};	
		var angle = iterationCount*Math.PI/180;
		var xTranslation = (pageCenter.x-origin.x);
		var yTranslation = (pageCenter.y-origin.y);
		
		// Rotate page - rotating canvas is not an option due to anti-aliasing
		origin = rotateAroundOrigin({x:origin.x + xTranslation, y:origin.y + yTranslation}, origin, angle);

		$spiro.css("-webkit-transform", "rotate(" + (-1*angle) + "rad)");
		$spiro.css("-webkit-transform-origin", origin.x + "px " + origin.y + "px" );

		// Arm1 disc rotate
		arm1.disc = rotateAroundOrigin(arm1.disc, origin, angle);
		
		// Arm1 peg rotate
		arm1.peg = rotateAroundOrigin(arm1.peg, origin, angle);
		
		// Arm2 disc rotate
		arm2.disc = rotateAroundOrigin(arm2.disc, origin, angle);
		
		// Arm2 peg rotate
		arm2.peg = rotateAroundOrigin(arm2.peg, origin, angle);
		
		updateContact();
	}
	
	function updateContact() {
		// Ref: http://paulbourke.net/geometry/2circle/	
		// Distance between points
		var d = pointDistance(arm1.peg, arm2.peg);
		
		var a = ((arm1.length*arm1.length) - (arm2.length*arm2.length) + (d*d) ) / (2*d);
			
		//h^2 = r0^2 - a^2
		var h = Math.sqrt((arm1.length*arm1.length) - (a*a));
		
		// P2 = P0 + a ( P1 - P0 ) / d
		var p2x = arm1.peg.x + (a * (arm2.peg.x - arm1.peg.x) /d);
		var p2y = arm1.peg.y + (a * (arm2.peg.y - arm1.peg.y) /d);
		
		// x3 = x2 +- h ( y1 - y0 ) / d
		// y3 = y2 -+ h ( x1 - x0 ) / d
		
		pen.contactPoint.x = p2x - (h* (arm2.peg.y - arm1.peg.y) /d);
		pen.contactPoint.y = p2y + (h* (arm2.peg.x - arm1.peg.x) /d);
	}
	
	function rotateAroundOrigin(point, origin, angle) {
	    return {x: Math.cos(angle) * (point.x-origin.x) - Math.sin(angle) * (point.y-origin.y) + origin.x,
				y: Math.sin(angle) * (point.x-origin.x) + Math.cos(angle) * (point.y-origin.y) + origin.y};
	}
	
	function pointDistance(point1, point2) {
	    return Math.sqrt(
			((point1.x - point2.x) *(point1.x - point2.x)) + 
			((point1.y - point2.y) *(point1.y - point2.y)));
	}
	
	function circleContains(center, radius, point) {
	    return pointDistance(center, point) <= radius;
	}
	
	function drawSpiro() {
		// Draw
		spiroCtx.lineTo(pen.contactPoint.x,pen.contactPoint.y);
		spiroCtx.lineWidth = 2;
		spiroCtx.strokeStyle = pen.color;
		spiroCtx.stroke();
	}
	
	
    function drawCircle(ctx, center, r, fill, color) {
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI*2, true); 
        ctx.closePath();
		
		ctx.strokeStyle = (color || "#ccc")
		ctx.fillStyle = (color || "#ccc")
        fill ? ctx.fill() : ctx.stroke();
    }

	function drawLine(ctx, from, to, width, color) {
		ctx.moveTo(from.x, from.y);
		ctx.lineTo(to.x, to.y);
		ctx.lineWidth = width;
		ctx.strokeStyle = color;
		ctx.stroke();
	}
	
	function clearApparatus() {
		clear(apparatusCanvas, apparatusCtx);
	}
	
	function clearSpiro() {
		clear(spiroCanvas, spiroCtx);
	}
	
	function clear(canvas, ctx) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		var w = canvas.width;
		canvas.width = 1;
		canvas.width = w;
	}
			

	// 
	// Methods for moving things around
	//
	var dragging = false;
	var dragUpdateFunc;
	
	function getMouseOffset(e) {
		var $canvas = $(e.target);
		var canvasOffset = $canvas.offset();
		return {x: e.pageX-canvasOffset.left, y: e.pageY-canvasOffset.top};
	}
	
	function clickTest(e) {
		var point = getMouseOffset(e);
		
		var deltaX = arm1.peg.x - arm1.center.x;
		var deltaY = arm1.peg.y - arm1.center.y;
		
		var pointDeltaX  = point.x - arm1.center.x;
		var pointDeltaY  = point.y - arm1.center.y;
		console.log(-1* (-90 + Math.atan2(deltaY, deltaX) * 180 / Math.PI));
		console.log(-1* (-90 + Math.atan2(pointDeltaY, pointDeltaX) * 180 / Math.PI));
	}
	
	
	function canvasStartDrag(e) {
		var clickPoint = getMouseOffset(e);
		
		if (isOverPageRotation(clickPoint)) {
			dragging = true;
			dragUpdateFunc = function(point) {
				pageCenter.x = point.x;
				pageCenter.y = point.y;
			}
			
		} else if (isOverContact(clickPoint)) {
			dragging = true;
			dragUpdateFunc = function(point) {
				pen.contactPoint.x = point.x;
				pen.contactPoint.y = point.y;
				
				// Stretch the arms
				arm1.length = pointDistance(point, arm1.peg);
				arm2.length = pointDistance(point, arm2.peg);
			}

		} else if (isOverArm1Peg(clickPoint)) {
			dragging = true;
			dragUpdateFunc = function(point) {
				var pointDeltaX  = point.x - arm1.center.x;
				var pointDeltaY  = point.y - arm1.center.y;
				var pointAngle = -1* (-(0.5*Math.PI) + Math.atan2(pointDeltaY, pointDeltaX));
				arm1.phase =  pointAngle;
				update();
			}

		} else if (isOverArm2Peg(clickPoint)) {
			dragging = true;
			dragUpdateFunc = function(point) {
				var pointDeltaX  = point.x - arm2.center.x;
				var pointDeltaY  = point.y - arm2.center.y;
				var pointAngle = -1* (-(0.5*Math.PI) + Math.atan2(pointDeltaY, pointDeltaX));
				arm2.phase =  pointAngle;
				update();
			}

		} else if (isOverArm1Disc(clickPoint)) {
			dragging = true;
			dragUpdateFunc = function(point) {
				arm1.center = point;
				// Stretch the arms
				update();
			}
			
		} else if (isOverArm2Disc(clickPoint)) {
			dragging = true;
			dragUpdateFunc = function(point) {
				arm2.center = point;
				update();
			}
		}
	}
	
	function canvasDrag(e) {
		if (!dragging) {
			return;
		}
		
		var dragPoint = getMouseOffset(e);
		dragUpdateFunc(dragPoint);
		drawApparatus();
	}
	
	function canvasEndDrag(e) {
		dragging = false;
		dragUpdateFunc = null;
	}
	
	function isOverPageRotation(point) {
		return circleContains(pageCenter, pageCenterMarkerSize, point);
	}
	
	function isOverContact(point) {
		return circleContains(pen.contactPoint, armWidth, point);
	}
	
	function isOverArm1Disc(point) {
		return circleContains(arm1.disc, arm1.radius, point);
	}
	
	function isOverArm2Disc(point) {
		return circleContains(arm2.disc, arm2.radius, point);
	}
	
	function isOverArm1Peg(point) {
		return circleContains(arm1.peg, armWidth, point);
	}
	
	function isOverArm2Peg(point) {
		return circleContains(arm2.peg, armWidth, point);
	}
	
    return {
    }
})(window, document, jQuery);