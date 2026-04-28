module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const r1 = await fetch('https://www.mascotasenadopcion.com/perros-en-adopcion');
    const r2 = await fetch('https://www.mascotasenadopcion.com/gatos-en-adopcion');
    const h1 = await r1.text();
    const h2 = await r2.text();

    function parsear(html, tipo) {
      const reLink = /href="(\/(?:perros|gatos)-en-adopcion\/i\/(\d+)\/([^"]+))"/g;
      const reImg = /data-src="(https:\/\/cmsphoto\.ww-cdn\.com[^"]+)"|src="(https:\/\/cmsphoto\.ww-cdn\.com[^"]+)"/g;
      
      const links = [...html.matchAll(reLink)];
      const imgs = [...html.matchAll(reImg)];
      
      const vistos = {};
      const items = [];
      var imgIndex = 0;
      
      links.forEach(function(m) {
        const id = m[2];
        if (vistos[id]) return;
        vistos[id] = true;
        
        // buscar la imagen que está cerca de este link en el HTML
        const linkPos = m.index;
        var bestImg = null;
        var bestDist = Infinity;
        
        imgs.forEach(function(img) {
          const dist = Math.abs(img.index - linkPos);
          if (dist < bestDist) {
            bestDist = dist;
            bestImg = img[1] || img[2];
          }
        });
        
        if (!bestImg) return;
        
        const nombre = m[3]
          .replace(/-/g, ' ')
          .replace(/^\w/, function(c) { return c.toUpperCase(); });
        
var fotoHD = bestImg;

items.push({
  url: m[1],
  foto: fotoHD,
  nombre: nombre,
  tipo: tipo
});
      });
      
      return items;
    }

    var perros = parsear(h1, 'perro');
    var gatos = parsear(h2, 'gato');
    var todos = perros.concat(gatos).sort(function() { return Math.random() - 0.5; });
    
    res.status(200).json({ perros: todos, total: todos.length });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
};
