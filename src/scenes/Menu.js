class Menu extends Phaser.Scene 
{
    constructor() 
    {
        super('menuScene')
    }

    preload() //load images, audio, sprites here
    {   
        this.load.image("menu_background", "./assets/menu_background.png")
        this.load.atlas('bike_ramp_anims', './assets/bike_ramp.png', './assets/bike_ramp.json')
        this.load.audio('play_music', './assets/New Kids On The Block   Hangin  Tough Instrumental DIY ULTIMATE VOCAL REMOVER v5.mp3')

    }

    create() //add custom background, animation configuration, display menu text and instructions, define keys
    {
        this.backgroundImage = this.add.tileSprite(0, 0, 800, 600, "menu_background").setOrigin(0, 0)
        this.startGame = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P)
        this.trickIndex = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T)

        let highScore = 500
        this.game.highScore = highScore

        this.anims.create
        ({
            key: 'rampAnims',
            frames: this.anims.generateFrameNames('bike_ramp_anims', {prefix: "bike_ramp_", start: 1, end: 8, suffix: ".png"}),
            frameRate: 6
        })

        this.playMusic = this.sound.add('play_music')
    }

    update() //transition from menu to play
    {

        if (this.startGame.isDown)
        {
            this.playMusic.play({loop: true})
            this.playMusic.setVolume(0.1)
            this.scene.start("playScene")
        }

        if (this.trickIndex.isDown)
        {    
            this.scene.start("trickIndexScene")
        }
    }
}