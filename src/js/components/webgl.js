import * as THREE from 'three/build/three.module.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { throttle } from '../utils/throttle';
import { gsap } from 'gsap';
const OrbitControls = require('three-orbitcontrols');

export default class Webgl {
    constructor() {
        this.wd = window.innerWidth;
        this.wh = window.innerHeight;
        this.elms = {
            canvas: document.querySelector('[data-canvas]'),
            mvWrapTitle: document.querySelector('[data-mv="wrap-title"]'),
            mvTitle: document.querySelector('[data-mv="title"]'),
            mvWrapSubTitle: document.querySelectorAll('[data-mv="wrap-sub-title"]'),
            mvSubTitle: document.querySelectorAll('[data-mv="subTitle"]'),
            mvKeyImg: document.querySelectorAll('[data-mv="key-img"]'),
            mvHome: document.querySelector('[data-mv="home"]'),
            mvGit: document.querySelector('[data-mv="git"]'),
            mvNote: document.querySelector('[data-mv="note"]'),
        };
        this.three = {
            scene: null,
            renderer: null,
            camera: null,
            redraw: null,
            mixer: null,
            clock: null,
            animations: null,
            cameraFov: 50,
            cameraAspect: window.innerWidth / window.innerHeight,
            controls: null,
        };
        this.srcObj = './obj/toy-car.gltf';
        this.flg = {
            loaded: false,
        };
        this.addClass = 'is-active';
        this.sp = 768;
        this.spSize = 768;
        this.ua = window.navigator.userAgent.toLowerCase();
        this.mq = window.matchMedia('(max-width: 768px)');
        this.init();
    }
    init() {
        this.getLayout();
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.setLoading();
        this.setLight();
        this.handleEvents();

        if (this.ua.indexOf('msie') !== -1 || this.ua.indexOf('trident') !== -1) {
            return;
        } else {
            this.mq.addEventListener('change', this.getLayout.bind(this));
        }
    }
    getLayout() {
        this.sp = this.mq.matches ? true : false;
    }
    initScene() {
        this.three.scene = new THREE.Scene();
    }
    initCamera() {
        this.three.camera = new THREE.PerspectiveCamera(this.three.cameraFov, this.wd / this.wh, this.three.cameraAspect, 1000); //(視野角, スペクト比, near, far)
        this.three.camera.position.set(7, 5.8, 8);
        this.three.camera.rotation.set(-0.2, 0.9, 0);
    }
    initRenderer() {
        // レンダラーのサイズ調整
        this.three.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true, //背景色を設定しないとき、背景を透明にする
        });

        this.three.renderer.setPixelRatio(window.devicePixelRatio);
        this.three.renderer.setSize(this.wd, this.wh);
        this.three.renderer.physicallyCorrectLights = true;
        this.three.renderer.shadowMap.enabled = true;
        this.three.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.elms.canvas.appendChild(this.three.renderer.domElement);
        this.three.renderer.outputEncoding = THREE.GammaEncoding;

        if (this.wd <= this.spSize) {
            // OrbitControlsの設定
            this.three.controls = new OrbitControls(this.three.camera, this.three.renderer.domElement);
            this.three.controls.enableDamping = true;
            this.three.controls.dampingFactor = 0.25;
            this.three.controls.enableZoom = false;
        }
    }
    setLight() {
        const ambientLight = new THREE.AmbientLight(0x666666);
        this.three.scene.add(ambientLight);

        const positionArr = [
            [0, 5, 0, 2],
            [-5, 3, 2, 2],
            [5, 3, 2, 2],
            [0, 3, 5, 1],
            [0, 3, -5, 2],
        ];

        for (let i = 0; i < positionArr.length; i++) {
            const directionalLight = new THREE.DirectionalLight(0xffffff, positionArr[i][3]);
            directionalLight.position.set(positionArr[i][0], positionArr[i][1], positionArr[i][2]);

            if (i == 0 || i == 2 || i == 3) {
                directionalLight.castShadow = true;
                directionalLight.shadow.camera.top = 50;
                directionalLight.shadow.camera.bottom = -50;
                directionalLight.shadow.camera.right = 50;
                directionalLight.shadow.camera.left = -50;
                directionalLight.shadow.mapSize.set(4096, 4096);
            }
            this.three.scene.add(directionalLight);
        }
    }
    setLoading() {
        const loader = new GLTFLoader();
        this.three.clock = new THREE.Clock();
        loader.load(this.srcObj, (obj) => {
            const gltf = obj;
            const data = gltf.scene;
            this.three.animations = gltf.animations;

            if (this.three.animations && this.three.animations.length) {
                //Animation Mixerインスタンスを生成
                this.three.mixer = new THREE.AnimationMixer(data);

                //全てのAnimation Clipに対して
                for (let i = 0; i < this.three.animations.length; i++) {
                    const animation = this.three.animations[i];
                    //Animation Actionを生成
                    const action = this.three.mixer.clipAction(animation);

                    //ループ設定（無限）
                    action.setLoop(THREE.Loop);
                    //アニメーションの最後のフレームでアニメーションが終了
                    action.clampWhenFinished = true;
                    //アニメーションを再生
                    action.play();
                }
            }
            // data.traverse((n) => {
            //     //シーン上のすべてに対して
            //     n.castShadow = true;
            //     n.receiveShadow = true;
            // });

            this.three.redraw = data;
            this.three.scene.add(data);
            this.three.redraw.position.set(0, 1.3, 0);
            this.flg.loaded = true;
            this.rendering();
        });
    }
    rendering() {
        if (this.three.mixer) {
            this.three.mixer.update(this.three.clock.getDelta());
        }
        requestAnimationFrame(this.rendering.bind(this));
        this.three.renderer.render(this.three.scene, this.three.camera);
    }
    keyDownLeftHideAnim() {
        gsap.config({
            force3D: true,
        });
        const tl = gsap.timeline({
            paused: true,
            defaults: {
                duration: 0.6,
            },
        });
        tl.to(this.elms.mvTitle, {
            duration: 0.2,
            y: '100%',
        });
        tl.to(this.elms.mvSubTitle, {
            duration: 0.2,
            y: '100%',
        });
        tl.to(this.elms.mvHome, {
            duration: 0.2,
            y: '100%',
        })
            .to(
                this.elms.mvGit,
                {
                    duration: 0.2,
                    y: '100%',
                },
                '<'
            )
            .to(
                this.elms.mvNote,
                {
                    duration: 0.2,
                    y: '100%',
                },
                '<'
            );
        tl.to(this.elms.mvKeyImg, {
            duration: 0.5,
            scale: 0.5,
            opacity: 0,
        });
        tl.to(this.elms.mvWrapTitle, {
            duration: 0.2,
            left: 'auto',
            right: '3%',
            top: '70%',
            width: 'auto',
        });
        tl.to(this.elms.mvWrapSubTitle, {
            duration: 0,
            right: '3%',
            left: 'auto',
            top: '91%',
            textAlign: 'right',
        });
        tl.to(this.elms.mvTitle, {
            y: 0,
        });
        tl.to(this.elms.mvSubTitle, {
            y: 0,
        });
        tl.to(this.elms.mvHome, {
            y: 0,
        })
            .to(
                this.elms.mvGit,
                {
                    y: 0,
                },
                '<'
            )
            .to(
                this.elms.mvNote,
                {
                    y: 0,
                },
                '<'
            );
        tl.play();
    }
    keyDownRightHideAnim() {
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
            duration: 0.2,
            y: '100%',
        });
        tl.to(this.elms.mvSubTitle, {
            duration: 0.2,
            y: '100%',
        });
        tl.to(this.elms.mvHome, {
            duration: 0.2,
            y: '100%',
        })
            .to(
                this.elms.mvGit,
                {
                    duration: 0.2,
                    y: '100%',
                },
                '<'
            )
            .to(
                this.elms.mvNote,
                {
                    duration: 0.2,
                    y: '100%',
                },
                '<'
            );
        tl.to(this.elms.mvKeyImg, {
            duration: 0.5,
            scale: 0.5,
            opacity: 0,
        });
        tl.to(this.elms.mvWrapTitle, {
            duration: 0.2,
            left: '3%',
            right: 'auto',
            top: '62%',
            width: 'auto',
        });
        tl.to(this.elms.mvWrapSubTitle, {
            duration: 0,
            right: 'auto',
            left: '3%',
            top: '83%',
            textAlign: 'inherit',
        });
        tl.to(this.elms.mvTitle, {
            y: 0,
        });
        tl.to(this.elms.mvSubTitle, {
            y: 0,
        });
        tl.to(this.elms.mvHome, {
            y: 0,
        })
            .to(
                this.elms.mvGit,
                {
                    y: 0,
                },
                '<'
            )
            .to(
                this.elms.mvNote,
                {
                    y: 0,
                },
                '<'
            );
        tl.play();
    }
    keyDownTopHideAnim() {
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
            duration: 0.2,
            y: '100%',
        });
        tl.to(this.elms.mvSubTitle, {
            duration: 0.2,
            y: '100%',
        });
        tl.to(this.elms.mvHome, {
            duration: 0.2,
            y: '100%',
        })
            .to(
                this.elms.mvGit,
                {
                    duration: 0.2,
                    y: '100%',
                },
                '<'
            )
            .to(
                this.elms.mvNote,
                {
                    duration: 0.2,
                    y: '100%',
                },
                '<'
            );
        tl.to(this.elms.mvKeyImg, {
            duration: 0.5,
            scale: 0.5,
            opacity: 0,
        });
        tl.to(this.elms.mvWrapTitle, {
            duration: 0.2,
            left: 'auto',
            right: '2%',
            top: '2%',
            width: 'auto',
        });
        tl.to(this.elms.mvWrapSubTitle, {
            duration: 0,
            right: '2%',
            top: '23%',
            textAlign: 'right',
        });
        tl.to(this.elms.mvTitle, {
            y: 0,
        });
        tl.to(this.elms.mvSubTitle, {
            y: 0,
        });
        tl.to(this.elms.mvHome, {
            y: 0,
        })
            .to(
                this.elms.mvGit,
                {
                    y: 0,
                },
                '<'
            )
            .to(
                this.elms.mvNote,
                {
                    y: 0,
                },
                '<'
            );
        tl.play();
    }
    keyDownBottomHideAnim() {
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
            duration: 0.2,
            y: '100%',
        });
        tl.to(this.elms.mvSubTitle, {
            duration: 0.2,
            y: '100%',
        });
        tl.to(this.elms.mvHome, {
            duration: 0.2,
            y: '100%',
        })
            .to(
                this.elms.mvGit,
                {
                    duration: 0.2,
                    y: '100%',
                },
                '<'
            )
            .to(
                this.elms.mvNote,
                {
                    duration: 0.2,
                    y: '100%',
                },
                '<'
            );
        tl.to(this.elms.mvKeyImg, {
            duration: 0.5,
            scale: 0.5,
            opacity: 0,
        });
        tl.to(this.elms.mvWrapTitle, {
            duration: 0.2,
            left: 'auto',
            right: 0,
            top: '20%',
            width: '540px',
        });
        tl.to(this.elms.mvWrapSubTitle, {
            duration: 0.2,
            right: '3%',
            top: '60%',
            textAlign: 'right',
        });
        tl.to(this.elms.mvTitle, {
            y: 0,
        });
        tl.to(this.elms.mvSubTitle, {
            y: 0,
        });
        tl.to(this.elms.mvHome, {
            y: 0,
        })
            .to(
                this.elms.mvGit,
                {
                    y: 0,
                },
                '<'
            )
            .to(
                this.elms.mvNote,
                {
                    y: 0,
                },
                '<'
            );
        tl.play();
    }
    handleEvents() {
        window.addEventListener('resize', throttle(this.handleResize.bind(this)), false);
        document.body.addEventListener('keydown', (event) => {
            this.keyDown(event);
        });
    }
    handleResize() {
        // リサイズ処理
        if (this.wd !== window.innerWidth) {
            this.wd = window.innerWidth;
            this.wh = window.innerHeight;
            this.three.cameraAspect = this.wd / this.wh;
            this.three.camera.aspect = this.wd / this.wh;
            this.three.camera.updateProjectionMatrix();
            this.three.renderer.setSize(this.wd, this.wh);
            this.three.renderer.setPixelRatio(window.devicePixelRatio);
        }
    }
    keyDown(event) {
        //押されたボタンに割り当てられた数値（すうち）を、key_codeに代入
        const key_code = event.keyCode;

        if (key_code === 37) {
            // 左矢印キー
            this.keyDownLeftAnim();
        }
        if (key_code === 38) {
            // 上矢印キー
            this.keyDownTopAnim();
        }
        if (key_code === 39) {
            // 右矢印キー
            this.keyDownRightAnim();
        }
        if (key_code === 40) {
            // 下矢印キー
            console.log('下');
            this.keyDownBottomAnim();
        }
    }
    keyDownRightAnim() {
        this.keyDownRightHideAnim();
        gsap.to(this.three.camera.position, {
            duration: 1.2,
            ease: 'power4.inOut',
            x: this.sp ? 2 : 3.5,
            y: this.sp ? 0 : 1,
            z: this.sp ? 3 : 5.5,
        });
        gsap.to(this.three.camera.rotation, {
            duration: 1.2,
            ease: 'power4.inOut',
            x: this.sp ? 0 : 0.1,
            y: this.sp ? 0.3 : 0.5,
            z: this.sp ? 0 : 0,
        });
    }
    keyDownLeftAnim() {
        this.keyDownLeftHideAnim();

        gsap.to(this.three.camera.position, {
            duration: 1.2,
            ease: 'power4.inOut',
            x: this.sp ? 2 : -5,
            y: this.sp ? 0 : 1.2,
            z: this.sp ? 3 : 4,
        });
        gsap.to(this.three.camera.rotation, {
            duration: 1.2,
            ease: 'power4.inOut',
            x: this.sp ? 3 : 0.1,
            y: this.sp ? 0.3 : -0.9,
            z: this.sp ? 3 : 0,
        });
    }
    keyDownTopAnim() {
        this.keyDownTopHideAnim();
        gsap.to(this.three.camera.position, {
            duration: 1.2,
            ease: 'power4.inOut',
            x: this.sp ? 2 : 5,
            y: this.sp ? 0 : 1.5,
            z: this.sp ? 3 : 3.5,
        });
        gsap.to(this.three.camera.rotation, {
            duration: 1.2,
            ease: 'power4.inOut',
            x: this.sp ? 3 : 0.1,
            y: this.sp ? 0.3 : 0.6,
            z: this.sp ? 3 : 0,
        });
    }
    keyDownBottomAnim() {
        this.keyDownBottomHideAnim();
        gsap.to(this.three.camera.position, {
            duration: 1.2,
            ease: 'power4.inOut',
            x: this.sp ? 2 : -6,
            y: this.sp ? 0 : 2.5,
            z: this.sp ? 3 : 3,
        });
        gsap.to(this.three.camera.rotation, {
            duration: 1.2,
            ease: 'power4.inOut',
            x: this.sp ? 3 : -0.4,
            y: this.sp ? 0.3 : -1.4,
            z: this.sp ? 3 : 0,
        });
    }
}
