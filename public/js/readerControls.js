var myState = {
    pdf: null,
    currentPage: 1,
    zoom: 1
}

document.getElementById('zoom_in')
    .addEventListener('click', (e) => {
        if(myState.pdf == null) return;
        myState.zoom += 0.5;
        render();
    });

document.getElementById('zoom_out')
    .addEventListener('click', (e) => {
        if(myState.pdf == null) return;
        myState.zoom -= 0.5;
        render();
    });

function startDoc() {

    console.log("StartDoc")
    var documentLink = document.getElementById("documentLink").value;

    fetch('/get-document?url=' + documentLink)
        .catch(err => console.log(err))
        .then(res => res.json())
        .then(res => {

            pdfjsLib.getDocument(res.fileName).then((pdf) => {
                myState.pdf = pdf;

                myState.currentPage = 1;
                myState.zoom = 1;

                document.getElementById("current_page").value = myState.currentPage;

                // more code here
                //console.log("render from start doc - load")
                render()
            }).catch((e) => {
                console.log('Error', e)
            })

        });
    }


    //this duplicated code should be refactored
    function visualizeDoc(documentLink){
        console.log("VisualizeDoc")

        fetch('/get-document?url=' + documentLink)
            .catch(err => console.log(err))
            .then(res => res.json())
            .then(res => {

                pdfjsLib.getDocument(res.fileName).then((pdf) => {
                    myState.pdf = pdf;

                    myState.currentPage = 1;
                    myState.zoom = 1;

                    document.getElementById("current_page").value = myState.currentPage;


                    // more code here
                    //console.log("render from visualize doc - load")
                    render()
                }).catch((e) => {
                    console.log('Error', e);
                })

            });
    }

function render() {
    myState.pdf.getPage(myState.currentPage).then((page) => {

        // more code here
        var canvasContainer = document.getElementById("canvas_container");
        var canvas = document.getElementById("pdf_renderer");
        var ctx = canvas.getContext('2d');

        //var viewport = page.getViewport(myState.zoom);
        var viewport = page.getViewport((canvasContainer.getBoundingClientRect().width / page.getViewport(1.0).width) * myState.zoom * 0.97 );
        console.log(canvasContainer.getBoundingClientRect().width);
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        page.render({
            canvasContext: ctx,
            viewport: viewport
        });

        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
        }


    });

}
