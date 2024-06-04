//main.js 
// assignment 1 
// AUTHOR: Mark Machado (machmark@sheridancollege.ca)
// CREATED: 2024-06-02
// UPDATED: 2024-06-02
///////////////////////////////////////////////////////////////////////////////
// main entry point: execute after DOM is ready
document.addEventListener("DOMContentLoaded", () =>
    {
        // 1. init webgl with your canvas ID
        // then, use "gl" global object to manipulate the 3D content
        initWebGL("webglview");
    
        // 2. init DOM elements & events
        initControls();
    
        // 3. initialize model name update functionality and shape selection
        initModelNameUpdater();
    
        // 4. include default html & js into the page dynamically
        let uiDiv = document.getElementById("includeblock");
        includeHtml("includeblock", "html/ui_sphere.html", "js/ui_sphere.js");
    });
    
    
    ///////////////////////////////////////////////////////////////////////////////
    function initControls()
    {
        let checkTexture = document.getElementById("checkTexture");
        checkTexture.checked = true;
        checkTexture.addEventListener("click", () => gl.textureEnabled = checkTexture.checked);
    
        let checkSmooth = document.getElementById("checkSmooth");
        checkSmooth.checked = false;
        checkSmooth.addEventListener("click", () =>
        {
            gl.smooth = checkSmooth.checked;
            if (gl.model) {
                gl.model.setSmooth(gl.smooth);
            }
        });
    
        let buttonReset = document.getElementById("buttonReset");
        buttonReset.addEventListener("click", () => resetCamera());
    }
    
    
    ///////////////////////////////////////////////////////////////////////////////
    // dynamically add html and js
    // PARAMS: domId: the container DOM ID
    //         html : URL to html file
    //         js   : URL to js file
    function includeHtml(domId, html, js)
    {
        fetch(html)
        .then(response => response.text())
        .then(text =>
        {
            // success
            log("loaded HTML: " + html);
            let dom = document.getElementById(domId);
            dom.innerHTML = text;
            // load JS after html is loaded
            loadJavaScript(js);
            // resize canvas manually because page was updated
            handleResize();
        })
        .catch(e =>
        {
            // failed
            console.log("Failed to load " + html);
        });
    }
    
    ///////////////////////////////////////////////////////////////////////////////
    function loadJavaScript(file)
    {
        if (!file) return;
    
        let jsId = btoa(file);  // encode to base64 string
        let script = document.createElement("script");
        script.id = jsId;
    
        // add script to dom
        if (!document.getElementById("jsId"))
            document.head.appendChild(script);
    
        // callback onload
        script.onload = () =>
        {
            // parsing JS is completed, safe to execute it here
            log("loaded JS: " + file);
        };
        // callback onerror
        script.onerror = e => console.log(e);
    
        // start to load
        script.src = file;
    }
    
    ///////////////////////////////////////////////////////////////////////////////
    // Function to initialize model name update based on shape selection
    function initModelNameUpdater()
    {
        const shapesDropdown = document.getElementById('shapes');
        const modelNameDiv = document.getElementById('modelname');
    
        // Function to update the model name and load the selected shape
        const updateModel = () => {
            const selectedOption = shapesDropdown.options[shapesDropdown.selectedIndex];
            const shape = selectedOption.text.trim();
            modelNameDiv.textContent = shape;
    
            // Load the appropriate model
            switch (shape) {
                case 'Sphere':
                    gl.model = new Smal.Sphere(gl, 1, 36, 18, false);
                    includeHtml("includeblock", "html/ui_sphere.html", "js/ui_sphere.js");
                    break;
                case 'Cone':
                    gl.model = new Smal.Cone(gl, 1, 2, 36, 1, false);
                    includeHtml("includeblock", "html/ui_cone.html", "js/ui_cone.js");
                    break;
                case 'Cylinder':
                    gl.model = new Smal.Cylinder(gl, 1, 1, 2, 36, 1, false);
                    includeHtml("includeblock", "html/ui_cylinder.html", "js/ui_cylinder.js");
                    break;
                case 'Torus':
                    gl.model = new Smal.Torus(gl, 1, 0.5, 36, 18, false);
                    includeHtml("includeblock", "html/ui_torus.html", "js/ui_torus.js");
                    break;
                default:
                    console.log("Unknown shape selected");
            }
    
            log(gl.model);  // log the model for debugging
        };
    
        // Add event listener to the dropdown menu
        shapesDropdown.addEventListener('change', updateModel);
    
        // Initialize the model on page load
        updateModel();
    }
    