class Enemy extends Entity {
    constructor(id, x=0, y=0){
        super(id, x, y);
    }
    render(ctx){
        ctx.drawImage(this.img, this.x, this.y)
    }
    onClick(x, y){
        // hp가 달거나 뭐 그러겠지?
    }
}