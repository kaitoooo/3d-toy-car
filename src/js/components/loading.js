import { gsap } from 'gsap';

export default class Loading {
    constructor() {
        this.elms = {
            canvas: document.querySelector('[data-canvas]'),
            mvTitle: document.querySelector('[data-mv="title"]'),
            mvSubTitle: document.querySelectorAll('[data-mv="subTitle"]'),
            mvHome: document.querySelector('[data-mv="home"]'),
            mvGit: document.querySelector('[data-mv="git"]'),
            mvKeyImg: document.querySelectorAll('[data-mv="key-img"]'),
            mvFinger: document.querySelector('[data-mv="finger"]'),
            mvCircle: document.querySelector('[data-mv="circle"]'),
        };
        this.init();
    }
    init() {
        this.start();
    }
    start() {
        gsap.config({
            force3D: true,
        });
        const tl = gsap.timeline({
            paused: true,
            defaults: {
                duration: 0.6,
                ease: 'power2.easeOut',
            },
        });
        tl.to(this.elms.mvTitle, {
            y: 0,
        });
        tl.to(this.elms.mvSubTitle, {
            stagger: 0.03,
            y: 0,
        });
        tl.to(this.elms.canvas, {
            opacity: 1,
        });
        tl.to(this.elms.mvKeyImg, {
            opacity: 1,
        })
            .to(
                this.elms.mvFinger,
                {
                    opacity: 1,
                },
                '<'
            )
            .to(
                this.elms.mvCircle,
                {
                    opacity: 1,
                },
                '<'
            )
            .to(
                this.elms.mvHome,
                {
                    y: 0,
                },
                '<'
            )
            .to(
                this.elms.mvGit,
                {
                    y: 0,
                },
                '<'
            );
        tl.play();
    }
}
