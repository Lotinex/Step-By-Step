export default class XHR {
    static POST(url: string, reqBody: any): Promise<{success: boolean}>{
        return new Promise((rs, rj) => {
            $.post(url, reqBody, rs).fail(rj)
        })
    }
    static GET(url: string, reqBody: any): Promise<{success: boolean}>{
        return new Promise((rs, rj) => {
            $.get(url, reqBody, rs).fail(rj)
        })
    }
}
