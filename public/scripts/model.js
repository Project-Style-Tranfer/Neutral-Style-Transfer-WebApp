const model = new mi.ArbitraryStyleTransferNetwork();
const canvas = document.getElementById('stylized');
const ctx = canvas.getContext('2d');
const contentImg = document.getElementById('content_image_display');
const styleImg = document.getElementById('style_image_display');

$(".transfer-btn").on('click', function () {
  model.initialize().then(() => {
    stylize();
  });
});
 
async function stylize() {
  // await clearCanvas();
   
  // Resize the canvas to be the same size as the source image.
  canvas.width = contentImg.width;
  canvas.height = contentImg.height;
   
  // This does all the work!
  model.stylize(contentImg, styleImg, 0.8).then((imageData) => {
      ctx.putImageData(imageData, 0, 0);
      console.log(imageData);
  })
}

function downloadCanvas(link, canvasId, filename) {
  link.href = document.getElementById(canvasId).toDataURL();
  link.download = filename;
}

$(".btn-download").on('click', function() {
  var img = canvas.toDataURL("image/png");
  document.body.appendChild('<img src="'+img+'"/>');
  // document.body.appendChild(img);
  // downloadCanvas(this, 'stylized', 'test.jpg');
})