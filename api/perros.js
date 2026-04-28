module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const r1 = await fetch('https://www.mascotasenadopcion.com/perros-en-adopcion');
    const r2 = await fetch('https://www.mascotasenadopcion.com/gatos-en-adopcion');
    const h1 = await r1.text();
    const h2 = await r2.text();

    function getLinks(html, tipo) {
      const re = /href="(\/(?:perros|gatos)-en-adopcion\/i\/(\d+)\/([^"]+))"/g;
      const vistos = {};
      const links = [];
      var m;
      while ((m = re.exec(html)) !== null) {
        if (vistos[m[2]]) continue;
        vistos[m[2]] = true;
        links.push({ url: m[1], id: m[2], slug: m[3], tipo });
      }
      return links;
    }

    async function fetchPerfil(item) {
      try {
        const r = await fetch('https://www.mascotasenadopcion.com' + item.url);
        const html = await r.text();
        
        // Buscar título
        const titleM = html.match(/<h1[^>]*>([\s\S]{0,100}?)<\/h1>/);
        const nombre = titleM 
          ? titleM[1].replace(/<[^>]+>/g, '').trim()
          : item.slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());
        
        // Buscar foto principal
        const imgM = html.match(/src="(https:\/\/cmsphoto\.ww-cdn\.com\/superstatic[^"]+)"/);
        const foto = imgM ? imgM[1] : null;
        
        if (!foto) return null;
        return { url: item.url, nombre, foto, tipo: item.tipo };
      } catch(e) {
        return null;
      }
    }

    const links1 = getLinks(h1, 'perro').slice(0, 20);
    const links2 = getLinks(h2, 'gato').slice(0, 15);
    const todos = [...links1, ...links2];

    const results = await Promise.all(todos.map(fetchPerfil));
    const perros = results.filter(Boolean).sort(() => Math.random() - 0.5);
    
    res.status(200).json({ perros, total: perros.length });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
};
