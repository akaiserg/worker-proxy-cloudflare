console.log('Hello from public2/main.js!');

document.getElementById('actionBtn2').addEventListener('click', function() {
  document.getElementById('message2').textContent = 'Button on second server clicked! JavaScript is working.';
}); 