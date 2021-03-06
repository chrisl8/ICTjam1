'use strict';

var game = require('../game'),
    Phaser = require('phaser').Phaser;

var sprite;//our hero, Chuck
var iAmHovering = false;
var pukeAbilitySprite, pukeAbilitySprite2, pukeAbilitySprite3;
var hoverAbilitySprite, hoverAbilitySprite2, hoverAbilitySprite3;
var controls = {};
var testMap;
var jumper = 0;
var layer;
var grassyLayer;
var ability = 0;//0 = vomit, 1 = hover. THis is checked in puke() which is general perpose
var emitter;
var emitting = false;
var emitterXvelocity;
var bgParallax;
var bgParallax2;
var baddies = [];
var charge = 20; //this keeps track of how close we are to triggering an ability.
var counter;
var counterBackground;
var gameOverActivated, gameWinActivated;
var sfx;
var music;
var mutePushed;
var musicMute = false;
var healthApple;
var tookDamage;
var spikeWall;
var hasSpike = false;

function createGameState() {
ability = 0;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = '#999999';

    var bg = game.add.sprite(0, -300, 'bg');
    bg.fixedToCamera = true;
    var sun = game.add.sprite(200, 280, 'sun');
    sun.anchor.setTo(0.5, 0.5);
    sun.fixedToCamera = true;
    sun.scale.setTo(0.1, 0.1);
    bgParallax = game.add.sprite(0, 0, 'bgParallax');
    bgParallax.fixedToCamera = true;
    bgParallax2 = game.add.sprite(1000, 0, 'bgParallax');
    bgParallax2.fixedToCamera = true;

    gameOverActivated = false;
    gameWinActivated = false;

    sfx = {};
    sfx.b1 = game.add.audio('bump1');
    sfx.b2 = game.add.audio('bump2');
    sfx.wobble = game.add.audio('wobble');
    sfx.endSound = game.add.audio('endSound');

    music = game.add.sound('bgMusic');
    music.play('', 0, musicMute ? 0 : 0.8, true);
    mutePushed = false;

    testMap = game.add.tilemap('testMap');
    testMap.addTilesetImage('all_small', 'all_small');
    layer = testMap.createLayer('Tile Layer 1');
    grassyLayer = testMap.createLayer('Grass On Top');

    emitter = game.add.emitter(0, 0, 1);
    // TODO: Set start back to normal for production
    sprite = game.add.sprite(200, 200, 'player');
    //sprite = game.add.sprite(14000, 200, 'player');
    sprite.anchor.setTo(0.65, 0.5);
    sprite.facing = 1;

    counterBackground = game.add.sprite(3, 3, 'abilityBarBackground');
    counter = game.add.sprite(5, 5, 'abilityBar');

counter.fixedToCamera = true;
counterBackground.fixedToCamera = true;
counter.scale.x = 2;
counterBackground.scale.y = 0.5;

    sprite.animations.add('walk', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]);
    sprite.animations.add('stand', [6]);
    sprite.animations.add('float', [39]);

    sprite.animations.play('walk', 60, true);


    game.physics.arcade.enable(sprite);
    sprite.body.setSize(40, 144, 6, 14);
    game.physics.arcade.gravity.y = 300;

    game.physics.arcade.collide(sprite, layer);
    testMap.setCollisionBetween(8, 11, true, layer);
    testMap.setCollisionBetween(13, 17, true, layer);
    testMap.setCollisionBetween(19, 30, true, layer);

    sprite.body.maxVelocity.x = 400;
    sprite.body.drag.x = 370;
    sprite.body.drag.y = 370;
    sprite.running = false;
    game.physics.enable(sprite, Phaser.Physics.ARCADE);
    sprite.body.gravity.y = 2000;

    layer.resizeWorld();


    emitter.makeParticles('vomit', [0,1,2,3], 200, true, true);
    emitter.maxParticleScale = 1.8;
    emitter.minParticleScale = .2;

    // Attach the emitter to the sprite
    //sprite.addChild(emitter);

    //position the emitter relative to the sprite's anchor location
    emitter.y = 100;
    emitter.x = -250;

    emitterXvelocity = 700;
    emitter.minParticleSpeed.setTo(emitterXvelocity, 100);
    emitter.maxParticleSpeed.setTo(emitterXvelocity / 2, 600);

    emitter.gravity = 1;
    emitter.bounce.setTo(0.5, 0.5);
    emitter.angularDrag = 0;

    controls.left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    controls.right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    controls.run = game.input.keyboard.addKey(Phaser.Keyboard.X);
    controls.jump = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    controls.mute = game.input.keyboard.addKey(Phaser.Keyboard.M);
    populateBaddies();
    makeTokens();
    iAmHovering = false;

    sprite.health = 3;
    healthApple = game.add.sprite(960, 10, 'apple');
    healthApple.anchor.setTo(1, 0);
    healthApple.scale.setTo(0.4, 0.4);
    healthApple.fixedToCamera = true;

    tookDamage = false;
}
function spikeCall(a, b){
    playerDamage();
}

function updateGameState() {
if(sprite.body.x > 8600 && !hasSpike){
    hasSpike = true;
    spikeWall = game.add.sprite(8200, 280, 'spikeWall');
    spikeWall.anchor.setTo(0.5, 0.5);
    spikeWall.scale.setTo(1, 1);
    game.physics.arcade.enable(spikeWall);

    spikeWall.body.setSize(120, 640);

    spikeWall.body.allowGravity = false;
    spikeWall.update = spiker;
}
    if(hasSpike){game.physics.arcade.collide(sprite, spikeWall, spikeCall);}
if(sprite.body.x > 14400){win();}
if(sprite.body.velocity.y > 500) {sprite.body.velocity.y = 600;}
    game.camera.focusOnXY(sprite.x, sprite.y - 120);
    var rectangle = new Phaser.Rectangle(0,0,135*(charge/70),45);

    counter.crop(rectangle);
    if(Math.random() > 0.5) {
        modifyCharge(0.2);
    } else {
        modifyCharge(-0.2);
    }
    if(charge > 70) {abilityTrigger(); modifyCharge(0, true);}
    if(charge < 0) {modifyCharge(0, true);}

    if (!mutePushed && controls.mute.isDown) {
        mutePushed = true;
        if (musicMute) {
            music.volume = 0.8;
            musicMute = false;
        } else {
            music.volume = 0;
            musicMute = true;
        }
    }
    if (!controls.mute.isDown) {
        mutePushed = false;
    }

    game.physics.arcade.collide(sprite, layer);
    game.physics.arcade.collide(emitter, layer);

    // Token Sprite overlap handlers
    game.physics.arcade.overlap(sprite, pukeAbilitySprite, handlePukeSprite);
    game.physics.arcade.overlap(sprite, pukeAbilitySprite2, handlePukeSprite);
    game.physics.arcade.overlap(sprite, pukeAbilitySprite3, handlePukeSprite);
    game.physics.arcade.overlap(sprite, hoverAbilitySprite, handleHoverSprite);
    game.physics.arcade.overlap(sprite, hoverAbilitySprite2, handleHoverSprite);
    game.physics.arcade.overlap(sprite, hoverAbilitySprite3, handleHoverSprite);

    if (!sprite.running && controls.run.isDown) {
        sprite.running = true;
        sprite.body.maxVelocity.x = 700;
        sprite.body.drag.x = 470;
    }
    if (!controls.run.isDown && sprite.running) {
        sprite.running = false;
        sprite.body.maxVelocity.x = 400;
        sprite.body.drag.x = 370;
    }
    if (sprite.running) {
        modifyCharge(Math.random() * 0.5);
    }

    modifyCharge(Math.abs(sprite.body.velocity.x)/500);
    var moving = false;
    if (controls.left.isDown) {
        moving = true;
        sprite.body.velocity.x -= 50;
        if (sprite.facing === 1) {
            sprite.scale.x = -1;
            sprite.facing = -1;
        }
        if (emitting) {
            emitter.maxParticleSpeed.x = (emitterXvelocity * sprite.facing) + sprite.body.velocity.x;
            emitter.minParticleSpeed.x = ((emitterXvelocity * sprite.facing)/2) + sprite.body.velocity.x;
        }
    }
    if (controls.right.isDown) {
        moving = true;
        sprite.body.velocity.x += 50;
        if (sprite.facing === -1) {
            sprite.scale.x = 1;
            sprite.facing = 1;
        }
        if (emitting) {
            emitter.maxParticleSpeed.x = (emitterXvelocity * sprite.facing) + sprite.body.velocity.x;
            emitter.minParticleSpeed.x = ((emitterXvelocity * sprite.facing)/2) + sprite.body.velocity.x;
        }
    }
    if (!moving && !Math.abs(sprite.body.velocity.y)) {
        modifyCharge(-0.1);
        if (!iAmHovering && sprite.animations.currentAnim.name !== 'stand') {
            sprite.animations.play('stand');
        }
    } else {
    if(Math.abs(sprite.body.velocity.y) > 100){modifyCharge(0.4);}
        if (!iAmHovering && sprite.animations.currentAnim.name !== 'walk') {
            sprite.animations.play('walk', 60, true);
        }
    }
    if(jumper > 0) {jumper--;}
    if(sprite.body.onFloor() && controls.jump.isDown && jumper == 0){
       jumper = 20;
       sprite.body.velocity.y = -700;
       if(sprite.running){
           sprite.body.velocity.y -= 150;
       }
    }
    else if (controls.jump.isDown && sprite.body.velocity.y < -300){
        modifyCharge(0.5);
        sprite.body.velocity.y -= 20;
    }

    bgParallax.cameraOffset.x = (-(game.camera.x/3)) % 1000;
    bgParallax2.cameraOffset.x = (-(game.camera.x/3) % 1000) + 1000;

    if (emitting) {
        emitter.emitParticle();
        //emitter.x += 10;
        //emitter.position = sprite.position;
        emitter.x = sprite.x+10;
        emitter.y = sprite.y;
    }

    if(sprite.body.y > 1300){gameOver();}
    // TODO: Remove for Production:
    //game.debug.bodyInfo(sprite, 16, 24);
}

function playerDamage() {
    if (!tookDamage) {
        tookDamage = true;
        game.time.events.add(700, function() {tookDamage = false;});
        sfx.b1.play();
        if (sprite.health === 1) {
            healthApple.kill();
            gameOver();
            return;
        }
        sprite.health--;
        healthApple.frame = -(sprite.health) + 3;
    }
}

function gameOver(){
    if (gameOverActivated) {
        return;
    }
    gameOverActivated = true;
    game.time.events.add(3000, reset);
    var diss = game.add.sprite(500, -300, 'gameOver1');
    diss.anchor.setTo(0.5, 0.5);
    diss.fixedToCamera = true;
    diss.cameraY = -300;
    diss.stage = 1;
    var anim = game.add.tween(diss);
    anim.to({cameraY: 300}, Phaser.SECOND, Phaser.Easing.Bounce.Out);
    diss.update = function() {
        this.cameraOffset.y = this.cameraY;
        if (300 -this.cameraY < 20 && this.stage < 3) {
            this.stage++;
            if (this.stage === 2) {
                this.loadTexture('gameOver2');
                sfx.b1.play();
            } else {
                sfx.b2.play();
            }
        }
    };
    anim.start();

    var poof = game.add.sprite(sprite.x, sprite.y, 'death');
    poof.anchor.setTo(0.5, 0.5);
    poof.scale.setTo(0.5, 0.5);
    poof.animations.add('poof');
    poof.animations.play('poof', 3, false);
    poof.alpha = 0.5;
    game.time.events.add(1200, function() {this.kill();}, poof);
    sprite.kill();
}
function win(){
    if (gameWinActivated) {
        return;
    }
    gameWinActivated = true;
    sfx.endSound.play();
    var winSprite = game.add.sprite(500, 300, 'youWin');
    winSprite.anchor.setTo(0.5, 0.5);
    winSprite.fixedToCamera = true;
    winSprite.scale.setTo(0, 0);
    var winAnimation = game.add.tween(winSprite.scale);
    winAnimation.to({x: 1.0, y: 1.0}, Phaser.SECOND, Phaser.Easing.Elastic.Out);
    winAnimation.start();
}
function reset(){
    baddies = [];
    music.stop();
    game.state.start("gameState");
}

function handlePukeSprite(){
ability = 0;
}
function handleHoverSprite(){
ability = 1;
}

function abilityTrigger(){
    if (!sprite.alive) {
        return;
    }
    if(ability == 0) {
        puke();
    } else if (ability == 1) {
        hover();
    }
    sfx.wobble.play();
    emitting = true;
    game.time.events.add(1000, function() {emitting = false;});
}

function puke(){
        var bullet = game.add.sprite(sprite.x, sprite.y, 'squid');
        if (sprite.facing < 1) {
            bullet.scale.setTo(-0.25, 0.25)
        } else {
            bullet.scale.setTo(0.25, 0.25);
        }
        bullet.anchor.setTo(0.5, 0.5);
        bullet.update = bulletColide;
        bullet.facing = sprite.facing;
        game.physics.arcade.enable(bullet);
        bullet.body.setSize(400,100,0,0);
        bullet.body.allowGravity = false;
        bullet.animations.add('squidGrow', [1, 2]);
        game.time.events.add(300, function() {this.animations.play('squidGrow', 15, true)}, bullet);
        game.time.events.add(5000, bulletDeath, bullet);
}

function hover() {
    if (iAmHovering) {
    } else {
        sprite.animations.play('float', 10, false);
        iAmHovering = true;
        sprite.body.gravity.y = 0;
        sprite.body.velocity.y = 0;
        sprite.body.y = sprite.body.y - 10;
        game.time.events.add(1500, endHover, sprite);
    }
}

function endHover(){
    this.body.gravity.y = 2000;
    iAmHovering = false;
}

function makeTokens() {
    pukeAbilitySprite = game.add.sprite(1000, 410, 'pukeAbilitySprite');
    pukeAbilitySprite.scale.setTo(0.5, 0.5);
    game.physics.arcade.enable(pukeAbilitySprite);
    //baddy.update = baddyColide;
    pukeAbilitySprite.body.allowGravity = false;

    hoverAbilitySprite = game.add.sprite(2000, 410, 'hoverAbilitySprite');
    hoverAbilitySprite.scale.setTo(0.5, 0.5);
    game.physics.arcade.enable(hoverAbilitySprite);
    //baddy.update = baddyColide;
    hoverAbilitySprite.body.allowGravity = false;

    pukeAbilitySprite2 = game.add.sprite(4050, 300, 'pukeAbilitySprite');
    pukeAbilitySprite2.scale.setTo(0.5, 0.5);
    game.physics.arcade.enable(pukeAbilitySprite2);
    //baddy.update = baddyColide;
    pukeAbilitySprite2.body.allowGravity = false;

    pukeAbilitySprite3 = game.add.sprite(3950, 816, 'pukeAbilitySprite');
    pukeAbilitySprite3.scale.setTo(0.5, 0.5);
    game.physics.arcade.enable(pukeAbilitySprite3);
    //baddy.update = baddyColide;
    pukeAbilitySprite3.body.allowGravity = false;

    hoverAbilitySprite2 = game.add.sprite(3186, 450, 'hoverAbilitySprite');
    hoverAbilitySprite2.scale.setTo(0.5, 0.5);
    game.physics.arcade.enable(hoverAbilitySprite2);
    //baddy.update = baddyColide;
    hoverAbilitySprite2.body.allowGravity = false;

    hoverAbilitySprite3 = game.add.sprite(5550, 816, 'hoverAbilitySprite');
    hoverAbilitySprite3.scale.setTo(0.5, 0.5);
    game.physics.arcade.enable(hoverAbilitySprite3);
    //baddy.update = baddyColide;
    hoverAbilitySprite3.body.allowGravity = false;

    // TODO: Be sure to add these to the token sprite overlap handler list!

}

function bulletDeath(){
    this.kill();
}
function spiker(){
if (sprite.y > this.y){this.body.velocity.y = 80;}
else {this.body.velocity.y = -80;}
this.body.velocity.x = 100;
}
function populateBaddies(){

    function createBaddy(x, y) {
        var baddy = game.add.sprite(x, y, 'enemy');
        baddy.scale.setTo(0.5, 0.5);
        baddy.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(baddy);
        baddy.update = baddyColide;
        baddy.body.allowGravity = false;
        baddy.animations.add('normal', [1, 1, 1, 1, 1, 0]);
        baddy.animations.add('hurt', [2, 0]);
        baddy.animations.play('normal', 1, true);
        baddy.health = 3;
        baddy.body.drag.x = 1500;
        baddy.body.drag.y = 1500;
        baddies.push(baddy);
    }
    createBaddy(2000, 410);
    createBaddy(3500, 800);
    createBaddy(5550, 800);
}

function modifyCharge(value, abs) {
    if (sprite.alive) {
        if (abs !== true) {
            charge += value;
        } else {
            charge = value;
        }
    }
}

function baddyColide(){
if(sprite.body.x > this.body.x - 800) {this.body.velocity.x = -400;}
    if(game.physics.arcade.collide(this, sprite)){playerDamage();}
    game.physics.arcade.collide(this, layer);
}

function killBaddy(a){
baddies[a].animations.play('hurt', 1, true);
game.time.events.add(500, function(){baddyAnim(a);});
baddies[a].health--;
if(baddies[a].health <= 0){
  modifyCharge(100);
baddies[a].kill();}
}
function baddyAnim(a){
baddies[a].animations.play('normal', 1, true);
}

function bulletColide(){
    this.body.velocity.x = 600 * this.facing;
    game.physics.arcade.collide(this, layer);
    var i;
    for (i=0; i < baddies.length; i++) {
        if(game.physics.arcade.collide(this, baddies[i])) {
            killBaddy(i);this.kill();
        }
    }
    //if(game.physics.arcade.collide(this, baddies[1])){killBaddy(1);}
    //this line shouldnt do aything but im scared to remove it.
    if (!this.body.touching.none) {
        this.facing = this.facing * -1;
    }
}

var gameState = {
    create: createGameState,
    update: updateGameState
};


module.exports = gameState;
