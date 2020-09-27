class Enemy extends Entity {
    constructor(id, x, y, w, h, hp){
        super(id, x, y);
        this.w = w;
        this.h = h;
        this.hp = hp;
        this.targeted = false;
    }
    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx){
        ctx.drawImage(this.img, this.x  - this.w / 2, this.y - this.h / 2, this.w, this.h)
    }
    onClick(e){
        this.targeted = !this.targeted;

        let damage = Util.random(0, 2)
        /*bossBar.quake();
        bossBar.addValue(-damage);*/
        DamageRenderer.addDamage(new DamageText(damage, e))
    }

}