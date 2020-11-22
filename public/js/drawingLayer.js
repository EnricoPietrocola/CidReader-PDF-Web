
//const space = new CanvasSpace("#canvas_container");
//bgcolor: "transparent"

const canvas = document.getElementById("drawing_renderer")
const pdf = document.getElementById("pdf_renderer")

const ctx = canvas.getContext('2d')

//this is not very optimized but it's the only way I've found at the moment to make it work
pdf.addEventListener("mousemove", ()=>{
    canvas.width = pdf.width
    canvas.height = pdf.height
})

canvas.addEventListener("mousemove", function(e) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cRect = canvas.getBoundingClientRect();        // Gets CSS pos, and width/height
    const canvasX = Math.round(e.clientX - cRect.left);  // Subtract the 'left' of the canvas
    const canvasY = Math.round(e.clientY - cRect.top);   // from the X/Y positions to make
    //ctx.clearRect(0, 0, canvas.width, canvas.height);  // (0,0) the top left of the canvas
    //ctx.fillText("X: "+canvasX+", Y: "+canvasY, 10, 20);
    console.log(canvasX + " " + canvasY)
    ctx.fillRect(canvasX,canvasY,20,20)
});




/*
if (y >= (canvasH - pageView.bitmapH) / 2f && y <= ((canvasH - pageView.bitmapH) / 2f) + pageView.bitmapH) {

				if ((y < actionBar.getHeight() || y > canvasH - actionBar.getHeight()) && actionBar.getVisibility() == View.VISIBLE) {
					//clicking on menu bars, ignoring touch for drawing
				} else {
					//clicking on bitmap, drawing
					float percX;
					float percY;

					float horizontalOffset = (canvasW - pageView.bitmapW) / 2f;
					float verticalOffset = (canvasH - pageView.bitmapH) / 2f;

					if ((pageView.canvasW - pageView.bitmapW) >= 0f && pageView.viewScale != 1f) {
						horizontalOffset = (pageView.canvasW - pageView.bitmapW);
						x = x - horizontalOffset * pageView.viewScale;
					} else if ((pageView.canvasW - pageView.bitmapW) >= 0f && pageView.viewScale == 1f) {
						x = x - horizontalOffset;
					}
					if ((pageView.canvasH - pageView.bitmapH) >= 0f && pageView.viewScale != 1f) {
						verticalOffset = (pageView.canvasH - pageView.bitmapH);
						y = y - verticalOffset * pageView.viewScale;
					} else if ((pageView.canvasH - pageView.bitmapH) >= 0f && pageView.viewScale == 1f) {
						y = y - verticalOffset;
					}

					percX = (x + pageView.scrollX) / pageView.bitmapW;
					percY = (y + pageView.scrollY) / pageView.bitmapH;
 */