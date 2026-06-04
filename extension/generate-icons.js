/**
 * Generate proper PNG icons for the extension using the GhostRelay logo SVG.
 * Uses Node.js to render SVG to PNG via a simple pixel-based approach.
 */
const fs = require('fs');
const { createCanvas } = (() => {
  // We'll create minimal PNGs with the logo colors since we can't render SVG
  // without canvas/sharp. Instead we'll create a high-quality icon programmatically.
  return { createCanvas: null };
})();

// Since we can't use canvas in plain Node, we'll create the SVG files
// and rely on Chrome supporting SVG in some contexts, OR create proper PNGs
// using a manual pixel buffer approach.

const zlib = require('zlib');

function createPNG(size) {
  // Create RGBA pixel buffer
  const pixels = Buffer.alloc(size * size * 4);
  
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2;
  const cornerRadius = size * 0.25;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      
      // Check if inside rounded rect
      if (!inRoundedRect(x, y, 0, 0, size, size, cornerRadius)) {
        // Transparent
        pixels[idx] = 0;
        pixels[idx + 1] = 0;
        pixels[idx + 2] = 0;
        pixels[idx + 3] = 0;
        continue;
      }
      
      // Background gradient (teal #14b8a6 to cyan #22d3ee to purple #a78bfa)
      const t = (x + y) / (2 * size);
      let r, g, b;
      if (t < 0.5) {
        const lt = t * 2;
        r = lerp(20, 34, lt);
        g = lerp(184, 211, lt);
        b = lerp(166, 238, lt);
      } else {
        const lt = (t - 0.5) * 2;
        r = lerp(34, 167, lt);
        g = lerp(211, 139, lt);
        b = lerp(238, 250, lt);
      }
      
      // Ghost body (white, centered)
      const ghostCx = size / 2;
      const ghostTop = size * 0.2;
      const ghostBottom = size * 0.78;
      const ghostWidth = size * 0.5;
      const ghostHeadRadius = ghostWidth / 2;
      const ghostHeadCy = ghostTop + ghostHeadRadius;
      
      // Check if in ghost shape
      const inGhost = isInGhost(x, y, ghostCx, ghostTop, ghostBottom, ghostWidth, size);
      
      if (inGhost) {
        r = 255;
        g = 255;
        b = 255;
        
        // Ghost eyes (dark)
        const eyeY = ghostHeadCy + size * 0.02;
        const eyeRadius = size * 0.055;
        const leftEyeX = ghostCx - ghostWidth * 0.2;
        const rightEyeX = ghostCx + ghostWidth * 0.2;
        
        const inLeftEye = dist(x, y, leftEyeX, eyeY) <= eyeRadius;
        const inRightEye = dist(x, y, rightEyeX, eyeY) <= eyeRadius;
        
        if (inLeftEye || inRightEye) {
          r = 3; g = 3; b = 3;
        }
        
        // Envelope on body
        const envW = ghostWidth * 0.5;
        const envH = envW * 0.6;
        const envX = ghostCx - envW / 2;
        const envY = ghostHeadCy + ghostHeadRadius * 0.6;
        
        if (x >= envX && x <= envX + envW && y >= envY && y <= envY + envH) {
          // Envelope background (gradient colored)
          const et = (x + y) / (2 * size);
          if (et < 0.5) {
            const lt = et * 2;
            r = lerp(20, 34, lt);
            g = lerp(184, 211, lt);
            b = lerp(166, 238, lt);
          } else {
            const lt = (et - 0.5) * 2;
            r = lerp(34, 167, lt);
            g = lerp(211, 139, lt);
            b = lerp(238, 250, lt);
          }
          
          // Envelope flap (V shape - white line)
          const envCx = envX + envW / 2;
          const flapSlope = envH / (envW / 2);
          const expectedY = envY + Math.abs(x - envCx) * flapSlope;
          if (Math.abs(y - expectedY) < size * 0.02) {
            r = 255; g = 255; b = 255;
          }
        }
      }
      
      pixels[idx] = Math.round(r);
      pixels[idx + 1] = Math.round(g);
      pixels[idx + 2] = Math.round(b);
      pixels[idx + 3] = 255;
    }
  }
  
  return encodePNG(size, size, pixels);
}

function isInGhost(x, y, cx, top, bottom, width, size) {
  const headRadius = width / 2;
  const headCy = top + headRadius;
  
  // Head (circle)
  if (dist(x, y, cx, headCy) <= headRadius) return true;
  
  // Body (rectangle below head to bottom)
  if (x >= cx - width / 2 && x <= cx + width / 2 && y >= headCy && y <= bottom) {
    // Wavy bottom
    if (y > bottom - size * 0.06) {
      const waveFreq = 3;
      const wavePhase = ((x - (cx - width / 2)) / width) * Math.PI * waveFreq;
      const waveY = bottom - size * 0.06 + Math.sin(wavePhase) * size * 0.03 + size * 0.03;
      return y <= waveY;
    }
    return true;
  }
  
  return false;
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function inRoundedRect(px, py, rx, ry, rw, rh, cr) {
  if (px < rx || px >= rx + rw || py < ry || py >= ry + rh) return false;
  
  // Check corners
  const corners = [
    [rx + cr, ry + cr],
    [rx + rw - cr, ry + cr],
    [rx + cr, ry + rh - cr],
    [rx + rw - cr, ry + rh - cr],
  ];
  
  for (const [ccx, ccy] of corners) {
    if ((px < rx + cr || px > rx + rw - cr) && (py < ry + cr || py > ry + rh - cr)) {
      if (dist(px, py, ccx, ccy) > cr) return false;
    }
  }
  
  return true;
}

function encodePNG(width, height, rgbaPixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);   // bit depth
  ihdr.writeUInt8(6, 9);   // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  
  // Raw image data with filter bytes
  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // No filter
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = 1 + x * 4;
      row[dstIdx] = rgbaPixels[srcIdx];
      row[dstIdx + 1] = rgbaPixels[srcIdx + 1];
      row[dstIdx + 2] = rgbaPixels[srcIdx + 2];
      row[dstIdx + 3] = rgbaPixels[srcIdx + 3];
    }
    rawRows.push(row);
  }
  
  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData);
  
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);
  const crc = crc32(crcData);
  const crcB = Buffer.alloc(4);
  crcB.writeUInt32BE(crc >>> 0);
  return Buffer.concat([len, typeB, data, crcB]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate
[16, 48, 128].forEach(size => {
  const png = createPNG(size);
  fs.writeFileSync(__dirname + '/icons/icon-' + size + '.png', png);
  console.log('Created icon-' + size + '.png (' + png.length + ' bytes)');
});

console.log('Done!');
