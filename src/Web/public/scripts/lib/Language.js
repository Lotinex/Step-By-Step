const TABLE = window.LANGUAGE_TABLE || {};

/**
 * Implement Me
 */
class L {
    static process(key, data){
        const base = TABLE[key];
        if(base === undefined) return `$${key}$`; // 표에서 적절한 문자열을 찾지 못했을 때

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