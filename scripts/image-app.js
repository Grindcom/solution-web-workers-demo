(function() {
        // http://stackoverflow.com/questions/10906734/how-to-upload-image-into-html5-canvas
        var original;
        var imageLoader = document.querySelector('#imageLoader');
        imageLoader.addEventListener('change', handleImage, false);
        var canvas = document.querySelector('#image');
        var ctx = canvas.getContext('2d');
        //
        // Create the Worker
        //  Set up a worker relationship with worker.js
        //
        var imageWorker = new Worker('scripts/worker.js');
        console.log("Made imageWorker.");
        //
        function handleImage(e) {
                var reader = new FileReader();
                reader.onload = function(event) {
                        var img = new Image();
                        img.onload = function() {
                                canvas.width = img.width;
                                canvas.height = img.height;
                                ctx.drawImage(img, 0, 0);
                                original = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        }
                        img.src = event.target.result;
                }
                reader.readAsDataURL(e.target.files[0]);
        }

        // greys out the buttons while manipulation is happening
        // un-greys out the buttons when the manipulation is done
        function toggleButtonsAbledness() {
                var buttons = document.querySelectorAll('button');
                for (var i = 0; i < buttons.length; i++) {
                        if (buttons[i].hasAttribute('disabled')) {
                                buttons[i].removeAttribute('disabled')
                        } else {
                                buttons[i].setAttribute('disabled', null);
                        }
                };
        }

        function manipulateImage(type) {
                var a, b, g, i, imageData, j, length, pixel, r, ref;
                imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                console.log("imageData: " + imageData.data);
                toggleButtonsAbledness();

                // Hint! This is where you should post messages to the web worker and

                // receive messages from the web worker.
                // If the browser supports the Worker
                //
                // Send message to Worker API
                myWorker.postMessage({
                        'imageData': imageData,
                        'type': type
                });
                console.log("Sent message to worker");
                //
                // Receive message from worker
                myWorker.onmessage = function(e) {
                        console.log("From Worker: " + e.data);
                        image = e.data;
                        if(image){
                                toggleButtonsAbledness();
                                return ctx.putImageData(imageData, 0, 0);
                        }
                        console.log("No image returned.");
                }
                //
                // Exception Handler
                //
                imageWorker.onerror = function(error){
                        function WorkerException(message){
                                this.name = "WorkerException";
                                this.message = message;
                        };
                        throw new WorkerException('Worker Error.');
                }
        };

        function revertImage() {
                return ctx.putImageData(original, 0, 0);
        }

        document.querySelector('#invert').onclick = function() {
                manipulateImage("invert");
        };
        document.querySelector('#chroma').onclick = function() {
                manipulateImage("chroma");
        };
        document.querySelector('#greyscale').onclick = function() {
                manipulateImage("greyscale");
        };
        document.querySelector('#vibrant').onclick = function() {
                manipulateImage("vibrant");
        };
        document.querySelector('#revert').onclick = function() {
                revertImage();
        };
})();
