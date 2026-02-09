const https = require('https');

https.get('https://goodsco.com.co/wp-json/wp/v2/inmueble?_embed&per_page=5', (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    try {
        const json = JSON.parse(data);
        if (Array.isArray(json)) {
            console.log("Received " + json.length + " items.");
            json.forEach((item, index) => {
                console.log(`Item ${index}: ID=${item.id}`);
                console.log(`  Title:`, item.title);
                console.log(`  Excerpt:`, item.excerpt);
                console.log(`  Content:`, item.content);
            });
        } else {
            console.log("Response is not an array:", json);
        }
    } catch (e) {
        console.error("Error parsing JSON:", e.message);
        console.log("Raw data preview:", data.substring(0, 200));
    }
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});