class ActiveSkill { //패시브는 어떻게 할지 생각해보자. SKill abstract class를 두고 Active와 Passive로 나눌까?
    constructor(id, key){
        this.key = key;
        this.id = id;
        document.addEventListener("keydown", e => {
            if(e.key == this.key) this.use();
        })
    }
    /**
     * Implement this
     */
    use(){}
}