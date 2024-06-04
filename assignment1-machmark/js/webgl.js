// webgl codes for assignment1
//


// AUTHOR: Mark Machado (machmark@sheridancollege.ca)
// CREATED: 2024-06-02
// UPDATED: 2024-06-02

///////////////////////////////////////////////////////////////////////////////

// global variables
let gl = null;

// constants
const CAMERA_DIST = 3;
const Z_NEAR = 0.1;
const Z_FAR = 1000;
const FOV_V = 60;
const ANIM_DURATION = 500; // ms



///////////////////////////////////////////////////////////////////////////////
// init WebGL
function initWebGL(canvasId)
{
    try {

    if(!Smal)
    {
        log("[ERROR] Namespace \"Smal\" is NOT defined.");
        return false;
    }
    log("SMAL Version: " + Smal.version);

    if(!Smal.isWebGLSupported())
    {
        log("[ERROR] The browser does not support WebGL.");
        return false;
    }

    let canvas = document.getElementById(canvasId);
    gl = Smal.getContextGL(canvas);
    logWebGL(gl);

    // remember the canvas
    gl.canvas = canvas;

    initGL(gl);
    initGLSL(gl);
    log("WebGL is initialized.");

    // init app ===============================================================

    // detault white texture
    gl.texManager = new Smal.TextureManager(gl);
    gl.tex0 = gl.texManager.get("defaultImage");
    gl.tex1 = gl.texManager.load("img/numgrid256.png");
    gl.tex2 = gl.texManager.load("img/earth2048x1024.jpg");

    // init array of pointer objects
    gl.pointers = [];

    gl.spin = false;
    gl.textureEnabled = true;
    gl.smooth = false;
    gl.model = null;

    // register event handlers
    registerEventHandlers(canvas);

    // start rendering loop
    startRendering(gl);
    //handleResize();

    return true;

    } catch(e){
        log("[ERROR] " + e.message);
        alert("[ERROR] " + e.message);
    }
}



//=============================================================================
// webgl utilities

///////////////////////////////////////////////////////////////////////////////
// print WebGL RC info
///////////////////////////////////////////////////////////////////////////////
function logWebGL(gl)
{
    log("===== WebGL Info =====");
    log("   Version: " + gl.getParameter(gl.VERSION));
    log("  GLSL Ver: " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    log("    Vendor: " + gl.getParameter(gl.VENDOR));
    log("  Renderer: " + gl.getParameter(gl.RENDERER));
    log("     Color: (" + gl.getParameter(gl.RED_BITS) + ", " + gl.getParameter(gl.GREEN_BITS) + ", " + gl.getParameter(gl.BLUE_BITS) + ", " + gl.getParameter(gl.ALPHA_BITS) + ") bits");
    log("     Depth: " + gl.getParameter(gl.DEPTH_BITS) + " bits");
    log("   Stencil: " + gl.getParameter(gl.STENCIL_BITS) + " bits");
    log("Extentions: " + gl.getSupportedExtensions());
    log();
}



///////////////////////////////////////////////////////////////////////////////
// init OpenGL
///////////////////////////////////////////////////////////////////////////////
function initGL(gl)
{
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);   // enable depth test
    gl.depthFunc(gl.LEQUAL);
    //gl.enable(gl.CULL_FACE);    // enable culling backface
    //gl.cullFace(gl.BACK);
    gl.enable(gl.BLEND);        // enable blend

    // default light
    gl.light = new Smal.Light(0, 0.5, 1, 0);
    gl.light.position.normalize();
    gl.light.color.set(1.0, 1.0, 1.0, 1.0);        // light color
    gl.light.attenuations.set(1, 0.0, 0); // attenuations (constant, linear, quad)
    log("    Light Position: " + gl.light.position);
    log("       Light Color: " + gl.light.color);
    log("Light Attenuations: " + gl.light.attenuations);
    log();

    // default material
    gl.material = new Smal.Material(0.7, 0.7, 0.7, 1.0); // with default diffuse
    gl.material.ambient.set(0.3, 0.3, 0.3, 1.0);
    gl.material.specular.set(1.0, 1.0, 1.0, 1);
    gl.material.shininess = 128;
    log("  Material Ambient: " + gl.material.ambient);
    log("  Material Diffuse: " + gl.material.diffuse);
    log(" Material Specualr: " + gl.material.specular);
    log("Material Shininess: " + gl.material.shininess);
    log();

    // init camera with position and target
    gl.camera = new Smal.OrbitCamera(0, 0, CAMERA_DIST, 0, 0, 0);
    gl.camera.rotateTo(new Smal.Vector3(30,0,0));
    gl.camera.zNear = Z_NEAR;
    gl.camera.zFar = Z_FAR;
    gl.camera.radius = 1;
    log("Created an orbit camera.");
    log(gl.camera);

    // init matrices
    handleResize();
    gl.matrixModel = new Smal.Matrix4().rotateX(-Math.PI/2); // z-axis up
    gl.matrixView = gl.camera.matrix;
    gl.matrixModelView = gl.matrixView.clone().multiply(gl.matrixModel);
    gl.matrixModelViewProjection = gl.matrixProjection.clone().multiply(gl.matrixModelView);
}



///////////////////////////////////////////////////////////////////////////////
// init GLSL (shaders and programs)
///////////////////////////////////////////////////////////////////////////////
function initGLSL(gl)
{
    // enable all vertexAttribArray
    Smal.initVertexAttribArrays(gl);

    // load shaders
    gl.shaderPrograms = {}; // associative array

    // load phong shader
    Smal.createShaderProgram(gl, "glsl/gles_phongTex.vert", "glsl/gles_phongTex.frag").then(program =>
    {
        gl.useProgram(program);

        // setup uniforms
        gl.uniform4fv(program.uniform.lightPosition, gl.light.getPosition());
        gl.uniform4fv(program.uniform.lightColor, gl.light.getColor());
        gl.uniform3fv(program.uniform.lightAttenuations, gl.light.getAttenuations());
        gl.uniform4fv(program.uniform.materialAmbient, gl.material.getAmbient());
        gl.uniform4fv(program.uniform.materialDiffuse, gl.material.getDiffuse());
        gl.uniform4fv(program.uniform.materialSpecular, gl.material.getSpecular());
        gl.uniform1f(program.uniform.materialShininess, gl.material.shininess);
        gl.uniform1i(program.uniform.map0, 0);

        gl.shaderPrograms["phongTex"] = program;
    });
}



///////////////////////////////////////////////////////////////////////////////
// start rendering loop
///////////////////////////////////////////////////////////////////////////////
function startRendering(gl)
{
    log("\nStarting rendering loop...\n");

    let timer = new Smal.Timer();
    gl.fps = new Smal.FrameRate("fps");
    let frameCallback = function()
    {
        gl.fps.tick();
        gl.frameTime = timer.getFrameTime();
        gl.runTime += gl.frameTime;
        frame();
        postFrame();
        requestAnimationFrame(frameCallback);
    };

    timer.start();
    gl.runTime = 0;
    requestAnimationFrame(frameCallback);
}



///////////////////////////////////////////////////////////////////////////////
// draw a single frame
///////////////////////////////////////////////////////////////////////////////
function frame()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(!gl.model || !gl.model.vboVertex)
        return;

    // set active program
    gl.program = gl.shaderPrograms["phongTex"];
    if(!gl.program) return;
    gl.useProgram(gl.program);

    // set view transform
    gl.matrixView = gl.camera.matrix;

    // set modelview matrix
    gl.matrixModelView = gl.matrixView.clone().multiply(gl.matrixModel);
    gl.uniformMatrix4fv(gl.program.uniform.matrixModelView, false, gl.matrixModelView.m);

    // compute normal transform
    gl.matrixNormal = gl.matrixModelView.clone();
    gl.matrixNormal.setTranslation(0,0,0); // remove tranlsation part
    gl.uniformMatrix4fv(gl.program.uniform.matrixNormal, false, gl.matrixNormal.m);

    // compute projection matrix
    gl.matrixModelViewProjection = gl.matrixProjection.clone().multiply(gl.matrixModelView);
    gl.uniformMatrix4fv(gl.program.uniform.matrixModelViewProjection, false, gl.matrixModelViewProjection.m);

    gl.activeTexture(gl.TEXTURE0);
    if(gl.textureEnabled)
    {
        gl.bindTexture(gl.TEXTURE_2D, gl.tex2);
    }
    else
    {
        gl.bindTexture(gl.TEXTURE_2D, gl.tex0);
    }

    // draw model
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.model.vboVertex);
    gl.vertexAttribPointer(gl.program.attribute.vertexPosition, 3, gl.FLOAT, false, gl.model.stride, 0);
    gl.vertexAttribPointer(gl.program.attribute.vertexNormal, 3, gl.FLOAT, false, gl.model.stride, 12);
    gl.vertexAttribPointer(gl.program.attribute.vertexTexCoord0, 2, gl.FLOAT, false, gl.model.stride, 24);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.model.vboIndex);
    gl.uniform4fv(gl.program.uniform.lightColor, gl.light.getColor());
    gl.drawElements(gl.TRIANGLES, gl.model.getIndexCount(), gl.UNSIGNED_SHORT, 0);
    if(gl.wireframeEnabled)
    {
        gl.uniform4fv(gl.program.uniform.lightColor, new Float32Array([0, 0, 0, 1]));
        gl.drawElements(gl.LINE_STRIP, gl.model.getIndexCount(), gl.UNSIGNED_SHORT, 0);
    }

    // unbind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, null);
}



///////////////////////////////////////////////////////////////////////////////
// post frame
///////////////////////////////////////////////////////////////////////////////
function postFrame()
{
    if(gl.spin)
    {
        let angle = gl.camera.angle.clone();
        angle.y += 0.1;
        if(angle.y > 360)
            angle.y = angle.y % 360;
        gl.camera.rotateTo(angle);
    }
}



///////////////////////////////////////////////////////////////////////////////
// register event handlers to canvas
///////////////////////////////////////////////////////////////////////////////
function registerEventHandlers(canvas)
{
    // register event handlers
    window.addEventListener("resize",  handleResize, false);
    log("Added window resize envent listener, handleResize().");

    canvas.addEventListener("wheel", handleWheel, false);
    log("Added canvas wheel event listener, handleWheel().");

    // canvas pointer events
    canvas.addEventListener("pointerdown", handlePointerDown, false);
    log("Added canvas pointerdown event listeners, handlePointerDown()");

    canvas.addEventListener("pointerup", handlePointerUp, false);
    log("Added canvas pointerup event listeners, handlePointerUp()");

    canvas.addEventListener("pointermove", handlePointerMove, false);
    log("Added canvas pointermove event listeners, handlePointerMove()");

    canvas.addEventListener("pointercancel", handlePointerCancel, false);
    log("Added canvas pointercancel event listeners, handlePointerCancel()");

    canvas.addEventListener("pointerleave", handlePointerLeave, false);
    log("Added canvas pointerleave event listeners, handlePointerLeave()");
}



///////////////////////////////////////////////////////////////////////////////
// reshape OpenGL window when the canvas is resized
///////////////////////////////////////////////////////////////////////////////
function handleResize()
{
    // resize window to fit to parent
    let width = gl.canvas.parentNode.clientWidth;
    let height = gl.canvas.parentNode.clientHeight;

    // adjust canvas dimension
    gl.canvas.width = width;
    gl.canvas.height = height;
    gl.canvas.style.width = width + "px";
    gl.canvas.style.height = height + "px";

    gl.viewport(0, 0, width, height);
    gl.matrixProjection = Smal.Matrix4.makePerspective(FOV_V, width/height, gl.camera.zNear, gl.camera.zFar);

    log("Canvas is resized: " + gl.canvas.width + " x " + gl.canvas.height);
}



///////////////////////////////////////////////////////////////////////////////
// handlers for mouse event
///////////////////////////////////////////////////////////////////////////////
function handleWheel(e)
{
    const ZOOM_SCALE = 0.05;
    if(e.deltaY != 0)
    {
        let deltaDistance = 0;
        if(e.deltaY > 0)    // wheel down
            deltaDistance = ZOOM_SCALE;
        else                // wheel up
            deltaDistance = -ZOOM_SCALE;

        if((gl.camera.distance - deltaDistance) < gl.camera.zNear)
        {
            deltaDistance = gl.camera.distance - gl.camera.zNear;
        }
        else if((gl.camera.distance - deltaDistance) > gl.camera.zFar)
        {
            deltaDistance = gl.camera.distance - gl.camera.zFar;
        }

        gl.camera.moveForward(deltaDistance);
    }

    e.preventDefault();
}



///////////////////////////////////////////////////////////////////////////////
// handle pointer events: input is PointerEvent object
///////////////////////////////////////////////////////////////////////////////
function handlePointerDown(pe)
{
    pe.preventDefault();    // prevent pointer event being delivered

    let offset = Smal.getElementOffset(this);    // get canvas offset
    gl.pointers.push(copyPointer(pe, offset));

    // remember down pointer and angles when pointer down
    if(gl.pointers.length == 1)
    {
        gl.camera.pointerAngle = gl.camera.angle.clone();
        gl.pointers.downs = []; // clear
        gl.pointers.downs.push(copyPointer(pe, offset));
        // handle right mouse button(0=left, 2=right)
        gl.pointers[0].button = pe.button;
    }
    else if(gl.pointers.length == 2)
    {
        // remember second pointer
        gl.pointers.downs.push(copyPointer(pe, offset));
    }
}

function handlePointerUp(pe)
{
    pe.preventDefault();    // prevent pointer event being delivered

    // get array index matching from gl.pointers
    let index = gl.pointers.findIndex(pointer => pointer.id == pe.pointerId);
    if(index >= 0) // found
    {
        gl.pointers.splice(index, 1);   // remove it
        gl.pointers.distance = 0;       // clear
    }
}

function handlePointerMove(pe)
{
    pe.preventDefault();    // prevent pointer event being delivered

    // get the current moving pointer and replace it in the array
    let offset = Smal.getElementOffset(this);    // get canvas offset
    let index = gl.pointers.findIndex(p => p.id == pe.pointerId);
    if(index == 0)
    {
        // remember delta movement
        gl.pointers[0].delta = new Smal.Vector2((pe.pageX - offset.x) - gl.pointers[0].x, (pe.pageY - offset.y) - gl.pointers[0].y);
        // update
        gl.pointers[0].x = pe.pageX - offset.x;
        gl.pointers[0].y = pe.pageY - offset.y;
    }
    else if(index == 1)
    {
        // remember delta movement
        gl.pointers[1].delta = new Smal.Vector2((pe.pageX - offset.x) - gl.pointers[1].x, (pe.pageY - offset.y) - gl.pointers[1].y);
        // update
        gl.pointers[1].x = pe.pageX - offset.x;
        gl.pointers[1].y = pe.pageY - offset.y;
    }

    // if 2 pointers, perform shift/zoom
    if(gl.pointers.length == 2)
    {
        const SCALE_SHIFT = 0.03;
        const SCALE_ZOOM = 0.01;

        let d1 = gl.pointers[0].delta.normalize();
        let d2 = gl.pointers[1].delta.normalize();
        let dir = d1.add(d2).normalize();   // sum vector of 2 delta vectors
        let v = new Vector2(gl.pointers[1].x - gl.pointers[0].x, gl.pointers[1].y - gl.pointers[0].y);
        let dist = v.length();              // distance of 2 vectors
        /*
        if(d1.dot(d2) > 0.95)
        {
            // shift camera if same direction
            gl.camera.shift(dir.scale(SCALE_SHIFT));
        }
        else
        */
        {
            // zoom camera if opposite direction
            let deltaDistance = 0;
            if(gl.pointers.distance > 0)
                deltaDistance = dist - gl.pointers.distance;
            gl.pointers.distance = dist;     // remember
            gl.camera.moveForward(deltaDistance * SCALE_ZOOM);
        }
    }
    // if 1 down, perform rotate
    else if(gl.pointers.length == 1)
    {
        const SCALE_ROTATE = 0.2;
        const SCALE_SHIFT = 0.05;

        // shift if dragging right mouse button
        if(pe.pointerType == "mouse" && gl.pointers[0].button == 2)
        {
            let delta = gl.pointers[0].delta.normalize();
            delta = delta.scale(SCALE_SHIFT);
            gl.camera.shift(delta);
        }
        else
        {
            let angle = new Smal.Vector3();
            angle.x = gl.camera.pointerAngle.x + (gl.pointers[0].y - gl.pointers.downs[0].y) * SCALE_ROTATE;
            angle.y = gl.camera.pointerAngle.y - (gl.pointers[0].x - gl.pointers.downs[0].x) * SCALE_ROTATE;

            gl.camera.rotateTo(angle);
        }
    }
}

function handlePointerCancel(pe)
{
    gl.pointers.length = 0; // clear
    gl.pointers.distance = 0;
}

function handlePointerLeave(pe)
{
    gl.pointers.length = 0; // clear
    gl.pointers.distance = 0;
}

function copyPointer(pe, offset={x:0,y:0})
{
    // return pointer data
    return {id:pe.pointerId, x:pe.clientX - offset.x, y:pe.clientY - offset.y};
}



///////////////////////////////////////////////////////////////////////////////
// load texture asynchronously, and return OpenGL texture object
///////////////////////////////////////////////////////////////////////////////
function loadTexture(gl, url, repeat, callback)
{
    // create an OpenGL texture object and a DOM image object
    let texture = gl.createTexture();
    setupDefaultTexture(gl, texture); // temporarily use default image until it is loaded

    // create new image and load it from URL
    let imageName = url.substring(url.lastIndexOf("/")+1);
    let image = new Image();
    image.crossOrigin = "anonymous";
    image.src = url;
    image.onload = function()
    {
        setupTexture(gl, texture, image, repeat);
        //texture.image = image; // replace it from default
        //log("url: " + image.src);

        if(callback)
            callback(texture);
    };
    image.onerror = function()
    {
        log("[ERROR] Failed to load texture: " + imageName);
        if(callback)
            callback(null);
    };

    return texture;
}



///////////////////////////////////////////////////////////////////////////////
// copy image to OpenGL texture
///////////////////////////////////////////////////////////////////////////////
function setupTexture(gl, texture, image, repeat, type)
{
    let format = gl.RGBA;
    if(type == TextureType.OCCLUSIONMAP)
        format = gl.LUMINANCE;

    gl.bindTexture(gl.TEXTURE_2D, texture);
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    if(repeat == true)
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    }
    else
    {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}



///////////////////////////////////////////////////////////////////////////////
// assign default 1x1 image data to the target texture object
// Types: 0=base, 1=normalmap, 2=occlusionmap
///////////////////////////////////////////////////////////////////////////////
function setupDefaultTexture(gl, texture, type)
{
    let format = gl.RGBA;
    let textureData = defaultTextureData;
    if(type == TextureType.NORMALMAP)
    {
        textureData = defaultNormalmapData;
    }
    else if(type == TextureType.OCCLUSIONMAP)
    {
        textureData = defaultOcclusionmapData;
        format = gl.LUMINANCE;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, 1, 1, 0, format, gl.UNSIGNED_BYTE,
                  textureData);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.bindTexture(gl.TEXTURE_2D, null);
}



///////////////////////////////////////////////////////////////////////////////
// camera manipulations
// Shift Left : startShiftCamera(1,0)
// Shift Right: startShiftCamera(-1,0)
// Shift Up   : startShiftCamera(0,1)
// Shift Down : startShiftCamera(0,-1)
// Zoom In    : startZoomCamera(1)
// Zoom Out   : startZoomCamera(-1)
///////////////////////////////////////////////////////////////////////////////
function resetCamera()
{
    let a = new Smal.Vector3(30, 0, 0);
    gl.camera.rotateTo(a, 1000, Smal.AnimationMode.EASE_OUT);

    let d = gl.camera.distance - CAMERA_DIST;
    gl.camera.moveForward(d, 1000, Smal.AnimationMode.EASE_OUT);

    let t = new Smal.Vector2(0,0);
    gl.camera.shiftTo(t, 1000, Smal.AnimationMode.EASE_OUT);
}

function startShiftCamera(x, y)
{
    let dx = x || 0;
    let dy = y || 0;
    let dir = new Smal.Vector2(-0.5 * dx, -0.5 * dy);
    gl.camera.startShift(dir, 2);
}
function stopShiftCamera()
{
    gl.camera.stopShift();
}

function startZoomCamera(d)
{
    gl.camera.startForward(0.5 * d, 2);
}
function stopZoomCamera()
{
    gl.camera.stopForward();
}



///////////////////////////////////////////////////////////////////////////////
// toggle flags
///////////////////////////////////////////////////////////////////////////////
function toggleTexture(flag)
{
    gl.textureEnabled = flag;
}
function toggleSpin(flag)
{
    gl.spin = flag;
}

function enableTexture()
{
    gl.textureEnabled = true;
}
function disableTexture()
{
    gl.textureEnabled = false;
}
function enableSpin()
{
    gl.spin = true;
}
function disableSpin()
{
    gl.spin = false;
}



