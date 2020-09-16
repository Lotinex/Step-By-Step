class DamageText {
    constructor(damage, e){
        this.damage = DamageText.toKorean(damage);
        this.event = e;
        this.data = [];

        let xCounter = this.event.pageX;

        this.damage.split('').forEach(text => {
            const image = new Image()
            image.src = `assets/img/damage/${text}.png`
            image.onload = () => {
                this.data.push({
                    number: !isNaN(text),
                    img: image,
                    x: !isNaN(text) ? xCounter: xCounter,
                    y: !isNaN(text) ? this.event.pageY : this.event.pageY - 15
                })
                xCounter += !isNaN(text) ? 45 : 75
            }
        })
    }
    static toKorean(number){
        var inputNumber  = number < 0 ? false : number;
        var unitWords    = ['', '만', '억', '조', '경'];
        var splitUnit    = 10000;
        var splitCount   = unitWords.length;
        var resultArray  = [];
        var resultString = '';
    
        for (var i = 0; i < splitCount; i++){
             var unitResult = (inputNumber % Math.pow(splitUnit, i + 1)) / Math.pow(splitUnit, i);
            unitResult = Math.floor(unitResult);
            if (unitResult > 0){
                resultArray[i] = unitResult;
            }
        }
    
        for (var i = 0; i < resultArray.length; i++){
            if(!resultArray[i]) continue;
            resultString = String(resultArray[i]) + unitWords[i] + resultString;
        }
    
        return resultString;
    }
    render(ctx){
        for(const text of this.data){
            ctx.drawImage(text.img, text.x, text.y)
        }
    }
}