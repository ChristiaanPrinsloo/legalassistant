export function AddTime() {
    const currentDate = new Date();
    let datetime = '';
    if (currentDate.getMinutes() < 10) {
      datetime =
        currentDate.getDate() +
        '/' +
        (currentDate.getMonth() + 1) +
        '/' +
        currentDate.getFullYear() +
        ' ' +
        currentDate.getHours() +
        ':' +
        '0' +
        currentDate.getMinutes();
    } else {
      datetime =
        currentDate.getDate() +
        '/' +
        (currentDate.getMonth() + 1) +
        '/' +
        currentDate.getFullYear() +
        ' ' +
        currentDate.getHours() +
        ':' +
        currentDate.getMinutes();
    }
    return datetime;
  }
