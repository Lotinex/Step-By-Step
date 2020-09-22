class XHR {
    static POST(url, reqBody){
        return new Promise((rs, rj) => {
            $.post(url, reqBody, rs).fail(rj)
        })
    }
    static GET(url, reqBody){
        return new Promise((rs, rj) => {
            $.get(url, reqBody, rs).fail(rj)
        })
    }
}
