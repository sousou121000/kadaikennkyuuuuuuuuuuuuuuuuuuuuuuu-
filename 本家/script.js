const bg = document.getElementById("movingBg");

if (bg){
    const images = bg.querySelectorAll("img")

    const speed = 25;

    let positions = [0,0];
    let imageWidth = 0;
    let lastTime = 0;

    function setup(){
        imagewidth = images[0].getBoundingClientRect().width;

        position[0] = 0;
        position[1] = imageWidth;

        images[0].styleleft = positions[0] + "px";
        images[1].styleleft = positions[1] + "px";
    }
    images[0].onload = setup;

    if (images[0].complete) {
        setup();
    }
    function animate(time){
        if (imagewidth > 0) {
            const delta = lastTime ? (time - lastTime) / 1000 : 0;
            lastTime = time;

            for (let i = 0; i < 2; i++){
                position[i] -= speed * delta;

                if (positions[i] <= -imageWidth) {
                    positions[i] += imageWidth * 2;
                }
                images[i].style.left = positions[i] + "px";
            }
        }
        requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
}