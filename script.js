// DOM Elements
const entryScreen = document.getElementById('entryScreen');
const letterScreen = document.getElementById('letterScreen');
const nameInput = document.getElementById('nameInput');
const openLetterBtn = document.getElementById('openLetterBtn');
const replayBtn = document.getElementById('replayBtn');
const shareBtn = document.getElementById('shareBtn');
const typewriterText = document.getElementById('typewriter-text');
const bgMusic = document.getElementById('bgMusic');
const particlesContainer = document.querySelector('.particles-container');
const musicOptions = document.querySelectorAll('.music-option');
const volumeSlider = document.getElementById('volumeSlider');
const roleSelect = document.getElementById('roleSelect');
const snowContainer = document.querySelector('.snow-container');
const handwrittenContainer = document.getElementById('handwrittenContainer');
const starsCanvas = document.getElementById('starsCanvas');
const entryCard3d = document.getElementById('entryCard3d');
const letter3d = document.getElementById('letter3d');
const confettiContainer = document.getElementById('confettiContainer');

// ═══════════════════════════════════════════════════
// 3D PARALLAX STAR FIELD (Canvas)
// ═══════════════════════════════════════════════════
const starsCtx = starsCanvas ? starsCanvas.getContext('2d') : null;
let stars = [];

function resizeStarsCanvas() {
    if (!starsCanvas) return;
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
}

class Star {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.z = Math.random() * 3; // depth layer (0=far, 3=close)
        this.baseSize = 0.3 + this.z * 0.5;
        this.size = this.baseSize;
        this.opacity = 0.2 + this.z * 0.15;
        this.twinkleSpeed = 0.005 + Math.random() * 0.02;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.color = this.getStarColor();
    }
    getStarColor() {
        const colors = [
            '255, 255, 255',      // white
            '253, 121, 168',      // pink 
            '162, 155, 254',      // lavender
            '249, 202, 36',       // gold
            '116, 185, 255',      // blue
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    update(time) {
        this.twinklePhase += this.twinkleSpeed;
        const twinkle = Math.sin(this.twinklePhase) * 0.5 + 0.5;
        this.size = this.baseSize * (0.6 + twinkle * 0.8);
        this.currentOpacity = this.opacity * (0.3 + twinkle * 0.7);
    }
    draw() {
        if (!starsCtx) return;
        starsCtx.beginPath();
        starsCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        starsCtx.fillStyle = `rgba(${this.color}, ${this.currentOpacity})`;
        starsCtx.fill();
        
        // Add glow for closer/brighter stars
        if (this.z > 1.5) {
            starsCtx.beginPath();
            starsCtx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            starsCtx.fillStyle = `rgba(${this.color}, ${this.currentOpacity * 0.08})`;
            starsCtx.fill();
        }
    }
}

function initStars() {
    resizeStarsCanvas();
    const count = Math.min(150, Math.floor(window.innerWidth * window.innerHeight / 8000));
    stars = [];
    for (let i = 0; i < count; i++) {
        stars.push(new Star());
    }
}

let starTime = 0;
function animateStars() {
    if (!starsCtx) return;
    starsCtx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
    starTime += 0.016;
    stars.forEach(s => { s.update(starTime); s.draw(); });
    requestAnimationFrame(animateStars);
}

// ═══════════════════════════════════════════════════
// 3D MOUSE/TOUCH TILT EFFECT
// ═══════════════════════════════════════════════════
let mouseX = 0, mouseY = 0;
let targetRotX = 0, targetRotY = 0;
let currentRotX = 0, currentRotY = 0;

function handleMouseMove(e) {
    const rect = entryCard3d ? entryCard3d.getBoundingClientRect() : null;
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX = (e.clientX - centerX) / (rect.width / 2);
    mouseY = (e.clientY - centerY) / (rect.height / 2);
    
    targetRotX = -mouseY * 8; // Max 8 degrees
    targetRotY = mouseX * 8;
}

function handleTouchMove(e) {
    if (e.touches.length > 0) {
        handleMouseMove(e.touches[0]);
    }
}

function animateTilt() {
    currentRotX += (targetRotX - currentRotX) * 0.08;
    currentRotY += (targetRotY - currentRotY) * 0.08;
    
    if (entryCard3d && !entryScreen.classList.contains('hidden')) {
        const card = entryCard3d.querySelector('.entry-content');
        if (card) {
            card.style.transform = `perspective(1000px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
        }
    }
    
    if (letter3d && !letterScreen.classList.contains('hidden')) {
        const tiltX = currentRotX * 0.3;
        const tiltY = currentRotY * 0.3;
        letter3d.style.transform = `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }
    
    requestAnimationFrame(animateTilt);
}

document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('touchmove', handleTouchMove, { passive: true });
document.addEventListener('mouseleave', () => {
    targetRotX = 0;
    targetRotY = 0;
});

// ═══════════════════════════════════════════════════
// 3D CONFETTI BURST
// ═══════════════════════════════════════════════════
function launchConfetti() {
    if (!confettiContainer) return;
    
    const colors = [
        '#e84393', '#fd79a8', '#6c5ce7', '#a29bfe',
        '#f9ca24', '#ffeaa7', '#ff6b81', '#ff9ff3',
        '#54a0ff', '#48dbfb', '#1dd1a1', '#feca57'
    ];
    
    const shapes = ['circle', 'square', 'triangle'];
    const count = 60;
    
    for (let i = 0; i < count; i++) {
        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const size = Math.random() * 8 + 6;
        const left = Math.random() * 100;
        const delay = Math.random() * 0.8;
        const duration = 2.5 + Math.random() * 2;
        const rotateStart = Math.random() * 360;
        const drift = (Math.random() - 0.5) * 200;
        
        let borderRadius = '0';
        let clipPath = 'none';
        if (shape === 'circle') borderRadius = '50%';
        if (shape === 'triangle') clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
        
        piece.style.cssText = `
            left: ${left}%;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${borderRadius};
            clip-path: ${clipPath};
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
            --drift: ${drift}px;
            box-shadow: 0 0 6px ${color}40;
        `;
        
        // Override animation with custom keyframes including drift
        piece.style.animation = 'none';
        piece.offsetHeight; // reflow
        piece.style.animation = `confettiFall ${duration}s ease-out ${delay}s forwards`;
        piece.style.setProperty('--random-x', `${drift}px`);
        
        // Custom animation using JS for more control
        const startTime = performance.now() + delay * 1000;
        const startX = left / 100 * window.innerWidth;
        let animFrame;
        
        function animateConfetti(now) {
            const elapsed = (now - startTime) / 1000;
            if (elapsed < 0) {
                animFrame = requestAnimationFrame(animateConfetti);
                return;
            }
            
            const progress = elapsed / duration;
            if (progress > 1) {
                piece.remove();
                return;
            }
            
            const y = progress * window.innerHeight * 1.1;
            const x = Math.sin(elapsed * 3) * 40 + drift * progress;
            const rotation = rotateStart + elapsed * 200;
            const scale = 1 - progress * 0.5;
            const opacity = progress < 0.85 ? 1 : (1 - (progress - 0.85) / 0.15);
            
            piece.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg) scale(${scale})`;
            piece.style.opacity = opacity;
            piece.style.top = '0';
            piece.style.left = `${startX}px`;
            piece.style.animation = 'none';
            
            animFrame = requestAnimationFrame(animateConfetti);
        }
        
        confettiContainer.appendChild(piece);
        requestAnimationFrame(animateConfetti);
        
        // Clean up after animation
        setTimeout(() => {
            if (piece.parentNode) piece.remove();
        }, (delay + duration) * 1000 + 100);
    }
}

// ═══════════════════════════════════════════════════
// Farewell Message Templates
// ═══════════════════════════════════════════════════
const farewellMessage = (name, role) => {
    if (role === 'teacher') {
        return `Dear Respected ${name} Sir/Madam,

With immense respect and heartfelt gratitude,
we, the 3rd year students of the ECE Department,
warmly invite you to grace the occasion of our Farewell Fest 2026,
organized in honor of our beloved final year seniors.

Your presence would mean a great deal to us,
as we bid farewell to a memorable batch whose journey you've guided, nurtured, and inspired.

Let us come together to celebrate their accomplishments,
reflect on shared memories, and wish them the very best for their future endeavors.

🎓 FAREWELL FEST 2026 🎓

📅 Date: Wednesday, 15th April 2026
🕑 Time: 2:00 PM to 4:30 PM
📍 Venue: C. V. Raman Indoor Auditorium

We would be honored by your esteemed presence and blessings on this heartfelt occasion.

Warm regards,
3rd Year Students – ECE Department ❤️`;
    } else {
        return `Dear ${name},

With love in our hearts ❤️ and gratitude in every word,
we, your juniors from the ECE Department,
warmly invite you to an evening of celebration 💖 —
a tribute to the memories we've shared and the legacy you leave behind 💞.

Your presence has been a light in our journey ✨,
your guidance a gift we'll always cherish 💝.
As you step into a new chapter 📖,
allow us to honor your remarkable path with joy and admiration 💗.

🎓 HAPPY FAREWELL 2026 🎓

📅 Date: Wednesday, 15th April 2026
🕑 Time: 2:00 PM to 4:30 PM
📍 Venue: C. V. Raman Indoor Auditorium

Let's gather to laugh, to remember, and to say —
not goodbye, but thank you 💓

With heartfelt wishes and endless love,
Your Juniors 💘`;
    }
};

// ═══════════════════════════════════════════════════
// Typewriter Effect
// ═══════════════════════════════════════════════════
function startTypewriter(name, role) {
    const typewriterText = document.getElementById('typewriter-text');
    typewriterText.innerHTML = '';
    const paragraphs = farewellMessage(name, role).split('\n\n');
    let currentParagraph = 0;
    let currentChar = 0;
    let isTyping = true;
    let typingSpeed = 30;
    let pauseBetweenParagraphs = 400;

    function getTypingSpeed(char) {
        if (char === ' ' || char === '\n') return typingSpeed * 0.5;
        if (char === ',' || char === '.') return typingSpeed * 1.5;
        if (char === '!' || char === '?') return typingSpeed * 2;
        return typingSpeed;
    }

    function type() {
        if (currentParagraph < paragraphs.length) {
            const paragraph = paragraphs[currentParagraph];
            
            if (currentChar === 0) {
                const p = document.createElement('p');
                if (paragraph.includes('🎓')) {
                    p.className = 'farewell-title';
                    typingSpeed = 40;
                } else if (paragraph.includes('📍') || paragraph.includes('📅') || paragraph.includes('🕑')) {
                    p.className = 'detail-item';
                    typingSpeed = 35;
                } else if (paragraph.includes('Your Juniors')) {
                    p.className = 'signature';
                    typingSpeed = 45;
                } else {
                    typingSpeed = 30;
                }
                typewriterText.appendChild(p);
            }

            const currentP = typewriterText.lastElementChild;
            
            if (currentChar < paragraph.length) {
                const span = document.createElement('span');
                span.textContent = paragraph[currentChar];
                span.style.opacity = '0';
                span.style.transition = 'opacity 0.15s ease';
                span.style.display = 'inline';
                currentP.appendChild(span);
                
                setTimeout(() => {
                    span.style.opacity = '1';
                }, 10);

                currentChar++;
                const nextChar = paragraph[currentChar];
                const delay = getTypingSpeed(nextChar);
                setTimeout(type, delay);
            } else {
                currentParagraph++;
                currentChar = 0;
                if (currentParagraph < paragraphs.length) {
                    setTimeout(type, pauseBetweenParagraphs);
                } else {
                    isTyping = false;
                    if (role === 'student') {
                        setTimeout(() => {
                            handwrittenContainer.classList.remove('hidden');
                            setTimeout(() => {
                                handwrittenContainer.classList.add('hidden');
                            }, 3000);
                        }, 2000);
                    }
                }
            }
        }
    }

    setTimeout(type, 500);
}

// ═══════════════════════════════════════════════════
// Particle System (Sakura Petals)
// ═══════════════════════════════════════════════════
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = -10;
        this.size = Math.random() * 5 + 5;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 + 1;
        this.rotation = Math.random() * 360;
        this.opacity = Math.random() * 0.3 + 0.2;
        this.element = document.createElement('div');
        this.element.className = 'particle';
        this.element.style.cssText = `
            position: absolute;
            width: ${this.size}px;
            height: ${this.size}px;
            background: rgba(253, 121, 168, ${this.opacity});
            border-radius: 50%;
            pointer-events: none;
            box-shadow: 0 0 ${this.size}px rgba(253, 121, 168, ${this.opacity * 0.5});
        `;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += 2;

        if (this.y > window.innerHeight) {
            this.reset();
        }

        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
    }
}

const particles = [];
const PARTICLE_COUNT = 30;

function initParticles() {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const particle = new Particle();
        particles.push(particle);
        particlesContainer.appendChild(particle.element);
    }
}

function animateParticles() {
    particles.forEach(particle => particle.update());
    requestAnimationFrame(animateParticles);
}

// ═══════════════════════════════════════════════════
// Snow Effect
// ═══════════════════════════════════════════════════
class SnowElement {
    constructor(type) {
        this.type = type;
        this.reset();
    }

    reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = -10;
        this.size = this.type === 'flake' ? Math.random() * 3 + 2 : Math.random() * 15 + 10;
        this.speed = this.type === 'flake' ? Math.random() * 2 + 1 : Math.random() * 3 + 2;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = this.type === 'flake' ? Math.random() * 2 - 1 : Math.random() * 3 - 1.5;
        this.element = document.createElement('div');
        this.element.className = this.type === 'flake' ? 'snowflake' : 'snow-crystal';
        this.element.style.cssText = `
            width: ${this.size}px;
            height: ${this.size}px;
            left: ${this.x}px;
            top: ${this.y}px;
            animation-duration: ${this.type === 'flake' ? 5 + Math.random() * 5 : 8 + Math.random() * 7}s;
            animation-delay: ${Math.random() * 10}s;
        `;
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotationSpeed;
        this.element.style.transform = `translateY(${this.y}px) rotate(${this.rotation}deg)`;

        if (this.y > window.innerHeight) {
            this.reset();
        }
    }
}

const snowElements = [];
const SNOWFLAKE_COUNT = 25;
const CRYSTAL_COUNT = 15;

function initSnow() {
    for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
        const snowflake = new SnowElement('flake');
        snowElements.push(snowflake);
        snowContainer.appendChild(snowflake.element);
    }
    for (let i = 0; i < CRYSTAL_COUNT; i++) {
        const crystal = new SnowElement('crystal');
        snowElements.push(crystal);
        snowContainer.appendChild(crystal.element);
    }
}

function animateSnow() {
    snowElements.forEach(element => element.update());
    requestAnimationFrame(animateSnow);
}

// ═══════════════════════════════════════════════════
// Music Controls
// ═══════════════════════════════════════════════════
bgMusic.volume = 0.3;
volumeSlider.value = 30;

musicOptions.forEach(option => {
    option.addEventListener('click', () => {
        const source = option.dataset.source;
        bgMusic.src = source;
        bgMusic.play();
        musicOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
    });
});

volumeSlider.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value / 100;
});

document.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
    }
}, { once: true });

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        bgMusic.pause();
    } else {
        bgMusic.play();
    }
});

// ═══════════════════════════════════════════════════
// Event Handlers
// ═══════════════════════════════════════════════════

openLetterBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const role = roleSelect.value;
    
    if (name && role) {
        // Dramatic exit: 3D flip away
        const card = entryCard3d.querySelector('.entry-content');
        if (card) {
            card.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.transform = 'perspective(1000px) rotateY(90deg) scale(0.8)';
            card.style.opacity = '0';
        }
        
        setTimeout(() => {
            entryScreen.classList.add('hidden');
            letterScreen.classList.remove('hidden');
            startTypewriter(name, role);
            bgMusic.play();
            
            // Launch confetti on reveal!
            setTimeout(launchConfetti, 300);
        }, 600);
    } else {
        // Shake effect
        const content = entryCard3d.querySelector('.entry-content');
        if (content) {
            content.style.transition = 'transform 0.05s ease';
            const shakeSequence = [
                'perspective(1000px) translateX(-8px)',
                'perspective(1000px) translateX(8px)',
                'perspective(1000px) translateX(-5px)',
                'perspective(1000px) translateX(5px)',
                'perspective(1000px) translateX(-3px)',
                'perspective(1000px) translateX(3px)',
                'perspective(1000px) translateX(0)',
            ];
            shakeSequence.forEach((t, i) => {
                setTimeout(() => { content.style.transform = t; }, i * 60);
            });
            setTimeout(() => {
                content.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            }, shakeSequence.length * 60);
        }
        
        if (!name && !role) {
            alert('Please enter your name and select your role ✨');
        } else if (!name) {
            alert('Please enter your name ✨');
        } else {
            alert('Please select your role ✨');
        }
    }
});

nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        openLetterBtn.click();
    }
});

replayBtn.addEventListener('click', () => {
    const typewriterText = document.getElementById('typewriter-text');
    typewriterText.innerHTML = '';
    startTypewriter(nameInput.value.trim(), roleSelect.value);
    bgMusic.currentTime = 0;
    bgMusic.play();
    launchConfetti();
});

shareBtn.addEventListener('click', async () => {
    try {
        if (navigator.share) {
            await navigator.share({
                title: '🎓 Farewell Invitation 2026',
                text: 'You\'re warmly invited to our Farewell Fest 2026! Join us for a beautiful celebration of memories.',
                url: window.location.href
            });
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard! Share it with your friends 🎉');
        }
    } catch (error) {
        console.error('Error sharing:', error);
    }
});

// ═══════════════════════════════════════════════════
// Initialization
// ═══════════════════════════════════════════════════
window.addEventListener('load', () => {
    try {
        initStars();
        animateStars();
        animateTilt();
        initParticles();
        animateParticles();
        initSnow();
        animateSnow();
    } catch (error) {
        console.error('Error in initialization:', error);
    }
});

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        try {
            resizeStarsCanvas();
            initStars();
            particles.forEach(particle => particle.reset());
            snowElements.forEach(element => element.reset());
        } catch (error) {
            console.error('Error in resize handler:', error);
        }
    }, 250);
});