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

  let isAnimate = false;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isAnimate) return;

    currentTasks = [];
    tasks.forEach((task) => {
      task.checked && currentTasks.push(task.value);
    });
    if (!currentTasks.length) return;
    await window.api.writeTasks(currentTasks);

    const animation = success.animate(
      [{opacity: 1, offset: 0.5}, {opacity: 0}],
      {duration: 2000}
    );

    isAnimate = true;
    success.style.zIndex = 10;
    animation.onfinish = () => {
      isAnimate = false;
      success.style.zIndex = -10;
    };
  });
})();
