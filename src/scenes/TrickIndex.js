class TrickIndex extends Phaser.Scene 
{
    constructor()
    {
        super('trickIndexScene')
    }

    preload()
    {
        this.load.image("trickindex_background", "./assets/trickBackground.png")
    }

    create() 
    {
        this.backGroundImage = this.add.tileSprite(0, 0, 800, 600, "trickindex_background").setOrigin(0, 0)
        this.returnMenu = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M)
    }

    update() 
    {
        if (this.returnMenu.isDown)
        {
            this.scene.start("menuScene")
        }
    }

}