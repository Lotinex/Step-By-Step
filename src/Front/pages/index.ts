import {GraphicRenderer, Entity} from '../lib/graphic';
import Util from '../lib/util'
import $ from 'jquery'
import Star from '../lib/star';

class Main {
    private static BackgroundRendererLayer1 = new GraphicRenderer("backgroundLayer1");
    private static BackgroundRendererLayer2 = new GraphicRenderer("backgroundLayer2");
    private static starCount = 200;
    public static Init(): void {
        $(document).on('mousemove', Main.onMouseMove);

        $("#backgroundLayer1").attr("width", window.innerWidth).attr("height", window.innerHeight)
        $("#backgroundLayer2").attr("width", window.innerWidth).attr("height", window.innerHeight)
        const createStar = (renderer: GraphicRenderer) => {
            for(let i=0; i<Main.starCount; i++){
                const star = new Star(`star-${i}`, Util.random(0, 2000), Util.random(0, 1050), Util.random(1, 2));
                renderer.addEntity(star)
            }
        }
        createStar(Main.BackgroundRendererLayer1)
        createStar(Main.BackgroundRendererLayer2)
    }
    public static onMouseMove(event: JQuery.MouseMoveEvent<Document, undefined, Document, Document>): void {
        $("#backgroundLayer1")
            .css('left', -(event.pageX * 0.1))
            .css('top', -(event.pageY * 0.1))
        $("#backgroundLayer2")
            .css('left', -(event.pageX * 0.05))
            .css('top', -(event.pageY * 0.05))
    }
}
Main.Init() //entry
