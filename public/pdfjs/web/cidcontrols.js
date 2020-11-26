console.log("Cid Controls Active")

document.addEventListener(
    "keydown",
    function(event) {
      // if (event.defaultPrevented) {
      // return; // Do nothing if event already handled
      // }
      switch (event.code) {
        case "KeyD":
          // Handle "left"
          //webViewerNextPage();
          //eventBus.dispatch('nextpage');
          console.log(PDFViewerApplication.pdfViewer.eventBus.dispatch("nextpage"))

          console.log("D")
          break;
        case "KeyA":
          // Handle "left"
          //webViewerPreviousPage();
          //eventBus.dispatch('previouspage');
          console.log("A")
          console.log(PDFViewerApplication.pdfViewer.eventBus.dispatch("previouspage"))
          break;
        case "KeyL":
          //PDFViewerApplication.open('doc.pdf').then() //this opens a file by its url
          break;
        default:
          // default
          break;
      } // Consume the event so it doesn't get handled twice
      // event.preventDefault();
    },
    true
  );


