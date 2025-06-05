class SVGAnimator {
    constructor() {
        this.svgContent = null;
        this.animatedSVG = null;
        this.currentAnimation = null;
        this.isAnimating = false;
        this.isDarkMode = false;
        this.animationSettings = {
            duration: 2,
            delay: 0,
            strokeWidth: 2,
            strokeColor: '#3b82f6',
            strokeLinecap: 'round',
            style: 'simultaneous',
            type: 'stroke'
        };
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File upload
        const svgInput = document.getElementById('svgInput');
        const uploadContainer = document.getElementById('uploadContainer');
        
        uploadContainer.addEventListener('click', () => svgInput.click());
        svgInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Drag and drop
        uploadContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadContainer.classList.add('dragover');
        });
        
        uploadContainer.addEventListener('dragleave', () => {
            uploadContainer.classList.remove('dragover');
        });
        
        uploadContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadContainer.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'image/svg+xml') {
                this.processSVGFile(files[0]);
            }
        });

        // Control sliders
        const durationSlider = document.getElementById('animationDuration');
        const delaySlider = document.getElementById('animationDelay');
        const strokeWidthSlider = document.getElementById('strokeWidth');
        const strokeColorPicker = document.getElementById('strokeColor');
        const strokeLinecapSelect = document.getElementById('strokeLinecap');
        const animationStyleSelect = document.getElementById('animationStyle');
        const animationTypeSelect = document.getElementById('animationType');

        durationSlider.addEventListener('input', (e) => {
            this.animationSettings.duration = parseFloat(e.target.value);
            document.getElementById('durationValue').textContent = `${e.target.value}s`;
            this.updateAnimation();
        });

        delaySlider.addEventListener('input', (e) => {
            this.animationSettings.delay = parseFloat(e.target.value);
            document.getElementById('delayValue').textContent = `${e.target.value}s`;
            this.updateAnimation();
        });

        strokeWidthSlider.addEventListener('input', (e) => {
            this.animationSettings.strokeWidth = parseFloat(e.target.value);
            document.getElementById('strokeWidthValue').textContent = `${e.target.value}px`;
            this.updateAnimation();
        });

        strokeColorPicker.addEventListener('input', (e) => {
            this.animationSettings.strokeColor = e.target.value;
            this.updateAnimation();
        });

        strokeLinecapSelect.addEventListener('change', (e) => {
            this.animationSettings.strokeLinecap = e.target.value;
            this.updateAnimation();
        });

        animationStyleSelect.addEventListener('change', (e) => {
            this.animationSettings.style = e.target.value;
            this.updateAnimation();
        });

        animationTypeSelect.addEventListener('change', (e) => {
            this.animationSettings.type = e.target.value;
            this.updateAnimation();
        });

        // Animation controls
        document.getElementById('playBtn').addEventListener('click', () => this.playAnimation());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetAnimation());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportToGIF());
        document.getElementById('exportCSSBtn').addEventListener('click', () => this.exportToCSS());
        document.getElementById('themeToggleBtn').addEventListener('click', () => this.toggleTheme());
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type === 'image/svg+xml') {
            this.processSVGFile(file);
        }
    }

    async processSVGFile(file) {
        try {
            const text = await file.text();
            this.svgContent = text;
            this.setupSVGAnimation();
            this.showControls();
        } catch (error) {
            console.error('Error processing SVG file:', error);
            alert('Error processing SVG file. Please try again.');
        }
    }

    setupSVGAnimation() {
        // Parse SVG and prepare for animation
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(this.svgContent, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        // Find all paths, lines, circles, and other drawable elements
        const drawableElements = svgElement.querySelectorAll('path, line, polyline, polygon, circle, ellipse, rect');
        
        // Prepare each element for stroke animation
        drawableElements.forEach((element, index) => {
            const tagName = element.tagName.toLowerCase();
            
            // Convert shapes to paths for consistent animation
            if (tagName !== 'path') {
                const pathData = this.convertToPath(element);
                if (pathData) {
                    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    pathElement.setAttribute('d', pathData);
                    this.copyAttributes(element, pathElement);
                    element.parentNode.replaceChild(pathElement, element);
                }
            }
        });

        // Update the SVG content
        this.svgContent = new XMLSerializer().serializeToString(svgElement);
        this.updateAnimation();
    }

    convertToPath(element) {
        const tagName = element.tagName.toLowerCase();
        
        switch (tagName) {
            case 'line':
                const x1 = element.getAttribute('x1') || 0;
                const y1 = element.getAttribute('y1') || 0;
                const x2 = element.getAttribute('x2') || 0;
                const y2 = element.getAttribute('y2') || 0;
                return `M ${x1} ${y1} L ${x2} ${y2}`;
                
            case 'rect':
                const x = element.getAttribute('x') || 0;
                const y = element.getAttribute('y') || 0;
                const width = element.getAttribute('width') || 0;
                const height = element.getAttribute('height') || 0;
                return `M ${x} ${y} h ${width} v ${height} h -${width} Z`;
                
            case 'circle':
                const cx = element.getAttribute('cx') || 0;
                const cy = element.getAttribute('cy') || 0;
                const r = element.getAttribute('r') || 0;
                return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`;
                
            case 'polyline':
            case 'polygon':
                const points = element.getAttribute('points') || '';
                const pointsArray = points.trim().split(/\s+|,/).filter(p => p);
                let pathData = '';
                for (let i = 0; i < pointsArray.length; i += 2) {
                    if (i === 0) {
                        pathData += `M ${pointsArray[i]} ${pointsArray[i + 1]}`;
                    } else {
                        pathData += ` L ${pointsArray[i]} ${pointsArray[i + 1]}`;
                    }
                }
                if (tagName === 'polygon') {
                    pathData += ' Z';
                }
                return pathData;
                
            default:
                return null;
        }
    }

    copyAttributes(from, to) {
        for (let attr of from.attributes) {
            if (!['x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'cx', 'cy', 'r', 'points'].includes(attr.name)) {
                to.setAttribute(attr.name, attr.value);
            }
        }
    }

    updateAnimation() {
        if (!this.svgContent) return;

        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(this.svgContent, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        // Clear any existing animations and styles
        this.clearAnimations(svgElement);

        // Apply animation based on type
        switch (this.animationSettings.type) {
            case 'stroke':
                this.applyStrokeAnimation(svgElement);
                break;
            case 'typewriter':
                this.applyTypewriterAnimation(svgElement);
                break;
            case 'fade':
                this.applyFadeAnimation(svgElement);
                break;
            case 'scale':
                this.applyScaleAnimation(svgElement);
                break;
            case 'slide':
                this.applySlideAnimation(svgElement);
                break;
            case 'bounce':
                this.applyBounceAnimation(svgElement);
                break;
            case 'rotate':
                this.applyRotateAnimation(svgElement);
                break;
            case 'spread':
                this.applySpreadAnimation(svgElement);
                break;
        }

        // Update preview
        this.animatedSVG = new XMLSerializer().serializeToString(svgElement);
        this.displayPreview();
    }

    clearAnimations(svgElement) {
        // Remove existing animations and reset styles
        const animatedElements = svgElement.querySelectorAll('*');
        animatedElements.forEach(element => {
            // Remove animation elements
            const animations = element.querySelectorAll('animate, animateTransform');
            animations.forEach(anim => anim.remove());
            
            // Reset transform and style attributes
            element.removeAttribute('style');
            element.removeAttribute('transform');
            element.removeAttribute('opacity');
        });
    }

    applyStrokeAnimation(svgElement) {
        if (this.animationSettings.style === 'continuous') {
            this.applyContinuousAnimation(svgElement);
        } else {
            this.applyMultiplePathAnimation(svgElement);
        }
    }

    applyMultiplePathAnimation(svgElement) {
        // Apply animation settings to individual paths
        const paths = svgElement.querySelectorAll('path');
        paths.forEach((path, index) => {
            // Calculate path length
            const pathLength = this.calculatePathLength(path.getAttribute('d'));
            
            // Set up stroke animation
            path.setAttribute('stroke', this.animationSettings.strokeColor);
            path.setAttribute('stroke-width', this.animationSettings.strokeWidth);
            path.setAttribute('stroke-linecap', this.animationSettings.strokeLinecap);
            path.setAttribute('stroke-linejoin', this.animationSettings.strokeLinecap === 'round' ? 'round' : 'miter');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke-dasharray', pathLength);
            path.setAttribute('stroke-dashoffset', pathLength);
            
            // Add CSS class for animation
            path.classList.add('animated-path');
            
            // Set stroke style attributes (fallback for browsers that don't support CSS custom properties)
            path.style.setProperty('stroke-linecap', this.animationSettings.strokeLinecap);
            path.style.setProperty('stroke-linejoin', this.animationSettings.strokeLinecap === 'round' ? 'round' : 'miter');
            
            // Calculate start time based on animation style
            let startTime = this.animationSettings.delay;
            if (this.animationSettings.style === 'sequential') {
                startTime += (index * 0.1); // Staggered animation
            }
            // For 'simultaneous', all paths start at the same time
            
            // Create animation
            const animateElement = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animateElement.setAttribute('attributeName', 'stroke-dashoffset');
            animateElement.setAttribute('values', `${pathLength};0`);
            animateElement.setAttribute('dur', `${this.animationSettings.duration}s`);
            animateElement.setAttribute('begin', `${startTime}s`);
            animateElement.setAttribute('fill', 'freeze');
            
            // Remove existing animations
            const existingAnimate = path.querySelector('animate');
            if (existingAnimate) {
                existingAnimate.remove();
            }
            
            path.appendChild(animateElement);
        });
    }

    applyContinuousAnimation(svgElement) {
        // Combine all paths into one continuous path
        const paths = svgElement.querySelectorAll('path');
        let combinedPathData = '';
        
        // Collect all path data
        paths.forEach((path, index) => {
            const pathData = path.getAttribute('d');
            if (pathData) {
                if (index === 0) {
                    combinedPathData = pathData;
                } else {
                    // Add move command to connect paths
                    combinedPathData += ' ' + pathData;
                }
            }
        });

        // Remove all existing paths
        paths.forEach(path => path.remove());

        // Create single combined path
        if (combinedPathData) {
            const combinedPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            combinedPath.setAttribute('d', combinedPathData);
            combinedPath.setAttribute('stroke', this.animationSettings.strokeColor);
            combinedPath.setAttribute('stroke-width', this.animationSettings.strokeWidth);
            combinedPath.setAttribute('fill', 'none');
            combinedPath.setAttribute('stroke-linecap', this.animationSettings.strokeLinecap);
            combinedPath.setAttribute('stroke-linejoin', this.animationSettings.strokeLinecap === 'round' ? 'round' : 'miter');
            
            // Calculate total path length
            const totalLength = this.calculatePathLength(combinedPathData);
            
            // Set up animation
            combinedPath.setAttribute('stroke-dasharray', totalLength);
            combinedPath.setAttribute('stroke-dashoffset', totalLength);
            combinedPath.classList.add('animated-path');
            
            // Set stroke style attributes
            combinedPath.style.setProperty('stroke-linecap', this.animationSettings.strokeLinecap);
            combinedPath.style.setProperty('stroke-linejoin', this.animationSettings.strokeLinecap === 'round' ? 'round' : 'miter');
            
            // Create animation
            const animateElement = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animateElement.setAttribute('attributeName', 'stroke-dashoffset');
            animateElement.setAttribute('values', `${totalLength};0`);
            animateElement.setAttribute('dur', `${this.animationSettings.duration}s`);
            animateElement.setAttribute('begin', `${this.animationSettings.delay}s`);
            animateElement.setAttribute('fill', 'freeze');
            
            combinedPath.appendChild(animateElement);
            svgElement.appendChild(combinedPath);
        }
    }

    applyTypewriterAnimation(svgElement) {
        const elements = svgElement.querySelectorAll('path, text, circle, rect, line, polygon, polyline');
        elements.forEach((element, index) => {
            // Start hidden
            element.setAttribute('opacity', '0');
            
            // Calculate start time - typewriter should always be sequential
            let startTime = this.animationSettings.delay + (index * 0.2); // 200ms between each element
            
            // Create opacity animation with slight fade-in for smooth effect
            const animateElement = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animateElement.setAttribute('attributeName', 'opacity');
            animateElement.setAttribute('values', '0;0;1'); // Stay hidden briefly, then appear
            animateElement.setAttribute('dur', '0.3s'); // Longer duration for smoother effect
            animateElement.setAttribute('keyTimes', '0;0.7;1'); // Stay hidden for 70% of duration, then fade in
            animateElement.setAttribute('begin', `${startTime}s`);
            animateElement.setAttribute('fill', 'freeze');
            
            element.appendChild(animateElement);
        });
    }

    applyFadeAnimation(svgElement) {
        const elements = svgElement.querySelectorAll('path, text, circle, rect, line, polygon, polyline');
        elements.forEach((element, index) => {
            element.setAttribute('opacity', '0');
            
            let startTime = this.animationSettings.delay;
            if (this.animationSettings.style === 'sequential') {
                startTime += (index * 0.2);
            }
            
            const animateElement = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animateElement.setAttribute('attributeName', 'opacity');
            animateElement.setAttribute('values', '0;1');
            animateElement.setAttribute('dur', `${this.animationSettings.duration}s`);
            animateElement.setAttribute('begin', `${startTime}s`);
            animateElement.setAttribute('fill', 'freeze');
            
            element.appendChild(animateElement);
        });
    }

    applyScaleAnimation(svgElement) {
        const elements = svgElement.querySelectorAll('path, text, circle, rect, line, polygon, polyline');
        elements.forEach((element, index) => {
            let startTime = this.animationSettings.delay;
            if (this.animationSettings.style === 'sequential') {
                startTime += (index * 0.1);
            }
            
            // Get element bounds for transform origin
            const bbox = this.getElementBounds(element);
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            
            const animateTransform = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
            animateTransform.setAttribute('attributeName', 'transform');
            animateTransform.setAttribute('type', 'scale');
            animateTransform.setAttribute('values', '0;1.2;1');
            animateTransform.setAttribute('dur', `${this.animationSettings.duration}s`);
            animateTransform.setAttribute('begin', `${startTime}s`);
            animateTransform.setAttribute('fill', 'freeze');
            animateTransform.setAttribute('transform-origin', `${centerX} ${centerY}`);
            
            element.appendChild(animateTransform);
        });
    }

    applySlideAnimation(svgElement) {
        const elements = svgElement.querySelectorAll('path, text, circle, rect, line, polygon, polyline');
        elements.forEach((element, index) => {
            let startTime = this.animationSettings.delay;
            if (this.animationSettings.style === 'sequential') {
                startTime += (index * 0.1);
            }
            
            const animateTransform = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
            animateTransform.setAttribute('attributeName', 'transform');
            animateTransform.setAttribute('type', 'translate');
            animateTransform.setAttribute('values', '-100,0;0,0');
            animateTransform.setAttribute('dur', `${this.animationSettings.duration}s`);
            animateTransform.setAttribute('begin', `${startTime}s`);
            animateTransform.setAttribute('fill', 'freeze');
            
            element.appendChild(animateTransform);
        });
    }

    applyBounceAnimation(svgElement) {
        const elements = svgElement.querySelectorAll('path, text, circle, rect, line, polygon, polyline');
        elements.forEach((element, index) => {
            let startTime = this.animationSettings.delay;
            if (this.animationSettings.style === 'sequential') {
                startTime += (index * 0.1);
            }
            
            const animateTransform = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
            animateTransform.setAttribute('attributeName', 'transform');
            animateTransform.setAttribute('type', 'translate');
            animateTransform.setAttribute('values', '0,-50;0,10;0,-5;0,0');
            animateTransform.setAttribute('dur', `${this.animationSettings.duration}s`);
            animateTransform.setAttribute('begin', `${startTime}s`);
            animateTransform.setAttribute('fill', 'freeze');
            animateTransform.setAttribute('keyTimes', '0;0.5;0.8;1');
            
            element.appendChild(animateTransform);
        });
    }

    applyRotateAnimation(svgElement) {
        const elements = svgElement.querySelectorAll('path, text, circle, rect, line, polygon, polyline');
        elements.forEach((element, index) => {
            let startTime = this.animationSettings.delay;
            if (this.animationSettings.style === 'sequential') {
                startTime += (index * 0.1);
            }
            
            const bbox = this.getElementBounds(element);
            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;
            
            const animateTransform = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
            animateTransform.setAttribute('attributeName', 'transform');
            animateTransform.setAttribute('type', 'rotate');
            animateTransform.setAttribute('values', `360 ${centerX} ${centerY};0 ${centerX} ${centerY}`);
            animateTransform.setAttribute('dur', `${this.animationSettings.duration}s`);
            animateTransform.setAttribute('begin', `${startTime}s`);
            animateTransform.setAttribute('fill', 'freeze');
            
            element.appendChild(animateTransform);
        });
    }

    applySpreadAnimation(svgElement) {
        const elements = svgElement.querySelectorAll('path, text, circle, rect, line, polygon, polyline');
        const centerX = 200; // Assume center of SVG
        const centerY = 100;
        
        elements.forEach((element, index) => {
            let startTime = this.animationSettings.delay;
            if (this.animationSettings.style === 'sequential') {
                startTime += (index * 0.1);
            }
            
            // Calculate random spread direction
            const angle = (index / elements.length) * 2 * Math.PI;
            const distance = 100;
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            
            const animateTransform = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
            animateTransform.setAttribute('attributeName', 'transform');
            animateTransform.setAttribute('type', 'translate');
            animateTransform.setAttribute('values', `${offsetX},${offsetY};0,0`);
            animateTransform.setAttribute('dur', `${this.animationSettings.duration}s`);
            animateTransform.setAttribute('begin', `${startTime}s`);
            animateTransform.setAttribute('fill', 'freeze');
            
            element.appendChild(animateTransform);
        });
    }

    getElementBounds(element) {
        // Simplified bounds calculation
        try {
            const rect = element.getBoundingClientRect();
            return rect;
        } catch (e) {
            // Fallback for elements not in DOM
            return { x: 0, y: 0, width: 100, height: 100 };
        }
    }

    calculatePathLength(pathData) {
        // Create a temporary SVG element to calculate path length
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        svg.appendChild(path);
        document.body.appendChild(svg);
        
        const length = path.getTotalLength();
        document.body.removeChild(svg);
        
        return length;
    }

    displayPreview() {
        const previewContainer = document.getElementById('svgPreview');
        previewContainer.innerHTML = this.animatedSVG;
        
        // Apply stroke linecap settings via CSS custom properties
        const svgElement = previewContainer.querySelector('svg');
        if (svgElement) {
            svgElement.style.setProperty('--stroke-linecap', this.animationSettings.strokeLinecap);
            svgElement.style.setProperty('--stroke-linejoin', this.animationSettings.strokeLinecap === 'round' ? 'round' : 'miter');
        }
        
        // Apply current theme
        if (this.isDarkMode) {
            previewContainer.classList.add('dark-mode');
        } else {
            previewContainer.classList.remove('dark-mode');
        }
    }

    showControls() {
        document.getElementById('controlsSection').style.display = 'block';
        document.getElementById('previewSection').style.display = 'block';
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        
        // Update preview background
        const previewContainer = document.getElementById('svgPreview');
        if (this.isDarkMode) {
            previewContainer.classList.add('dark-mode');
        } else {
            previewContainer.classList.remove('dark-mode');
        }
        
        // Toggle button icons
        const sunIcon = document.querySelector('.sun-icon');
        const moonIcon = document.querySelector('.moon-icon');
        
        if (this.isDarkMode) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    playAnimation() {
        if (!this.animatedSVG) return;
        
        this.isAnimating = true;
        
        // Re-render the SVG to restart animations
        this.displayPreview();
        
        // Update button state
        const playBtn = document.getElementById('playBtn');
        playBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
            </svg>
            Playing...
        `;
        playBtn.disabled = true;
        
        // Re-enable after animation completes
        const totalDuration = (this.animationSettings.duration + this.animationSettings.delay + 1) * 1000;
        setTimeout(() => {
            playBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5,3 19,12 5,21"/>
                </svg>
                Play Animation
            `;
            playBtn.disabled = false;
            this.isAnimating = false;
        }, totalDuration);
    }

    resetAnimation() {
        if (!this.animatedSVG) return;
        
        // Reset by re-applying the animation setup
        this.updateAnimation();
        
        // Reset button states
        const playBtn = document.getElementById('playBtn');
        playBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5,3 19,12 5,21"/>
            </svg>
            Play Animation
        `;
        playBtn.disabled = false;
        this.isAnimating = false;
    }

    async exportToGIF() {
        if (!this.animatedSVG) return;
        
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.style.display = 'flex';
        
        try {
            // Use simplified approach - always try gif.js first, with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Timeout')), 10000); // 10 second timeout
            });
            
            const gifPromise = this.createGIFWithTimeout();
            
            await Promise.race([gifPromise, timeoutPromise]);
            
        } catch (error) {
            console.error('Error exporting GIF:', error);
            loadingOverlay.style.display = 'none';
            
            // Always fallback to frame export if GIF fails
            showToast('GIF generation failed or timed out. Exporting frames instead...', 'error');
            setTimeout(() => this.exportFramesAsImages(), 1000);
        }
    }

    async createGIFWithTimeout() {
        return new Promise(async (resolve, reject) => {
            try {
                // Try to use gif.js with CDN worker (only works on web servers)
                let gif;
                
                if (window.location.protocol !== 'file:') {
                    try {
                        gif = new GIF({
                            workers: 2,
                            quality: 10,
                            width: 800,
                            height: 600,
                            workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js'
                        });
                    } catch (e) {
                        throw new Error('GIF.js failed to initialize');
                    }
                } else {
                    throw new Error('Local file detected');
                }

                // Create canvas for rendering
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 600;
                const ctx = canvas.getContext('2d');
                
                // Calculate frame count and duration (reduced for faster processing)
                const fps = 10; // Lower FPS for faster generation
                const totalDuration = this.animationSettings.duration + this.animationSettings.delay + 0.5;
                const frameCount = Math.min(Math.ceil(totalDuration * fps), 50); // Max 50 frames
                const frameDelay = 1000 / fps;
                
                // Create frames with progress indicator
                for (let frame = 0; frame < frameCount; frame++) {
                    const progress = frame / frameCount;
                    const currentTime = progress * totalDuration;
                    
                    // Update loading text
                    const loadingText = document.querySelector('.loading-content p');
                    if (loadingText) {
                        loadingText.textContent = `Generating frame ${frame + 1} of ${frameCount}...`;
                    }
                    
                    // Clear canvas with appropriate background
                    ctx.fillStyle = this.isDarkMode ? '#1f2937' : 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Create SVG with current animation state
                    const svgData = this.createFrameSVG(currentTime);
                    
                    // Convert SVG to image and draw on canvas
                    await this.drawSVGOnCanvas(svgData, canvas, ctx);
                    
                    // Add frame to GIF
                    gif.addFrame(canvas, { delay: frameDelay });
                    
                    // Allow UI updates
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
                
                // Update loading text
                const loadingText = document.querySelector('.loading-content p');
                if (loadingText) {
                    loadingText.textContent = 'Finalizing GIF...';
                }
                
                // Set up event handlers
                gif.on('finished', (blob) => {
                    // Download the GIF
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'svg-animation.gif';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    document.getElementById('loadingOverlay').style.display = 'none';
                    showToast('GIF exported successfully!', 'success');
                    resolve();
                });
                
                gif.on('progress', (p) => {
                    const loadingText = document.querySelector('.loading-content p');
                    if (loadingText) {
                        loadingText.textContent = `Processing GIF... ${Math.round(p * 100)}%`;
                    }
                });
                
                // Start rendering
                gif.render();
                
            } catch (error) {
                reject(error);
            }
        });
    }

    async exportFramesAsImages() {
        if (!this.animatedSVG) return;

        showToast('Exporting animation frames as images...', 'info');
        
        try {
            // Create canvas for rendering
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            
            // Calculate frame count and duration
            const fps = 10;
            const totalDuration = this.animationSettings.duration + this.animationSettings.delay + 0.5;
            const frameCount = Math.ceil(totalDuration * fps);
            
            // Create frames
            for (let frame = 0; frame < frameCount; frame++) {
                const progress = frame / frameCount;
                const currentTime = progress * totalDuration;
                
                // Clear canvas with appropriate background
                ctx.fillStyle = this.isDarkMode ? '#1f2937' : 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Create SVG with current animation state
                const svgData = this.createFrameSVG(currentTime);
                
                // Convert SVG to image and draw on canvas
                await this.drawSVGOnCanvas(svgData, canvas, ctx);
                
                // Download frame as PNG
                const dataURL = canvas.toDataURL('image/png');
                const a = document.createElement('a');
                a.href = dataURL;
                a.download = `svg-animation-frame-${String(frame).padStart(3, '0')}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Small delay to prevent browser blocking
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            showToast(`Exported ${frameCount} frames! Use online tools to create GIF.`, 'success');
            
            // Show instructions
            setTimeout(() => {
                alert(`Exported ${frameCount} animation frames as PNG files!\n\nTo create a GIF:\n1. Use online tools like ezgif.com or giphy.com\n2. Upload all the frames in order\n3. Set frame delay to ${Math.round(1000/fps)}ms\n4. Create your GIF!\n\nAlternatively, run this app on a web server for direct GIF export.`);
            }, 500);
            
        } catch (error) {
            console.error('Error exporting frames:', error);
            showToast('Error exporting frames. Please try again.', 'error');
        }
    }



    exportToCSS() {
        if (!this.animatedSVG) return;

        const cssCode = this.generateCSSAnimation();
        const htmlCode = this.generateHTMLTemplate();
        
        // Create a combined file with HTML and CSS
        const combinedCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SVG Animation</title>
    <style>
${cssCode}
    </style>
</head>
<body>
    <div class="svg-container">
${htmlCode}
    </div>
    
    <script>
        // Restart animation
        function restartAnimation() {
            const svg = document.querySelector('svg');
            const animatedElements = svg.querySelectorAll('.animated-element');
            animatedElements.forEach(el => {
                el.style.animation = 'none';
                el.offsetHeight; // Trigger reflow
                el.style.animation = null;
            });
        }
        
        // Auto-restart every ${this.animationSettings.duration + this.animationSettings.delay + 1} seconds
        setInterval(restartAnimation, ${(this.animationSettings.duration + this.animationSettings.delay + 1) * 1000});
    </script>
</body>
</html>`;

        // Download the file
        const blob = new Blob([combinedCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'svg-animation.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('CSS Animation exported successfully!', 'success');
    }

    generateCSSAnimation() {
        const duration = this.animationSettings.duration;
        const delay = this.animationSettings.delay;
        
        let css = `.svg-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        svg {
            max-width: 100%;
            max-height: 80vh;
            filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));
        }

        .animated-element {
            animation-fill-mode: both;
            animation-timing-function: ease-out;
        }

`;

        switch (this.animationSettings.type) {
            case 'stroke':
                css += this.generateStrokeCSS();
                break;
            case 'typewriter':
                css += this.generateTypewriterCSS();
                break;
            case 'fade':
                css += this.generateFadeCSS();
                break;
            case 'scale':
                css += this.generateScaleCSS();
                break;
            case 'slide':
                css += this.generateSlideCSS();
                break;
            case 'bounce':
                css += this.generateBounceCSS();
                break;
            case 'rotate':
                css += this.generateRotateCSS();
                break;
            case 'spread':
                css += this.generateSpreadCSS();
                break;
        }

        return css;
    }

    generateStrokeCSS() {
        return `
        .animated-element {
            stroke: ${this.animationSettings.strokeColor};
            stroke-width: ${this.animationSettings.strokeWidth};
            fill: none;
            stroke-linecap: ${this.animationSettings.strokeLinecap};
            stroke-linejoin: ${this.animationSettings.strokeLinecap === 'round' ? 'round' : 'miter'};
            animation: drawStroke ${this.animationSettings.duration}s ease-out ${this.animationSettings.delay}s both;
        }

        @keyframes drawStroke {
            0% {
                stroke-dasharray: 1000;
                stroke-dashoffset: 1000;
            }
            100% {
                stroke-dasharray: 1000;
                stroke-dashoffset: 0;
            }
        }`;
    }

    generateTypewriterCSS() {
        return `
        .animated-element {
            opacity: 0;
            animation: typewriter 0.3s ease-out var(--animation-delay, ${this.animationSettings.delay}s) both;
        }

        @keyframes typewriter {
            0% { opacity: 0; }
            70% { opacity: 0; }
            100% { opacity: 1; }
        }`;
    }

    generateFadeCSS() {
        return `
        .animated-element {
            opacity: 0;
            animation: fadeIn ${this.animationSettings.duration}s ease-out var(--animation-delay, ${this.animationSettings.delay}s) both;
        }

        @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }`;
    }

    generateScaleCSS() {
        return `
        .animated-element {
            transform: scale(0);
            animation: scaleIn ${this.animationSettings.duration}s ease-out var(--animation-delay, ${this.animationSettings.delay}s) both;
        }

        @keyframes scaleIn {
            0% { transform: scale(0); }
            60% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }`;
    }

    generateSlideCSS() {
        return `
        .animated-element {
            transform: translateX(-100px);
            animation: slideIn ${this.animationSettings.duration}s ease-out var(--animation-delay, ${this.animationSettings.delay}s) both;
        }

        @keyframes slideIn {
            0% { transform: translateX(-100px); }
            100% { transform: translateX(0); }
        }`;
    }

    generateBounceCSS() {
        return `
        .animated-element {
            transform: translateY(-50px);
            animation: bounceIn ${this.animationSettings.duration}s ease-out var(--animation-delay, ${this.animationSettings.delay}s) both;
        }

        @keyframes bounceIn {
            0% { transform: translateY(-50px); }
            50% { transform: translateY(10px); }
            80% { transform: translateY(-5px); }
            100% { transform: translateY(0); }
        }`;
    }

    generateRotateCSS() {
        return `
        .animated-element {
            transform: rotate(360deg);
            animation: rotateIn ${this.animationSettings.duration}s ease-out var(--animation-delay, ${this.animationSettings.delay}s) both;
        }

        @keyframes rotateIn {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
        }`;
    }

    generateSpreadCSS() {
        return `
        .animated-element {
            animation: spreadIn ${this.animationSettings.duration}s ease-out var(--animation-delay, ${this.animationSettings.delay}s) both;
        }

        @keyframes spreadIn {
            0% { 
                transform: translate(var(--spread-x, 100px), var(--spread-y, 100px));
                opacity: 0;
            }
            100% { 
                transform: translate(0, 0);
                opacity: 1;
            }
        }`;
    }

    generateHTMLTemplate() {
        // Parse the SVG and add CSS classes
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(this.animatedSVG, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        // Remove SVG animations and add CSS classes
        const elements = svgElement.querySelectorAll('path, text, circle, rect, line, polygon, polyline');
        elements.forEach((element, index) => {
            // Remove SVG animations
            const animations = element.querySelectorAll('animate, animateTransform');
            animations.forEach(anim => anim.remove());

            // Add CSS class
            element.classList.add('animated-element');

            // Add individual animation delays for sequential animations
            if (this.animationSettings.style === 'sequential') {
                let delay = this.animationSettings.delay;
                if (this.animationSettings.type === 'typewriter') {
                    delay += (index * 0.2);
                } else {
                    delay += (index * 0.1);
                }
                element.style.setProperty('--animation-delay', `${delay}s`);
            } else if (this.animationSettings.type === 'typewriter') {
                // Typewriter should always be sequential
                let delay = this.animationSettings.delay + (index * 0.2);
                element.style.setProperty('--animation-delay', `${delay}s`);
            }

            // Add spread animation variables
            if (this.animationSettings.type === 'spread') {
                const angle = (index / elements.length) * 2 * Math.PI;
                const distance = 100;
                const offsetX = Math.cos(angle) * distance;
                const offsetY = Math.sin(angle) * distance;
                element.style.setProperty('--spread-x', `${offsetX}px`);
                element.style.setProperty('--spread-y', `${offsetY}px`);
            }
        });

        return '        ' + new XMLSerializer().serializeToString(svgElement);
    }

    createFrameSVG(currentTime) {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(this.animatedSVG, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;
        
        // Calculate animation progress for each path
        const paths = svgElement.querySelectorAll('path');
        paths.forEach((path, index) => {
            const pathLength = parseFloat(path.getAttribute('stroke-dasharray'));
            
            // Calculate start time based on animation style
            let startTime = this.animationSettings.delay;
            if (this.animationSettings.style === 'sequential') {
                startTime += (index * 0.1);
            }
            // For 'simultaneous' and 'continuous', all paths start at the same time
            
            const endTime = startTime + this.animationSettings.duration;
            
            let progress = 0;
            if (currentTime >= startTime && currentTime <= endTime) {
                progress = (currentTime - startTime) / this.animationSettings.duration;
            } else if (currentTime > endTime) {
                progress = 1;
            }
            
            const currentOffset = pathLength * (1 - progress);
            path.setAttribute('stroke-dashoffset', currentOffset);
            
            // Remove animate elements for static frame
            const animateElement = path.querySelector('animate');
            if (animateElement) {
                animateElement.remove();
            }
        });
        
        return new XMLSerializer().serializeToString(svgElement);
    }

    drawSVGOnCanvas(svgData, canvas, ctx) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                // Calculate dimensions to fit SVG in canvas while maintaining aspect ratio
                const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                const x = (canvas.width - img.width * scale) / 2;
                const y = (canvas.height - img.height * scale) / 2;
                
                ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                resolve();
            };
            img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new SVGAnimator();
});

// Add some utility functions for better UX
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add toast styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        animation: slideInRight 0.3s ease-out;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add CSS animations for toasts
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 