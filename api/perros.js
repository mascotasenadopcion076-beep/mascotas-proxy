export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const [resPerros, resGatos] = await Promise.all([
      fetch('https://www.mascotasenadopcion.com/perros-en-adopcion'),
      fetch('https://www.mascotasenadopcion.com/gatos-en-adopcion')
    ]);
    
    const [htmlPerros, htmlGatos] = await Promise.all([
      resPerros.text(),
      resGatos.text()
    ]);

    function parsear(html, tipo) {
      const parser = new (require('node-html-parser').parse || Object)(html);
      const items = [];
      const linkRegex = /href="(\/(?:perros|gatos)-en-adopcion\/i\/(\d+)\/([^"]+))"/g;
      const imgRegex = /src="(https:\/\/cmsphoto\.ww-cdn\.com\/superstatic[^"]+)"/g;
      const titleRegex = /title="([^"]+)"/g;
      
      const links = [...html.matchAll(linkRegex)];
      const imgs  = [...html.matchAll(/src="(https:\/\/cmsphoto\.ww-cdn\.com\/superstatic[^"]+large_16_9[^"]+)"/g)];
      
      // Nombre desde el slug de la URL
      links.forEach((m, i) => {
        const slug = m[3];
        const nombre = slug
          .replace(/^copia-de-/, '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        
        if (imgs[i]?.1]) {
          items.push({
            url: m[1],
            id: m[2],
            foto: imgs[i][1],
            nombre: nombre,
            tipo: tipo
          });
        }
      });
      return items;
    }

    const perros = parsear(htmlPerros, 'perro');
    const gatos  = parsear(htmlGatos,  'gato');
    const todos  = [...perros, ...gatos].sort(() => Math.random() - 0.5);

    res.status(200).json({ perros: todos, total: todos.length });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
