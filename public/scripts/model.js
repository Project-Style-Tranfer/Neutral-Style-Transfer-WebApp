const model = new mi.ArbitraryStyleTransferNetwork();
const canvas = document.getElementById('stylized');
const ctx = canvas.getContext('2d');
const contentImg = document.getElementById('content_image_display');
const styleImg = document.getElementById('style_image_display');

$(".transfer-btn").on('click', document.getElementById("dis-transfer").enabled = true, function () {
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
      document.getElementById("dis-transfer").disabled = false;
      ctx.putImageData(imageData, 0, 0);
      console.log(imageData);
      $('.hide').show();
  })
}

$(".btn-download").on('click', function() {
  var link = document.createElement('a');
  link.href = canvas.toDataURL("image/png");
  link.download = 'artistic.png';
  link.click();
})