
var spiro = (function(window, document, $, undefined) {
    var apparatusCanvas;
    var apparatusCtx;
	var spiroCanvas;
    var spiroCtx;
    
	var tempCanvas = document.createElement("canvas");
	var tempCtx = tempCanvas.getContext("2d");
		
	var canvasMargin = 10;
	var armWidth = 5;
	
	var previousContactPoint = {x:0, y:0};
	var contactPoint = {x:0, y:0};
	
    var arm1 = {
        phase:   135,
        radius:  100,
        length:  350,
		
		direction: 1,
		
		// Move the disc
		xCenterAdj : 0,
		yCenterAdj : 0
    }
    
    var arm2 = {
        phase:    0,
        radius:  60,
        length:  300,
		
		direction: -1,
		
		// Move the disc
		xCenterAdj : 0,
		yCenterAdj : 0
    }    
    
    $(document).ready(function() {
        apparatusCanvas = document.getElementById("aparatusCanvas");
        apparatusCtx = apparatusCanvas.getContext("2d");
		spiroCanvas = document.getElementById("spiroCanvas");
        spiroCtx = spiroCanvas.getContext("2d");
		tempCanvas.width = spiroCanvas.width;
		tempCanvas.height = spiroCanvas.height;
		
		update();
		
		spiroCtx.moveTo(contactPoint.x, contactPoint.y);
		
        drawApparatus();
		
		setInterval(function() {
			arm1.phase = arm1.phase + arm1.direction * (Math.PI/12);
			arm2.phase = arm2.phase + arm2.direction * (Math.PI/18);
			update();
			drawApparatus();
			drawSpiro();
		}, 20);
    });

	function update() {
		arm1.discX = apparatusCanvas.width/2 + arm1.xCenterAdj;
		arm1.discY = apparatusCanvas.height - (arm1.radius + canvasMargin) + arm1.yCenterAdj;
		arm1.pegX = arm1.discX + arm1.radius * Math.sin(arm1.phase);
		arm1.pegY = arm1.discY + arm1.radius * Math.cos(arm1.phase);
		
		arm2.discX = arm2.radius + canvasMargin + arm1.xCenterAdj;
		arm2.discY = apparatusCanvas.height/2 + arm2.yCenterAdj;
		arm2.pegX = arm2.discX + arm2.radius * Math.sin(arm2.phase);
		arm2.pegY = arm2.discY + arm2.radius * Math.cos(arm2.phase);
		
		updateContact();
		
	}
	
	function updateContact() {
		previousContactPoint = {
			x: contactPoint.x,
			y: contactPoint.y };
			
		// Ref: http://paulbourke.net/geometry/2circle/	
		// Distance between points
		var d = Math.sqrt( 
			((arm1.pegX - arm2.pegX) * (arm1.pegX - arm2.pegX)) +
			((arm1.pegY - arm2.pegY) * (arm1.pegY - arm2.pegY)));

		var a = ((arm1.length*arm1.length) - (arm2.length*arm2.length) + (d*d) ) / (2*d);
			
		//h^2 = r0^2 - a^2
		var h = Math.sqrt((arm1.length*arm1.length) - (a*a));
		
		// P2 = P0 + a ( P1 - P0 ) / d
		var p2x = arm1.pegX + (a * (arm2.pegX - arm1.pegX) /d);
		var p2y = arm1.pegY + (a * (arm2.pegY - arm1.pegY) /d);
		
		// x3 = x2 +- h ( y1 - y0 ) / d
		// y3 = y2 -+ h ( x1 - x0 ) / d
		
		contactPoint.x = p2x - (h* (arm2.pegY - arm1.pegY) /d);
		contactPoint.y = p2y + (h* (arm2.pegX - arm1.pegX) /d);
	}
	
    function drawApparatus() {
        clearApparatus();
        
        // Arm1 
        drawCircle(apparatusCtx, arm1.discX, arm1.discY, arm1.radius, true, '#ccc');
		drawCircle(apparatusCtx, arm1.pegX, arm1.pegY, armWidth, true, '#000');
		//drawCircle(apparatusCtx, arm1.pegX, arm1.pegY, arm1.length, false, '#ccc');   // TODO: REMOVE
		drawArm({x:arm1.pegX, y:arm1.pegY}, {x:contactPoint.x, y:contactPoint.y});
		
		// Arm2
		drawCircle(apparatusCtx, arm2.discX, arm2.discY, arm2.radius, true, '#ccc');
		drawCircle(apparatusCtx, arm2.pegX, arm2.pegY, armWidth, true, '#000');
		//drawCircle(apparatusCtx, arm2.pegX, arm2.pegY, arm2.length, false, '#ccc');  // TODO: REMOVE
		drawArm({x:arm2.pegX, y:arm2.pegY}, {x:contactPoint.x, y:contactPoint.y});
		
		// Draw Contact
		drawCircle(apparatusCtx, contactPoint.x, contactPoint.y, armWidth, true, '#f00');
    }
    
	function drawSpiro() {
		// Rotate Page
		spiroCtx.beginPath();
		rotateSpiro();
		
		// Draw 
		spiroCtx.lineTo(contactPoint.x,contactPoint.y);
		spiroCtx.closePath();
		spiroCtx.lineWidth = 1;
		spiroCtx.strokeStyle = "#ff0000";
		spiroCtx.stroke();
	}
	
	function rotateSpiro() {
		// Create a temp canvas to store our data (because we need to clear the other box after rotation.
		tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
		tempCtx.drawImage(spiroCanvas, 0,0,spiroCanvas.width,spiroCanvas.height);
		
		// Now clear the portion to rotate.
		spiroCtx.clearRect(0, 0, spiroCanvas.width, spiroCanvas.height);
		var angle = Math.PI / 180;
		
		spiroCtx.save();
		spiroCtx.translate(spiroCanvas.width/2, spiroCanvas.height/2);
		spiroCtx.rotate(angle);
		spiroCtx.translate(-spiroCanvas.width/2, -spiroCanvas.height/2);
		spiroCtx.drawImage(tempCanvas, 0, 0,spiroCanvas.width,spiroCanvas.height);
		spiroCtx.restore();
		
		// Translate the current location also - as it's not correct after the restore.
		var cx = spiroCanvas.width/2;
		var cy = spiroCanvas.height/2;
		var x1 = previousContactPoint.x;
		var y1 = previousContactPoint.y;
		
		spiroCtx.moveTo(
			Math.cos(angle) * (x1-cx) - Math.sin(angle) * (y1-cy) + cx,
				Math.sin(angle) * (x1-cx) + Math.cos(angle) * (y1-cy) + cy);

	}
	
    function drawCircle(ctx, x, y, r, fill, color) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI*2, true); 
        ctx.closePath();
		
		ctx.strokeStyle = (color || "#ccc")
		ctx.fillStyle = (color || "#ccc")
        fill ? ctx.fill() : ctx.stroke();
    }

	function drawArm(from, to) {
		apparatusCtx.moveTo(from.x, from.y);
		apparatusCtx.lineTo(to.x, to.y);
		apparatusCtx.lineWidth = armWidth;
		apparatusCtx.strokeStyle = "#000";
		apparatusCtx.stroke();
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
				
    return {
    }
})(window, document, jQuery);