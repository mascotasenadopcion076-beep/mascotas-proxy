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
      const items = [];
      const linkRegex = /href="(\/(?:perros|gatos)-en-adopcion\/i\/(\d+)\/([^"]+))"/g;
      const imgRegex = /src="(https:\/\/cmsphoto\.ww-cdn\.com\/superstatic[^"]+large_16_9[^"]+)"/g;
      
      const links = [...html.matchAll(linkRegex)];
      const imgs  = [...html.matchAll(imgRegex)];
      
      links.forEach((m, i) => {
        if (!imgs[i]) return;
        
        const slug = m[3]
          .replace(/^copia-de-/, '')
          .replace(/-/g, ' ')
          .trim();
        
        const nombre = slug.charAt(0).toUpperCase() + slug.slice(1);
        
        items.push({
          url: m[1],
          id: m[2],
