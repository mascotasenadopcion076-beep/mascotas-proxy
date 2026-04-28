module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const r1 = await fetch('https://www.mascotasenadopcion.com/perros-en-adopcion');
    const r2 = await fetch('https://www.mascotasenadopcion.com/gatos-en-adopcion');
    const h1 = await r1.text();
    const h2 = await r2.text();

    function parsear(html, tipo) {
      const reLink = /href="(\/(?:perros|gatos)-en-adopcion\/i\/(\d+)\/([^"]+))"/g;
      const reImg = /src="(https:\/\/cmsphoto\.ww-cdn\.com[^"]+)"/g;
      const links = [...html.matchAll(reLink)];
      const imgs = [...html.matchAll(reImg)];
      
      const vistos = {};
      const items = [];
      
      links.forEach(function(m, i) {
        const id = m[2];
        if (vistos[id]) return;
        vistos[id] = true;
        if (!imgs[i]) return;
        
        const nombre = m[3]
          .replace(/^copia-de-/, '')
          .replace(/-/g, ' ')
          .replace(/^\w/, function(c) { return c.toUpperCase(); });
        
        items.push({
          url: m[1],
          foto: imgs[i][1],
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
