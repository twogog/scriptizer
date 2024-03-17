(async () => {
  const allTasks = await window.api.getTasks();
  const tasksOuter = document.querySelector('.tasks');
  const tasksContainer = tasksOuter.querySelector('.grid-container');
  const search = document.querySelector('.search');
  const success = document.querySelector('.success');

  let searchTasks = [];
  const caches = {
    fileCache: '',
    htmlCache: allTasks.join(),
  };

  tasksContainer.innerHTML = makeTasksHtmlStr(allTasks);
  tasksOuter.innerHTML += `
    <div class="flex-container">
      <input type="button" value="invert all"></input>
      <input type="submit" value="update"></input>
    </div>
  `;

  let tasks = tasksOuter.querySelectorAll('input[type="checkbox"]');
  tasksOuter.addEventListener('click', async (e) => {
    e.target.value === 'invert all' &&
      tasks.forEach((task) => {
        task.checked ? (task.checked = false) : (task.checked = true);
      });
  });

  let isAnimate = false;
  tasksOuter.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isAnimate) return;

    const currentTasks = [];
    tasks.forEach((task) => {
      task.checked && currentTasks.push(task.value);
    });

    if (!currentTasks.length) return;
    const isSame = controlCache(currentTasks, caches, 'fileCache');
    if (isSame) return;
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

  search.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(search);
    const searchValue = formData.get('search');
    search.reset();

    searchTasks = allTasks.filter((v) => {
      const complexName = v.replace(/.+?-/, '');
      return complexName.includes(searchValue);
    });

    const isSame = controlCache(searchTasks, caches, 'htmlCache');
    if (isSame) return;
    if (searchValue === '') searchTasks = allTasks;

    tasksOuter.querySelector('div').innerHTML = makeTasksHtmlStr(searchTasks);
    tasks = tasksOuter.querySelectorAll('input[type="checkbox"]');
  });
})();

function makeTasksHtmlStr(tasks) {
  return tasks.reduce((init, v) => {
    init += `
        <div>
          <input type="checkbox" id="${v}" name="${v}" value="${v}">
          <label for="${v}">${v}</label>
        </div>
      `;
    return init;
  }, '');
}

function controlCache(currentTasks, caches, key) {
  const newCache = currentTasks.join();
  if (newCache === caches[key]) return true;
  caches[key] = newCache;
  return false;
}
