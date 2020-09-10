const TABLE = window.LANGUAGE_TABLE || {};

/**
 * Implement Me
 */
class L {
    static SYNTAX = {
        normal: index => `{#${index}}`,
        FA: () => `{*(\w)}`,
    }
    static process(key, ...data){
        let base = TABLE[key];
        if(base === undefined) return `$${key}$`; // 표에서 적절한 문자열을 찾지 못했을 때


        for(let i in data){
            base = base.replace(new RegExp(L.SYNTAX.normal(i)), data[i]);
            base = base.replace(new RegExp(L.SYNTAX.FA()), `<i class="fas fa-$1"></i>`);
        }
        return base;
    }
    /**
     * L.process를 overload하기에는 부적합해서 object Expression을 사용하는 함수를 따로 사용
     */
    static processResolveObject(key, expression){
        /**
         * Implement Me
         */
    }
}