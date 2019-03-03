EnemyTank = function (index, game, player, bullets)
{
    var x = 3000; //game.world.randomX;
    var y = 3000; //game.world.randomY;

    this.game = game;
    this.health = 2;
    this.player = player;
    this.bullets = bullets;
    this.fireRate = 700;
    this.nextFire = 0;
    this.alive = true;

    this.tank = game.add.sprite(x, y, 'enemy', 'guy.png');

    this.tank.anchor.set(0.5);

    this.tank.name = index.toString();
    game.physics.enable(this.tank, Phaser.Physics.ARCADE);
    this.tank.body.immovable = false;
    this.tank.body.collideWorldBounds = true;
    this.tank.body.bounce.setTo(1, 1);

    this.tank.angle = game.rnd.angle();

    game.physics.arcade.velocityFromRotation(this.tank.rotation, 100, this.tank.body.velocity);
};

EnemyTank.prototype.damage = function()
{
    this.health -= 1;
    if (this.health <= 0)
    {
        this.alive = false;
        this.tank.kill();
        return true;
    }
    return false;
};

EnemyTank.prototype.update = function()
{
    if (this.game.physics.arcade.distanceBetween(this.tank, this.player) < 300)
    {
        if (this.game.time.now > this.nextFire && this.bullets.countDead() > 0)
        {
            this.nextFire = this.game.time.now + this.fireRate;
            var bullet = this.bullets.getFirstDead();
            bullet.rotation = this.game.physics.arcade.moveToObject(bullet, this.player, 500);
        }
    }
};

var game = new Phaser.Game(1280, 720, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.image('background','map.png');
    game.load.image('bullet', 'fireball.png');
    game.load.spritesheet('player', 'move.png', 72, 62, 4); //size 72, 62, 4 fps
    game.load.spritesheet('enemy', 'guy.png');
}

var facing = 'up'; //Its a string - left right up down
var player;
var cursors;

var tank;

var enemies;
var enemyBullets;
var enemiesTotal = 0;
var enemiesAlive = 0;

var bullets;
var fireRate = 300;
var nextFire = 0;

var playerID;
var playerHP;
var isAlive;
var playerX;
var playerY;

var wKey;

//create instances and variables that are necessary for the game
function create()
{
    tank = game.add.sprite(0, 0, 'enemy');

    game.add.tileSprite(0, 0, 1280, 720, 'background');//; 5000, 5000, 'background');
    game.world.setBounds(0, 0, 1280, 720); //5000, 5000);
    //  This will force it to decelerate and limit its speed
    game.physics.enable(tank, Phaser.Physics.ARCADE);
    tank.body.collideWorldBounds = true;

    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(10, 'bullet');
    bullets.setAll('checkWorldBounds', true);
    bullets.setAll('outOfBoundsKill', true);

    //  The enemies bullet group
    enemyBullets = game.add.group();
    enemyBullets.enableBody = true;
    enemyBullets.physicsBodyType = Phaser.Physics.ARCADE;
    enemyBullets.createMultiple(100, 'bullet');
    enemyBullets.setAll('anchor.x', 0.5);
    enemyBullets.setAll('anchor.y', 0.5);
    enemyBullets.setAll('outOfBoundsKill', true);
    enemyBullets.setAll('checkWorldBounds', true);

    //  Create some baddies to waste :)
    enemies = [];
    enemiesTotal = 5;
    enemiesAlive = 5;
    for (var i = 0; i < enemiesTotal; i++) {
        enemies.push(new EnemyTank(i, game, tank, enemyBullets));
    }

    player = this.add.sprite(spawnPlayer()[0], spawnPlayer()[1], 'player'); //game.world.centerX, game.world.centerY, 'player');
    player.anchor.set(0.5);
    game.physics.arcade.enable(player); //use arcade physics package
    player.body.collideWorldBounds = true;
    playerHP = 2;
    isAlive = player.alive;

    var walk = player.animations.add('walk', [0,1], 10, true);
    game.camera.follow(player); //camera will follow the player

    cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
    // this.w = game.input.keyboard.addKey(Phaser.Keyboard.W);
    // this.s = game.input.keyboard.addKey(Phaser.Keyboard.S);
    // this.a = game.input.keyboard.addKey(Phaser.Keyboard.A);
    // this.d = game.input.keyboard.addKey(Phaser.Keyboard.A);


    text = game.add.text(game.world.centerX, game.world.centerY, "Current_loc: \n", {
        font: "25px Arial",
        fill: "#ff0044",
        align: "center"
    });
    text.anchor.setTo(0.5, 0.5);
}

//all the key listeners
function update()
{
    game.physics.arcade.overlap(enemyBullets, tank, bulletHitPlayer, null, this);
    enemiesAlive = 0;
    for (var i = 0; i < enemies.length; i++)
    {
        if (enemies[i].alive)
        {
            enemiesAlive++;
            game.physics.arcade.collide(tank, enemies[i].tank);
            game.physics.arcade.overlap(bullets, enemies[i].tank, bulletHitEnemy, null, this);
            enemies[i].update();
        }
    }
    if(wKey.isDown){
        text.setText("fuck yeh");
    }
    if(cursors.up.isDown){
        showText();
        facing = 'up';
        player.y -= 5;
        player.play('walk');
        playerX = player.x;
        playerY = player.y;
    }
    if(cursors.down.isDown){
        showText();
        facing = 'down';
        player.y += 5;
        player.play('walk');
    }
    if(cursors.left.isDown){
        showText();
        facing = 'left';
        player.x -= 5;
        player.play('walk');
    }
    if(cursors.right.isDown){
        showText();
        facing = 'right';
        player.x += 5;
        player.play('walk');
    }
    if (game.input.activePointer.isDown) {
        showText();
        player.tint = 0xff0000;
        fire();
    }
    else if (game.input.activePointer.isUp) {
        showText();
        player.tint = 0xffffff;
    }
}

function showText() {
    text.setText("Current_loc: \n" + player.x + ", " + player.y + "\n" +
        "playerHp is: " + playerHP + ", " + isAlive + "\n" +
        "enermies[0] HP is: " + enemies[0].health + ", " + enemies[0].alive);
}

//spawn player. Location will be random.
function spawnPlayer(){
    var x = Math.floor(Math.random()*1280); //5000);
    var y = Math.floor(Math.random()*720); //5000);
    return [x, y];
}

function fire()
{
    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;
        var bullet = bullets.getFirstDead();
        bullet.reset(player.x - 8, player.y - 8);
        game.physics.arcade.moveToPointer(bullet, 800);
    }
}

function bulletHitEnemy (tank, bullet)
{
    tank.tint = 0xff0000;
    bullet.kill();
    enemies[tank.name].damage();
    // var destroyed = enemies[tank.name].damage();
    // if (destroyed) {
    //     var explosionAnimation = explosions.getFirstExists(false);
    //     explosionAnimation.reset(tank.x, tank.y);
    //     explosionAnimation.play('kaboom', 30, false, true);
    // }
}
function bulletHitPlayer (tank, bullet) {
    playerHP--;
    if(playerHP <= 0) {
        bullet.kill();
    }
    // bullet.kill();
}

//convert player data to json and send
function toJson(player)
{
    var returnDict = {
        "PlayerID": playerID,
        "playerHP": playerHP,
        "currentLoc": [player.x, player.y], //[3000, 3000],
        "type": "human",
        "isAlive": player.alive
    }
}
function getData(){
    var xhr = new XMLHttpRequest();
    var url = "url";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            console.log(json.email + ", " + json.password);
        }
    };
    var data = JSON.stringify({"playerID": playerID, "playerHP": playerHP, "score": score});
    xhr.send(data);
}

//debug info
function render() {
    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(player, 32, 600);
    game.debug.text(facing, 600, 32);
    game.debug.text('Active Bullets: ' + bullets.countLiving() + ' / ' + bullets.total, 900, 60);
    game.debug.spriteInfo(player, 32, 350);
    game.debug.text('Enemies: ' + enemiesAlive + ' / ' + enemiesTotal, 900, 32);
}