(async () => {
  const allTasks = await window.api.getTasks();
  const form = document.querySelector('form');
  const success = document.querySelector('.success');

  let innerString = '';
  allTasks.forEach((v) => {
    innerString += `
    <div>
      <input type="checkbox" id="${v}" name="${v}" value="${v}">
      <label for="${v}">${v}</label>
    </div>
`;
  });

  form.querySelector('div').innerHTML = innerString;
  form.innerHTML += `
    <div class="flex-container">
      <input type="button" value="invert all"></input>
      <input type="submit" value="update"></input>
    </div>
    `;

  const tasks = document.querySelectorAll('input[type="checkbox"]');
  form.addEventListener('click', async (e) => {
    e.target.value === 'invert all' &&
      tasks.forEach((task) => {
        task.checked ? (task.checked = false) : (task.checked = true);
      });
  });

  let decTimer, incTimer;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (decTimer || incTimer) return;

    currentTasks = [];
    tasks.forEach((task) => {
      task.checked && currentTasks.push(task.value);
    });
    if (!currentTasks.length) return;
    await window.api.writeTasks(currentTasks);

    let opacity = 0;
    incTimer = setInterval(() => {
      opacity += 1;
      success.style.opacity = opacity + '%';
      if (opacity === 100) {
        clearInterval(incTimer);
        incTimer = null;

        decTimer = setInterval(() => {
          opacity -= 1;
          success.style.opacity = opacity + '%';
          if (opacity === 0) {
            clearInterval(decTimer);
            decTimer = null;
          }
        }, 10);
      }
    }, 10);
  });
})();
