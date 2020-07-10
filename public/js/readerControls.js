var myState = {
    pdf: null,
    currentPage: 1,
    zoom: 1
}

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

                document.getElementById('go_previous').addEventListener('click', (e) => {
                    if(myState.pdf == null
                        || myState.currentPage == 1) return;
                    myState.currentPage -= 1;
                    document.getElementById("current_page")
                        .value = myState.currentPage;
                    //console.log("render from start doc - go previous")
                    render()
                });

                document.getElementById('go_next').addEventListener('click', (e) => {
                    if(myState.pdf == null
                        || myState.currentPage > myState.pdf
                            ._pdfInfo.numPages)
                        return;

                    myState.currentPage += 1;
                    document.getElementById("current_page")
                        .value = myState.currentPage;
                    //console.log("render from start doc - go next")
                    render()

                });

                // more code here
                //console.log("render from start doc - load")
                render()
            }).catch((e) => {
                console.log('Error', e)
            })

        });
    }

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
        var canvas = document.getElementById("pdf_renderer");
        var ctx = canvas.getContext('2d');

        var viewport = page.getViewport(myState.zoom);

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        page.render({
            canvasContext: ctx,
            viewport: viewport
        });

        /*if (context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
        }*/
    });

}