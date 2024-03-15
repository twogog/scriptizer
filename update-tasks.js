const fs = require('fs');
const path = require('path');

(async () => {
  const [, , ...tasks] = process.argv;

  const initialBuild = {
    version: '2.0.0',
    tasks: [],
  };

  const combiner = {
    label: 'Run build',
    group: 'build',
    dependsOn: [],
  };

  let file;
  try {
    buildStructures(tasks, initialBuild, combiner);
    checkConstraints(combiner);
    writeTasks(file, initialBuild);
  } catch (err) {
    console.error(err);
  } finally {
    if (file !== undefined) fs.closeSync(file);
    process.exit();
  }
})();

function buildTask(script, type = 'npm') {
  return {
    type,
    script,
    label: script,
  };
}

function buildStructures(tasks, initialBuild, combiner) {
  tasks.forEach((taskWithKeys) => {
    const [task, key] = taskWithKeys.split('-');
    const watchWord = 'watch-' + task;
    const devWord = 'dev-' + task;
    switch (key) {
      case undefined:
        pushHelper(watchWord, devWord);
        break;
      case 'd':
        pushHelper(devWord);
        break;
      case 'w':
        pushHelper(watchWord);
        break;
      default:
        throw Error('Вы указали несуществующий ключ, скрипт выполнится с ошибкой');
    }
  });
  initialBuild.tasks.push(combiner);

  function pushHelper(...commands) {
    const [w, d] = commands;
    w && initialBuild.tasks.push(buildTask(w));
    d && initialBuild.tasks.push(buildTask(d));
    w && combiner.dependsOn.push(w);
    d && combiner.dependsOn.push(d);
  }
}

function checkConstraints(combiner) {
  const jsonPath = path.join(__dirname, 'package.json');
  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const filteredKeys = Object.keys(json.scripts).filter((key) => key.includes('watch-') || key.includes('dev-'));
  const constraints = filteredKeys.join(',');
  combiner.dependsOn.forEach((task) => {
    if (!constraints.includes(task)) throw Error(`Скрипт ${task} не существует`);
  });
}

function writeTasks(file, initialBuild) {
  const filePath = path.join(__dirname, '.vscode', 'tasks.json');
  file = fs.openSync(filePath, 'w');
  fs.writeFileSync(filePath, JSON.stringify(initialBuild, undefined, 2));
}
