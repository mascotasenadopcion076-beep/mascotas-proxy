export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    const response = await fetch('https://www.mascotasenadopcion.com/perros-en-adopcion');
    const html = await response.text();
    
    const matches = [...html.matchAll(/href="(\/perros-en-adopcion\/i\/(\d+)\/[^"]+)"/g)];
    const imgMatches = [...html.matchAll(/src="(https:\/\/cmsphoto[^"]+)"/g)];
    const nameMatches = [...html.matchAll(/alt="([^"]+)"/g)];
    
    const perros = matches.slice(0, 20).map((m, i) => ({
      url: m[1],
      id: m[2],
      foto: imgMatches[i]?.[1] || '',
      nombre: nameMatches[i]?.[1] || 'Perro'
    })).filter(p => p.foto);
    
    res.status(200).json({ perros });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
