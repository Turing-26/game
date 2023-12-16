import React, { useState, useEffect, useRef } from "react";
import PixelatedButton from "./components/pixelatedButton/pixelatedButton";
import PixelBubble from "./components/pixelBubble/pixelBubble";
import "./App.css";

const App = () => {
  const canvasRef = useRef(null);
  let snowEffect;

  function isChildInsideParent(child, parent, direction = 0) {
    const childRect = child.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    const isInside = direction
      ? childRect.left >= parentRect.left
      : childRect.right <= parentRect.right;

    return isInside;
  }

  function areElementsIntersecting(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  const delay = (ms) => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), ms);
    });
  };

  useEffect(() => {
    snowEffect = {
      el: canvasRef.current,
      density: 10000,
      maxHSpeed: 5,
      minFallSpeed: 2,
      canvas: null,
      ctx: null,
      particles: [],
      colors: [],
      mp: 1,
      quit: false,
      init() {
        this.canvas = this.el;
        this.ctx = this.canvas.getContext("2d");
        this.reset();
        requestAnimationFrame(this.render.bind(this));
        window.addEventListener("resize", this.reset.bind(this));
      },
      reset() {
        this.w = window.innerWidth;
        this.h = window.innerHeight;
        this.canvas.width = this.w;
        this.canvas.height = this.h;
        this.particles = [];
        this.mp = Math.ceil((this.w * this.h) / this.density);
        for (var i = 0; i < this.mp; i++) {
          var size = Math.random() * 4 + 5;
          this.particles.push({
            x: Math.random() * this.w,
            y: Math.random() * this.h,
            w: size,
            h: size,
            vy: this.minFallSpeed + Math.random(),
            vx: Math.random() * this.maxHSpeed - this.maxHSpeed / 2,
            fill: "#ffffff",
            s: Math.random() * 0.2 - 0.1,
          });
        }
      },

      render() {
        this.ctx.clearRect(0, 0, this.w, this.h);
        this.particles.forEach((p, i) => {
          p.y += p.vy;
          p.x += p.vx;
          this.ctx.fillStyle = p.fill;
          this.ctx.fillRect(p.x, p.y, p.w, p.h);
          if (p.x > this.w + 5 || p.x < -5 || p.y > this.h) {
            p.x = Math.random() * this.w;
            p.y = -10;
          }
        });
        if (this.quit) {
          return;
        }
        requestAnimationFrame(this.render.bind(this));
      },
      destroy() {
        this.quit = true;
      },
    };

    snowEffect.init();

    return () => {
      snowEffect.destroy();
    };
  }, []);

  const heroRef = useRef(null);
  const gameRef = useRef(null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const forwardImgRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const backImgRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const leftImgRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const rightImgRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [curCharIndex, setCurCharIndex] = useState(0);
  const gameAreaRef = useRef(null);
  const charRef = useRef(null);
  const charSpeechRef = useRef(null);
  const [displayedText, setDisplayedText] = useState("");
  const [anim1, setAnim1] = useState(false);

  const handleTranslate = () => {
    setSectionIndex((sectionIndex + 1) % 2);
    heroRef.current.style.transform = "translateY(-100%)";
    gameRef.current.style.transform = "translateY(-100%)";
  };

  useEffect(() => {
    const handleKeyPress = (event) => {
      const movementMap = {
        ArrowUp: { index: 12, refs: backImgRefs },
        ArrowDown: { index: 0, refs: forwardImgRefs },
        ArrowLeft: { index: 4, refs: leftImgRefs },
        ArrowRight: { index: 8, refs: rightImgRefs },
      };

      const movement = movementMap[event.key];
      if (movement) {
        const { index, refs } = movement;

        [forwardImgRefs, backImgRefs, leftImgRefs, rightImgRefs]
          .flat()
          .forEach((ref) => {
            ref.current.classList.remove("game__char--root");
            ref.current.classList.add("game__char--noroot");
          });

        refs[curCharIndex % 4].current.classList.add("game__char--root");
        refs[curCharIndex % 4].current.classList.remove("game__char--noroot");

        if (
          event.key === "ArrowLeft" &&
          isChildInsideParent(charRef.current, gameAreaRef.current, 1)
        ) {
          const currentLeft =
            parseInt(window.getComputedStyle(charRef.current).left, 10) || 0;
          charRef.current.style.left = `${currentLeft - 15}px`;
        } else if (
          event.key === "ArrowRight" &&
          isChildInsideParent(charRef.current, gameAreaRef.current)
        ) {
          const currentLeft =
            parseInt(window.getComputedStyle(charRef.current).left, 10) || 0;
          charRef.current.style.left = `${currentLeft + 15}px`;
        }

        setCurCharIndex((curCharIndex + 1) % 4);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [curCharIndex]);

  const [points, setPoints] = useState(0);
  const vendingRef = useRef(null);
  const starRef = useRef(null);
  const [animateVending, setAnimateVending] = useState(true);
  const keyDownTimeRef = useRef(null);

  const handleStarStart = (event) => {
    if (
      event.key === "ArrowUp" &&
      areElementsIntersecting(vendingRef.current, charRef.current) &&
      !keyDownTimeRef.current
    )
      keyDownTimeRef.current = Date.now();
  };

  const handleStarEnd = (event) => {
    if (
      event.key === "ArrowUp" &&
      areElementsIntersecting(vendingRef.current, charRef.current) &&
      keyDownTimeRef.current
    ) {
      const duration = Date.now() - keyDownTimeRef.current;
      keyDownTimeRef.current = null;

      if (duration >= 2000) {
        starRef.current.style.display = "block";
        setAnimateVending(false);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleStarStart);
    window.addEventListener("keyup", handleStarEnd);

    return () => {
      window.removeEventListener("keydown", handleStarStart);
      window.removeEventListener("keyup", handleStarEnd);
    };
  }, [keyDownTimeRef]);

  const handleStarCollect = (event) => {
    const display = starRef.current.style.display;
    if (
      areElementsIntersecting(starRef.current, charRef.current) &&
      display === "block"
    ) {
      starRef.current.style.display = "none";
      setPoints(points + 1);
    }
  };

  const typeText = async (text) => {
    for (let i = 0; i < text.length; i++) {
      setDisplayedText((prevText) => prevText + text[i]);
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
  };

  const vendingSpeechTrigger = async () => {
    if (
      areElementsIntersecting(vendingRef.current, charRef.current) &&
      points === 0 &&
      !anim1
    ) {
      console.log(true);
      const speech = charSpeechRef.current;
      speech.style.display = "block";
      setAnim1(true);
      await typeText("Why is this vending machine moving???");
      await delay(1200);
      setDisplayedText("");
      await typeText("AND WHY IS THERE A CAT INSIDEE!!!");
      await delay(1200);
      setDisplayedText("");
      speech.style.display = "none";
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleStarCollect);
    // window.addEventListener("keydown", vendingSpeechTrigger);

    return () => {
      window.removeEventListener("keydown", handleStarCollect);
      // window.removeEventListener("keydown", vendingSpeechTrigger);
    };
  }, [points]);

  useEffect(() => {
    window.addEventListener("keydown", vendingSpeechTrigger);

    return () => {
      window.removeEventListener("keydown", vendingSpeechTrigger);
    };
  }, [anim1, points]);

  const resetGame = () => {
    setSectionIndex(0);
    heroRef.current.style.transform = "translateY(0)";
    gameRef.current.style.transform = "translateY(0)";
    setPoints(0);
  };

  // console.log(points);
  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        id="snow"
      ></canvas>
      <div className="app">
        <section
          className={`section section__hero ${
            sectionIndex === 0 ? "active" : ""
          }`}
          ref={heroRef}
        >
          <PixelatedButton onClick={handleTranslate}>
            Welcome
            <div className="arrow__body">
              <img src="/pixel-arrow.png" alt="arrow image" />
            </div>
          </PixelatedButton>
          {/* <h3>Hello</h3> */}
        </section>
        <section
          className={`section section__doors ${
            sectionIndex === 1 ? "active" : ""
          }`}
          ref={gameRef}
        >
          {/* <h1>Hello</h1> */}
          <div className="game" ref={gameAreaRef}>
            <img src="/bg.png" alt="game backgropund" />
            <div className="game__char" ref={charRef}>
              <PixelBubble
                style={{
                  position: "absolute",
                  bottom: "18rem",
                  left: "3rem",
                  display: "none",
                }}
                type={"medium"}
                direction={"bottom"}
                refer={charSpeechRef}
              >
                {displayedText}
              </PixelBubble>
              <img
                ref={forwardImgRefs[0]}
                className="game__char--root"
                src="/t1.png"
                alt="game character"
              />
              <img
                ref={forwardImgRefs[1]}
                className="game__char--noroot"
                src="/t2.png"
                alt="game character"
              />
              <img
                ref={forwardImgRefs[2]}
                className="game__char--noroot"
                src="/t1.png"
                alt="game character"
              />
              <img
                ref={forwardImgRefs[3]}
                className="game__char--noroot"
                src="/t3.png"
                alt="game character"
              />
              <img
                ref={leftImgRefs[0]}
                className="game__char--noroot"
                src="/t4.png"
                alt="game character"
              />
              <img
                ref={leftImgRefs[1]}
                className="game__char--noroot"
                src="/t5.png"
                alt="game character"
              />
              <img
                ref={leftImgRefs[2]}
                className="game__char--noroot"
                src="/t4.png"
                alt="game character"
              />
              <img
                ref={leftImgRefs[3]}
                className="game__char--noroot"
                src="/t6.png"
                alt="game character"
              />
              <img
                ref={rightImgRefs[0]}
                className="game__char--noroot"
                src="/t10.png"
                alt="game character"
              />
              <img
                ref={rightImgRefs[1]}
                className="game__char--noroot"
                src="/t11.png"
                alt="game character"
              />
              <img
                ref={rightImgRefs[2]}
                className="game__char--noroot"
                src="/t10.png"
                alt="game character"
              />
              <img
                ref={rightImgRefs[3]}
                className="game__char--noroot"
                src="/t12.png"
                alt="game character"
              />
              <img
                ref={backImgRefs[0]}
                className="game__char--noroot"
                src="/t7.png"
                alt="game character"
              />
              <img
                ref={backImgRefs[1]}
                className="game__char--noroot"
                src="/t8.png"
                alt="game character"
              />
              <img
                ref={backImgRefs[2]}
                className="game__char--noroot"
                src="/t7.png"
                alt="game character"
              />
              <img
                ref={backImgRefs[3]}
                className="game__char--noroot"
                src="/t9.png"
                alt="game character"
              />
            </div>
            <div className={`vending`} ref={vendingRef}>
              <img
                src="/vending.png"
                className={animateVending ? "animate" : ""}
              />
              <div
                className={`star ${animateVending ? "" : "star__animate"}`}
                ref={starRef}
              >
                <img src="/star.png" />
              </div>
            </div>
          </div>
        </section>

        {/* <section className="section__form">
          <form>
            <h3>How much water should u drink in a day?</h3>
            <div>
              <label>
                <input
                  type="radio"
                  value="javascript"
                  checked={selectedOptionPage1 === "javascript"}
                  onChange={handleFirstPageForm}
                />
                1 Liter ?
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  value="python"
                  checked={selectedOptionPage1 === "python"}
                  onChange={handleFirstPageForm}
                />
                2 Liters ??
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  value="rust"
                  checked={selectedOptionPage1 === "rust"}
                  onChange={handleFirstPageForm}
                />
                Yes!!
              </label>
            </div>
          </form>
        </section> */}
        <PixelatedButton type={"reset"} onClick={resetGame}>
          Reset
        </PixelatedButton>
      </div>
    </>
  );
};

export default App;
