module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const [r1, r2] = await Promise.all([
      fetch('https://www.mascotasenadopcion.com/perros-en-adopcion'),
      fetch('https://www.mascotasenadopcion.com/gatos-en-adopcion')
    ]);

    const [h1, h2] = await Promise.all([r1.text(), r2.text()]);

    function parsear(html, tipo) {
      const re = /href="(\/(?:perros|gatos)-en-adopcion\/i\/\d+\/([^"]+))"/g;
      const reImg = /src="(https:\/\/cmsphoto\.ww-cdn\.com\/superstatic[^"]+large_16_9[^"]+)"/g;
      const links = [...html.matchAll(re)];
      const imgs = [...html.matchAll(reImg)];
      retu
