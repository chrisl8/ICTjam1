'use strict';

var game = require('../game'),
  Phaser = require('phaser').Phaser;
var controls = {};
var titleSprite;
var loadingBar;
var loadImage;
var pressKey;

function createPreloader() {
game.input.keyboard.addCallbacks(this, function () {if(game.state.current === 'preloader'){game.state.start("gameState");}});
        loadingBar.kill();
        loadImage.kill();
        game.stage.backgroundColor = '#ffffff';
        var titleSprite = game.add.sprite(495, 280, 'titleSprite');
        titleSprite.scale.setTo(.7, .7);
        titleSprite.anchor.setTo( .5, .5);
        var pressKey = game.add.sprite(520, 535, 'pressKey');
        pressKey.scale.setTo(.5, .5);
        pressKey.anchor.setTo( .5, .5);
}
function startGame(){
console.log('WHAHAHAHA');
    game.state.start("gameState");

}

function loadStuff() {
        "use strict";
        game.load.image('titleSprite', 'img/title.png');
        game.load.image('sun', 'img/sun.png');
        game.load.image('youWin', 'img/youWIN.png');
        game.load.image('pressKey', 'img/pressAnyKey.png');
        game.load.image('spikeWall', 'img/spikeWall.png');
        game.load.spritesheet('player', 'img/walk_cycle.png', 122, 180);
        game.load.image('pukeAbilitySprite', 'img/a.png');
        game.load.image('hoverAbilitySprite', 'img/b.png');
        game.load.image('test2', 'img/testPNG.png');
        game.load.image('abilityBar', 'img/abilityBar.png');
        game.load.image('abilityBarBackground', 'img/bar.png');
        game.load.spritesheet('enemy', 'img/enemy.png', 830, 678);
        game.load.spritesheet('vomit', 'img/Emitter.png', 32, 32);
        game.load.spritesheet('squid', 'img/squid.png', 533, 242);

        game.load.spritesheet('death', 'img/POOF.png', 500, 500);
        game.load.spritesheet('apple', 'img/apple.png', 200, 200);

        game.load.image('gameOver1', 'img/youFailONE.png');
        game.load.image('gameOver2', 'img/youFailTWO.png');

        game.load.image('bg', 'img/background.png');
        game.load.image('bgParallax', 'img/backgroundFront.png');

        game.load.image('all_small', 'img/all_small.png');
        game.load.tilemap('testMap', 'map/levelOne.json', null, Phaser.Tilemap.TILED_JSON);

        game.load.audio('bump1', ['sound/Bumbp1.mp3', 'sfx/Bumbp1.ogg']);
        game.load.audio('bump2', ['sound/Bumbp2.mp3', 'sfx/Bumbp2.ogg']);
        game.load.audio('wobble', ['sound/wobble.mp3', 'sfx/wobble.ogg']);
        game.load.audio('endSound', ['sound/end.mp3', 'sfx/end.ogg']);

        game.load.audio('bgMusic', ['sound/Music1.mp3', 'sfx/Music1.ogg']);

        loadingBar = game.add.sprite(104, 280, 'loadBar');
        loadImage = game.add.sprite(93, 193, 'loadImage');

        game.load.setPreloadSprite(loadingBar);


        controls.jump = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
}

function updatePreloader() {
}

var preloader = {
  create: createPreloader,
  update: updatePreloader,
  preload: loadStuff
};

module.exports = preloader;
