class GameOver extends Phaser.Scene 
{
    constructor()
    {
        super('gameOverScene')
    }
    
    preload()
    {
        this.load.image("game_over_background", "./assets/gameoverbackground.png")
    }

    create() 
    {
        this.gameOverBackground = this.add.tileSprite(0, 0, 800, 600, "game_over_background").setOrigin(0, 0)
        this.startGameAgain = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P)

    }

    resetGame()
    {
        this.scene.start("playScene")
    }

    update() 
    {
        if (this.startGameAgain.isDown)
        {
            this.resetGame()
        }
    }

}
