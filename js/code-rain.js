// code-rain.js – Falling code keywords and programming terms

const canvas = document.getElementById("code-rain");
const ctx = canvas.getContext("2d");

// Set canvas to full window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Basic coding keywords
const codeTerms = [
  "if", "else", "for", "while", "do", "switch", "case", "break", "continue",
  "int", "bool", "float", "char", "void", "string", "const", "let", "var",
  "function", "return", "class", "public", "private", "static",
  "true", "false", "null", "new", "this", "try", "catch",
  "import", "export", "require",
  "==", "!=", "<", ">", "<=", ">=", "&&", "||", "++", "--",
  "{}", "[]", "()", "//", "/*", "*/", "#include",
  "def", "print", "input", "lambda", "async", "await",
];

const fontSize = 16;
const columnWidth = 160; 
const columns = Math.floor(canvas.width / columnWidth);

// IDE-style colors
const colors = [
  { main: "rgba(122, 162, 247, ", highlight: "rgba(170, 200, 255, " }, // Blue
  { main: "rgba(86, 182, 194, ", highlight: "rgba(140, 220, 230, " }, // Aqua
  { main: "rgba(187, 154, 247, ", highlight: "rgba(220, 190, 255, " }, // Lavender
  { main: "rgba(224, 108, 117, ", highlight: "rgba(255, 160, 180, " }, // Red-Pink
  { main: "rgba(255, 158, 100, ", highlight: "rgba(255, 190, 150, " }, // Peach
];

const numColors = colors.length;

// Initialize streams
const streams = [];
for (let i = 0; i < columns; i++) {
  streams.push({
    x: i * columnWidth + 20, 
    terms: [],
    speed: 2.5, 
    nextSpawn: Math.random() * 50,
  });
}

function draw() {
  // ⭐️ ADJUSTED: Semi-transparent black with 0.35 opacity.
  // This creates a "very little" trail that fades quickly but isn't instant.
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)"; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = `${fontSize}px 'Courier New', monospace`;
  ctx.textAlign = "left";

  streams.forEach((stream) => {
    stream.nextSpawn -= stream.speed;
    
    if (stream.nextSpawn <= 0) {
      stream.terms.push({
        text: codeTerms[Math.floor(Math.random() * codeTerms.length)],
        y: -40, 
        age: 0,
        colorIndex: Math.floor(Math.random() * numColors) 
      });
      stream.nextSpawn = 30 + Math.random() * 20; 
    }

    for (let i = stream.terms.length - 1; i >= 0; i--) {
      const term = stream.terms[i];
      term.y += stream.speed;
      term.age++;

      const colorScheme = colors[term.colorIndex]; 

      if (term.y > canvas.height + 100) {
        stream.terms.splice(i, 1);
        continue;
      }
      
      const isNewest = i === stream.terms.length - 1;
      let opacity;
      
      if (isNewest) {
        opacity = 1;
        ctx.fillStyle = colorScheme.highlight + opacity + ")";
        ctx.shadowBlur = 15;
        ctx.shadowColor = colorScheme.main + "0.8)";
      } else {
        const fadeStart = canvas.height * 0.85; 
        if (term.y > fadeStart) {
            const fadeDistance = canvas.height - fadeStart;
            const yOffset = term.y - fadeStart;
            opacity = Math.max(0, 1 - (yOffset / fadeDistance)); 
        } else {
            opacity = 1;
        }
        opacity = Math.max(opacity * 0.8, 0.4); 

        ctx.fillStyle = colorScheme.main + opacity + ")";
        ctx.shadowBlur = 0; 
      }

      ctx.fillText(term.text, stream.x, term.y);
      ctx.shadowBlur = 0;
    }
  });
}

let animationId;
function animate() {
  draw();
  animationId = requestAnimationFrame(animate);
}
// Do NOT auto-start — controlled by easter egg
window.startMatrix = function () {
    if (!animationId) {
        document.getElementById("code-rain").style.display = "block";
        animate();
    }
};

window.stopMatrix = function () {
    cancelAnimationFrame(animationId);
    animationId = null;
    document.getElementById("code-rain").style.display = "none";
};


window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const newColumns = Math.floor(canvas.width / columnWidth);
  
  while (streams.length < newColumns) {
    const newIndex = streams.length;
    streams.push({
      x: newIndex * columnWidth + 20,
      terms: [],
      speed: 2.5, 
      nextSpawn: Math.random() * 50,
    });
  }
  
  while (streams.length > newColumns) {
    streams.pop();
  }
  
  streams.forEach((stream, i) => {
    stream.x = i * columnWidth + 20;
  });
});