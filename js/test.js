			import * as THREE from '../jsm/three.module.js';
			import { GUI } from '../jsm/dat.gui.module.js';
			import { EffectComposer } from '../jsm/EffectComposer.js';
			import { RenderPass } from '../jsm/RenderPass.js';
			import { BokehPass } from '../jsm/BokehPass.js';
			var camera, scene, renderer, composer;
			var object, light;
			var postprocessing = {};
			var width = window.innerWidth;
			var height = window.innerHeight;

			init();
			animate();
			function init() {
				renderer = new THREE.WebGLRenderer();
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );
				//
				camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.z = 400;
				scene = new THREE.Scene();
				scene.fog = new THREE.Fog( 0xdddddd, 1, 1000 );
				object = new THREE.Object3D();
				scene.add( object );
				var geometry = new THREE.SphereBufferGeometry( 1, 4, 4 );
				for ( var i = 0; i < 200; i ++ ) {
					var material = new THREE.MeshPhongMaterial( { color: 0x6bbcff, flatShading: true } );
					var mesh = new THREE.Mesh( geometry, material );
					mesh.position.set( Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5 ).normalize();
					mesh.position.multiplyScalar( Math.random() * 400 + 100 );
					mesh.rotation.set( Math.random() * 2, Math.random() * 2, Math.random() * 2 );
					mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 25;
					object.add( mesh );
				}
				scene.add( new THREE.AmbientLight( 0x444444 ) );
				light = new THREE.DirectionalLight( 0xffffff );
				light.position.set( 1, 1, 1 );
				scene.add( light );
				// postprocessing
				composer = new EffectComposer( renderer );
				var renderPass = new RenderPass( scene, camera );

				var bokehPass = new BokehPass( scene, camera, {
					focus: 1430,
					aperture:	2.8,
					maxblur:	1.725,

					width: width,
					height: height
				} );

				composer.addPass( renderPass );
				composer.addPass( bokehPass );

				postprocessing.composer = composer;
				postprocessing.bokeh = bokehPass;

				renderer.autoClear = false;

				window.addEventListener( 'resize', onWindowResize, false );

				var effectController = {
					focus: 1430,
					aperture:	3.4,
					maxblur: 2.75	
				};

				var matChanger = function ( ) {
					postprocessing.bokeh.uniforms[ "focus" ].value = effectController.focus;
					postprocessing.bokeh.uniforms[ "aperture" ].value = effectController.aperture * 0.00001;
					postprocessing.bokeh.uniforms[ "maxblur" ].value = effectController.maxblur;
				};

				var gui = new GUI();
				gui.add( effectController, "focus", 10.0, 3000.0, 10 ).onChange( matChanger );
				gui.add( effectController, "aperture", 0, 10, 0.1 ).onChange( matChanger );
				gui.add( effectController, "maxblur", 0.0, 3.0, 0.025 ).onChange( matChanger );
				gui.close();

				matChanger();

				// var wildGlitchOption = document.getElementById( 'wildGlitch' );
				// wildGlitchOption.addEventListener( 'change', updateOptions );
				// updateOptions();
			}
			function onWindowResize() {
				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );
				composer.setSize( window.innerWidth, window.innerHeight );
			}
			function animate() {
				requestAnimationFrame( animate );
				object.rotation.x += 0.001;
				object.rotation.y += 0.0025;
				composer.render();
			}
