// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies;

var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// create an engine
var engine = Engine.create({
	render: {
		element: document.body,
		canvas: canvas,
		options:{
			width: canvas.width,
			height: canvas.height
		}
	}
});


// create two boxes and a ground
var boxA = Bodies.rectangle(400, 200, 80, 80);
var boxB = Bodies.rectangle(450, 50, 80, 80);
var ground = Bodies.rectangle(canvas.width/2, canvas.height, canvas.width, 60, { isStatic: true });
var ceiling = Bodies.rectangle(canvas.width/2, 0, canvas.width, 60, { isStatic: true });
var leftWall = Bodies.rectangle(0, canvas.height/2, 60, canvas.height, {isStatic: true});
var rightWall = Bodies.rectangle(canvas.width, canvas.height/2, 60, canvas.height, {isStatic: true});

// add all of the bodies to the world
World.add(engine.world, [boxA, boxB, ground, ceiling, leftWall, rightWall]);

// run the engine
Engine.run(engine);