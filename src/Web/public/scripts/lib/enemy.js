class Enemy extends Entity {
    constructor(id, x, y, w, h){
        super(id, x, y);
        this.w = w;
        this.h = h;
    }
    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx){
        ctx.drawImage(this.img, this.x  - this.w / 2, this.y - this.h / 2, this.w, this.h)
    }
    onClick(x, y){
        alert('clicked')
    }
}