module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const r1 = await fetch('https://www.mascotasenadopcion.com/perros-en-adopcion');
    const r2 = await fetch('https://www.mascotasenadopcion.com/gatos-en-adopcion');
    const h1 = await r1.text();
    const h2 = await r2.text();

    function parsear(html, tipo) {
      const vistos = {};
      const items = [];
      
      // Buscar cada bloque de item: link + título + imagen juntos
      const bloqueRe = /href="(\/(?:perros|gatos)-en-adopcion\/i\/(\d+)\/[^"]+)"[\s\S]{0,500}?<(?:h\d|div|span)[^>]*class="[^"]*(?:title|nombre|name)[^"]*"[^>]*>([\s\S]{0,100}?)<\/(?:h\d|div|span)>[\s\S]{0,500}?src="(https:\/\/cmsphoto\.ww-cdn\.com[^"]+)"/g;
      
      var m;
      while ((m = bloqueRe.exec(html)) !== null) {
        const id = m[2];
        if (vistos[id]) continue;
        vistos[id] = true;
        
        const nombre = m[3].replace(/<[^>]+>/g, '').trim();
        if (!nombre) continue;
        
        items.push({
          url: m[1],
          foto: m[4],
          nombre: nombre,
          tipo: tipo
        });
      }
      
      // Fallback: si no encontró nada con el método anterior, usar slug
      if (items.length === 0) {
        const reLink = /href="(\/(?:perros|gatos)-en-adopcion\/i\/(\d+)\/([^"]+))"/g;
        const reImg = /src="(https:\/\/cmsphoto\.ww-cdn\.com[^"]+)"/g;
        const links = [...html.matchAll(reLink)];
        const imgs = [...html.matchAll(reImg)];
        
        links.forEach(function(lm, i) {
          const id = lm[2];
          if (vistos[id] || !imgs[i]) return;
          vistos[id] = true;
          items.push({
            url: lm[1],
            foto: imgs[i][1],
            nombre: lm[3].replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase()),
            tipo: tipo
          });
        });
      }
      
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
