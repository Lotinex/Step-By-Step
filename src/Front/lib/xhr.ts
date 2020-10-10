import $ from 'jquery';
type Response = Promise<{[key: string]: any}>
export default class XHR {
    static POST(url: string, reqBody: any): Response {
        return new Promise((rs, rj) => {
            $.post(url, reqBody, rs).fail(rj)
        })
    }
    static GET(url: string, reqBody: any): Response {
        return new Promise((rs, rj) => {
            $.get(url, reqBody, rs).fail(rj)
        })
    }
}
