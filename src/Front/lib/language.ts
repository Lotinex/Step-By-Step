const TABLE = (window as any).LANGUAGE_TABLE || {};

/**
 * Implement Me
 */
export default class L {
    static process(key: string, data: any){
        const base = TABLE[key];
        if(base === undefined) return `$${key}$`; // 표에서 적절한 문자열을 찾지 못했을 때

        return base; 



    }
    /**
     * L.process를 overload하기에는 부적합해서 object Expression을 사용하는 함수를 따로 사용
     */
    static processResolveObject(key: string, expression: any){
        /**
         * Implement Me
         */
    }
}