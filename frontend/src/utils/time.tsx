export const timeAgo = (input: string) => {
  const prev = new Date(input);
  const now = new Date();
  const diff = now.getTime() - prev.getTime(); 
  const diffInSeconds = diff / 1000;
  const diffInMinutes = diffInSeconds / 60;
  const diffInHours = diffInMinutes / 60;
  const diffInDays = diffInHours / 24;
  const diffInWeeks = diffInDays / 7;

  if (diffInWeeks > 1) {
    return `${Math.floor(diffInWeeks)}w`;
  } else if (diffInDays > 1) {
    return `${Math.floor(diffInDays)}d`;
  } else if (diffInHours > 1) {
    return `${Math.floor(diffInHours)}h`;
  } else if (diffInMinutes > 1) {
    return `${Math.floor(diffInMinutes)}m`;
  } else {
    return `${Math.floor(diffInSeconds)}s`;
  }
};
