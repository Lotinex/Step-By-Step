import {GraphicDamageRenderer} from './graphic';

declare let DamageRenderer: GraphicDamageRenderer;

export default class DamageText {
    public damage: string;
    public event: MouseEvent;
    public data: Array<{
        number: boolean;
        img: HTMLImageElement;
        x: number;
        y: number;
    }>;
    public life: number;
    public startDying: boolean;
    public alpha: number;


    static HANGUL_X_INCREASE = 75;
    static NUMBER_X_INCREASE = 45;
    static HANGUL_Y_DECREASE = 15;
    constructor(damage: number, e: MouseEvent){
        this.damage = DamageText.toKorean(damage);
        this.event = e;
        this.data = [];
        this.life = 200;
        this.startDying = false;
        this.alpha = 1;

        let xCounter = this.event.pageX;

        this.damage.split('').forEach(text => {
            const image = new Image()
            image.src = `assets/img/damage/${text}.png`
            image.onload = () => {
                this.data.push({
                    number: !isNaN(parseInt(text)),
                    img: image,
                    x: xCounter,
                    y: !isNaN(parseInt(text)) ? this.event.pageY : this.event.pageY - DamageText.HANGUL_Y_DECREASE,
                })
                xCounter += !isNaN(parseInt(text)) ? DamageText.NUMBER_X_INCREASE : DamageText.HANGUL_X_INCREASE;
            }
        })
    }
    static toKorean(number: number){
        const inputNumber  = number < 0 ? false : number;
        const unitWords    = ['', '만', '억', '조', '경'];
        const splitUnit    = 10000;
        const splitCount   = unitWords.length;
        const resultArray  = [];
        let resultString = '';
    
        for (let i = 0; i < splitCount; i++){
             let unitResult = (inputNumber as number % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
            unitResult = Math.floor(unitResult);
            if (unitResult > 0){
                resultArray[i] = unitResult;
            }
        }
    
        for (let i = 0; i < resultArray.length; i++){
            if(!resultArray[i]) continue;
            resultString = String(resultArray[i]) + unitWords[i] + resultString;
        }
    
        return resultString;
    }
    render(ctx: CanvasRenderingContext2D){
        for(const text of this.data){
            if(this.alpha <= 0){
                const index = DamageRenderer.damages.indexOf(this);
                DamageRenderer.damages.splice(index, 1)
                break;
            }
            if(this.startDying){
                ctx.save() //globalAlpha가 다른 렌더링에
                ctx.globalAlpha = this.alpha;
            }
            ctx.drawImage(text.img, text.x, text.y)

            if(this.startDying){
                ctx.restore() //영향을 주지 않게 하기 위함
                this.alpha -= 0.01;
            }
        }
    }
}