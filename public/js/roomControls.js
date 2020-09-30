function getRoom() {
    let roomName = document.getElementById("roomNameInput").value;

    window.open(roomName,"_self")
}

document.addEventListener("keydown", function(event) {
    //if (event.defaultPrevented) {
    // return; // Do nothing if event already handled
    //}
    switch(event.code) {
        case "Enter":
            // Handle "left"
            getRoom()
            break;
        default:
            //default
            break;
    }    // Consume the event so it doesn't get handled twice
    //event.preventDefault();
}, true);