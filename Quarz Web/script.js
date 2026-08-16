document.addEventListener("DOMContentLoaded", () => {

    // Register GSAP ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    const header = document.getElementById("main-header");
    const quartzWrapper = document.querySelector(".quartz-wrapper");
    const canvas = document.getElementById("quartz-canvas");
    const ctx = canvas.getContext("2d");

    const lineUl = document.getElementById("line-ul");
    const lineUr = document.getElementById("line-ur");
    const lineLl = document.getElementById("line-ll");
    const lineLr = document.getElementById("line-lr");

    const nodeUlStart = document.getElementById("node-ul-start");
    const nodeUlEnd = document.getElementById("node-ul-end");
    const nodeUrStart = document.getElementById("node-ur-start");
    const nodeUrEnd = document.getElementById("node-ur-end");
    const nodeLlStart = document.getElementById("node-ll-start");
    const nodeLlEnd = document.getElementById("node-ll-end");
    const nodeLrStart = document.getElementById("node-lr-start");
    const nodeLrEnd = document.getElementById("node-lr-end");

    const titleUl = document.getElementById("title-ul");
    const titleUr = document.getElementById("title-ur");
    const titleLl = document.getElementById("title-ll");
    const titleLr = document.getElementById("title-lr");

    const mgLeft = document.getElementById("mg-left");
    const mgSecondBrain = document.getElementById("mg-second-brain");
    const mgRight = document.getElementById("mg-right");
    const mgReturnLeft = document.getElementById("mg-return-left");
    const mgReturnRight = document.getElementById("mg-return-right");

    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothTouch: true
    });

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Frame Sequence Loader for 100% Offline & file:/// Protocol Compatibility
    const numFrames = 56;
    const framesP1 = [];
    const framesP2 = [];
    let loadedCount = 0;

    function preloadFrames() {
        for (let i = 1; i <= numFrames; i++) {
            const numStr = String(i).padStart(3, '0');

            // Phase 1 Frames
            const img1 = new Image();
            img1.src = `media/frames/phase1/f_${numStr}.jpg`;
            img1.onload = checkLoaded;
            framesP1.push(img1);

            // Phase 2 Frames
            const img2 = new Image();
            img2.src = `media/frames/phase2/f_${numStr}.jpg`;
            img2.onload = checkLoaded;
            framesP2.push(img2);
        }
    }

    function checkLoaded() {
        loadedCount++;
        if (loadedCount === 1) {
            // Draw initial frame immediately
            drawFrame(1, 0);
        }
    }

    preloadFrames();

    function drawFrame(phase, progress) {
        const frameIdx = Math.min(numFrames - 1, Math.max(0, Math.floor(progress * (numFrames - 1))));
        const img = (phase === 1) ? framesP1[frameIdx] : framesP2[frameIdx];

        if (img && img.complete) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    }

    // ----------------------------------------------------------------------
    // Circuito dorado: Las líneas nacen justo sobre la punta de cada cuarzo.
    // Puntas de cuarzo en espacio de canvas 1024x1024 (normalizado 0..1):
    // - Cuarzo Izquierdo Interior (Crystal 2): x: 0.428, y: 0.218 (Línea Superior Izq)
    // - Cuarzo Derecho Interior (Crystal 4): x: 0.568, y: 0.218 (Línea Superior Der)
    // - Cuarzo Izquierdo Exterior (Crystal 1): x: 0.254, y: 0.410 (Línea Inferior Izq)
    // - Cuarzo Derecho Exterior (Crystal 5): x: 0.711, y: 0.410 (Línea Inferior Der)
    // ----------------------------------------------------------------------
    let lenUl = 0, lenUr = 0, lenLl = 0, lenLr = 0;

    function updateCircuitPaths() {
        const svg = document.getElementById("circuit-svg");
        const W = window.innerWidth;
        const H = window.innerHeight;
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

        const rUl = titleUl.getBoundingClientRect();
        const rUr = titleUr.getBoundingClientRect();
        const rLl = titleLl.getBoundingClientRect();
        const rLr = titleLr.getBoundingClientRect();

        // Posición y escala física real del canvas en pantalla
        const rCanvas = canvas.getBoundingClientRect();

        // Puntos de nacimiento anclados exactamente sobre la punta de cada cuarzo en el canvas
        const tipUl = { x: rCanvas.left + rCanvas.width * 0.245, y: rCanvas.top + rCanvas.height * 0.208 - 8 };
        const tipUr = { x: rCanvas.left + rCanvas.width * 0.754, y: rCanvas.top + rCanvas.height * 0.208 - 8 };
        const tipLl = { x: rCanvas.left + rCanvas.width * 0.040, y: rCanvas.top + rCanvas.height * 0.361 - 8 };
        const tipLr = { x: rCanvas.left + rCanvas.width * 0.955, y: rCanvas.top + rCanvas.height * 0.361 - 8 };

        // Canales verticales en los márgenes exteriores para conectar con los títulos
        const xLeftChannel = Math.max(16, Math.min(rUl.left, rLl.left) - Math.max(20, W * 0.02));
        const xRightChannel = Math.min(W - 16, Math.max(rUr.right, rLr.right) + Math.max(20, W * 0.02));

        // Niveles Y en el centro vertical de cada título
        const yUl = rUl.top + rUl.height / 2;
        const yUr = rUr.top + rUr.height / 2;
        const yLl = rLl.top + rLl.height / 2;
        const yLr = rLr.top + rLr.height / 2;

        function setPathAndNodes(line, nodeStart, nodeEnd, pts) {
            line.setAttribute("d", "M " + pts.map(p => p[0] + " " + p[1]).join(" L "));
            const startPt = pts[0];
            const endPt = pts[pts.length - 1];
            nodeStart.setAttribute("cx", startPt[0]);
            nodeStart.setAttribute("cy", startPt[1]);
            nodeEnd.setAttribute("cx", endPt[0]);
            nodeEnd.setAttribute("cy", endPt[1]);
        }

        // Superior Izquierda: Punta cuarzo interior izq -> izquierda -> sube -> termina en punto verde a la izq del título
        setPathAndNodes(lineUl, nodeUlStart, nodeUlEnd, [
            [tipUl.x, tipUl.y],
            [xLeftChannel, tipUl.y],
            [xLeftChannel, yUl],
            [rUl.left - 12, yUl]
        ]);

        // Superior Derecha: Punta cuarzo interior der -> derecha -> sube -> termina en punto verde a la der del título
        setPathAndNodes(lineUr, nodeUrStart, nodeUrEnd, [
            [tipUr.x, tipUr.y],
            [xRightChannel, tipUr.y],
            [xRightChannel, yUr],
            [rUr.right + 12, yUr]
        ]);

        // Inferior Izquierda: Punta cuarzo exterior izq -> izquierda -> baja -> termina en punto verde a la izq del título
        setPathAndNodes(lineLl, nodeLlStart, nodeLlEnd, [
            [tipLl.x, tipLl.y],
            [xLeftChannel, tipLl.y],
            [xLeftChannel, yLl],
            [rLl.left - 12, yLl]
        ]);

        // Inferior Derecha: Punta cuarzo exterior der -> derecha -> baja -> termina en punto verde a la der del título
        setPathAndNodes(lineLr, nodeLrStart, nodeLrEnd, [
            [tipLr.x, tipLr.y],
            [xRightChannel, tipLr.y],
            [xRightChannel, yLr],
            [rLr.right + 12, yLr]
        ]);

        lenUl = lineUl.getTotalLength();
        lenUr = lineUr.getTotalLength();
        lenLl = lineLl.getTotalLength();
        lenLr = lineLr.getTotalLength();

        gsap.set(lineUl, { strokeDasharray: lenUl, strokeDashoffset: lenUl });
        gsap.set(lineUr, { strokeDasharray: lenUr, strokeDashoffset: lenUr });
        gsap.set(lineLl, { strokeDasharray: lenLl, strokeDashoffset: lenLl });
        gsap.set(lineLr, { strokeDasharray: lenLr, strokeDashoffset: lenLr });
    }

    updateCircuitPaths();
    window.addEventListener("resize", () => {
        updateCircuitPaths();
        ScrollTrigger.refresh();
    });

    // ----------------------------------------------------------------------
    // Motion Graphics de Apertura (Entrada Inicial a la Página)
    // Muestra los dos motion graphics principales (second brain a la izq.
    // y texto manifiesto en bucle a la der.) al cargar la página.
    // Al primer scroll se desvanecen.
    // ----------------------------------------------------------------------
    let initialMotionDismissed = false;
    let initialMotionShown = false;

    function playSafe(video) {
        const p = video.play();
        if (p && p.catch) p.catch(() => { });
    }

    function revealInitialMotion() {
        if (initialMotionDismissed || initialMotionShown) return;
        initialMotionShown = true;
        gsap.killTweensOf([mgReturnLeft, mgReturnRight]);
        [mgReturnLeft, mgReturnRight].forEach((v) => {
            v.style.display = "";
            v.currentTime = 0;
            playSafe(v);
        });
        gsap.to([mgReturnLeft, mgReturnRight], { opacity: 1, duration: 0.6, ease: "power2.out" });
    }

    function dismissInitialMotion() {
        if (initialMotionDismissed) return;
        initialMotionDismissed = true;
        initialMotionShown = false;

        gsap.killTweensOf([mgReturnLeft, mgReturnRight]);
        gsap.to([mgReturnLeft, mgReturnRight], {
            opacity: 0,
            duration: 0.35,
            ease: "power2.out",
            onComplete: () => {
                [mgReturnLeft, mgReturnRight].forEach((v) => {
                    v.pause();
                    v.style.display = "none";
                });
            }
        });
    }

    // ----------------------------------------------------------------------
    // Motion Graphics del "Regreso al Inicio" (Tras hacer Scroll y volver)
    // Cuando el usuario baja y vuelve a subir a scroll 0, se dispara la
    // secuencia (manifiesto 3 bullets a la izquierda -> desliza a la derecha).
    // ----------------------------------------------------------------------
    let returnMotionShown = false;
    let secondMotionShown = false;
    let secondMotionTimeout = null;

    function showSecondMotion() {
        if (secondMotionShown || !returnMotionShown) return;
        secondMotionShown = true;
        mgRight.style.display = "";
        mgRight.currentTime = 0;
        playSafe(mgRight);
        gsap.to(mgRight, { opacity: 1, duration: 0.6, ease: "power2.out" });
    }

    function showReturnMotion() {
        // Sólo se activa tras haber hecho scroll al menos una vez (tras descartar la apertura)
        if (!initialMotionDismissed || returnMotionShown) return;
        returnMotionShown = true;
        secondMotionShown = false;

        gsap.killTweensOf([mgLeft, mgRight]);

        // Asegurar que mgRight esté oculto para iniciar la secuencia desde 0
        mgRight.pause();
        mgRight.style.display = "none";
        mgRight.style.opacity = "0";

        mgLeft.style.display = "";
        mgLeft.currentTime = 0;
        playSafe(mgLeft);
        gsap.to(mgLeft, { opacity: 1, duration: 0.6, ease: "power2.out" });

        mgLeft.addEventListener("ended", showSecondMotion, { once: true });

        const secs = (isFinite(mgLeft.duration) && mgLeft.duration > 0) ? mgLeft.duration : 5.4;
        if (secondMotionTimeout) clearTimeout(secondMotionTimeout);
        secondMotionTimeout = setTimeout(showSecondMotion, secs * 1000 + 600);
    }

    function hideReturnMotion() {
        if (!returnMotionShown) return;
        returnMotionShown = false;

        if (secondMotionTimeout) clearTimeout(secondMotionTimeout);

        gsap.killTweensOf([mgLeft, mgRight]);
        gsap.to([mgLeft, mgRight], {
            opacity: 0,
            duration: 0.35,
            ease: "power2.out",
            onComplete: () => {
                [mgLeft, mgRight].forEach((v) => {
                    v.pause();
                    v.style.display = "none";
                });
            }
        });
    }

    // Manejo unificado del Scroll para ocultar/mostrar según posición
    function handleScrollState(scrollPos) {
        if (scrollPos > 2) {
            dismissInitialMotion();
            hideReturnMotion();
        } else {
            showReturnMotion();
        }
    }

    lenis.on("scroll", ({ scroll }) => handleScrollState(scroll));
    window.addEventListener("wheel", () => {
        if (window.scrollY > 2) dismissInitialMotion();
    }, { passive: true });
    window.addEventListener("touchmove", () => {
        if (window.scrollY > 2) dismissInitialMotion();
    }, { passive: true });
    window.addEventListener("keydown", (e) => {
        if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)) {
            if (window.scrollY > 2) dismissInitialMotion();
        }
    });
    window.addEventListener("scroll", () => handleScrollState(window.scrollY), { passive: true });

    // ----------------------------------------------------------------------
    // Selección de sección — PASO 1
    //
    // Al hacer clic la página todavía NO navega. Ocurre esto, en un solo
    // gesto continuo: las otras 3 opciones se repliegan (el título se apaga
    // y su línea se comprime de vuelta hacia el cuarzo) y el cuarzo del
    // centro deja de estar pintado por el scroll para pasar al vídeo que
    // aísla el cuarzo de esa sección.
    //
    // Dos decisiones que hacen que se sienta transición y no corte:
    //
    // 1. El primer fotograma del vídeo es idéntico al último del canvas
    //    (la corona de 5). Así que el relevo canvas→vídeo es un cambio seco
    //    e invisible, no un crossfade — fundir dos capas `multiply` idénticas
    //    las oscurecería a mitad de camino.
    // 2. Para llegar a ese fotograma NO se mueve el scroll (se sentía brusco):
    //    se congela el ScrollTrigger y se termina de dibujar la corona a mano
    //    desde donde el scroll la hubiera dejado.
    // ----------------------------------------------------------------------
    const stateP1 = { progress: 0 };
    const stateP2 = { progress: 0 };
    let masterTL = null;

    const selectionVideo = document.getElementById("selection-video");
    let selectionInProgress = false;

    const CIRCUIT_GROUPS = [
        { title: titleUl, line: lineUl, nodes: [nodeUlStart, nodeUlEnd] },
        { title: titleUr, line: lineUr, nodes: [nodeUrStart, nodeUrEnd] },
        { title: titleLl, line: lineLl, nodes: [nodeLlStart, nodeLlEnd] },
        { title: titleLr, line: lineLr, nodes: [nodeLrStart, nodeLrEnd] }
    ];

    // Cambia canvas por vídeo en el mismo fotograma. Si el vídeo aún no tiene
    const singleQuartzImg = document.getElementById("single-quartz-img");
    const logoPrincipal = document.getElementById("logo-principal");
    const logoGoldWrapper = document.getElementById("logo-gold-wrapper");

    let activeSectionKey = "soluciones";

    const SECTION_CONFIGS = {
        "soluciones": {
            videoWebm: "media/videos/seleccion/transicion_soluciones_para_empresas.webm",
            videoMp4: "media/videos/seleccion/transicion_soluciones_para_empresas.mp4",
            singleImg: "media/images/cuarzo_soluciones_para_empresas.png",
            targetXRatio: 0.55,   // Deslice hacia la derecha (+55vw)
            targetYRatio: 0.02,
            targetScale: 0.62,
            tipXRatio: 0.30,      // Punta de cristal para soluciones (ajuste usuario)
            tipYRatio: 0.07,
            titleElem: titleUl,
            lineElem: lineUl,
            nodeStart: nodeUlStart,
            nodeEnd: nodeUlEnd,
            isRightSide: true
        },
        "metodologia": {
            videoWebm: "media/videos/seleccion/transicion_metodologia_de_trabajo.webm",
            videoMp4: "media/videos/seleccion/transicion_metodologia_de_trabajo.mp4",
            singleImg: "media/images/cuarzo_metodologia_de_trabajo.png",
            targetXRatio: -0.55,  // Deslice hacia la izquierda (-55vw)
            targetYRatio: 0.02,
            targetScale: 0.62,
            tipXRatio: 0.75,      // Punta de cristal para metodología (ajuste usuario)
            tipYRatio: 0.07,
            titleElem: titleUr,
            lineElem: lineUr,
            nodeStart: nodeUrStart,
            nodeEnd: nodeUrEnd,
            isRightSide: false
        },
        "b2c": {
            videoWebm: "media/videos/seleccion/quiebre_cuarzos_completo.webm",
            videoMp4: "media/videos/seleccion/quiebre_cuarzos_completo.mp4",
            singleImg: "media/images/cuarzo_producto_b2c.png",
            targetXRatio: 0,
            targetYRatio: 0,
            targetScale: 0.62,
            tipXRatio: 0.50,
            tipYRatio: 0.10,
            titleElem: titleLl,
            lineElem: lineLl,
            nodeStart: nodeLlStart,
            nodeEnd: nodeLlEnd,
            isBottomLeft: true,
            noQuartz: true
        },
        "partners": {
            videoWebm: "media/videos/seleccion/quiebre_cuarzos_completo.webm",
            videoMp4: "media/videos/seleccion/quiebre_cuarzos_completo.mp4",
            singleImg: "media/images/cuarzo_hub_de_partners.png",
            targetXRatio: 0,
            targetYRatio: 0,
            targetScale: 0.62,
            tipXRatio: 0.50,
            tipYRatio: 0.10,
            titleElem: titleLr,
            lineElem: lineLr,
            nodeStart: nodeLrStart,
            nodeEnd: nodeLrEnd,
            isBottomRight: true,
            noQuartz: true
        }
    };

    let lineProgress = { value: 0 };

    // Recálculo dinámico en tiempo real de la línea dorada creciendo orgánicamente y persiguiendo la punta
    function updateSlidingLine() {
        const cfg = SECTION_CONFIGS[activeSectionKey] || SECTION_CONFIGS["soluciones"];
        const svg = document.getElementById("circuit-svg");
        const W = window.innerWidth;
        const H = window.innerHeight;
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

        const rTitle = cfg.titleElem.getBoundingClientRect();
        const rQ = singleQuartzImg.getBoundingClientRect();
        const p = lineProgress.value;

        if (cfg.isBottomLeft || cfg.isBottomRight) {
            singleQuartzImg.style.opacity = "0";

            const startX = cfg.isBottomLeft ? (rTitle.left + 15) : (rTitle.right - 15);
            const startY = rTitle.top - 12;
            const yChannel = H * 0.08;
            const endX = cfg.isBottomLeft ? (W * 0.66) : (W * 0.34);

            let currentX = startX;
            let currentY = startY;
            let pts = [[startX, startY]];

            if (p <= 0.35) {
                const subP = p / 0.35;
                currentY = startY + (yChannel - startY) * subP;
                pts.push([startX, currentY]);
            } else {
                const subP = (p - 0.35) / 0.65;
                currentY = yChannel;
                currentX = startX + (endX - startX) * subP;
                pts.push([startX, yChannel]);
                pts.push([currentX, yChannel]);
            }

            cfg.lineElem.setAttribute("d", "M " + pts.map(pt => pt[0] + " " + pt[1]).join(" L "));
            cfg.lineElem.style.strokeDasharray = "none";
            cfg.lineElem.style.strokeDashoffset = "0";
            cfg.lineElem.style.opacity = "1";

            cfg.nodeStart.setAttribute("cx", startX);
            cfg.nodeStart.setAttribute("cy", startY);
            cfg.nodeStart.style.opacity = "1";

            cfg.nodeEnd.setAttribute("cx", currentX);
            cfg.nodeEnd.setAttribute("cy", currentY);
            cfg.nodeEnd.style.opacity = (p > 0.05) ? "1" : "0";
            return;
        }

        // --- SOLUCIONES Y METODOLOGÍA: DIBUJADO PROGRESIVO EN 3 TRAMOS ---
        const startX = cfg.isRightSide ? (rTitle.left + 15) : (rTitle.right - 15);
        const startY = rTitle.bottom + 10;
        const yChannel = startY + 24;

        // Punta del cuarzo en tiempo real
        const currentTipX = rQ.left + rQ.width * cfg.tipXRatio;
        const currentTipY = rQ.top + rQ.height * cfg.tipYRatio;

        const L1 = 24; // Tramo 1 vertical hacia abajo
        const L2 = Math.abs(currentTipX - startX); // Tramo 2 horizontal a través del viewport
        const L3 = Math.max(0, currentTipY - yChannel); // Tramo 3 vertical directo a la punta
        const totalL = L1 + L2 + L3;

        const currentDist = p * totalL;
        let pts = [[startX, startY]];
        let headX = startX;
        let headY = startY;

        if (currentDist <= L1) {
            headY = startY + currentDist;
            pts.push([startX, headY]);
        } else if (currentDist <= L1 + L2) {
            const d2 = currentDist - L1;
            const dirX = (currentTipX >= startX) ? 1 : -1;
            headY = yChannel;
            headX = startX + dirX * d2;
            pts.push([startX, yChannel]);
            pts.push([headX, yChannel]);
        } else {
            const d3 = currentDist - (L1 + L2);
            headX = currentTipX;
            headY = yChannel + d3;
            pts.push([startX, yChannel]);
            pts.push([currentTipX, yChannel]);
            pts.push([currentTipX, headY]);
        }

        cfg.lineElem.setAttribute("d", "M " + pts.map(pt => pt[0] + " " + pt[1]).join(" L "));
        cfg.lineElem.style.strokeDasharray = "none";
        cfg.lineElem.style.strokeDashoffset = "0";
        cfg.lineElem.style.opacity = "1";

        cfg.nodeStart.setAttribute("cx", startX);
        cfg.nodeStart.setAttribute("cy", startY);
        cfg.nodeStart.style.opacity = "1";

        cfg.nodeEnd.setAttribute("cx", headX);
        cfg.nodeEnd.setAttribute("cy", headY);
        cfg.nodeEnd.style.opacity = (p > 0.04) ? "1" : "0";
    }

    function startQuartzSlideTransition(targetHref) {
        const cfg = SECTION_CONFIGS[activeSectionKey] || SECTION_CONFIGS["soluciones"];

        if (cfg.noQuartz) {
            singleQuartzImg.style.opacity = "0";
            gsap.to(selectionVideo, { opacity: 0, duration: 0.25, ease: "power1.out" });
        } else {
            singleQuartzImg.style.opacity = "1";
            gsap.to(selectionVideo, { opacity: 0, duration: 0.25, ease: "power1.out" });
        }

        // Apagar líneas y nodos secundarios
        const secondaryLines = [lineUl, lineUr, lineLl, lineLr, nodeUlStart, nodeUlEnd, nodeUrStart, nodeUrEnd, nodeLlStart, nodeLlEnd, nodeLrStart, nodeLrEnd]
            .filter(el => el !== cfg.lineElem && el !== cfg.nodeStart && el !== cfg.nodeEnd);
        gsap.set(secondaryLines, { opacity: 0 });

        lineProgress.value = 0;

        // Establecer origen de transformación homogéneo para el cuarzo
        gsap.set(singleQuartzImg, { xPercent: -50, yPercent: 0, transformOrigin: "center bottom" });

        // Única línea temporal fluida (60fps continuous easing)
        const slideTL = gsap.timeline({
            onUpdate: updateSlidingLine,
            onComplete: () => {
                if (targetHref && targetHref !== "#") {
                    window.location.href = targetHref;
                }
            }
        });

        if (cfg.isBottomLeft || cfg.isBottomRight) {
            // 1. Mover suavemente el título hacia abajo a su cota exacta de subpágina (bottom: 6vh)
            const titleElem = cfg.titleElem;
            const rTitle = titleElem.getBoundingClientRect();
            const targetTop = window.innerHeight - (window.innerHeight * 0.06 + rTitle.height);
            const deltaY = targetTop - rTitle.top;

            slideTL.to(titleElem, {
                y: `+=${deltaY > 0 ? deltaY : 20}`,
                duration: 0.65,
                ease: "power2.inOut"
            }, 0);

            // 2. Crecimiento orgánico de la línea (0 a 1) desplegándose hacia arriba y al canal horizontal
            slideTL.to(lineProgress, {
                value: 1,
                duration: 1.3,
                ease: "power2.inOut"
            }, 0.1);
        } else {
            // 1. Crecimiento orgánico de la línea dorada cruzando la pantalla
            slideTL.to(lineProgress, {
                value: 1,
                duration: 1.35,
                ease: "power2.inOut"
            }, 0.05);

            // 2. Desplazamiento orgánico del cuarzo hacia la derecha o izquierda
            slideTL.to(singleQuartzImg, {
                x: window.innerWidth * cfg.targetXRatio,
                y: window.innerHeight * cfg.targetYRatio,
                scale: cfg.targetScale,
                duration: 1.35,
                ease: "power2.inOut"
            }, 0);
        }

        // Transición del logo: fade-out del logo negro centrado y fade-in del logo dorado
        slideTL.to(logoPrincipal, {
            opacity: 0,
            duration: 0.45,
            ease: "power2.out"
        }, 0);

        const goldLogoSol = document.getElementById("logo-gold-wrapper-soluciones");
        const goldLogoMet = document.getElementById("logo-gold-wrapper-metodologia");
        const targetGoldLogo = (activeSectionKey === "soluciones") ? goldLogoSol : (activeSectionKey === "metodologia" ? goldLogoMet : null);
        if (targetGoldLogo) {
            slideTL.to(targetGoldLogo, {
                opacity: 1,
                duration: 0.6,
                ease: "power2.out"
            }, 0.2);
        }
    }

    function handOffToVideo(targetHref) {
        function swap() {
            selectionVideo.style.opacity = "1";
            canvas.style.opacity = "0";
            playSafe(selectionVideo);

            let slideTriggered = false;
            const triggerSlide = () => {
                if (slideTriggered) return;
                slideTriggered = true;
                startQuartzSlideTransition(targetHref);
            };

            // Disparar el deslice orgánico y el trazado de la línea a los 2.0s de vídeo
            const checkTime = () => {
                if (selectionVideo.currentTime >= 2.0) {
                    selectionVideo.removeEventListener("timeupdate", checkTime);
                    triggerSlide();
                }
            };
            selectionVideo.addEventListener("timeupdate", checkTime);
            selectionVideo.addEventListener("ended", triggerSlide, { once: true });
            setTimeout(triggerSlide, 2400);
        }
        if (selectionVideo.readyState >= 2) swap();
        else selectionVideo.addEventListener("canplay", swap, { once: true });
    }

    function playSelection(group) {
        if (selectionInProgress) return;
        selectionInProgress = true;

        if (group.title === titleUl) activeSectionKey = "soluciones";
        else if (group.title === titleUr) activeSectionKey = "metodologia";
        else if (group.title === titleLl) activeSectionKey = "b2c";
        else if (group.title === titleLr) activeSectionKey = "partners";
        else activeSectionKey = "soluciones";

        const cfg = SECTION_CONFIGS[activeSectionKey];
        singleQuartzImg.src = cfg.singleImg;

        // Aplicar máscara radial únicamente a las secciones inferiores (B2C y Partners)
        if (cfg.noQuartz) {
            selectionVideo.style.webkitMaskImage = "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0) 97%)";
            selectionVideo.style.maskImage = "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0) 97%)";
        } else {
            selectionVideo.style.webkitMaskImage = "none";
            selectionVideo.style.maskImage = "none";
        }

        const sources = selectionVideo.querySelectorAll("source");
        if (sources.length >= 2) {
            sources[0].src = cfg.videoWebm;
            sources[1].src = cfg.videoMp4;
            selectionVideo.load();
        }

        const targetHref = group.title.getAttribute("href");

        // Congelar el mundo interactivo
        lenis.stop();
        if (masterTL && masterTL.scrollTrigger) masterTL.scrollTrigger.kill(false);
        CIRCUIT_GROUPS.forEach((g) => { g.title.style.pointerEvents = "none"; });

        dismissInitialMotion();
        hideReturnMotion();

        try { selectionVideo.currentTime = 0; } catch (e) { /* aún sin metadata */ }

        const others = CIRCUIT_GROUPS.filter((g) => g !== group);
        const tl = gsap.timeline();

        // 1) Terminar de abrir la corona si el scroll estaba incompleto
        const remaining = 1 - stateP2.progress;
        if (remaining > 0.01) {
            tl.to(stateP2, {
                progress: 1,
                duration: 0.2 + 0.5 * remaining,
                ease: "power2.inOut",
                onUpdate: () => drawFrame(2, stateP2.progress)
            }, 0);
        }

        // 2) Retirar otras opciones
        tl.to(others.map((g) => g.title), {
            opacity: 0,
            y: -6,
            duration: 0.3,
            ease: "power2.in",
            stagger: 0.04
        }, 0.05);

        // 3) Replegar y desvanecer todas las líneas iniciales del héroe limpiamente
        CIRCUIT_GROUPS.forEach((g, i) => {
            tl.to(g.nodes, { opacity: 0, duration: 0.2, ease: "none" }, 0.08 + i * 0.03);
            tl.to(g.line, {
                strokeDashoffset: g.line.getTotalLength ? g.line.getTotalLength() : 500,
                opacity: 0,
                duration: 0.35,
                ease: "power2.in"
            }, 0.08 + i * 0.03);
        });

        // 4) Relevo al vídeo de aislación de cuarzo
        tl.call(() => handOffToVideo(targetHref), null, 0.5);
    }

    CIRCUIT_GROUPS.forEach((group) => {
        group.title.addEventListener("click", (e) => {
            e.preventDefault();
            playSelection(group);
        });
    });

    // Fast Intro Load Animation
    const introTL = gsap.timeline({
        onComplete: () => {
            initScrollTimeline();
            revealInitialMotion();
        }
    });

    introTL
        .to(header, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out"
        })
        .to(quartzWrapper, {
            y: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.5");

    // Master ScrollTrigger Timeline
    function initScrollTimeline() {
        masterTL = gsap.timeline({
            scrollTrigger: {
                trigger: ".scroll-track",
                start: "top top",
                end: "bottom bottom",
                scrub: 1.2
            }
        });

        masterTL
            // ----------------------------------------------------
            // Paso 1 (0% a 25% Scroll): Canvas Frame Scrubbing (1 -> 3 Cuarzos)
            // ----------------------------------------------------
            .to(stateP1, {
                progress: 1,
                ease: "none",
                duration: 0.25,
                onUpdate: () => drawFrame(1, stateP1.progress)
            }, 0)

            // ----------------------------------------------------
            // Paso 2 (25% a 50% Scroll): Trazado SVG Superior + Nodos + Títulos
            // ----------------------------------------------------
            .to([nodeUlStart, nodeUrStart], {
                opacity: 1,
                duration: 0.04
            }, 0.24)
            .to([lineUl, lineUr], {
                strokeDashoffset: 0,
                ease: "power2.out",
                duration: 0.16
            }, 0.25)
            .to([nodeUlEnd, nodeUrEnd], {
                opacity: 1,
                duration: 0.04
            }, 0.38)
            .to([titleUl, titleUr], {
                opacity: 1,
                y: 0,
                duration: 0.12,
                stagger: 0.04
            }, 0.36)

            // ----------------------------------------------------
            // Paso 3 (50% a 75% Scroll): Canvas Frame Scrubbing (3 -> 5 Cuarzos)
            // ----------------------------------------------------
            .to(stateP2, {
                progress: 1,
                ease: "none",
                duration: 0.25,
                onUpdate: () => drawFrame(2, stateP2.progress)
            }, 0.50)

            // ----------------------------------------------------
            // Paso 4 (75% a 100% Scroll): Trazado SVG Inferior + Nodos + Títulos
            // ----------------------------------------------------
            .to([nodeLlStart, nodeLrStart], {
                opacity: 1,
                duration: 0.04
            }, 0.74)
            .to([lineLl, lineLr], {
                strokeDashoffset: 0,
                ease: "power2.out",
                duration: 0.16
            }, 0.75)
            .to([nodeLlEnd, nodeLrEnd], {
                opacity: 1,
                duration: 0.04
            }, 0.88)
            .to([titleLl, titleLr], {
                opacity: 1,
                y: 0,
                duration: 0.12,
                stagger: 0.04
            }, 0.86);
    }

});
