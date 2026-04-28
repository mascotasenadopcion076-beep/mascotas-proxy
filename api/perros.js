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

    function parsear(html, tipo, seccion) {
      const matches = [...html.matchAll(/href="(\/[^"]*\/i\/(\d+)\/[^"]+)"/g)];
      const imgMatches = [...html.matchAll(/src="(https:\/\/cmsphoto[^"]+)"/g)];
      const nameMatches = [...html.matchAll(/alt="([^"]+)"/g)];
      return matches.slice(0, 30).map((m, i) => ({
        url: m[1],
        id: m[2],
        foto: imgMatches[i]?.[1] || '',
        nombre: nameMatches[i]?.[1] || tipo,
        tipo: tipo
      })).filter(p => p.foto);
    }

    const perros = parsear(htmlPerros, 'perro', 'perros-en-adopcion');
    const gatos  = parsear(htmlGatos,  'gato',  'gatos-en-adopcion');
    const todos  = [...perros, ...gatos].sort(() => Math.random() - 0.5);

    res.status(200).json({ perros: todos, total: todos.length });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
