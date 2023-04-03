import { useLayoutEffect, useRef, useEffect } from "react";
import "./App.css";
import { gsap } from "gsap";

function App() {
  let currentImg: EventTarget | null = null;
  let currentImgProps = { x: 0, y: 0 };
  let isZooming = false;
  let column = -1;
  let mouse = { x: 0, y: 0 };
  let delayedPlay: gsap.core.Tween;

  const mainBoxes = useRef<HTMLDivElement>(null);

  const init = () => {
    for (let i = 0; i < 12; i++) {
      if (i % 4 == 0) column++;

      const b = document.createElement("div");
      document.getElementById("mainBoxes")?.append(b);

      gsap.set(b, {
        attr: { id: "b" + i, class: "photoBox pb-col" + column },
        backgroundImage: "url(https://assets.codepen.io/721952/" + i + ".jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        overflow: "hidden",
        x: [60, 280, 500][column],
        width: 400,
        height: 640,
        borderRadius: 20,
        scale: 0.5,
        zIndex: 1,
      });

      //@ts-ignore
      b.tl = gsap
        .timeline({ paused: true, repeat: -1 })
        .fromTo(
          b,
          { y: [-575, 800, 800][column], rotation: -0.05 },
          {
            duration: [40, 35, 26][column],
            y: [800, -575, -575][column],
            rotation: 0.05,
            ease: "none",
          }
        )
        .progress((i % 4) / 4);
    }
  };

  const mousemoveEL = (e: Event) => {
    mouse.x = (e as Event & { x: number; layerY: number }).x;
    mouse.y = (e as Event & { x: number; layerY: number }).layerY;
    if (currentImg) {
      gsap.to(".mainClose", {
        duration: 0.1,
        x: mouse.x,
        y: mouse.y,
        overwrite: "auto",
      });
    }
  };

  const mouseenterEL = (e: Event) => {
    if (currentImg) return;
    if (delayedPlay) delayedPlay.kill();
    pauseBoxes(e.currentTarget as Element);
    const _t = e.currentTarget;
    gsap.to(".photoBox", {
      duration: 0.2,
      overwrite: "auto",
      opacity: function (i, t) {
        return t == _t ? 1 : 0.33;
      },
    });
    gsap.fromTo(
      _t,
      { zIndex: 100 },
      { duration: 0.2, scale: 0.62, overwrite: "auto", ease: "power3" }
    );
  };

  const mouseleaveEL = (e: Event) => {
    if (currentImg) return;
    const _t = e.currentTarget;

    if ((gsap.getProperty(_t, "scale") as number) > 0.62)
      delayedPlay = gsap.delayedCall(0.3, playBoxes);
    // to avoid jump, add delay when mouseout occurs as big image scales back down (not 100% reliable because the scale value sometimes evaluates too late)
    else playBoxes();

    gsap
      .timeline()
      .set(_t, { zIndex: 1 })
      .to(_t, { duration: 0.3, scale: 0.5, overwrite: "auto", ease: "expo" }, 0)
      .to(".photoBox", { duration: 0.5, opacity: 1, ease: "power2.inOut" }, 0);
  };

  const clickEL = (e: Event) => {
    if (!isZooming) {
      //only tween if photoBox isn't currently zooming

      isZooming = true;
      gsap.delayedCall(0.8, function () {
        isZooming = false;
      });

      if (currentImg) {
        gsap
          .timeline({ defaults: { ease: "expo.inOut" } })
          .to(".mainClose", { duration: 0.1, autoAlpha: 0, overwrite: true }, 0)
          .to(
            ".mainBoxes",
            {
              duration: 0.5,
              scale: 1,
              left: "75%",
              width: 1200,
              rotationX: 14,
              rotationY: -15,
              rotationZ: 10,
              overwrite: true,
            },
            0
          )
          .to(
            ".photoBox",
            { duration: 0.6, opacity: 1, ease: "power4.inOut" },
            0
          )
          .to(
            currentImg,
            {
              duration: 0.6,
              width: 400,
              height: 640,
              borderRadius: 20,
              x: currentImgProps.x,
              y: currentImgProps.y,
              scale: 0.5,
              rotation: 0,
              zIndex: 1,
            },
            0
          );
        // .add(playBoxes, 0.8)
        currentImg = null;
      } else {
        pauseBoxes(e.currentTarget as Element);

        currentImg = e.currentTarget;
        currentImgProps.x = gsap.getProperty(currentImg, "x") as number;
        currentImgProps.y = gsap.getProperty(currentImg, "y") as number;

        gsap
          .timeline({ defaults: { duration: 0.6, ease: "expo.inOut" } })
          .set(currentImg, { zIndex: 100 })
          .fromTo(
            ".mainClose",
            { x: mouse.x, y: mouse.y, background: "rgba(0,0,0,0)" },
            { autoAlpha: 1, duration: 0.3, ease: "power3.inOut" },
            0
          )
          .to(".photoBox", { opacity: 0 }, 0)
          .to(
            currentImg,
            {
              width: "100%",
              height: "100%",
              borderRadius: 0,
              x: 0,
              top: 0,
              y: 0,
              scale: 1,
              opacity: 1,
            },
            0
          )
          .to(
            ".mainBoxes",
            {
              duration: 0.5,
              left: "50%",
              width: "100%",
              rotationX: 0,
              rotationY: 0,
              rotationZ: 0,
            },
            0.15
          )
          .to(
            ".mainBoxes",
            { duration: 5, scale: 1.06, rotation: 0.05, ease: "none" },
            0.65
          );
      }
    }
  };

  const setupGsap = () => {
    const _t1 = gsap
      .timeline({ onStart: playBoxes })
      .set(".main", { perspective: 800 })
      .set(".photoBox", { opacity: 1, cursor: "pointer" })
      .set(".mainBoxes", {
        left: "75%",
        xPercent: -50,
        width: 1200,
        rotationX: 14,
        rotationY: -15,
        rotationZ: 10,
      })
      .set(".mainClose", {
        autoAlpha: 0,
        width: 60,
        height: 60,
        left: -30,
        top: -31,
        pointerEvents: "none",
      })
      .fromTo(
        ".main",
        { autoAlpha: 0 },
        { duration: 0.6, ease: "power2.inOut", autoAlpha: 1 },
        0.2
      );

    Array.from(document.getElementsByClassName("photoBox")).forEach(
      (photoBox) => {
        photoBox.addEventListener("mouseenter", mouseenterEL);
        photoBox.addEventListener("mouseleave", mouseleaveEL);
        photoBox.addEventListener("click", clickEL);
      }
    );

    if (!!("ontouchstart" in window)) {
      console.log("touch device!");
      mouse.x = window.innerWidth - 50;
      mouse.y = 60;
    } else {
      document
        .getElementsByClassName("main")[0]
        .addEventListener("mousemove", mousemoveEL);
    }

    return _t1;
  };

  useLayoutEffect(() => {
    init();
    return () => {
      const mainBoxes = document.getElementById("mainBoxes");
      if (mainBoxes) {
        mainBoxes.innerHTML = "";
      }
    };
  }, []);

  useEffect(() => {
    const _tl = setupGsap();
    return () => {
      _tl.clear();
    };
  }, []);

  const playBoxes = () => {
    for (let i = 0; i < (mainBoxes.current?.childElementCount ?? 0); i++) {
      const tl = (mainBoxes.current?.children[i] as Element & { tl: any }).tl;
      tl.play();
      gsap.to(tl, {
        duration: 0.4,
        timeScale: 1,
        ease: "sine.in",
        overwrite: true,
      });
    }
  };

  const pauseBoxes = (b: Element) => {
    let classStr = "pb-col0";
    if (b.classList.contains("pb-col1")) classStr = "pb-col1";
    if (b.classList.contains("pb-col2")) classStr = "pb-col2";
    for (let i = 0; i < (mainBoxes.current?.childElementCount ?? 0); i++) {
      let _b = mainBoxes.current?.children[i];
      if (_b && _b.classList.contains(classStr))
        gsap.to((_b as Element & { tl: any }).tl, {
          timeScale: 0,
          ease: "sine",
        });
    }
  };

  return (
    <div className="main">
      <div ref={mainBoxes} id="mainBoxes" className="mainBoxes fs"></div>
      <div className="mainClose">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xlinkHref="http://www.w3.org/1999/xlink"
          width="100%"
          height="100%"
          fill="none"
        >
          <circle cx="30" cy="30" r="30" fill="#000" opacity="0.4" />
          <path
            d="M15,16L45,46 M45,16L15,46"
            stroke="#000"
            strokeWidth="3.5"
            opacity="0.5"
          />
          <path d="M15,15L45,45 M45,15L15,45" stroke="#fff" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

export default App;
