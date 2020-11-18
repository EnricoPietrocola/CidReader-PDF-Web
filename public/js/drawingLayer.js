Pts.namespace( window );

//const space = new CanvasSpace("#canvas_container");
const space = new CanvasSpace("#drawing_renderer");
space.setup({ bgcolor: "transparent", resize: true });
const form = space.getForm();

space.add( () => form.point( space.pointer, 10 ) );
space.bindMouse().bindTouch().play();

console.log('this is happening!')