let myChart;
let langChart;

function generateColors(num) {
  const colors = [];
  for (let i = 0; i < num; i++) {
    const hue = Math.floor((360 / num) * i);
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }
  return colors;
}

async function fetchUser() {
  const username = document.getElementById('username').value.trim();

  if (!username) {
    alert('Please enter a GitHub username');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/user/${username}`);
    const data = await res.json();

    if (data.error) {
      document.getElementById('result').innerHTML = "User not found";
      if (myChart) myChart.destroy();
      if (langChart) langChart.destroy();
      return;
    }

    document.getElementById('result').innerHTML = `
      <img src="${data.avatar}" width="100" alt="Avatar"/><br/>
      <strong>${data.name}</strong><br/>
      Public Repos: ${data.repos}<br/>
      Followers: ${data.followers}<br/>
      Following: ${data.following}<br/>
      <a href="${data.profile}" target="_blank" rel="noopener">View Profile</a>
    `;

    // Bar Chart for repos/followers/following
    const ctx = document.getElementById('statsChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Public Repos', 'Followers', 'Following'],
        datasets: [{
          label: `${data.name}'s GitHub Stats`,
          data: [data.repos, data.followers, data.following],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });

    // Fetch languages and draw pie chart
    const langRes = await fetch(`http://localhost:3000/user/${username}/languages`);
    const langData = await langRes.json();

    const langCtx = document.getElementById('langChart').getContext('2d');
    if (langChart) langChart.destroy();

    langChart = new Chart(langCtx, {
      type: 'pie',
      data: {
        labels: Object.keys(langData),
        datasets: [{
          label: 'Languages Used',
          data: Object.values(langData),
          backgroundColor: generateColors(Object.keys(langData).length)
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: { display: true, text: 'Languages Used in Public Repos' }
        }
      }
    });

  } catch (error) {
    document.getElementById('result').innerHTML = "Error fetching data";
    if (myChart) myChart.destroy();
    if (langChart) langChart.destroy();
    console.error(error);
  }
}
