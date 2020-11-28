const model = new mi.ArbitraryStyleTransferNetwork();
const canvas = document.getElementById('stylized');
const ctx = canvas.getContext('2d');
const contentImg = document.getElementById('content_image_display');
const styleImg = document.getElementById('style_image_display');

var prerequi = function() {
  $('.hide').hide(); 
  $('.loading-image').show();
  document.getElementById("dis-transfer").disabled = true;
}

$(".transfer-btn").on('click', function () {
    $('.hide').hide(); 
    $('.loading-image').show();
    document.getElementById("dis-transfer").disabled = true;
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
  model.stylize(contentImg, styleImg).then((imageData) => {
      $('.loading-image').hide();
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