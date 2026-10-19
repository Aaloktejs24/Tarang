const axios = require('axios');
async function run() {
  try {
    const res = await axios.post('http://localhost:8083/api/v1/streaming/upload-intent', {
      original_filename: 'test.mp4',
      file_size: 1024 * 1024 * 10
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.error(e.message);
  }
}
run();
