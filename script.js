let scene, camera, renderer, moon, textureLoader;
let controls;

const canvas = document.getElementById('moonCanvas');
const music = document.getElementById('bgMusic');

let currentPhaseAngle = 0;  // will hold current light angle in radians
let targetPhaseAngle = 0;   // target angle to animate toward
let isTransitioning = false;
let transitionStartTime = 0;
const transitionDuration = 1500; // animation duration in milliseconds

// Zodiac personality descriptions
const zodiacPersonality = {
  "Aries": "Energetic and courageous, Aries leads with confidence.",
  "Taurus": "Reliable and patient, Taurus values stability.",
  "Gemini": "Curious and adaptable, Gemini loves variety.",
  "Cancer": "Emotional and intuitive, Cancer cares deeply.",
  "Leo": "Charismatic and generous, Leo shines bright.",
  "Virgo": "Analytical and kind, Virgo pays attention to detail.",
  "Libra": "Diplomatic and charming, Libra seeks harmony.",
  "Scorpio": "Passionate and resourceful, Scorpio is intense.",
  "Sagittarius": "Optimistic and adventurous, Sagittarius loves freedom.",
  "Capricorn": "Disciplined and wise, Capricorn is goal-oriented.",
  "Aquarius": "Innovative and independent, Aquarius thinks ahead.",
  "Pisces": "Compassionate and artistic, Pisces feels deeply."
};

// Moon phase personality insights
const moonPhasePersonality = {
  "New Moon": "A time for new beginnings and fresh ideas.",
  "Waxing Crescent": "Growth and potential are blossoming.",
  "First Quarter": "Challenges bring strength and progress.",
  "Waxing Gibbous": "Reflection and refinement lead to success.",
  "Full Moon": "Energy peaks with clarity and illumination.",
  "Waning Gibbous": "Sharing and gratitude are emphasized.",
  "Last Quarter": "Release and forgiveness prepare for change.",
  "Waning Crescent": "Rest and recuperation restore balance."
};

// Get Zodiac sign from birthday
function getZodiacSign(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1; // JS months are 0-based

  if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Aquarius";
  if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Pisces";
  if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries";
  if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus";
  if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini";
  if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer";
  if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
  if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
  if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
  if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio";
  if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius";
  return "Capricorn"; // default Dec 22 - Jan 19
}



// 📍 Start everything on button click
window.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById("startBtn");

  startBtn.addEventListener("click", () => {
    music.play().catch(() => console.log("Audio play blocked"));
    startBtn.style.display = "none";
    init();
    animate();
    setMoonPhase(new Date(), false); // Today's moon
  });

  // Handle shared link logic
  const params = new URLSearchParams(window.location.search);
  const dobParam = params.get('dob');
  const nameParam = params.get('name');

  if (dobParam && nameParam) {
    const autoDOB = new Date(dobParam);
    document.getElementById('dobInput').value = dobParam;
    document.getElementById('nameInput').value = nameParam;

    // Simulate user starting manually
    setTimeout(() => {
      startBtn.click();
      setTimeout(() => {
        const phaseName = setMoonPhase(autoDOB, true);
        const zodiac = getZodiacSign(autoDOB);
        const zodiacDesc = zodiacPersonality[zodiac];
        const moonDesc = moonPhasePersonality[phaseName] || "";
        const advice = getMoonAdvice(phaseName);

        document.getElementById('message').innerHTML = `
        
          <strong>${nameParam}</strong>, the moon on <strong>${autoDOB.toDateString()}</strong> was in the <strong>"${phaseName}"</strong> phase.<br><br>
          🌙 <strong>Zodiac Sign:</strong> ${zodiac} — ${zodiacDesc}<br>
          🌘 <strong>Moon Phase Insight:</strong> ${moonDesc}<br>
          💫 <strong>Daily Moon Advice:</strong> ${advice}
        `;

        // 📤 Add spacing and heading before share buttons
        // 📤 Add spacing and heading before share buttons (without <hr>)
            document.getElementById('message').innerHTML += `
        <div style="margin-top: 20px;"></div> <!-- spacer between advice and share -->

        <div style="font-size: 1.1em; margin-bottom: 6px;"><strong>🌐 Share your moon link:</strong></div>

        <div id="shareButtons" style="display: none; gap: 10px; margin-top: 10px;">
        <a id="whatsappShare" href="#" target="_blank" style="margin-right: 10px;">📱 WhatsApp</a>
        <a id="twitterShare" href="#" target="_blank" style="margin-right: 10px;">🐦 Twitter</a>
        <a id="facebookShare" href="#" target="_blank">📘 Facebook</a>
        </div>
        `;



        // 📤 Update share buttons
        const currentUrl = window.location.href;
        const shareText = `${nameParam} discovered their moon phase: "${phaseName}" 🌙 Check yours!`;
        const encodedText = encodeURIComponent(shareText);
        const encodedUrl = encodeURIComponent(currentUrl);

        document.getElementById('whatsappShare').href = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        document.getElementById('twitterShare').href = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        document.getElementById('facebookShare').href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

        // 📤 Show the buttons
        document.getElementById('shareButtons').style.display = "block";

      }, 500);
    }, 300);
  }

  // Form submission
  document.getElementById('moonForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const dob = new Date(document.getElementById('dobInput').value);
    const name = document.getElementById('nameInput').value;

    const phaseName = setMoonPhase(dob, true);
    const zodiac = getZodiacSign(dob);
    const zodiacDesc = zodiacPersonality[zodiac];
    const moonDesc = moonPhasePersonality[phaseName] || "";
    const advice = getMoonAdvice(phaseName);

    document.getElementById('message').innerHTML = `
      <strong>${name}</strong>, the moon on <strong>${dob.toDateString()}</strong> was in the <strong>"${phaseName}"</strong> phase.<br><br>
      🌙 <strong>Zodiac Sign:</strong> ${zodiac} — ${zodiacDesc}<br>
      🌘 <strong>Moon Phase Insight:</strong> ${moonDesc}<br>
      💫 <strong>Daily Moon Advice:</strong> ${advice}
    `;

    const queryString = `?name=${encodeURIComponent(name)}&dob=${dob.toISOString().split('T')[0]}`;
    history.replaceState(null, '', queryString); // Update URL
  });
});


let directionalLight;

// 🌕 Init 3D Scene
function init() {
  scene = new THREE.Scene();

  const size = canvas.clientWidth;

  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000); // aspect = 1 for square
  camera.position.z = 3;

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(size, size);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;

  textureLoader = new THREE.TextureLoader();
  const moonTexture = textureLoader.load("assets/moontexture.jpg");

  const geometry = new THREE.SphereGeometry(1, 128, 128);
  const material = new THREE.MeshStandardMaterial({
    map: moonTexture,
    roughness: 1,
    metalness: 0.3
  });

  moon = new THREE.Mesh(geometry, material);
  moon.castShadow = true;
  scene.add(moon);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 3, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.radius = 2;
}

// 🎥 Animate Rotation
function animate(time = 0) {
  requestAnimationFrame(animate);

  if (isTransitioning) {
    const elapsed = time - transitionStartTime;
    let t = Math.min(elapsed / transitionDuration, 1); // normalized [0,1]

    // Calculate shortest angular distance for smooth rotation
    let deltaAngle = targetPhaseAngle - currentPhaseAngle;
    if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
    else if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

    const currentAngle = currentPhaseAngle + deltaAngle * t;
    directionalLight.position.set(Math.cos(currentAngle) * 5, 0, Math.sin(currentAngle) * 5);

    if (t === 1) {
      // Animation finished
      currentPhaseAngle = targetPhaseAngle;
      isTransitioning = false;
    }
  }

  if (moon) moon.rotation.y += 0.001; // optional slow spin
  controls?.update(); // if you have controls

  renderer.render(scene, camera);
}

function getLatLonFromPlace(place) {
  const apiKey = 'df6e57c068b74169b842f0c6b8bcdc23';  // replace with your actual API key
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(place)}&key=${apiKey}`;

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        return { lat, lng };
      } else {
        throw new Error('Location not found');
      }
    });
}


// 🌙 Update Moon Phase Texture
function setMoonPhase(date, animateTransition = false) {
  const illumination = SunCalc.getMoonIllumination(date);
  const phase = illumination.phase; // 0 to 1

  const angle = phase * 2 * Math.PI;

  if (!animateTransition) {
    // Instant update (e.g., on initial load)
    directionalLight.position.set(Math.cos(angle) * 5, 0, Math.sin(angle) * 5);
    currentPhaseAngle = angle;
  } else {
    // Start transition animation
    targetPhaseAngle = angle;
    transitionStartTime = performance.now();
    isTransitioning = true;
  }

  return getPhaseName(phase);
}


function getPhaseName(phase) {
  if (phase === 0) return "New Moon";
  if (phase > 0 && phase < 0.25) return "Waxing Crescent";
  if (phase === 0.25) return "First Quarter";
  if (phase > 0.25 && phase < 0.5) return "Waxing Gibbous";
  if (phase === 0.5) return "Full Moon";
  if (phase > 0.5 && phase < 0.75) return "Waning Gibbous";
  if (phase === 0.75) return "Last Quarter";
  return "Waning Crescent";
}

function getMoonAdvice(phaseName) {
  const adviceMap = {
    "New Moon": "A fresh start awaits you — set your intentions today.",
    "Waxing Crescent": "Focus on growth and take small steps forward.",
    "First Quarter": "Overcome obstacles with determination and courage.",
    "Waxing Gibbous": "Great day to refine your plans and make progress.",
    "Full Moon": "Celebrate your achievements and let go of what no longer serves.",
    "Waning Gibbous": "Reflect and share your knowledge with others.",
    "Last Quarter": "Time to release and prepare for new beginnings.",
    "Waning Crescent": "Rest and recharge; listen to your intuition."
  };
  return adviceMap[phaseName] || "";
}


window.addEventListener('resize', () => {
  const size = Math.min(window.innerWidth * 0.8, 400);

  renderer.setSize(size, size);
  camera.aspect = 1; // square canvas
  camera.updateProjectionMatrix();
});


