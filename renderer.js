(async () => {
  const allTasks = await window.api.getTasks();

  const form = document.querySelector("form");

  let innerString = "";
  allTasks.forEach((v) => {
    innerString += `
    <input type="checkbox" id="${v}" name="${v}" value="${v}">
    <label for="${v}">${v}</label><br></br>
`;
  });

  form.innerHTML = innerString +=
    '<input type="submit" value="Обновить"></input>';

  form.addEventListener("submit", async () => {
    await window.api.writeTasks(allTasks);
  });

})();
