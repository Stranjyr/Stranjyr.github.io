var states = ["wind-up", "thrown", "scored"]
var config = {
    type: Phaser.AUTO,
    width: 870,
    height: 595,
    backgroundColor: 0xffc836,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 1000}
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var launch_pos = {x: 50, y: 300};
var first_click = {x:0, y:0};
var balls = [];
var red_cells = [];
var walls = [];
var line = null;
var ball_group;
var wall_group;
var red_button;
var launch_spot;

var totalShots = 0;
var totalButtons = 0;

var scoreboard;

var state = "wind-up";

var ball_settings = {mass: 1};
var red_cell_settings = {mass: 1000};

var red_cells = [];

var fireing = false;

function preload ()
{
    this.load.image('ball', 'assets/ball.png');
    this.load.image('red_cell', 'assets/blackHole.png');
    this.load.image('trash', 'assets/trash.png');
    
    this.load.image('button', 'assets/red.png');
    this.load.image('background', 'assets/doofinc.jpg');
    this.load.spritesheet('explosion', 'assets/explosion.png', {frameWidth: 100, frameHeight: 100});
    ball_group = this.physics.add.group();
    wall_group = this.physics.add.staticGroup();
    this.physics.add.collider(ball_group, ball_group);
    this.physics.add.collider(ball_group, wall_group);
    
}

function create()
{   balls = [];
    red_cells = [];
    walls = [];
    line = null;
    red_button = null;
    this.add.image(0, 0, 'background').setOrigin(0, 0);
    scoreboard = this.add.text(25, 25, '', { font: '16px Courier', fill: '#00ff00' });
    scoreboard.setDataEnabled();
    scoreboard.data.set('balls', totalShots);
    scoreboard.data.set('buttons', totalButtons);

    scoreboard.setText(['Total Balls Thrown: ' + scoreboard.data.get('balls'), 'Total Inators Destroyed: '+ scoreboard.data.get('buttons')]);
    scoreboard.on('changedata-balls', function(){
        scoreboard.setText(['Total Balls Thrown: ' + scoreboard.data.get('balls'), 'Total Inators Destroyed: '+ scoreboard.data.get('buttons')]);
    })
    var scene = this;
    this.input.keyboard.on('keydown-R', function (event) {
        scene.registry.destroy(); 
        scene.events.off();
        scene.scene.restart();
    });
    load_room(this);
    
    // create_new_ball(this);
}
function create_new_ball(scene)
{
    var ball = scene.physics.add.image(launch_pos.x, launch_pos.y, 'ball');
    ball_group.add(ball);
    ball.body.x = launch_pos.x;
    ball.body.y = launch_pos.y;
    // ball.setOrigin(0, 0);
    ball.setScale(0.125);
    ball.body.drag.x = 0.1;
    ball.body.drag.y = 5;
    ball.setVelocity(0, 0);
    ball.body.setAllowGravity(false);
    ball.setBounce(0.9, 0.7);
    ball.setCollideWorldBounds(true);
    ball.fired = false;
    totalShots += 1;
    scoreboard.data.values.balls = totalShots;
    balls.unshift(ball);
    
}

function draw_line(scene)
{
    if(line === null)
    {
        line = scene.add.line(0, 0, 100, 100,  0, 0, 0xff0000);
        line.setOrigin(0, 0);
        line.setStrokeStyle(10, 0, 0);
    }
    line.setStrokeStyle(10, 0, 1);
    line.setTo(game.input.mousePointer.x, game.input.mousePointer.y, first_click.x, first_click.y);
}
function update ()
{
    red_cells.forEach(element => {
        balls.forEach(ball => {
            if(ball.fired){
                apply_force(ball, element);
            }
        })     
    });            
    if (game.input.mousePointer.isDown)
    {  
        if(fireing === false)
        {
            first_click.x = game.input.mousePointer.x;
            first_click.y = game.input.mousePointer.y;
        }
        draw_line(this);
        fireing = true;
    }
    if (!game.input.mousePointer.isDown && fireing === true)
    {
        create_new_ball(this);

        line.setStrokeStyle(10, 0, 0);
        fireing = false;
        var dist = Math.abs(Phaser.Math.Distance.BetweenPoints(first_click, game.input.mousePointer));
        var force = 3*dist;
        var angle = Phaser.Math.Angle.BetweenPoints(first_click, game.input.mousePointer);
        balls[0].body.velocity.x += force * Math.cos(angle);
        balls[0].body.velocity.y += force * Math.sin(angle);
        balls[0].body.setAllowGravity(true);
        
        balls[0].fired = true;
        
    }
}

function load_room(scene)
{

    scene.add.rectangle(launch_pos.x, launch_pos.y, 64, 64, 0xaaaaaa, 0.5);
    var num_red_cells = Math.floor(1 + Math.random() * 4);
    red_cells = [];
    for(var i = 0; i < num_red_cells; i++)
    {
        var x_pos = Math.floor(150 + Math.random()*650);
        var y_pos = Math.floor(150 + Math.random()*450);
        var cell = scene.physics.add.image(x_pos, y_pos, 'red_cell');
        cell.setScale(0.25);
        cell.body.setAllowGravity(false);
        red_cells.push(cell);
    }

    var num_walls = Math.floor(2 + Math.random()*8);
    for(var i = 0; i < num_walls; i++)
    {
        var x_pos = Math.floor(300 + Math.random()*(870-300));
        var y_pos = Math.floor(Math.random()*500);
        let wall = scene.add.rectangle(x_pos, y_pos, 20, 100, 0xff0000);
        wall_group.add(wall);
    }

    let button_height = Math.floor(150 + Math.random()*250);
    red_button = scene.physics.add.image(870 - 20, button_height, 'button');
    red_button.setScale(0.25);
    red_button.setRotation(-1.59);
    red_button.body.setAllowGravity(false);
    scene.physics.add.collider(ball_group, red_button, function() {explode_and_reset(scene)});
}

function explode_and_reset(scene)
{
    let pop = scene.add.sprite(435, 250);
    pop.setScale(10, 10);
    scene.anims.create({
        key: 'bomb',
        frames: scene.anims.generateFrameNumbers('explosion'),
        frameRate: 60,
        repeat: 0
    });
    pop.play('bomb');
    pop.on("animationcomplete", () => { totalButtons+=1;
                                        scene.registry.destroy(); 
                                        scene.events.off();
                                        scene.scene.restart();})
}

function apply_force(object, source)
{
    var dist = 0.075 * Math.abs(Phaser.Math.Distance.BetweenPoints(object, source));
    if(dist < 10) dist = 10;
    var force = 5*ball_settings.mass*red_cell_settings.mass/(dist*dist);
    var angle = Phaser.Math.Angle.BetweenPoints(object, source);
    object.body.velocity.x += force * Math.cos(angle);
    object.body.velocity.y += force * Math.sin(angle);
}