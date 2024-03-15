// Make the Fake - Broken Bonez
// Name: Emil Sabev
// Date: 3/4/2024

/* Some Major Components Used:
1. physics system between biker and ground
2. animation manager to use/change biker animations
3. text objects to keep track of current score and high score
4. input handling in all scenes, especially utilized to perform tricks in the game
5. timers such as the delayedCall which resets the bike position after losing a life
*/


/* Credits: 
play music: https://www.youtube.com/watch?v=49qYd9x1uGA
jump sound (trimmed down): https://uppbeat.io/sfx/motorcycle-engine-revving/4653/12705
trick sound (trimmed down): https://pixabay.com/sound-effects/success-02-68338/
death sound: https://mixkit.co/free-sound-effects/arcade/
*/


'use strict'

let config = 
{
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scale: { autoCenter: Phaser.Scale.CENTER_BOTH},
    physics: 
    { 
        default: 'arcade', 
        arcade: 
        {
            gravity: { y: 500}, 
            debug: true
        }
    },
    scene: [ Menu, Play, GameOver, TrickIndex ]
}

let game = new Phaser.Game(config)

let { width, height } = game.config