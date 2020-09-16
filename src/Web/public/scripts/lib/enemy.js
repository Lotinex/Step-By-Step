class Enemy extends Entity {
    constructor(id, x, y, w, h, hp){
        super(id, x, y);
        this.w = w;
        this.h = h;
        this.hp = hp;
    }
    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx){
        ctx.drawImage(this.img, this.x  - this.w / 2, this.y - this.h / 2, this.w, this.h)
    }
    onClick(e){
        bossBar.quake();
        bossBar.addValue(-100);
        /**
         * 버그 1. 화면 상단 왼쪽을 보면 하얀색으로 상자가 하나 존재한다.
         * 버그 2. 데미지 텍스트 아래에 검은색으로 길 비스무리한것이 쭉 남는다.
         */
        StageRenderer.addDamage(new DamageText(1235812369, e))
    }

}