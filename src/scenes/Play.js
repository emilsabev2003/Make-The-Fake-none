/*
used chatGPT to help with setting up airborne trick animation: https://chat.openai.com/share/c1fc02b7-baef-4834-9dc6-f90363d22249
used chatGPT to help with setting up high score global variable: https://chat.openai.com/share/a7ef137c-309a-4b1d-8dba-ebaa20ed9300
*/

class Play extends Phaser.Scene
{
    constructor()
    {
        super('playScene') 

        //declare variables
        this.keysPressed = ''
        this.lastKeyPressTime = 0
        this.totalPoints = 0
        this.livesLeft = 5
        this.inTrick = false
        this.currentTrick = ''
        this.nextScene = false
        this.inDeathAnim = false
    }

    preload() //load images/atlases/audio
    {
        this.load.image("play_background", "./assets/play_background.png")

        this.load.atlas("360_side_flip_anims", "./assets/bike_360_side_flip.png", "./assets/bike_360_side_flip.json")
        this.load.image("trick_wind", "./assets/trick_wind.png")
        this.load.atlas("sexy_move_anims", "./assets/sexy_move_anims.png", "./assets/sexy_move_anims.json")
        this.load.atlas("headstand_anims", "./assets/headstand_anims.png", "./assets/headstand_anims.json")

        this.load.image("LIFE_LOST_5", "./assets/LIFE_LOST_0.png")
        this.load.image("LIFE_LOST_4", "./assets/LIFE_LOST_1.png")
        this.load.image("LIFE_LOST_3", "./assets/LIFE_LOST_2.png")
        this.load.image("LIFE_LOST_2", "./assets/LIFE_LOST_3.png")
        this.load.image("LIFE_LOST_1", "./assets/LIFE_LOST_4.png")
        this.load.image("LIFE_LOST_0", "./assets/LIFE_LOST_5.png")

        this.load.atlas("death_anims", "./assets/death_anim.png", "./assets/death_anim.json")

        this.load.audio("jump_sound", "./assets/bike_jump.mp3")
        this.load.audio("trick_sound", "./assets/trick_sound.mp3")
        this.load.audio("death_sound", "./assets/mixkit-arcade-retro-game-over-213.wav")

    }

    create() //add background, biker, biker animations, tricks, wind, jumping, and collision
    {
        //make background visible
        this.backgroundImage = this.add.tileSprite(0, 0, 800, 600, "play_background").setOrigin(0, 0)

        //jump audio
        this.jumpAudio = this.sound.add('jump_sound')
        this.jumpAudio.setVolume(0.5)

        //trick audio
        this.trickAudio = this.sound.add('trick_sound')
        this.trickAudio.setVolume(1.5)

        //death audio
        this.deathAudio = this.sound.add('death_sound')


        //add HUD at top
        this.hud = this.add.tileSprite(0, 0, 800, 600, "LIFE_LOST_5").setOrigin(0, 0)

        //add biker and set to stationary frame
        this.biker = this.physics.add.sprite(150, 470, 'bike_ramp_anims')
        this.biker.setFrame('bike_ramp_1.png')
        
        //modify biker properties
        this.biker.setVelocity(0)
        this.biker.body.setSize(50, 50)

        //display current points and high score
        this.displayPoints = this.add.text(45, 25, 'Player 1\n0', {fontSize: '32px', fill: '#FFF'})
        let highScore = this.game.highScore
        this.hiScore = this.add.text(270, 25, 'Hi Score\n' + highScore, {fontSize: '32px', fill: '#FFF'}) //I purposely made this low so that it can be beaten in the playtest for gradin

        //add invisibile ground wall with collider and check for death condition
        const wall = this.physics.add.staticSprite(0, 500)
        wall.setSize(800, 1)

        this.physics.add.collider(this.biker, wall, () => 
        {
            if (this.inTrick && this.inTrickState(this.currentTrick)) 
            {
                this.inDeathAnim = true
                this.biker.anims.play('deathAnims')
                this.deathAudio.play()
                this.livesLeft -= 1
                this.hud.setTexture('LIFE_LOST_' + this.livesLeft)

                if (this.livesLeft <= 0) 
                {

                    this.totalPoints = 0

                    this.inDeathAnim = false
                    this.livesLeft = 5

                    this.nextScene = true
                    this.scene.start('gameOverScene')
                }

                this.inTrick = false
                this.currentTrick = ''

                this.time.delayedCall(700, this.resetAfterLifeLost, [], this)
        
            }
        }, null, this)
        
        // Setup the jump interval
        this.setupJumpInterval();

        // Setup an event listener for when the scene is paused or stopped
        this.events.on('shutdown', this.clearJumpInterval, this);
        this.events.on('pause', this.clearJumpInterval, this);

        this.elapsedTime = 0;

        //trick index
        this.tricks = 
        {
            "360_side_flip": ["D", "W", "A", "S"],
            "head_stand": ["F, R, E, T"],
            "sexy_move": ["Q", "Q", "Q", "Q"]
        }

        //points index
        this.sideFlipPoints = 200
        this.headStandPoints = 300
        this.sexyMovePoints = 100

        //360-side-flip animations
        this.anims.create
        ({
            key: '360sideflipAnims',
            frames: this.anims.generateFrameNames('360_side_flip_anims', {prefix: "360_side_flip_", start: 1, end: 9, suffix: ".png"}),
            frameRate: 8
        })

        //sexy move animations
        this.anims.create
        ({
            key: 'sexyMoveAnims',
            frames: this.anims.generateFrameNames('sexy_move_anims', {prefix: "Sexy_move_", start: 1, end: 6, suffix: ".png"}),
            frameRate: 8
        })

        //head stand animations
        this.anims.create
        ({
            key: 'headStandAnims',
            frames: this.anims.generateFrameNames('headstand_anims', {prefix: "headstand_", start: 1, end: 7, suffix: ".png"}),
            frameRate: 8
        })

        //add trick wind sprite
        this.trickWind = this.add.sprite(0, 0, 'trick_wind').setOrigin(0, 0)
        this.trickWind.setVisible(false)

        //death anims
        this.anims.create
        ({
            key: 'deathAnims',
            frames: this.anims.generateFrameNames('death_anims', {prefix: "death_anim_", start: 1, end: 4, suffix: ".png" }),
            frameRate: 5
        })

        //check for user keyboard input
        this.input.keyboard.on('keydown', this.handleKeyDown, this)

    }

    update() //track biker jumping state, trick state, score, and more
    {
        //time elapsed
        this.elapsedTime = this.time.now

        //move trick wind by -5 
        this.trickWind.x -= 5

        //wrap screen if necessary
        if (this.trickWind.x > this.game.config.width) 
        {
            this.trickWind.x = 0
        }

        //3 second stationary background to start the game
        if (this.elapsedTime > 3000 && this.inDeathAnim == false) 
        {
            this.backgroundImage.tilePositionX += 5
        }

        //check for user keyboard input for tricking and more
        if (this.biker.y < 470)
        {
            if (this.keySequence === 'DWAS' && this.elapsedTime - this.lastKeyPressTime <= 500) //handle 360 side flip
            {
                this.handleTrickWind()
                this.trickAudio.play()

                this.biker.anims.play('360sideflipAnims')
                this.keySequence = ''
                this.lastKeyPressTime = 0

                this.totalPoints += this.sideFlipPoints
                this.displayPoints.setText('Player 1\n' + this.totalPoints)

                this.inTrick = true
                this.currentTrick = '360sideflipAnims'

            }

            if (this.keySequence == "QQQQ" && this.elapsedTime - this.lastKeyPressTime <= 500) //handle sexy move 
            {
                this.handleTrickWind()
                this.trickAudio.play()

                this.biker.anims.play("sexyMoveAnims")
                this.keySequence = ""
                this.lastKeyPressTime = 0

                this.totalPoints += this.sexyMovePoints
                this.displayPoints.setText('Player 1\n' + this.totalPoints)

                this.inTrick = true
                this.currentTrick = 'sexyMoveAnims'

            }

            if (this.keySequence == "FRET" && this.elapsedTime - this.lastKeyPressTime <= 500) //handle head stand
            {
                this.handleTrickWind()
                this.trickAudio.play()

                this.biker.anims.play("headStandAnims")
                this.keySequence = ""
                this.lastKeyPressTime = 0

                this.totalPoints += this.headStandPoints
                this.displayPoints.setText('Player 1\n' + this.totalPoints)

                this.inTrick = true
                this.currentTrick = 'headStandAnims'

            }
        }

        if (this.totalPoints > this.game.highScore) //update high score if current points > high score
        {
            this.game.highScore = this.totalPoints
            this.hiScore.setText('Hi Score\n' + this.totalPoints)
        }
        
    }

    handleKeyDown(event) //function that handles the key combinations pressed for biker tricking. inputs are calculated in 0 - 500 ms intervals
    {
        const key = event.key.toUpperCase()
        const currentTime = this.time.now
             
        if (currentTime - this.lastKeyPressTime > 500)
        {
            this.keySequence = key
        }

        else
        {
            this.keySequence += key
        }

        this.lastKeyPressTime = currentTime        
    }
    
    handleTrickWind() //set trick wind to visible if biker is in tricking state
    {
        this.trickWind.x = 0
        this.trickWind.y = 0

        this.trickWind.setVisible(true);
        this.trickWindTimer = this.time.addEvent
        ({
            delay: 1000,
            callback: this.hideTrickWind, 
            callbackScope: this
        })
    }
    
    hideTrickWind() //set trick wind to not visible after handleTrickWind() is called
    {
        this.trickWind.setVisible(false)
    }

    inTrickState(trick) //check if biker is in trick state (besides last 2 frames)
    {
        const currentFrameIndex = this.biker.anims.currentFrame.index
        const totalFrames = this.biker.anims.currentAnim.frames.length
        return currentFrameIndex < totalFrames - 2
    }
    

    resetAfterLifeLost() //reset biker position and relevant variables after life lost
    {
        this.biker.setPosition(150, 470);
        this.biker.setVelocity(0)

        this.inTrick = false
        this.currentTrick = ''

        this.inDeathAnim = false
    }

    setupJumpInterval() //handle bike jumping interval
    {
        this.jumpInterval = setInterval(() => 
        {
            if (this.scene.isActive('playScene')) 
            {
                this.jumpAudio.play()
                this.biker.setVelocityY(-380)
                this.biker.anims.play('rampAnims')

                setTimeout(() => 
                {
                    this.biker.setVelocityY(0)
                }, 1800)
            } 
            
            else 
            {
                this.clearJumpInterval()
            }
        }, 2500)
    }

    clearJumpInterval() //stop jump interval if in game over scene
    {
        if (this.jumpInterval !== null) 
        {
            clearInterval(this.jumpInterval)
            this.jumpInterval = null
        }
    }

}
    

