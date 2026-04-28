module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const r1 = await fetch('https://www.mascotasenadopcion.com/perros-en-adopcion');
    const r2 = await fetch('https://www.mascotasenadopcion.com/gatos-en-adopcion');
    const h1 = await r1.text();
    const h2 = await r2.text();

    function parsear(html, tipo) {
      const re = /href="(\/(?:perros|gatos)-en-adopcion\/i\/\d+\/([^"]+))"/g;
      const reImg = /src="(https:\/\/cmsphoto\.ww-cdn\.com\/superstatic[^"]+large_16_9[^"]+)"/g;
      const links = [...html.matchAll(re)];
      const imgs = [...html.matchAll(reImg)];
      return links.map(function(m, i) {
        return {
          url: m[1],
          foto: imgs[i] ? imgs[i][1] : '',
          nombre: m[2].replace(/^copia-de-/, '').replace(/-/g, ' ').replace(/^\w/, function(c) { return c.toUpperCase(); }),
          tipo: tipo
        };
      }).filter(function(p) { return p.foto; });
    }

    var todos = parsear(h1, 'perro').concat(parsear(h2, 'gato'));
    res.status(200).json({ perros: todos });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
};
