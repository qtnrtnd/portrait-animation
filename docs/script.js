(async function () {
    const canvas = document.querySelector('canvas');
    const backgroundLightOverlay = document.querySelector('.light-overlay');
    const markersContainer = document.querySelector('.markers-container');
    const ctx = canvas.getContext('2d');

    const INITIAL_LIGHT_SIZE_FACTOR = 0.3;
    
    const params = {
        LIGHT_SIZE_FACTOR: INITIAL_LIGHT_SIZE_FACTOR,
        LIGHT_FALLOFF: 0,
        BACKGROUND_LIGHT_MAX_S: 25,
        BACKGROUND_LIGHT_MIN_S: 8,
        x: 0,
        y: 0
    }

    const imgDark = new Image();
    const imgLight = new Image();

    await new Promise(resolve => {

        imgDark.addEventListener("load", () => {
            imgLight.addEventListener("load", () => {
                resolve();
            })
            imgLight.src = "./img/portrait_light.jpg";
        })

        imgDark.src = "./img/portrait_dark.jpg";
    });

    document.body.style.removeProperty('visibility');

    function init() {
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imgDark, canvas.width / 2 - canvas.height / 2, 0, canvas.height, canvas.height);
        backgroundLightOverlay.style.removeProperty("background-image");
    }
    init();

    window.addEventListener('resize', init);

    function draw() {

        const imgX = canvas.width / 2 - canvas.height / 2;
        const x = params.x;
        const y = params.y

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let gradient = ctx.createRadialGradient(x, y, 0, x, y, params.LIGHT_SIZE_FACTOR * canvas.height);

        gradient.addColorStop(params.LIGHT_FALLOFF, 'black');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.globalCompositeOperation = 'source-in';
        
        ctx.drawImage(imgLight, imgX, 0, canvas.height, canvas.height);
    
        ctx.globalCompositeOperation = 'destination-over';
        
        ctx.drawImage(imgDark, imgX, 0, canvas.height, canvas.height);
    }

    document.body.addEventListener('mousemove', function (e) {

        const x = params.x = e.clientX;
        const y = params.y = e.clientY;

        const imgX = canvas.width / 2 - canvas.height / 2;

        let saturation = params.BACKGROUND_LIGHT_MIN_S +
            (
                y <= canvas.height / 2 ? (y / (canvas.height / 2)) : (((canvas.height / 2) - (y - canvas.height / 2)) / (canvas.height / 2))
            )
            * (params.BACKGROUND_LIGHT_MAX_S - params.BACKGROUND_LIGHT_MIN_S) *
            (
                x <= imgX ? (x / imgX) :
                    (
                        x >= imgX + canvas.height ? ((imgX - (x - (imgX + canvas.height))) / imgX) : 1
                    )
            );

        backgroundLightOverlay.style.backgroundImage = `radial-gradient(circle at ${x}px ${y}px, hsl(26, ${saturation}%, 30%) 0%, transparent ${params.LIGHT_SIZE_FACTOR * canvas.height}px)`;
            
        requestAnimationFrame(draw);
        
    });

    document.querySelectorAll(".marker").forEach(marker => {
        marker.addEventListener("mouseenter", function () {

            const visible = document.querySelector(".visible");

            if (visible) visible.classList.remove("visible");

            const svgTargetContainer = document.querySelector(`.svg-` + this.getAttribute('data-svg'));
            svgTargetContainer.classList.add("visible");

            svgTargetContainer.querySelector('animateTransform').beginElement();

            const color = svgTargetContainer.querySelector('svg').getAttribute('fill');

            document.body.style.backgroundColor = markersContainer.style.borderColor = color;

            markersContainer.classList.add('active-marker');

            gsap.to(params, {
                LIGHT_SIZE_FACTOR: 0.025,
                LIGHT_FALLOFF: 0.5,
                duration: 0.6,
                ease: "power4.out",
                onUpdate: draw
            });
        });
        marker.addEventListener("mouseleave", function () {

            document.body.style.removeProperty('background-color');

            markersContainer.classList.remove('active-marker');
            markersContainer.style.removeProperty('border-color');

            gsap.to(params, {
                LIGHT_SIZE_FACTOR: INITIAL_LIGHT_SIZE_FACTOR,
                LIGHT_FALLOFF: 0,
                duration: 0.6,
                ease: "power4.out",
                onUpdate: draw
            });
        });
    });
})()



